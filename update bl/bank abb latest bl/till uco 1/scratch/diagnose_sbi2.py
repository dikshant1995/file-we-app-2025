import pdfplumber
import re
import os

def clean_amount(val_str):
    if val_str is None:
        return 0.0
    val_str = str(val_str).replace("(cid:9)", " ").replace(",", "").strip()
    if not val_str or val_str.upper() == 'NA':
        return 0.0
    
    # Check for negative (reproducing the potential bug in the main code)
    is_negative = False
    if '-' in val_str: # Main code had a bug with raw_str
        is_negative = True

    if len(val_str) > 15:
        return 0.0
        
    match = re.search(r'-?\d+(?:\.\d+)?', val_str)
    if match:
        try:
            val = float(match.group(0))
            if abs(val) > 500000000: 
                return 0.0
            return -abs(val) if is_negative else abs(val)
        except ValueError:
            return 0.0
    return 0.0

pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\SBI 2.pdf"

with pdfplumber.open(pdf_path) as pdf:
    for page_idx, page in enumerate(pdf.pages):
        print(f"--- Page {page_idx+1} ---")
        words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
        
        logical_rows = []
        current_row_words = []
        last_y = -1
        
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 3:
                current_row_words.append(w)
            else:
                logical_rows.append(current_row_words)
                current_row_words = [w]
            last_y = w['top']
        if current_row_words:
            logical_rows.append(current_row_words)
            
        for line_words in logical_rows:
            row_text = " ".join([w['text'] for w in line_words]).strip()
            # print(f"Row: {row_text}")
            
            match = re.search(r'^(\d{1,2}[/\- ]+(?:\d{1,2}|[A-Za-z]{3})[/\- ]+\d{2,4})', row_text)
            if not match or "TXN" in row_text.upper():
                continue 
                
            txn_date = match.group(1)
            print(f"\nFound Date Row: {row_text}")
            
            data_words = [w for w in line_words if w['x0'] > line_words[0]['x1']]
            
            numeric_tokens = []
            for w in data_words:
                cleaned = w['text'].replace(',', '').strip()
                if re.match(r'^-?[\d,]+(?:\.\d+)?$', cleaned) or cleaned.upper() in ["DR", "CR"]:
                    numeric_tokens.append(w)
            
            print(f"Numeric tokens with coords:")
            for nt in numeric_tokens:
                mid_x = (nt['x0'] + nt['x1']) / 2
                print(f"  '{nt['text']}' at mid_x={mid_x:.2f}")

            if len(numeric_tokens) < 1:
                continue
                
            bal_str = numeric_tokens[-1]['text']
            if bal_str.upper() in ["DR", "CR"] and len(numeric_tokens) >= 2:
                bal_str = numeric_tokens[-2]['text'] + " " + bal_str
            
            balance = clean_amount(bal_str)
            print(f"Parsed Balance: {balance}")
            
            dr, cr = 0.0, 0.0
            for nt in numeric_tokens[:-1]:
                mid_x = (nt['x0'] + nt['x1']) / 2
                if 500 <= mid_x < 580: 
                    val = clean_amount(nt['text'])
                    dr = val
                    print(f"  Assigned to Debit (500-580): {val}")
                elif 580 <= mid_x < 670: 
                    val = clean_amount(nt['text'])
                    cr = val
                    print(f"  Assigned to Credit (580-670): {val}")
                else:
                    print(f"  Token '{nt['text']}' at {mid_x:.2f} ignored (outside Dr/Cr zones)")
