import pdfplumber
import re

file_path = r"D:\update bl\till uco 1\limit acc icici (1).pdf"

with pdfplumber.open(file_path) as pdf:
    page = pdf.pages[0]
    words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
    
    # Let's find a row (Sl No followed by Date)
    rows = []
    current_line = []
    last_y = -1
    for w in words:
        if last_y == -1 or abs(w['top'] - last_y) < 3:
            current_line.append(w)
        else:
            if current_line:
                # Check for Sr No (digit) and Date (xx-xx-xxxx)
                text = " ".join([cw['text'] for cw in current_line])
                if re.search(r'^\d+', text) and re.search(r'\d{2}[-/]\d{2}[-/]\d{2,4}', text):
                    rows.append(current_line)
            current_line = [w]
        last_y = w['top']
        
    print(f"--- ANALYZING {len(rows)} ROWS ---")
    if rows:
        for i in range(min(3, len(rows))):
            print(f"\nROW {i+1}:")
            for w in rows[i]:
                print(f"  '{w['text']}' | x0: {w['x0']:.1f} | x1: {w['x1']:.1f} | mid: {((w['x0']+w['x1'])/2):.1f}")
