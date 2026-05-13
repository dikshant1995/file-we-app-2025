import pdfplumber
import io
import re
from datetime import datetime
from collections import Counter

def clean_amount(val_str):
    if val_str is None:
        return 0.0
    
    # Convert to string and handle CID artifacts
    val_str = str(val_str).replace("(cid:9)", " ").strip()
    if not val_str or val_str.upper() == 'NA':
        return 0.0

    # Capture sign indicator (DR/CR or minus)
    is_negative = False
    val_upper = val_str.upper()
    if re.search(r'^[\d,\.\s]*\bDR\b[\d,\.\s]*$', val_upper) or val_upper.startswith('-'):
        is_negative = True

    # V11.1: Multi-Token Shield. If multiple numbers are separated by spaces,
    # take the first one to avoid column bleeding (e.g. Balance and Init Br).
    tokens = str(val_str).split()
    if not tokens: return 0.0
    
    # Find the first token that contains a digit
    target = ""
    for t in tokens:
        if any(c.isdigit() for c in t):
            target = t
            break
    if not target: return 0.0
    
    numeric_clean = re.sub(r'[^\d\.\(\)]', '', target)
    # Strip parentheses if present but treat as positive
    numeric_clean = numeric_clean.replace('(', '').replace(')', '')
    
    if not numeric_clean:
        return 0.0

    # V6.0 Sanity Gate: Reject impossibly long strings
    if len(numeric_clean) > 18: 
        return 0.0
        
    try:
        val = float(numeric_clean)
        # V6.0 Outlier Shield: Reject balances > 50 Crore
        if abs(val) > 500000000: 
            return 0.0
        return -abs(val) if is_negative else abs(val)
    except ValueError:
        return 0.0

def detect_statement_year_context(pdf):
    """Scans the first page for '202X' or statement period to establish a default year."""
    try:
        first_page = pdf.pages[0].extract_text() or ""
        # V10.8: Prioritize years close to current time to avoid picking up old addresses/PINs
        years = [int(y) for y in re.findall(r'\b(20\d{2})\b', first_page)]
        if years:
            current_year = datetime.now().year
            # Filter for reasonable years (not too far in the future or past)
            valid_years = [y for y in years if 2018 <= y <= current_year + 1]
            if valid_years:
                return str(max(valid_years)) # Use the latest valid year found
            return str(Counter(years).most_common(1)[0][0])
    except:
        pass
    return str(datetime.now().year)

def parse_date(date_str, year_context=None):
    if not date_str:
        return None
    
    # Normalize slashes, spaces, dots, and repeated dashes
    date_str = str(date_str).strip().replace('.', '-')
    # Remove trailing non-alphanumeric (like hyphens in '02-Sep-')
    date_str = re.sub(r'[^a-zA-Z0-9]+$', '', date_str)
    date_str = re.sub(r'[\s\/\-]+', '-', date_str).title()
    
    # If it's a short date (DD-Mon or DD-MM), append the year context
    if re.match(r'^\d{1,2}-[A-Za-z]{3}$', date_str) or re.match(r'^\d{1,2}-\d{1,2}$', date_str):
        if year_context:
            date_str = f"{date_str}-{year_context}"
    
    # Priority List: 
    # 1. 4-digit years at start (YYYY-MM-DD)
    # 2. 4-digit years at end (DD-MM-YYYY)
    # 3. Textual months (DD-MMM-YYYY)
    # 4. YY-MM-DD (Newer bank pattern)
    # 5. DD-MM-YY (Older/Ambiguous)
    
    formats = (
        '%Y-%m-%d', '%Y/%m/%d', 
        '%d-%m-%Y', '%d/%m/%Y', '%d %b %Y', '%d-%B-%Y',
        '%d-%b-%Y', '%d/%b/%Y',
        '%d-%m-%y', '%d/%m/%y', '%d-%b-%y', '%d/%b/%y', '%d-%B-%y',
        '%y-%m-%d' # YY-MM-DD (IndusInd new pattern - Moved to end to avoid collision)
    )
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime('%Y-%m-%d')
        except ValueError:
            pass
    return None

def strip_serial_numbers(line):
    """Removes leading serial integers and spaces to reveal the date/narration."""
    if not line: return ""
    # Matches '1 02-Sep' or '102 02/01/2025' or '(1) 02-Sep'
    line = line.strip()
    match = re.match(r'^(\(?\d+\)?\s+)', line)
    if match:
        # Check if the next part looks like a date or capital narration
        remainder = line[match.end(0):].strip()
        if re.search(r'^\d{1,2}[/\- ]+|[A-Z]', remainder):
            return remainder
    return line

def extract_kotak_statement(pdf, first_page_text) -> dict:
    dataset_1 = []
    dataset_2 = []
    dataset_3 = []
    
    metadata = {
        "account_name": "Unknown",
        "account_type": "Unknown"
    }
    
    # 1. Metadata Extraction
    text_upper = first_page_text.upper().replace(" ", "")
    kotak_type = re.search(r'(?:Account Description|Product|Type)\s*:[ \t]*([A-Za-z\s]+)(?:\n|$)', first_page_text, re.IGNORECASE)
    if kotak_type:
        metadata["account_type"] = kotak_type.group(1).strip()
    else:
        if any(term in text_upper for term in ["PVTLTD", "CORP", "COMPANY", "LTD"]):
            metadata["account_type"] = "Current Account"
        else:
            metadata["account_type"] = "Savings Account"
            
    name_match = re.search(r'(?<!Nominee\s)(?:Statement of Account For|Customer Name|Account Name|Account Holder)\s*[:\-]?\s*([A-Za-z0-9\/\s&\.]+?)(?=\s+Account|\s+Customer|\s+Statement|\n|$)', first_page_text, re.IGNORECASE)
    if name_match:
        metadata["account_name"] = " ".join(name_match.group(1).strip().split())
    else:
        lines = first_page_text.split('\n')
        if len(lines) > 2:
            name_line = lines[1].strip()
            if "ACCOUNT STATEMENT" in name_line.upper():
                name_line = lines[2].strip()
            if "Sl. No." not in name_line and "Date" not in name_line:
                metadata["account_name"] = name_line

    # 2. Transaction Extraction (Coordinate-Isolated Segmenting)
    date_regex = re.compile(r'^\d{2}/\d{2}/\d{4}$')
    all_rows = []
    
    # Column GATES
    COL_SLNO  = (0, 75)
    COL_DATE  = (75, 145)
    COL_DESC  = (145, 380)
    COL_CHQ   = (380, 480)
    COL_AMT   = (480, 615)
    COL_TYPE_AMT = (615, 680)
    COL_BAL   = (680, 800)
    COL_TYPE_BAL = (800, 880)

    for page in pdf.pages:
        words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
        if not words: continue
        
        # --- DYNAMIC BOUNDARY DETECTION ---
        header_limit = 0
        footer_limit = page.height
        
        # Find Header Bottom (End of 'Balance' or 'Dr/Cr' header)
        for w in words:
            txt = w['text'].upper()
            if txt in ["BALANCE", "DR/CR", "SL.NO.", "TRAN.DATE"] and w['top'] < 100:
                header_limit = max(header_limit, w['bottom'] + 2)
            # Find Footer Top (Start of Opening/Closing balance or Page info)
            if "OPENINGBALANCE" in txt.replace(" ", "") or "CLOSINGBALANCE" in txt.replace(" ", ""):
                if w['top'] > 400: # Only footer balances
                    footer_limit = min(footer_limit, w['top'] - 5)
            if "POSTBOXNUMBER" in txt.replace(" ", ""):
                footer_limit = min(footer_limit, w['top'] - 5)

        # Identification Phase: Find Anchors within Header/Footer bounds
        anchors = []
        for w in words:
            if header_limit <= w['top'] < footer_limit:
                if COL_SLNO[0] <= w['x0'] <= COL_SLNO[1] and re.match(r'^\d+$', w['text']):
                    for d in words:
                        if abs(d['top'] - w['top']) < 15 and COL_DATE[0] <= d['x0'] <= COL_DATE[1] and date_regex.match(d['text']):
                            anchors.append({'sl': w['text'], 'date': d['text'], 'top': w['top']})
                            break
        
        if not anchors: continue
        
        # Collection Phase
        for i, anchor in enumerate(anchors):
            row_top = anchor['top']
            # Natural bottom is next anchor OR footer_limit
            row_bottom = anchors[i+1]['top'] if i+1 < len(anchors) else footer_limit
            
            # BOX LIMIT: Never reach more than 90px below the anchor (prevents vacuuming distant footers)
            row_bottom = min(row_bottom, row_top + 90)
            
            # BOX TOP: Allow text slightly ABOVE anchor for offset (min 5px above SlNo)
            env_top = max(header_limit, row_top - 12)
            env_bottom = row_bottom
            
            envelope_words = [w for w in words if env_top <= w['top'] < env_bottom]
            
            row_data = {
                "SlNo": anchor['sl'],
                "Date": anchor['date'],
                "NarrParts": [],
                "ChqParts": [],
                "AmountStr": "0.0",
                "TypeAmt": "UNKNOWN", # No default DR
                "BalanceStr": "0.0"
            }
            
            for w in envelope_words:
                mid_x = (w['x0'] + w['x1']) / 2
                w_top = w['top']
                
                # --- STRATIFIED EXTRACTION ---
                # A. Narration & Chq: Multi-line allowed in envelope
                if COL_DESC[0] <= mid_x < COL_DESC[1]:
                    row_data["NarrParts"].append(w['text'])
                elif COL_CHQ[0] <= mid_x < COL_CHQ[1]:
                    row_data["ChqParts"].append(w['text'])
                
                # B. Financial Data: STRICT LINE EXTRACTION (±10px from SlNo anchor)
                elif abs(w_top - row_top) < 10:
                    if COL_AMT[0] <= mid_x < COL_AMT[1]:
                        row_data["AmountStr"] = w['text']
                    elif COL_TYPE_AMT[0] <= mid_x < COL_TYPE_AMT[1]:
                        row_data["TypeAmt"] = w['text'].upper()
                    # Collect Balance AND its Type indicator (DR/CR) if they are in separate columns
                    elif COL_BAL[0] <= mid_x < COL_BAL[1] or COL_TYPE_BAL[0] <= mid_x < COL_TYPE_BAL[1]:
                        if row_data["BalanceStr"] == "0.0": row_data["BalanceStr"] = w['text']
                        else: row_data["BalanceStr"] += " " + w['text']
            
            amt = clean_amount(row_data["AmountStr"])
            # Default to CR if unknown, but normally it should be found now
            dr, cr = (amt, 0.0) if "DR" in row_data["TypeAmt"] else (0.0, amt)
            
            all_rows.append({
                "Date": parse_date(anchor['date']),
                "Narration": " ".join(row_data["NarrParts"]),
                "Dr": dr,
                "Cr": cr,
                "Balance": clean_amount(row_data["BalanceStr"])
            })

    # Chronological Check & Fix (Desc to Asc)
    if len(all_rows) > 1 and all_rows[0]["Date"] > all_rows[-1]["Date"]:
        all_rows.reverse()
    
    # Finalize
    for row in all_rows:
        dataset_1.append({"Date": row["Date"], "Dr": row["Dr"], "Cr": row["Cr"], "Balance": row["Balance"]})
        dataset_2.append({"Date": row["Date"], "Narration": row["Narration"]})
        dataset_3.append(row)
        
    return {"metadata": metadata, "dataset_1": dataset_1, "dataset_2": dataset_2, "dataset_3": dataset_3}


