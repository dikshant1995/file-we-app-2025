import re
from datetime import datetime
from pdf_extractor import clean_amount

def extract_central_statement(pdf, first_page_text) -> tuple:
    dataset_1, dataset_2, dataset_3 = [], [], []
    metadata = {"account_name": "Unknown", "account_type": "Central Bank of India Statement"}
    
    # Metadata extraction
    for line in first_page_text.split('\n'):
        if "Account Number" in line:
            parts = line.split(":")
            if len(parts) > 1: metadata["account_name"] = parts[1].strip()
            
    date_regex = re.compile(r'\b\d{1,2}/\d{1,2}/\d{4}\b')
    
    for page in pdf.pages:
        words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
        if not words: continue
        
        lines_w, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 4: current_line.append(w)
            else:
                lines_w.append(sorted(current_line, key=lambda x: x['x0'])); current_line = [w]
            last_y = w['top']
        if current_line: lines_w.append(sorted(current_line, key=lambda x: x['x0']))
        
        header_y = 0
        for lw in lines_w:
            text = " ".join([w['text'] for w in lw])
            if "Post Date" in text and "Value" in text:
                header_y = lw[0]['top']
                continue
                
            if header_y == 0 or lw[0]['top'] < header_y + 10:
                continue
                
            date_words = [w for w in lw if 40 <= (w['x0']+w['x1'])/2 < 110]
            date_str = " ".join([w['text'] for w in date_words])
            m = date_regex.search(date_str)
            
            if m:
                try:
                    parsed_date = datetime.strptime(m.group(0), "%d/%m/%Y").strftime("%Y-%m-%d")
                except:
                    continue
                    
                narr = " ".join([w['text'] for w in lw if 160 <= (w['x0']+w['x1'])/2 < 500])
                dr = clean_amount(" ".join([w['text'] for w in lw if 510 <= (w['x0']+w['x1'])/2 < 610]))
                cr = clean_amount(" ".join([w['text'] for w in lw if 610 <= (w['x0']+w['x1'])/2 < 700]))
                bal = clean_amount(" ".join([w['text'] for w in lw if 700 <= (w['x0']+w['x1'])/2 < 850]))
                
                dataset_3.append({
                    "Date": parsed_date,
                    "Narration": narr.strip(),
                    "Dr": abs(dr),
                    "Cr": abs(cr),
                    "Balance": abs(bal)
                })
            elif dataset_3 and lw[0]['x0'] < 400 and not text.startswith("Page"):
                narr_addon = " ".join([w['text'] for w in lw if 10 <= (w['x0']+w['x1'])/2 < 500])
                dataset_3[-1]["Narration"] += " " + narr_addon.strip()

    for r in dataset_3:
        dataset_1.append({"Date": r["Date"], "Dr": r["Dr"], "Cr": r["Cr"], "Balance": r["Balance"]})
        dataset_2.append({"Date": r["Date"], "Narration": r["Narration"]})
        
    print(f">>> [STRICT ROUTER] Central Bank Extracted {len(dataset_1)} rows.")
    return dataset_1, dataset_2, dataset_3, metadata