def extract_sbi_grid(pdf, first_page_text) -> dict:
    dataset_1 = []
    dataset_2 = []
    dataset_3 = []
    
    metadata = {
        "account_name": "Unknown",
        "account_type": "Unknown"
    }
    
    # 1. Metadata Extraction (Labels: Account Name, Account Description)
    name_match = re.search(r'Account Name\s*:\s*&?([A-Za-z0-9\/\s&\.,]+)(?:\n|$)', first_page_text, re.IGNORECASE)
    if name_match:
        metadata["account_name"] = name_match.group(1).strip()
    
    type_match = re.search(r'Account Description\s*:\s*&?([A-Za-z0-9\- \t]+)(?:\n|$)', first_page_text, re.IGNORECASE)
    if type_match:
        metadata["account_type"] = type_match.group(1).strip()

    # 2. Robust Coordinate Clustering Engine (For "Boxed" Layouts)
    # This groups words by their vertical Y-position to form "Logical Rows"
    for page_idx, page in enumerate(pdf.pages):
        header_search = page.search("Txn Date", case=False)
        header_y = 0
        if header_search:
            header_y = header_search[0]['top'] - 2
            
        words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
        if not words: continue
        
        # 1. Row Clustering (Group words that share the same Y-level)
        logical_rows = []
        current_row_words = []
        last_y = -1
        
        for w in words:
            if w['top'] < header_y: continue # Hide everything above "Txn Date"
            
            # If the word is at the same vertical level (±2px), it belongs to the same row
            if last_y == -1 or abs(w['top'] - last_y) < 3:
                current_row_words.append(w)
            else:
                logical_rows.append(current_row_words)
                current_row_words = [w]
            last_y = w['top']
            
        if current_row_words:
            logical_rows.append(current_row_words)
            
        print(f">>> [DEBUG] Page {page_idx+1}: Found {len(logical_rows)} logical lines.")
        
        # 2. Sliding Window Engine (Position-Independent)
        for line_words in logical_rows:
            if not line_words: continue
            
            # Combine the row text to hunt for the signature date
            row_text = " ".join([w['text'] for w in line_words]).strip()
            
            # Find a date anywhere in the first few words of the row
            match = re.search(r'^(\d{1,2}[/\- ]+(?:\d{1,2}|[A-Za-z]{3})[/\- ]+\d{2,4})', row_text)
            if not match or "TXN" in row_text.upper():
                continue # Skip header or non-date rows
                
            txn_date = parse_date(match.group(1))
            if not txn_date:
                continue
                
            # Now identify all numeric values in this row to find Balance, Dr and Cr
            # We filter out the date words from the word list
            date_end_x = match.end() # This is a char count, but we need x-coord
            # Better: Check word positions
            data_words = [w for w in line_words if w['x0'] > line_words[0]['x1']]
            
            numeric_tokens = []
            for w in data_words:
                cleaned = w['text'].replace(',', '').strip()
                # Relaxed Check: Allow numbers OR explicit DR/CR indicators
                if re.match(r'^-?[\d,]+(?:\.\d+)?$', cleaned) or cleaned.upper() in ["DR", "CR"]:
                    numeric_tokens.append(w)
            
            if len(numeric_tokens) < 1:
                continue # Row with no financial data
                
            # For SBI, Balance is usually the LAST set of tokens.
            # If the last word is "DR" or "CR", we must include the word preceding it.
            bal_str = numeric_tokens[-1]['text']
            if bal_str.upper() in ["DR", "CR"] and len(numeric_tokens) >= 2:
                bal_str = numeric_tokens[-2]['text'] + " " + bal_str
            
            balance = clean_amount(bal_str)
            
            # Credit/Debit are the two numeric columns to the left of balance
            # For SBI1: [Debit] at col 5, [Credit] at col 6, [Balance] at col 7
            # We look for numeric tokens in the Dr/Cr zones (x-coordinates)
            dr, cr = 0.0, 0.0
            for nt in numeric_tokens[:-1]:
                mid_x = (nt['x0'] + nt['x1']) / 2
                if 500 <= mid_x < 580: dr = clean_amount(nt['text'])
                elif 580 <= mid_x < 670: cr = clean_amount(nt['text'])

            # Narration is everything in the description zone (column 3)
            # Layout indices for SBI 1: Description sits between x=150 and x=450
            narration_parts = [w['text'] for w in line_words if 150 <= ((w['x0']+w['x1'])/2) < 450]
            narration = " ".join(narration_parts).strip()
            
            row_data = {
                "Date": txn_date,
                "Narration": narration,
                "Dr": dr,
                "Cr": cr,
                "Balance": balance
            }
            dataset_1.append({"Date": txn_date, "Dr": dr, "Cr": cr, "Balance": balance})
            dataset_2.append({"Date": txn_date, "Narration": narration})
            dataset_3.append(row_data)

    print(f">>> [Backend] SBI1 Sliding Engine Found {len(dataset_1)} rows.")
    return {"metadata": metadata, "dataset_1": dataset_1, "dataset_2": dataset_2, "dataset_3": dataset_3}

def find_opening_balance(text: str) -> float:
    """
    Search for opening balance in the text using various labels.
    """
    # Remove CID artifacts before searching
    text = text.replace("(cid:9)", " ")
    patterns = [
        r'Opening\s*Balance\s*[:\-]?\s*(?:INR|Rs\.?)?\s*([\d,\.]+)',
        r'Balance\s*B/F\s*[:\-]?\s*([\d,\.]+)',
        r'Brought\s*Forward\s*[:\-]?\s*([\d,\.]+)',
        r'Prev(?:ious)?\s*Balance\s*[:\-]?\s*([\d,\.]+)'
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return clean_amount(match.group(1))
    return 0.0

def extract_hdfc_statement(pdf, first_page_text) -> dict:
    dataset_1, dataset_2, dataset_3 = [], [], []
    metadata = {"account_name": "Unknown", "account_type": "Unknown"}
    
    # 1. Metadata Extraction (Customer Name from the left-side block)
    # The screenshot shows the name prefixed with M/S. or just starting the block on the left
    lines = first_page_text.split('\n')
    for line in lines[:25]:
        line_clean = line.strip().upper()
        if (line_clean.startswith("M/S.") or line_clean.startswith("M/S ") or 
            line_clean.startswith("SHRI ") or line_clean.startswith("MR ") or
            line_clean.startswith("MRS ") or line_clean.startswith("MS.")):
            metadata["account_name"] = " ".join(line.strip().split())
            break
            
    # Default fallback for name if prefix search fails
    if metadata["account_name"] == "Unknown":
        name_match = re.search(r'(?:Statement of Account For|Customer Name|Name)\s*[:\-]?\s*([A-Za-z0-9\/\s&\.,\-]+?)(?=\s+Account|\s+Customer|\s+Statement|\n|$)', first_page_text, re.IGNORECASE)
        if name_match:
            metadata["account_name"] = " ".join(name_match.group(1).strip().split())
    
    type_match = re.search(r'Account\s*No\s*[:\-]?\s*\d+\s+([A-Za-z0-9\s]+)', first_page_text, re.IGNORECASE)
    if type_match: metadata["account_type"] = type_match.group(1).strip()
    
    # Mathematical seed for HDFC
    open_bal = find_opening_balance(first_page_text)

    # 2. Sequential Extraction with Coordinate Shield
    all_rows = []
    # Date Format: DD/MM/YY or DD/MM/YYYY
    date_regex = re.compile(r'^\d{2}/\d{2}/\d{2,4}$')
    
    for page_idx, page in enumerate(pdf.pages):
        words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
        if not words: continue
        
        W = page.width
        
        # --- DYNAMIC BOUNDARY DETECTION (NOISE SHIELD) ---
        header_y = 0
        footer_y = page.height
        
        for w in words:
            txt_up = w['text'].upper().replace(" ", "")
            # Header Protection: Skip repeated titles/addresses on subsequent pages
            if page_idx > 0:
                if "STATEMENTOFACCOUNT" in txt_up or "PARTICULARS" in txt_up or "TRANDATE" in txt_up:
                    header_y = max(header_y, w['bottom'] + 5)
            else:
                # Page 1: Only skip until "Statement of account" or table headers
                if "STATEMENTOFACCOUNT" in txt_up or "VALUEDT" in txt_up:
                    header_y = max(header_y, w['bottom'] + 5)
                    
            # Footer Protection: Trigger disclaimer suppression
            if w['top'] > (page.height * 0.6):
                if ("CLOSINGBALANCEINCLUDES" in txt_up or "HDFCBANKLIMITED" in txt_up or 
                    "CONTENTSOFTHISSTATEMENT" in txt_up or "REGISTEREDOFFICE" in txt_up or 
                    "GSTN:" in txt_up or "08AAACH2702H1Z0" in txt_up or "COMPUTERGENERATED" in txt_up):
                    footer_y = min(footer_y, w['top'] - 5)

        # Cluster words into logical rows
        lines, current_line, last_y = [], [], -1
        for w in words:
            if w['top'] < header_y or w['bottom'] > footer_y: continue
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        for lw in lines:
            line_text = " ".join([w['text'] for w in lw]).upper()
            
            # Identify Transaction Row: Starts with Date on the left margin
            if not date_regex.match(lw[0]['text']) or lw[0]['x0'] > 80 or "DATE" in line_text: 
                continue
            
            # Column Mapping based on relative visual coordinates (W = page.width)
            # Standard HDFC (e.g. W=638):
            # 1. Date: x ~ 0 to 0.12W
            # 2. Narration: x ~ 0.12W to 0.48W
            # 3. [HIDE] Chq/Ref & Value Dt: x ~ 0.48W to 0.65W
            # 4. Withdrawal: x ~ 0.65W to 0.75W
            # 5. Deposit: x ~ 0.75W to 0.85W
            # 6. Balance: x ~ 0.85W+
            
            row_data = {
                "Date": parse_date(lw[0]['text']),
                "NarrParts": [],
                "Withdrawal": 0.0,
                "Deposit": 0.0,
                "Balance": 0.0
            }
            
            bal_parts = []
            for w in lw:
                mid_x = (w['x0'] + w['x1']) / 2
                rel_x = mid_x / W
                
                if 0.12 <= rel_x < 0.48:
                    row_data["NarrParts"].append(w['text'])
                elif 0.65 <= rel_x < 0.75:
                    val = clean_amount(w['text'])
                    if val != 0: row_data["Withdrawal"] = val
                elif 0.75 <= rel_x < 0.85:
                    val = clean_amount(w['text'])
                    if val != 0: row_data["Deposit"] = val
                elif rel_x >= 0.85:
                    bal_parts.append(w['text'])
            
            row_data["Balance"] = clean_amount(" ".join(bal_parts))



            
            all_rows.append({
                "Date": row_data["Date"],
                "Narration": " ".join(row_data["NarrParts"]),
                "Dr": row_data["Withdrawal"],
                "Cr": row_data["Deposit"],
                "Balance": row_data["Balance"]
            })

    # Step 3: Global Math-Force Classification & Chrono Correct
    if all_rows and all_rows[0]["Date"] and all_rows[-1]["Date"] and all_rows[0]["Date"] > all_rows[-1]["Date"]:
        all_rows.reverse()

    prev_bal = open_bal
    for r in all_rows:
        # If explicit amounts found, use them
        if r["Dr"] == 0 and r["Cr"] == 0 and abs(r["Balance"] - prev_bal) > 0.01:
            # Mathematical Recovery Shield
            diff = round(r["Balance"] - prev_bal, 2)
            if diff > 0.01:
                r["Cr"] = abs(diff)
            elif diff < -0.01:
                r["Dr"] = abs(diff)
        
        dataset_1.append({"Date": r["Date"], "Dr": r["Dr"], "Cr": r["Cr"], "Balance": r["Balance"]})
        dataset_2.append({"Date": r["Date"], "Narration": r["Narration"]})
        dataset_3.append(r)
        prev_bal = r["Balance"]
        
    return {"metadata": metadata, "dataset_1": dataset_1, "dataset_2": dataset_2, "dataset_3": dataset_3}

def extract_au_statement(pdf, first_page_text) -> dict:
    dataset_1, dataset_2, dataset_3 = [], [], []
    metadata = {"account_name": "Unknown", "account_type": "Unknown"}
    
    # 1. Metadata & Opening Balance
    name_match = re.search(r'Account Name\s*:\s*(.+?)(?:\s+Statement|$|\n)', first_page_text, re.IGNORECASE)
    if name_match: metadata["account_name"] = name_match.group(1).strip()
    
    type_match = re.search(r'Account Number.*?-\s*(AU [A-Za-z\s\-]+)', first_page_text, re.IGNORECASE)
    if type_match: metadata["account_type"] = type_match.group(1).strip()
    
    open_bal = find_opening_balance(first_page_text)
    
    # 2. Robust Trailing Logic for AU
    all_rows = []
    # AU uses DD MMM YYYY (e.g. 01 Apr 2022)
    date_regex = re.compile(r'^\d{2}\s+[A-Za-z]{3}\s+\d{4}$')

    for page in pdf.pages:
        words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
        if not words: continue
        
        lines, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        for lw in lines:
            # --- DATE ANCHOR CHECK ---
            # Try joining the first 3 tokens to see if it forms a date (DD MMM YYYY)
            date_prefix = " ".join([w['text'] for w in lw[:3]])
            # Transaction must start with a date and BE ON THE LEFT MARGIN (x < 100)
            if not date_regex.match(date_prefix) or lw[0]['x0'] > 100: 
                continue
            
            # AU specific financial tokens (Last 3: Dr, Cr, Bal) - dashes and labels allowed
            fin_words = []
            for w in lw:
                txt = w['text'].replace(',', '').strip()
                # Relaxed regex: Allow numbers, dashes, OR explicit DR/CR labels
                if txt == '-' or re.match(r'^-?[\d,]+(?:\.\d+)?$', txt) or txt.upper() in ["DR", "CR"]:
                    fin_words.append(w)
            
            if len(fin_words) < 2: continue # Must have at least balance
            
            # 3-column layout check
            bal_str = fin_words[-1]['text']
            if bal_str.upper() in ["DR", "CR"] and len(fin_words) >= 2:
                bal_str = fin_words[-2]['text'] + " " + bal_str
            
            bal = clean_amount(bal_str)
            cr, dr = 0.0, 0.0
            
            if len(fin_words) >= 3:
                # Standard: [..., Debit, Credit, Balance]
                cr = clean_amount(fin_words[-2]['text'])
                dr = clean_amount(fin_words[-3]['text'])
                start_fin_x = fin_words[-3]['x0']
            else:
                # One side: [..., Amount, Balance]
                amt = clean_amount(fin_words[-2]['text'])
                # Relative gap determines side
                gap = fin_words[-1]['x0'] - fin_words[-2]['x0']
                if gap < 100: cr = amt
                else: dr = amt
                start_fin_x = fin_words[-2]['x0']
            
            # Narration is between the date and the financial cluster
            narr_parts = [w['text'] for w in lw if w['x0'] > lw[2]['x1'] and w['x1'] < start_fin_x]
            
            all_rows.append({
                "Date": parse_date(date_prefix),
                "Narration": " ".join(narr_parts),
                "Dr": dr, "Cr": cr, "Balance": bal
            })

    # Ascending sort safeguard
    if all_rows and all_rows[0]["Date"] and all_rows[-1]["Date"] and all_rows[0]["Date"] > all_rows[-1]["Date"]:
        all_rows.reverse()

    # Final math seeding
    prev_bal = open_bal
    for r in all_rows:
        if r["Dr"] == 0 and r["Cr"] == 0 and abs(r["Balance"] - prev_bal) > 0.01:
            diff = round(r["Balance"] - prev_bal, 2)
            if diff > 0: r["Cr"] = abs(diff)
            else: r["Dr"] = abs(diff)
        
        dataset_1.append({"Date": r["Date"], "Dr": r["Dr"], "Cr": r["Cr"], "Balance": r["Balance"]})
        dataset_2.append({"Date": r["Date"], "Narration": r["Narration"]})
        dataset_3.append(r)
        prev_bal = r["Balance"]
        
    return {"metadata": metadata, "dataset_1": dataset_1, "dataset_2": dataset_2, "dataset_3": dataset_3}

def extract_bom_statement(pdf, first_page_text) -> dict:
    dataset_1, dataset_2, dataset_3 = [], [], []
    metadata = {"account_name": "Unknown", "account_type": "Unknown"}
    
    # 1. Metadata Extraction (Customer Details Box on the left)
    # The name is usually the first line of the left-side block
    lines = first_page_text.split('\n')
    for line in lines[:20]:
        if "CUSTOMER DETAILS" in line.upper(): continue
        # Look for typical name patterns or first non-empty line in top section
        clean = line.strip()
        if clean and len(clean) > 3 and not any(k in clean.upper() for k in ["DETAILS", "BRANCH", "ACCOUNT", "STATEMENT"]):
            metadata["account_name"] = clean
            break
            
    type_match = re.search(r'Account Type\s*:\s*([A-Za-z0-9\s\-]+)', first_page_text, re.IGNORECASE)
    if type_match: metadata["account_type"] = type_match.group(1).strip()
    
    # 2. Grid-Aware Sequential Extraction
    all_rows = []
    # Date Format: DD/MM/YYYY
    date_regex = re.compile(r'^\d{2}/\d{2}/\d{4}$')
    
    for page_idx, page in enumerate(pdf.pages):
        words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
        if not words: continue
        W = page.width
        
        # --- DYNAMIC BOUNDARY DETECTION ---
        header_y = 0
        footer_y = page.height
        for w in words:
            txt_up = w['text'].upper().replace(" ", "")
            if "PARTICULARS" in txt_up or "VALUEDT" in txt_up:
                header_y = max(header_y, w['bottom'] + 5)
            if w['top'] > (page.height * 0.7):
                if "TOTAL" in txt_up or "NOTE:" in txt_up or "THISISALINE" in txt_up:
                    footer_y = min(footer_y, w['top'] - 5)

        # Cluster words into rows
        lines, current_line, last_y = [], [], -1
        for w in words:
            if w['top'] < header_y or w['bottom'] > footer_y: continue
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        for lw in lines:
            line_text = " ".join([w['text'] for w in lw]).upper()
            
            # Start of Row: Date on the left (x0 < 10% width)
            if date_regex.match(lw[0]['text']) and lw[0]['x0'] < (W * 0.12):
                row_data = {
                    "Date": parse_date(lw[0]['text']),
                    "NarrParts": [],
                    "Withdrawal": 0.0,
                    "Deposit": 0.0,
                    "Balance": 0.0
                }
                
                # Apply BOM Column Gates (W ~ 1214)
                # 1. Date: 0.0 - 0.12W (already handled)
                # 2. Type: 0.12 - 0.18W (IGNORE)
                # 3. Particulars: 0.18 - 0.52W (CAPTURE)
                # 4. Channel/Ref: 0.52 - 0.68W (IGNORE)
                # 5. Debit: 0.68 - 0.78W (CAPTURE)
                # 6. Credit: 0.78 - 0.88W (CAPTURE)
                # 7. Balance: 0.88W+ (CAPTURE)
                
                bal_parts = []
                for w in lw:
                    mid_x = (w['x0'] + w['x1']) / 2
                    rel_x = mid_x / W
                    
                    if 0.18 <= rel_x < 0.52:
                        row_data["NarrParts"].append(w['text'])
                    elif 0.68 <= rel_x < 0.78:
                        val = clean_amount(w['text'])
                        if val != 0: row_data["Withdrawal"] = val
                    elif 0.78 <= rel_x < 0.88:
                        val = clean_amount(w['text'])
                        if val != 0: row_data["Deposit"] = val
                    elif rel_x >= 0.88:
                        bal_parts.append(w['text'])
                
                row_data["Balance"] = clean_amount(" ".join(bal_parts))
                
                all_rows.append({
                    "Date": row_data["Date"],
                    "Narration": " ".join(row_data["NarrParts"]),
                    "Dr": row_data["Withdrawal"],
                    "Cr": row_data["Deposit"],
                    "Balance": row_data["Balance"]
                })
            else:
                # Potential Multiline Narration continuation
                # Check if words sit in the 'Particulars' gate
                if all_rows:
                    extra_narr = []
                    for w in lw:
                        mid_x = (w['x0'] + w['x1']) / 2
                        if 0.18 <= (mid_x / W) < 0.52:
                            extra_narr.append(w['text'])
                    if extra_narr:
                        all_rows[-1]["Narration"] += " " + " ".join(extra_narr)

    # Convert to standard format
    dataset_1, dataset_2, dataset_3 = [], [], []
    for r in all_rows:
        dataset_1.append({"Date": r["Date"], "Dr": r["Dr"], "Cr": r["Cr"], "Balance": r["Balance"]})
        dataset_2.append({"Date": r["Date"], "Narration": r["Narration"]})
        dataset_3.append(r)
        
    return {"metadata": metadata, "dataset_1": dataset_1, "dataset_2": dataset_2, "dataset_3": dataset_3}

def extract_icici_detailed_statement(pdf, first_page_text) -> dict:
    dataset_1, dataset_2, dataset_3 = [], [], []
    metadata = {"account_name": "Unknown", "account_type": "Savings/Current Account"}
    
    # 1. Metadata Extraction
    name_match = re.search(r'Account Name\s*:\s*([A-Za-z0-9\s&\.,\-]+?)(?:\n|$)', first_page_text, re.IGNORECASE)
    if name_match:
        metadata["account_name"] = " ".join(name_match.group(1).strip().split())
    
    # 2. Sequential Extraction with Coordinate Gates
    # Column X-Gates (Approximate based on analysis - Expanded for Limit Account variants)
    COL_SRNO = (35, 150)
    COL_TXNDATE = (105, 230)
    COL_REMARKS = (230, 365)
    COL_DR = (365, 428)
    COL_CR = (428, 493)
    COL_BAL = (450, 650)
    
    all_rows = []
    
    for page in pdf.pages:
        words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
        if not words: continue
        
        # Cluster words into logical lines
        lines, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        for lw in lines:
            # Detect row start: Sr No is a number in the first column
            first_word = lw[0]['text']
            # ICICI Pattern: Row starts with a numeric Sr No in COL_SRNO AND must have a date on that line
            # This avoids catching Narration lines starting with numbers as false-positive rows
            line_text = " ".join([w['text'] for w in lw])
            has_date = re.search(r'\d{2}[/\- ]+(?:\d{2}|[A-Za-z]{3})[/\- ]+\d{2,4}', line_text)
            
            if re.match(r'^\d+$', first_word) and COL_SRNO[0] <= lw[0]['x0'] <= COL_SRNO[1] and has_date:
                row_data = {
                    "DateParts": [],
                    "NarrParts": [],
                    "DrParts": [], "CrParts": [], "BalParts": []
                }
                
                for w in lw:
                    mid_x = (w['x0'] + w['x1']) / 2
                    if COL_TXNDATE[0] <= mid_x <= COL_TXNDATE[1]:
                        row_data["DateParts"].append(w['text'])
                    elif COL_REMARKS[0] <= mid_x <= COL_REMARKS[1]:
                        row_data["NarrParts"].append(w['text'])
                    elif COL_DR[0] <= mid_x <= COL_DR[1]:
                        row_data["DrParts"].append(w['text'])
                    elif COL_CR[0] <= mid_x <= COL_CR[1]:
                        row_data["CrParts"].append(w['text'])
                    elif COL_BAL[0] <= mid_x <= COL_BAL[1]:
                        row_data["BalParts"].append(w['text'])
                
                all_rows.append({
                    "DateRaw": "".join(row_data["DateParts"]),
                    "Narration": " ".join(row_data["NarrParts"]),
                    "DrRaw": "".join(row_data["DrParts"]),
                    "CrRaw": "".join(row_data["CrParts"]),
                    "BalRaw": "".join(row_data["BalParts"])
                })
            elif all_rows:
                # Continuation of the previous row (Narration/Date/Math often span multiple lines)
                for w in lw:
                    mid_x = (w['x0'] + w['x1']) / 2
                    if COL_REMARKS[0] <= mid_x <= COL_REMARKS[1]:
                        all_rows[-1]["Narration"] += " " + w['text']
                    elif COL_TXNDATE[0] <= mid_x <= COL_TXNDATE[1]:
                        all_rows[-1]["DateRaw"] += w['text']
                    elif COL_DR[0] <= mid_x <= COL_DR[1]:
                        all_rows[-1]["DrRaw"] += w['text']
                    elif COL_CR[0] <= mid_x <= COL_CR[1]:
                        all_rows[-1]["CrRaw"] += w['text']
                    elif COL_BAL[0] <= mid_x <= COL_BAL[1]:
                        all_rows[-1]["BalRaw"] += w['text']

    # Finalize and Parse
    dataset_1, dataset_2, dataset_3 = [], [], []
    for r in all_rows:
        # Improved Date Extraction: Find the LAST valid date string in the combined raw data
        # Takes the last one to prioritize Transaction Date over Value Date if they're mashed
        raw_date_str = r["DateRaw"]
        # Match DD/MM/YYYY, DD-MMM-YYYY, DD/MM/YY etc.
        dates_found = re.findall(r'(\d{2}[/\- ]+(?:\d{2}|[A-Za-z]{3})[/\- ]+\d{2,4})', raw_date_str)
        if dates_found:
            parsed_date = parse_date(dates_found[-1])
        else:
            parsed_date = parse_date(raw_date_str)

        dr_val = clean_amount(r["DrRaw"])
        cr_val = clean_amount(r["CrRaw"])
        bal_val = clean_amount(r["BalRaw"])
        
        dataset_1.append({"Date": parsed_date, "Dr": dr_val, "Cr": cr_val, "Balance": bal_val})
        dataset_2.append({"Date": parsed_date, "Narration": r["Narration"].strip()})
        dataset_3.append({
            "Date": parsed_date,
            "Narration": r["Narration"].strip(),
            "Dr": dr_val,
            "Cr": cr_val,
            "Balance": bal_val
        })

    return {
        "metadata": metadata,
        "dataset_1": dataset_1,
        "dataset_2": dataset_2,
        "dataset_3": dataset_3
    }
def extract_icici_corporate_statement(pdf, first_page_text) -> dict:
    all_rows = []
    metadata = {"account_name": "Unknown", "account_type": "Current Account"}
    
    # 1. Metadata Extraction
    # Finding Name below "Your Details With Us:"
    lines = first_page_text.split('\n')
    for i, line in enumerate(lines):
        if "Your Details With Us:" in line:
            if i + 1 < len(lines):
                metadata["account_name"] = lines[i+1].strip()
            break

    # 2. Sequential Extraction with Coordinate Gates
    # Column X-Gates (Standard Current Account Layout)
    COL_TXNDATE = (15, 60)
    COL_REMARKS = (60, 240)
    COL_DR = (280, 350)
    COL_CR = (360, 420)
    COL_BAL = (530, 610)
    
    # Universal Page Shield Pattern: "Page X of Y" or "X of Y"
    page_patterns = [re.compile(r'^Page$', re.I), re.compile(r'^of$', re.I)]
    
    for page in pdf.pages:
        words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
        if not words: continue
        
        # Cluster words into logical lines
        lines_data, current_line, last_y = [], [], -1
        for w in words:
            # Shield: Skip obvious overlapping page fragments like "Page 18 of 18"
            txt = w['text'].strip()
            if any(p.match(txt) for p in page_patterns): continue
            # Skip pure numbers that sit in the extreme top/bottom overlap areas
            if txt.isdigit() and (w['top'] < 40 or w['top'] > 800): continue
            
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                lines_data.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines_data.append(current_line)
        
        for lw in lines_data:
            first_word = lw[0]['text'].strip()
            
            # Stop if we hit the disclaimer area
            full_line_text = " ".join([w['text'] for w in lw]).upper()
            if "LEGENDS FOR TRANSACTIONS" in full_line_text or "SINCERELY" in full_line_text or "TEAM ICICI BANK" in full_line_text:
                break
                
            # Pattern 2 Rows often start with a Date (DD-MM-YYYY or DD-MMM-YYYY)
            is_date_start = re.match(r'^\d{2}[/-]\d{2}[/-]\d{2,4}$|^\d{2}-[A-Za-z]{3}-\d{4}$', first_word)
            
            if is_date_start:
                row_data = {
                    "DateParts": [], "NarrParts": [],
                    "DrParts": [], "CrParts": [], "BalParts": []
                }
                for w in lw:
                    mid_x = (w['x0'] + w['x1']) / 2
                    if COL_TXNDATE[0] <= mid_x <= COL_TXNDATE[1]:
                        row_data["DateParts"].append(w['text'])
                    elif COL_REMARKS[0] <= mid_x <= COL_REMARKS[1]:
                        row_data["NarrParts"].append(w['text'])
                    elif COL_DR[0] <= mid_x <= COL_DR[1]:
                        row_data["DrParts"].append(w['text'])
                    elif COL_CR[0] <= mid_x <= COL_CR[1]:
                        row_data["CrParts"].append(w['text'])
                    elif COL_BAL[0] <= mid_x <= COL_BAL[1]:
                        row_data["BalParts"].append(w['text'])
                
                all_rows.append({
                    "DateRaw": "".join(row_data["DateParts"]),
                    "Narration": " ".join(row_data["NarrParts"]),
                    "DrRaw": "".join(row_data["DrParts"]),
                    "CrRaw": "".join(row_data["CrParts"]),
                    "BalRaw": "".join(row_data["BalParts"])
                })
            elif all_rows:
                # Continuation Logic for Multi-line Narrative or Split Numbers
                for w in lw:
                    mid_x = (w['x0'] + w['x1']) / 2
                    if COL_REMARKS[0] <= mid_x <= COL_REMARKS[1]:
                        all_rows[-1]["Narration"] += " " + w['text']
                    elif COL_TXNDATE[0] <= mid_x <= COL_TXNDATE[1]:
                        all_rows[-1]["DateRaw"] += w['text']
                    elif COL_DR[0] <= mid_x <= COL_DR[1]:
                        all_rows[-1]["DrRaw"] += w['text']
                    elif COL_CR[0] <= mid_x <= COL_CR[1]:
                        all_rows[-1]["CrRaw"] += w['text']
                    elif COL_BAL[0] <= mid_x <= COL_BAL[1]:
                        all_rows[-1]["BalRaw"] += w['text']

    # Final Pass: Mathematical Refinement
    dataset_1, dataset_2, dataset_3 = [], [], []
    for r in all_rows:
        parsed_date = parse_date(r["DateRaw"])
        dr_val = clean_amount(r["DrRaw"])
        cr_val = clean_amount(r["CrRaw"])
        bal_val = clean_amount(r["BalRaw"])
        
        dataset_1.append({"Date": parsed_date, "Dr": dr_val, "Cr": cr_val, "Balance": bal_val})
        dataset_2.append({"Date": parsed_date, "Narration": r["Narration"].strip()})
        dataset_3.append({
            "Date": parsed_date, "Narration": r["Narration"].strip(),
            "Dr": dr_val, "Cr": cr_val, "Balance": bal_val
        })

    return {
        "metadata": metadata,
        "dataset_1": dataset_1,
        "dataset_2": dataset_2,
        "dataset_3": dataset_3
    }

def extract_uco_limit_statement(pdf, first_page_text) -> dict:
    dataset_1, dataset_2, dataset_3 = [], [], []
    metadata = {
        "account_name": "Unknown",
        "account_type": "Limit Account (Masked Metadata)"
    }
    
    # 1. Metadata Extraction (STRICT MASKING: Only Name)
    name_match = re.search(r'Account Name\s*:\s*([A-Za-z0-9\s&\.,\-]+?)(?:\n|$|[A-Z][/])', first_page_text, re.IGNORECASE)
    if name_match:
        metadata["account_name"] = " ".join(name_match.group(1).strip().split())

    # 2. Sequential Extraction with coordinate gates
    all_rows = []
    # UCO Date Format: DD-MM-YYYY
    date_regex = re.compile(r'^\d{2}-\d{2}-\d{4}$')
    
    for page_idx, page in enumerate(pdf.pages):
        words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
        if not words: continue
        W = page.width
        
        # --- DYNAMIC BOUNDARY DETECTION (NOISE SHIELD) ---
        header_y = 0
        footer_y = page.height
        
        for w in words:
            txt_up = w['text'].upper().replace(" ", "")
            # Shield Header: Skip banner and "UCO Bank" titles
            if "HONOURSYOURTRUST" in txt_up or "UCOBANK" in txt_up:
                header_y = max(header_y, w['bottom'] + 5)
            # Find the actual Table Headers row to set a clean start point
            if "PARTICULARS" in txt_up or "WITHDRAWALS" in txt_up:
                header_y = max(header_y, w['bottom'] + 5)
            
            # Shield Footer: Disable extraction after Grand Total or system disclaimer
            if w['top'] > (page.height * 0.6):
                if "GRANDTOTAL" in txt_up or "SYSTEMGENERATEDREPORT" in txt_up or "REQUIREANYSIGNATURE" in txt_up:
                    footer_y = min(footer_y, w['top'] - 5)

        # 1. Cluster words into raw lines (strict 3px tolerance)
        raw_lines, current_line, last_y = [], [], -1
        for w in words:
            if w['top'] < header_y or w['bottom'] > footer_y: continue
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                raw_lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: raw_lines.append(current_line)
        
        # 2. Re-join lines if the second line is a continuation (amount line)
        combined_lines = []
        i = 0
        while i < len(raw_lines):
            current = raw_lines[i]
            # Peek at next line
            if i + 1 < len(raw_lines):
                next_l = raw_lines[i+1]
                # If next line is very close (~18px) and does NOT start with a date, it's a follow-up
                gap = next_l[0]['top'] - current[0]['top']
                if gap < 25 and not date_regex.match(next_l[0]['text']):
                    current.extend(next_l)
                    i += 1
            combined_lines.append(current)
            i += 1

        last_running_balance = None
        
        for lw in combined_lines:
            line_text = " ".join([w['text'] for w in lw]).upper()
            
            # --- NOISE FILTRATION ---
            if "STATEMENT OF ACCOUNT FOR THE PERIOD" in line_text: continue
            # Capture initial opening balance for the math shield
            if "OPENING BALANCE AS OF" in line_text: 
                bal_match = re.search(r'(-?[\d,]+\.\d{2})', line_text)
                if bal_match:
                    last_running_balance = clean_amount(bal_match.group(1))
                    if "DR" in line_text: last_running_balance = -abs(last_running_balance)
                continue
                
            if "GRAND TOTAL" in line_text: continue
            
            # Identify Transaction Row: Starts with Date
            if not date_regex.match(lw[0]['text']) or lw[0]['x0'] > 200: 
                continue
            
            # structural Gates for UCO Landscape (W=842)
            # 1. Date: ~0.15W
            # 2. Particulars: 0.18 - 0.55W
            # 3. CHQ.NO.: 0.55 - 0.65W
            # 4. Amount (Dr or Cr): 0.65 - 0.77W
            # 5. Balance: 0.77 - 0.85W
            # 6. Indicator (DR/CR): 0.85W+
            
            row_data = {
                "Date": parse_date(lw[0]['text']),
                "NarrParts": [],
                "ExtractedAmount": 0.0,
                "CurrentBalance": 0.0
            }
            
            bal_parts = []
            for w in lw:
                mid_x = (w['x0'] + w['x1']) / 2
                rel_x = mid_x / W
                
                # Check for Narration
                if 0.18 <= rel_x < 0.55:
                    row_data["NarrParts"].append(w['text'])
                # Amount (Withdrawal or Deposit column)
                elif 0.65 <= rel_x < 0.77:
                    val = clean_amount(w['text'])
                    if val != 0: row_data["ExtractedAmount"] = abs(val)
                # Balance column
                elif 0.77 <= rel_x < 0.85:
                    bal_parts.append(w['text'])
            
            # If nothing in balance column, look at indicator specifically
            row_indicator = " ".join([w['text'] for w in lw if (w['x0'] / W) > 0.83]).upper()
            
            row_data["CurrentBalance"] = clean_amount(" ".join(bal_parts))
            if "DR" in row_indicator:
                row_data["CurrentBalance"] = -abs(row_data["CurrentBalance"])
            
            # --- MATH INTEGRITY SHIELD (BALANCE SHIFT) ---
            dr, cr = 0.0, 0.0
            if last_running_balance is not None:
                delta = row_data["CurrentBalance"] - last_running_balance
                if delta > 0.01: # Deposit / BTO
                    cr = delta
                elif delta < -0.01: # Withdrawal
                    dr = abs(delta)
                
                # Final check: if balance shift confirms a delta but amount column was missed
                if dr == 0 and cr == 0 and row_data["ExtractedAmount"] > 0:
                    delta_abs = abs(delta)
                    if delta_abs < 0.01: # No balance shift but amount found
                        dr = row_data["ExtractedAmount"]
            else:
                # First row fallback logic
                dr = row_data["ExtractedAmount"]
                
            last_running_balance = row_data["CurrentBalance"]

            all_rows.append({
                "Date": row_data["Date"],
                "Narration": " ".join(row_data["NarrParts"]).strip(),
                "Dr": dr,
                "Cr": cr,
                "Balance": row_data["CurrentBalance"]
            })

    # Chrono Correct
    if len(all_rows) > 1 and all_rows[0]["Date"] > all_rows[-1]["Date"]:
        all_rows.reverse()

    for r in all_rows:
        dataset_1.append({"Date": r["Date"], "Dr": r["Dr"], "Cr": r["Cr"], "Balance": r["Balance"]})
        dataset_2.append({"Date": r["Date"], "Narration": r["Narration"]})
        dataset_3.append(r)
        
    return {"metadata": metadata, "dataset_1": dataset_1, "dataset_2": dataset_2, "dataset_3": dataset_3}
def extract_cub_statement(pdf, first_page_text) -> dict:
    dataset_1 = []
    dataset_2 = []
    dataset_3 = []
    metadata = {"account_name": "Unknown", "account_type": "CUB Limit Account"}
    
    # Metadata Discovery
    lines = first_page_text.split('\n')
    for line in lines[:20]:
        if "Name" in line:
            metadata["account_name"] = line.split(":", 1)[-1].strip()
            break

    last_running_balance = None
    all_rows = []

    for page in pdf.pages:
        words = page.extract_words()
        if not words: continue
        
        # 1. Page Header Sifting (Dynamic Column Locking)
        col_gates = {"Dr": None, "Cr": None, "Bal": None}
        table_top_y = 0

        # Create sorted lines for header search
        page_lines, current_line, last_y = [], [], -1
        sorted_words = sorted(words, key=lambda x: (x['top'], x['x0']))
        for w in sorted_words:
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                page_lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: page_lines.append(current_line)

        for lw in page_lines:
            line_txt = " ".join([w['text'] for w in lw]).upper()
            if "DEBIT" in line_txt or "CREDIT" in line_txt or "BALANCE" in line_txt:
                table_top_y = lw[0]['bottom'] + 2
                for w in lw:
                    txt = w['text'].upper()
                    mid_x = (w['x0'] + w['x1']) / 2
                    if "DEBIT" in txt or "WITHDRAWAL" in txt: col_gates["Dr"] = mid_x
                    elif "CREDIT" in txt or "DEPOSIT" in txt: col_gates["Cr"] = mid_x
                    elif "BALANCE" in txt: col_gates["Bal"] = mid_x
                break
        
        # Default gates if detection missed (CUB Standard Layout)
        if not col_gates["Bal"]: 
            col_gates = {"Dr": 415, "Cr": 515, "Bal": 615} # Points
            table_top_y = 250 # Common CUB top margin
            
        # 2. Precision Extraction Pass
        date_regex = re.compile(r'\d{2}[/\-]\d{2}[/\-]\d{2,4}')
        
        for lw in page_lines:
            if lw[0]['top'] < table_top_y: continue
            
            line_txt = " ".join([w['text'] for w in lw])
            date_match = date_regex.search(line_txt)
            if not date_match: continue
            
            parsed_date = parse_date(date_match.group(0))
            if not parsed_date: continue
            
            raw_dr, raw_cr, raw_bal = 0.0, 0.0, 0.0
            narr_parts = []
            
            for w in lw:
                txt = w['text'].replace(",","")
                mid_x = (w['x0'] + w['x1']) / 2
                
                # Assign by GATES (Visual alignment is Law)
                if abs(mid_x - col_gates["Dr"]) < 35 and re.search(r'\d+\.\d{2}', txt):
                    raw_dr = clean_amount(txt)
                elif abs(mid_x - col_gates["Cr"]) < 35 and re.search(r'\d+\.\d{2}', txt):
                    raw_cr = clean_amount(txt)
                elif abs(mid_x - col_gates["Bal"]) < 45 and re.search(r'\d+\.\d{2}', txt):
                    raw_bal = clean_amount(txt)
                elif 80 < mid_x < 350:
                    narr_parts.append(w['text'])

            # Math Validation Layer
            if last_running_balance is not None and abs(raw_bal) > 0.01:
                calc_delta = round(raw_bal - last_running_balance, 2)
                # If column extraction failed but balance shift exists, trust the shift
                if raw_dr == 0 and raw_cr == 0 and abs(calc_delta) > 0.01:
                    if calc_delta > 0: raw_cr = calc_delta
                    else: raw_dr = abs(calc_delta)
            
            if abs(raw_bal) > 0.01:
                last_running_balance = raw_bal
            
            all_rows.append({
                "Date": parsed_date,
                "Narration": " ".join(narr_parts).replace(date_match.group(0), "").strip(),
                "Dr": abs(raw_dr), "Cr": abs(raw_cr), "Balance": raw_bal
            })

    # Chrono Correction
    if len(all_rows) > 1 and all_rows[0]["Date"] > all_rows[-1]["Date"]:
        all_rows.reverse()

    for r in all_rows:
        dataset_1.append({"Date": r["Date"], "Dr": r["Dr"], "Cr": r["Cr"], "Balance": r["Balance"]})
        dataset_2.append({"Date": r["Date"], "Narration": r["Narration"]})
        dataset_3.append(r)
        
    return {"metadata": metadata, "dataset_1": dataset_1, "dataset_2": dataset_2, "dataset_3": dataset_3}


def extract_idfc_testing_statement(pdf, first_page_text):
    print(">>> [IDFC_E_DEBUG] - EXECUTING ACTIVE ENGINE VERSION 4.0 -")
    dataset_1, dataset_2, dataset_3 = [], [], []
    metadata = {"account_name": "Unknown", "account_type": "IDFC Bank Statement"}
    
    # Metadata Discovery
    lines = first_page_text.split('\n')
    for line in lines[:20]:
        if "CUSTOMER NAME" in line.upper():
            metadata["account_name"] = line.split(":", 1)[-1].strip()
            break
            
    all_rows = []
    active_row = None 
    
    for page in pdf.pages:
        try:
            words = page.extract_words()
            if not words: continue
            
            # Dynamic Pillar discovery per page
            col_gates = {"Dr": None, "Cr": None, "Bal": None}
            page_lines, current_line, last_y = [], [], -1
            sorted_words = sorted(words, key=lambda x: (x['top'], x['x0']))
            for w in sorted_words:
                if last_y == -1 or abs(w['top'] - last_y) < 3.5: current_line.append(w)
                else:
                    page_lines.append(current_line); current_line = [w]
                last_y = w['top']
            if current_line: page_lines.append(current_line)
            
            for lw in page_lines:
                txt_full = " ".join([w['text'] for w in lw]).upper()
                if "PARTICULARS" in txt_full or "BALANCE" in txt_full:
                    for w in lw:
                        txt = w['text'].upper()
                        mid_x = (w['x0'] + w['x1']) / 2
                        # IDFC Specific Pillar Offsets (X-Ray Validated)
                        if "DEBIT" in txt or "WITHDRAWAL" in txt: col_gates["Dr"] = mid_x
                        elif "CREDIT" in txt or "DEPOSIT" in txt: col_gates["Cr"] = mid_x
                        elif "BALANCE" in txt: col_gates["Bal"] = mid_x
            
            # X-Ray Validated Failover Grid
            if not col_gates["Dr"]: col_gates = {"Dr": 405, "Cr": 475, "Bal": 550} 
            
            for lw in page_lines:
                line_txt = " ".join([w['text'] for w in lw])
                date_match = re.search(r'\d{1,2}-[A-Za-z]{3}-\d{4}', line_txt)
                
                if date_match:
                    if active_row: all_rows.append(active_row)
                    parsed_date = parse_date(date_match.group(0))
                    if not parsed_date: continue
                    
                    active_row = {"Date": parsed_date, "Narration": "", "Dr": 0.0, "Cr": 0.0, "Balance": 0.0}
                    for w in lw:
                        cln = w['text'].replace(",","").replace("(","").replace(")","").strip()
                        mid_x = (w['x0'] + w['x1']) / 2
                        if re.search(r'\d+\.\d{2}', cln):
                            val = abs(clean_amount(cln))
                            # Tightened Gates (+/- 35px) to prevent column leaping
                            if col_gates["Dr"] and abs(mid_x - col_gates["Dr"]) < 35: active_row["Dr"] = val
                            elif col_gates["Cr"] and abs(mid_x - col_gates["Cr"]) < 35: active_row["Cr"] = val
                            elif col_gates["Bal"] and abs(mid_x - col_gates["Bal"]) < 60: active_row["Balance"] = val
                    
                    active_row["Narration"] = line_txt.replace(date_match.group(0), "").strip()
                    for w in lw:
                        if re.search(r'\d+\.\d{2}', w['text']): active_row["Narration"] = active_row["Narration"].replace(w['text'], "").strip()
                
                elif active_row:
                    narr_cont = " ".join([w['text'] for w in lw if 100 < (w['x0']+w['x1'])/2 < 380]).strip()
                    if narr_cont and len(narr_cont) > 2 and "PAGE" not in narr_cont.upper():
                        active_row["Narration"] += " " + narr_cont
        except: continue

    if active_row: all_rows.append(active_row)
    print(f">>> [IDFC Engine] Extraction Complete. Total Rows: {len(all_rows)}")

    # Sort and finalize
    if len(all_rows) > 1 and all_rows[0]["Date"] > all_rows[-1]["Date"]:
        all_rows.reverse()
        
    for r in all_rows:
        dataset_1.append({"Date": r["Date"], "Dr": r["Dr"], "Cr": r["Cr"], "Balance": r["Balance"]})
        dataset_2.append({"Date": r["Date"], "Narration": r["Narration"]})
        dataset_3.append(r)
        
    return {"metadata": metadata, "dataset_1": dataset_1, "dataset_2": dataset_2, "dataset_3": dataset_3}


class UnifiedBankBrain:
    """
    V8.0 Unified Ironclad Engine: The Single Source of Truth for all Bank Extractions.
    Consolidates Geography (Pillars), Chronology (Sniffer), and Math (Floor Shifter).
    """
    def __init__(self, pdf):
        self.pdf = pdf
        self.bank_type = "GENERIC"
        self.metadata = {"account_name": "N/A", "bank": "Unknown"} # Strictly disabled metadata
        self.pillars = []
        self.named_pillars = {"Date": None, "Narr": None, "Dr": None, "Cr": None, "Bal": None}
        self.is_descending = False
        self.header_y = 50
        self.narrative_shield_x = 100
        # V10.6 Grand Universal Date Key: 100% coverage for all 37 banks (including IndusInd & Indian Bank)
        # Improved to handle '02-Sep- 2023' (split) and '02-Sep-2023' (standard)
        self.date_regex = re.compile(r'\b\d{1,2}[-/ ](?:\d{1,2}|[A-Za-z]{3}-?)[-/ ]{1,2}\d{2,4}\b|\b\d{1,2}[-/]\d{1,2}\b')

        
        # --- THE GRAND UNIFIED KNOWLEDGE BANK (V8.2 - Strictly Transactions) ---
        self.knowledge = {
            "HDFC": {
                "cleaning": [r'CHQ/REF', r'UPI-[\w\-\.\@]+', r'NEFT-[\w\-\.\@]+', r'IMPS-[\w\-\.\@]+'],
                "shields": [r'CLOSING\s*BALANCE\s*INCLUDES', r'HDFC\s*BANK\s*LIMITED']
            },
            "SBI": {
                "cleaning": [r'UPI-[\w\-\.\@]+', r'TRANSFER FROM', r'TRANSFER TO', r'NEFT-[\w\-\.\@]+', r'IMPS-[\w\-\.\@]+'],
                "shields": [r'OPENING\s*BALANCE\s*:', r'CLOSING\s*BALANCE\s*:'],
                "gates": {"Date": (15, 135), "Narr": (135, 380), "Amt": (380, 515), "Bal": (515, 650)} # Refined SBI Grid V8.1
            },
            "ICICI": {
                "cleaning": [r'INF/', r'SR NO\s+VALUE\s+DATE', r'n Date Number n Remarks'], 
                "shields": [r'LEGENDS FOR TRANSACTIONS', r'SINCERELY', r'TEAM ICICI BANK']
            },
            "AU": {
                "cleaning": [r'\s+DR$', r'\s+CR$', r'UPI/\d+/'], 
                "shields": [r'END\s*OF\s*STATEMENT']
            },
            "AXIS": {
                "cleaning": [r'UPI-[\w\-\.\@]+', r'IMPS-[\w\-\.\@]+', r'NEFT-[\w\-\.\@]+', r'\d{6}\s+(?:DR|CR)$', r'INIT\.\s*BR'],
                "shields": [r'OPENING\s*BALANCE', r'CLOSING\s*BALANCE'],
                "gates": {"Date": (30, 110), "Narr": (110, 310), "Dr": (310, 395), "Cr": (395, 480), "Bal": (480, 538)}
            },
            "INDUSIND": {
                "cleaning": [r'UPI-[\w\-\.\@]+', r'IMPS-[\w\-\.\@]+']
            },
            "BOM": {
                "shields": [r'TOTAL', r'NOTE:', r'THIS IS A LINE']
            },
            "UCO": {
                "shields": [r'GRAND TOTAL', r'SYSTEM GENERATED REPORT', r'REQUIRE ANY SIGNATURE', r'OPENING\s*BALANCE', r'CLOSING\s*BALANCE', r'STATEMENTOFACCOUNT'],
                "gates": {"Date": (40, 115), "Narr": (115, 380), "Amt": (380, 520), "Bal": (520, 630)},
                "header_threshold": 180
            },
            "CANARA": {
                "cleaning": [r'MB-IMPS', r'UPI-[\w\-\.\@]+'],
                "gates": {"Date": (35, 135), "Narr": (135, 400), "Dr": (400, 455), "Cr": (455, 515), "Bal": (515, 650)}
            },
            "IDFC": {
                "cleaning": [r'UPI/MOB/[\d/]+', r'from PhonePe'],
                "gates": {"Date": (20, 140), "Narr": (140, 360), "Dr": (360, 430), "Cr": (430, 500), "Bal": (500, 590)}
            }
        }

    def detect_layout(self):
        """
        Unified Layout Discovery: Fingerprints the bank and identifies the coordinate map.
        V11.6: Strict Header Fingerprinting. Only looks at the top 250px of Page 1
        to avoid 'Narration Poisoning' from bank names appearing in transactions.
        """
        p = self.pdf.pages[0]
        words = p.extract_words()
        
        # Extract only the top portion for bank identification
        header_zone = (0, 0, p.width, 250)
        header_text = p.within_bbox(header_zone).extract_text() or ""
        txt_up = header_text.upper().replace(" ","").replace("\n","")
        
        # 1. Footprint Detection (Strict Header Search)
        # Priority 1: Axis / Canara / Specific Signatures
        if "AXISBANK" in txt_up or "UTIB" in txt_up or "STATEMENTOFAXIS" in txt_up: self.bank_type = "AXIS"
        elif "CANARABANK" in txt_up or "CNRB" in txt_up: self.bank_type = "CANARA"
        elif "HDFCBANK" in txt_up: self.bank_type = "HDFC"
        elif "STATEBANKOFINDIA" in txt_up: self.bank_type = "SBI" 
        elif "INDUSIND" in txt_up: self.bank_type = "INDUSIND"
        elif any(kw in txt_up for kw in ["AUBANK", "AUSMALL", "AUQR", "AUSFB", "AUCURRENT", "AUBL"]): self.bank_type = "AU"
        elif "IDBIBANK" in txt_up or "IDB0" in txt_up: self.bank_type = "IDBI"
        elif "ICICIBANK" in txt_up or "DETAILEDSTATEMENT" in txt_up: self.bank_type = "ICICI"
        elif "IDFC" in txt_up or "IDFCFIRST" in txt_up: self.bank_type = "IDFC"
        
        print(f">>> [Unified Brain] Professional Context Identified: {self.bank_type}")
        
        # 2. Metadata Extraction - REMOVED PER USER REQUEST
        # (Strictly transactions only mode)
        
        # 3. Dynamic Pillar Discovery (Fallback for unknown layouts)
        self.discover_pillars(words)
        
        # 4. Final Verification: Relaxed Date Gate for V9.2
        self.date_gate_width = 50 # Relaxed from 30
        
        # 4. Chronology Sniffer (Sampling transaction zone)
        self.detect_chronology()

    def discover_pillars(self, words):
        x_centers = []
        toxic_zones = []
        for w in words:
            txt = (w.get('text') or "").replace(",","")
            if re.search(r'\b\d{10,19}\b', txt): toxic_zones.append(round((w['x0'] + w['x1'])/2))
            # V11.0: Added parenthetical support to catch (Balance) columns
            dna_parts = re.findall(r'\(?\d+(?:,\d+)*\.\d{2}\)?|\b\d{4,8}\b', txt)
            for part in dna_parts: x_centers.append(round((w['x0'] + w['x1'])/2))
        
        if x_centers:
            valid_centers = [xc for xc in x_centers if not any(abs(xc - tx) < 5 for tx in toxic_zones)]
            if valid_centers:
                self.pillars = sorted([p[0] for p in Counter(valid_centers).most_common(5)])
                self.narrative_shield_x = max(100, self.pillars[0] - 25)

        # 2. Semantic Header Discovery
        lines, current_line, last_y = [], [], -1
        sorted_words = sorted(words, key=lambda x: (x.get('top', 0), x.get('x0', 0)))
        for w in sorted_words:
            if not w.get('text'): continue
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        for lw in lines:
            txt_full = " ".join([w.get('text', '') for w in lw]).upper()
            # V10.2 Metadata Shield: Require at least 3 keywords to trust this is a table header
            keywords = ["DATE", "PARTICULARS", "DESCRIPTION", "DEBIT", "CREDIT", "BALANCE", "VALUE", "POST", "WITHDRAWAL", "DEPOSIT", "REF", "CHQ"]
            match_count = sum(1 for k in keywords if k in txt_full)
            
            if match_count >= 3 or ("VALUE" in txt_full and "DATE" in txt_full and "BALANCE" in txt_full):
                self.header_y = lw[0]['top']
                # Semantic Mapping & Noise Shielding
                noise_x = []
                for w in lw:
                    txt = w.get('text', "").upper()
                    mid_x = (w['x0'] + w['x1']) / 2
                    if any(k in txt for k in ["DATE", "TXN", "VALUE"]): self.named_pillars["Date"] = mid_x
                    elif any(k in txt for k in ["DEBIT", "WITHDRAWAL"]): self.named_pillars["Dr"] = mid_x
                    elif any(k in txt for k in ["CREDIT", "DEPOSIT"]): self.named_pillars["Cr"] = mid_x
                    elif "BALANCE" in txt: self.named_pillars["Bal"] = mid_x
                    elif any(k in txt for k in ["INIT.", "BR.", "CODE", "RTN", "SR NO"]): noise_x.append(mid_x)
                
                # Neutralize pillars that fall into Noise Zones
                if noise_x:
                    self.pillars = [p for p in self.pillars if not any(abs(p - nx) < 15 for nx in noise_x)]
                break
        
        # V10.3 Pattern-Match Fallback: If no header found, find the first line that LOOKS like a transaction
        if self.header_y == 0:
            for lw in lines:
                txt_line = " ".join([w.get('text', '') for w in lw])
                if self.date_regex.search(txt_line) and re.search(r'\d+\.\d{2}', txt_line):
                    self.header_y = lw[0]['top'] - 10 # Start extraction just above this line
                    print(f">>> [Unified Brain] Headerless Recovery triggered at Y={self.header_y}")
                    break
        
        if self.header_y == 0: self.header_y = 50 
            
        # 3. Chronology Peek Phase
        self.detect_chronology()


    def polish_narration(self, narr):
        if not narr: return ""
        # Clean CID (9) in narration as requested
        narr = narr.replace("(cid:9)", " ").strip()
        if self.bank_type == "GENERIC": return narr
        rules = self.knowledge.get(self.bank_type, {}).get("cleaning", [])
        for pattern in rules:
            narr = re.sub(pattern, "", narr, flags=re.IGNORECASE)
        return re.sub(r'Page \d+ of \d+', '', narr, flags=re.IGNORECASE).strip()

    def detect_chronology(self):
        """
        Preliminary Chronology Peek: Samples dates to get a 'hint' of the order.
        The final decision is now made by the Math Parity Audit in extract().
        """
        all_dates = []
        year_ctx = detect_statement_year_context(self.pdf)
        date_px = self.named_pillars.get("Date") or 60
        
        # Sample pages (First and Last)
        pages_to_sample = [self.pdf.pages[0]]
        if len(self.pdf.pages) > 1: pages_to_sample.append(self.pdf.pages[-1])
        
        for page in pages_to_sample:
            h_y = 180 if page.page_number == 1 else 40
            crop_zone = (0, h_y, page.width, page.height - 40)
            words = page.within_bbox(crop_zone).extract_words()
            
            # Pillar-Locked sampling to avoid narration noise
            date_col_words = [w for w in words if abs(((w['x0']+w['x1'])/2) - date_px) < 50]
            date_col_txt = " ".join([w['text'] for w in date_col_words])
            
            dates = [parse_date(d, year_ctx) for d in self.date_regex.findall(date_col_txt) if parse_date(d, year_ctx)]
            all_dates.extend(dates)
            
        unique_dates = []
        for d in all_dates:
            if not unique_dates or d != unique_dates[-1]:
                unique_dates.append(d)
        
        if len(unique_dates) >= 2:
            self.is_descending = (unique_dates[0] > unique_dates[-1])
        else:
            self.is_descending = False # Default to Ascending, Math Audit will correct if wrong.


    def extract(self):
        """
        Unified Extraction Loop: Processes pages using either Template Gates or Dynamic Discovery.
        Includes vertical stitching, serial shielding, and floor-shifter reconciliation.
        """
        all_datasets = {"ds1": [], "ds2": [], "ds3": []}
        all_rows = []
        year_ctx = detect_statement_year_context(self.pdf)
        
        # 1. Establish Opening Balance Anchor
        prev_bal_anchor = 0.0
        found_anchor = False
        for page in self.pdf.pages[:1]:
            # V8.2: Dynamic Anchor Search zone (Everything above the discovered headers)
            h_text = page.within_bbox((0, 0, page.width, self.header_y + 5)).extract_text()
            if h_text:
                h_text = h_text.replace("(cid:9)", " ").replace("\x00", "")
                # V8.1 Robust Anchor Search: Handles dates between label and amount
                m = re.search(r'(?:OPENING\s*BALANCE|Balance\s*b/f|Start\s*Balance|Balance\s*at\s*start\s*of|Balance\s*as\s*on).*?[:\-]?\s*(-?[\d,]+\.\d{2})', h_text, re.I)
                if m:
                    prev_bal_anchor = clean_amount(m.group(1))
                    found_anchor = True
                    print(f">>> [Unified Engine] Found Opening Balance Anchor: {prev_bal_anchor}")

        # 2. Get Bank-Specific Middleware Config
        config = self.knowledge.get(self.bank_type, {})
        gates = config.get("gates")
        h_threshold = config.get("header_threshold", 150)
        shields = config.get("shields", [])
        
        leftover_line = None
        for page_idx, page in enumerate(self.pdf.pages):
            # V8.2: Dynamic Top-Down Start (Starts exactly below the table headers on Page 1)
            h_y = self.header_y if page_idx == 0 else 40
            words = sorted(page.extract_words(), key=lambda x: (x.get('top', 0), x.get('x0', 0)))
            
            # --- ROW GROUPING & STITCHING ---
            raw_lines, current_line, last_y = [], [], -1
            for w in words:
                if w.get('top', 0) < h_y or not w.get('text'): continue
                if last_y == -1 or abs(w['top'] - last_y) < 3.5: current_line.append(w)
                else: 
                    raw_lines.append(current_line); current_line = [w]
                last_y = w['top']
            if current_line: raw_lines.append(current_line)

            combined = []
            if leftover_line: combined.append(leftover_line); leftover_line = None
            i = 0
            while i < len(raw_lines):
                curr = raw_lines[i]
                if i+1 < len(raw_lines):
                    nxt = raw_lines[i+1]
                    dist = nxt[0]['top'] - curr[0]['top']
                    curr_txt = " ".join([w.get('text', "") for w in curr])
                    nxt_txt = " ".join([w.get('text', "") for w in nxt])
                    # Vertical Date Stitching (IndusInd Pattern)
                    is_split_date = (re.search(r'^\d{4}-?$', curr[0]['text']) and re.search(r'^-?\d{2}-\d{2}', nxt[0]['text']) and dist < 25)
                    
                    # V11.2: Opening Balance Shield. Never stitch Opening Balance with a transaction row.
                    is_opening_line = "OPENING BALANCE" in curr_txt.upper()
                    
                    # V11.4: Increased stitching distance for Axis and robust header skipping
                    stitch = is_split_date or (not self.date_regex.search(curr_txt) and dist < 40 and not is_opening_line)
                    if stitch:
                        if is_split_date:
                            year_part = re.search(r'^\d{4}-?', curr_txt).group(0).replace("-", "")
                            md_part = re.search(r'^-?\d{2}-\d{2}', nxt_txt).group(0).lstrip("-")
                            curr[0]['text'] = f"{year_part}-{md_part}"
                            nxt[0]['text'] = nxt[0]['text'].replace(re.search(r'^-?\d{2}-\d{2}', nxt_txt).group(0), "", 1).strip()
                        curr.extend(nxt); i += 1
                combined.append(curr); i += 1

            for lw in combined:
                # Serial Number Shield (Ignore far-left numbers)
                start_idx = 1 if (re.match(r'^\(?\d+\)?$', lw[0]['text']) and lw[0]['x1'] < 65) else 0
                active_lw = lw[start_idx:]
                line_txt = " ".join([w['text'] for w in active_lw])
                
                # Keyword Exclusion Shield: V8.2 - Expanded to block all header/metadata noise
                if any(kw in line_txt.lower() for kw in [
                    "period", "account no", "from :", "to :", "page", "tran date", "particulars", 
                    "balance as on", "statement from", "customer name", "account name", "address",
                    "ifsc", "micr", "nominee", "txn date", "value date", "ref no", "cheque no",
                    "detailed statement", "transaction date", "brought forward", "carried forward",
                    "closing balance", "opening balance", "total amount", "generated on"
                ]): continue
                
                if any(re.search(s, line_txt, re.I) for s in shields): break
                
                # V9.0: Decoupled Extraction Phase 1 (Math Pillars Only)
                # Strictly look for the Date in the detected Date Column X-range
                date_px = self.named_pillars.get("Date") or 60
                gate_w = getattr(self, 'date_gate_width', 50)
                
                # V10.2 Adaptive Date Sniffer: If primary gate fails, sweep nearby pillars
                date_match = None
                date_anchor_x1 = 100 # default
                date_words = [w for w in active_lw if abs(((w['x0']+w['x1'])/2) - date_px) < gate_w]
                if date_words:
                    date_txt = " ".join([w['text'] for w in date_words])
                    m = self.date_regex.search(date_txt)
                    # V11.3: Axis Strict Start. For Axis, the date MUST be at the very start of the word list
                    # AND it must be a standalone-looking token (no colons before it)
                    is_axis_start = (self.bank_type == "AXIS" and date_words[0] == active_lw[0] and ":" not in date_words[0]['text'])
                    if m and parse_date(m.group(0), year_ctx):
                        if self.bank_type != "AXIS" or is_axis_start:
                            date_match = m
                            date_anchor_x1 = max([w['x1'] for w in date_words])
                
                if not date_match:
                    # Fallback: Check if ANY word in the row is a date and is on the left margin
                    for w in active_lw:
                        if w['x0'] < 150:
                            m = self.date_regex.search(w['text'])
                            if m and parse_date(m.group(0), year_ctx):
                                date_match = m
                                date_anchor_x1 = w['x1']
                                break
                            
                if not date_match: continue
                
                # Critical Gate: Narratives must be to the RIGHT of the date anchor to prevent bleeding.
                # Using a small +2 offset to ensure we don't accidentally skip narrative text 
                # that starts close to the date column.
                active_lw = [w for w in lw if w['x0'] > date_anchor_x1 + 2]
                parsed_date = parse_date(date_match.group(0), year_ctx)
                if not parsed_date: continue

                # Extraction (Template vs Discovery)
                if gates:
                    # Template-Based (High Precision)
                    bal_str = " ".join([w['text'] for w in active_lw if gates["Bal"][0] <= (w['x0']+w['x1'])/2 < gates["Bal"][1]])
                    curr_bal = clean_amount(bal_str)
                    
                    if "Amt" in gates:
                        # Single-column amount (Dr/Cr distinguished by text indicator)
                        amt_str = " ".join([w['text'] for w in active_lw if gates["Amt"][0] <= (w['x0']+w['x1'])/2 < gates["Amt"][1]])
                        dr = clean_amount(amt_str) if "DR" in line_txt.upper() or "-" in amt_str else 0.0
                        cr = clean_amount(amt_str) if "CR" in line_txt.upper() or (not dr and amt_str) else 0.0
                    else:
                        # Separate Dr and Cr columns
                        dr_str = " ".join([w['text'] for w in active_lw if gates["Dr"][0] <= (w['x0']+w['x1'])/2 < gates["Dr"][1]])
                        cr_str = " ".join([w['text'] for w in active_lw if gates["Cr"][0] <= (w['x0']+w['x1'])/2 < gates["Cr"][1]])
                        dr = clean_amount(dr_str)
                        cr = clean_amount(cr_str)
                        
                    clean_narr = self.polish_narration(" ".join([w['text'] for w in active_lw if gates["Narr"][0] <= (w['x0']+w['x1'])/2 < gates["Narr"][1]]))
                else:
                    # Dynamic Discovery Fallback: Use named pillars from headers if available
                    bal_px = self.named_pillars["Bal"] or (self.pillars[-1] if self.pillars else 540)
                    dr_px = self.named_pillars["Dr"]
                    cr_px = self.named_pillars["Cr"]
                    
                    # V9.7: Tightened Dynamic Gate (20px) to prevent Narration Leakage
                    bal_str = " ".join([w['text'] for w in active_lw if abs(((w['x0']+w['x1'])/2) - bal_px) < 20])
                    curr_bal = clean_amount(bal_str)
                    
                    dr, cr = 0.0, 0.0
                    # If we have distinct Dr/Cr columns from headers, use them
                    if dr_px and cr_px:
                        dr = clean_amount(" ".join([w['text'] for w in active_lw if abs(((w['x0']+w['x1'])/2) - dr_px) < 25]))
                        cr = clean_amount(" ".join([w['text'] for w in active_lw if abs(((w['x0']+w['x1'])/2) - cr_px) < 25]))
                    
                    clean_narr = self.polish_narration(" ".join([w['text'] for w in active_lw if not any(abs(((w['x0']+w['x1'])/2) - px) < 25 for px in self.pillars) and not self.date_regex.search(w['text'])]))

                all_rows.append({"Date": parsed_date, "Narration": clean_narr, "Dr": dr, "Cr": cr, "Balance": curr_bal})

        if all_rows:
            # --- V9.5 MATH-BASED CHRONOLOGY AUDIT ---
            # We verify the direction by checking which order yields fewer math errors.
            def count_math_errors(rows):
                errors = 0
                for j in range(1, len(rows)):
                    # A 'shift' should exist if Dr/Cr were found, or we trust balance movement
                    b1, b2 = rows[j-1]["Balance"], rows[j]["Balance"]
                    if b1 == 0 or b2 == 0: continue # Skip zero-rows for audit
                    
                    # In ascending order, movement should be B2 - B1
                    delta = round(b2 - b1, 2)
                    # If there's a significant date gap but no math shift, it might be okay,
                    # but if there is a shift, it MUST match the Dr/Cr logic.
                    if rows[j]["Dr"] > 0 and abs(delta + rows[j]["Dr"]) > 0.1: errors += 1
                    if rows[j]["Cr"] > 0 and abs(delta - rows[j]["Cr"]) > 0.1: errors += 1
                return errors

            # Test Natural Order vs Reversed Order
            err_natural = count_math_errors(all_rows)
            err_reversed = count_math_errors(all_rows[::-1])
            
            # --- V9.8 DATE GRADIENT SENSOR ---
            force_reverse = False
            if err_natural == err_reversed and len(all_rows) > 1:
                # If math is tied (Double-Blind), use the Date Gradient.
                # If Row 0 is after Row N, it's definitely Descending.
                if all_rows[0]["Date"] > all_rows[-1]["Date"]:
                    force_reverse = True
                    print(">>> [Chronology Sensor] Date Gradient detected Descending order. Flipping.")

            if err_reversed < err_natural or force_reverse:
                all_rows.reverse()
                self.is_descending = True
                print(f">>> [Chronology Sensor] Descending Order Verified (Math Errors: {err_reversed} vs {err_natural})")
            else:
                self.is_descending = False
                print(f">>> [Chronology Sensor] Ascending Order Verified (Math Errors: {err_natural} vs {err_reversed})")
            
            # 2. Standardized Math Reconciliation (Floor Shifter)
            # V8.5 Smart Anchoring: Use opening balance as Row 0 for context and math stability.
            if found_anchor and prev_bal_anchor != 0:
                # Prepend the anchor as a reference row (not for calculation)
                all_rows.insert(0, {
                    "Date": all_rows[0]["Date"],
                    "Narration": "OPENING BALANCE",
                    "Dr": 0.0, "Cr": 0.0,
                    "Balance": prev_bal_anchor
                })
                cur_prev = prev_bal_anchor
                start_idx = 1
            else:
                # No anchor found: Trust the first row's balance as the starting point
                cur_prev = all_rows[0].get("Balance", 0.0)
                start_idx = 1 # Skip first row's math to avoid hallucinating deltas from zero

            for i in range(start_idx, len(all_rows)):
                r = all_rows[i]
                bal = r.get("Balance")
                if bal is None or bal == 0: 
                    # Use mathematical recovery if balance is missing but Dr/Cr exist
                    if r["Dr"] > 0: r["Balance"] = round(cur_prev - r["Dr"], 2)
                    elif r["Cr"] > 0: r["Balance"] = round(cur_prev + r["Cr"], 2)
                    else: r["Balance"] = cur_prev
                
                delta = round(r["Balance"] - cur_prev, 2)
                if abs(delta) > 0.01:
                    if delta > 0: 
                        r["Cr"], r["Dr"] = abs(delta), 0.0
                    else: 
                        r["Cr"], r["Dr"] = 0.0, abs(delta)
                else:
                    # V8.4: Zero-Shift Muffling. If balance didn't move, this is likely 
                    # a narration continuation or noise. Force amounts to zero.
                    r["Cr"], r["Dr"] = 0.0, 0.0
                    
                cur_prev = r["Balance"]

            # 3. Final Dataset Assembly
            filtered_rows = []
            cur_prev = None
            
            for i, r in enumerate(all_rows):
                # V10.9: Strict Zero-Movement Pruning
                # If a row has 0 Dr, 0 Cr, and no balance change, AND its narration is 
                # either empty or matches a header keyword, drop it as phantom noise.
                is_opening = "OPENING BALANCE" in r["Narration"].upper()
                
                # Check for Phantom First Row: If Row 0 has 0,0 and looks like a header/metadata
                if i == 0 and not is_opening:
                    # If this is the very first row and has no Dr/Cr, check for header text
                    noise_keywords = ["statement", "period", "page", "date", "balance", "balance as on", "account", "open date"]
                    if r["Dr"] == 0 and r["Cr"] == 0 and (not r["Narration"] or any(k in r["Narration"].lower() for k in noise_keywords)):
                        print(f">>> [Noise Shield] Dropped Phantom First Row: {r['Date']} | {r['Narration']}")
                        continue

                if not is_opening and cur_prev is not None:
                    balance_drift = abs(r["Balance"] - cur_prev)
                    if balance_drift < 0.01 and r["Dr"] == 0 and r["Cr"] == 0:
                        # V11.5 Expanded Noise Shield: Block common metadata/narration artifacts
                        noise_keywords = [
                            "statement", "period", "page", "date", "balance", "balance as on", 
                            "to ", " from", "generated", "total", "brought", "carried", "details",
                            "coll:", "int.coll"
                        ]
                        if not r["Narration"] or any(k in r["Narration"].lower() for k in noise_keywords) or len(r["Narration"]) < 3:
                            print(f">>> [Noise Shield] Dropped Phantom Row: {r['Date']} | {r['Narration']}")
                            continue
                
                filtered_rows.append(r)
                cur_prev = r["Balance"]

            for r in filtered_rows:
                all_datasets["ds1"].append({"Date": r["Date"], "Dr": r.get("Dr", 0.0), "Cr": r.get("Cr", 0.0), "Balance": r.get("Balance", 0.0)})
                all_datasets["ds2"].append({"Date": r["Date"], "Narration": r["Narration"]})
                all_datasets["ds3"].append(r)

        return all_datasets


def parse_bank_statement(pdf_bytes: bytes, password: str = None) -> tuple:
    """
    V8.0 Ironclad Dispatcher: Unified Architecture.
    """
    try:
        with pdfplumber.open(io.BytesIO(pdf_bytes), password=password or "") as pdf:
            if not pdf.pages: raise ValueError("Empty PDF")
            
            # Engagement of the Unified Engine
            brain = UnifiedBankBrain(pdf)
            brain.detect_layout()
            res = brain.extract()
            
            return res["ds1"], res["ds2"], res["ds3"], brain.metadata

    except Exception as e:
        print(f"!!! [CRITICAL ERROR] {e}")
        return [], [], [], {"account_name": "ERROR", "error": str(e)}

def parse_multiple_statements(pdf_bytes_list: list, password: str = None) -> tuple:
    """
    Parses multiple PDF byte streams, combines all transactions, 
    and performs precise deduplication using Date + Narration + Dr + Cr + Balance signatures.
    Finally, sorts everything in chronological order.
    """
    combined_ds3 = []
    final_metadata = {"account_name": "Unknown", "account_type": "Unknown"}
    
    for i, pdf_bytes in enumerate(pdf_bytes_list):
        # 1. Parse individual statement
        ds1, ds2, ds3, metadata = parse_bank_statement(pdf_bytes, password)
        
        # Capture metadata from the first valid parse
        if i == 0 or (final_metadata["account_name"] == "Unknown" and metadata.get("account_name") != "Unknown" and metadata.get("account_name") != "ERROR"):
            final_metadata = metadata
            
        # Check for errors in parsing
        if "error" in metadata and len(pdf_bytes_list) == 1:
            # If only one file and it errors, bubble up
            return ds1, ds2, ds3, metadata
            
        combined_ds3.extend(ds3)
        
    if not combined_ds3:
        return [], [], [], final_metadata
        
    # 2. Deduplication Fingerprint logic
    seen_signatures = set()
    unique_ds3 = []
    
    for row in combined_ds3:
        date_str = row.get("Date") or ""
        narration = str(row.get("Narration") or "").strip().upper()
        dr = float(row.get("Dr", 0.0))
        cr = float(row.get("Cr", 0.0))
        bal = float(row.get("Balance", 0.0))
        
        # Create Fingerprint string signature (using 2 decimal places for safety)
        sig = f"{date_str}|{narration}|{dr:.2f}|{cr:.2f}|{bal:.2f}"
        
        if sig not in seen_signatures:
            seen_signatures.add(sig)
            unique_ds3.append(row)
            
    # 3. Chronological Sort
    unique_ds3.sort(key=lambda x: x.get("Date") or "")
    
    # 4. Reconstruct ds1 and ds2
    final_ds1 = []
    final_ds2 = []
    for r in unique_ds3:
        final_ds1.append({"Date": r["Date"], "Dr": r.get("Dr", 0.0), "Cr": r.get("Cr", 0.0), "Balance": r.get("Balance", 0.0)})
        final_ds2.append({"Date": r["Date"], "Narration": r.get("Narration", "")})
        
    return final_ds1, final_ds2, unique_ds3, final_metadata
