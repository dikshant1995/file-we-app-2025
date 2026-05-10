import pdfplumber
import re

pdf_path = r'd:\update bl\bank abb latest bl\till uco 1\IDFC TESTNG.pdf'
with pdfplumber.open(pdf_path) as pdf:
    p0 = pdf.pages[0]
    words = p0.extract_words()
    
    # 1. Detect Headers
    headers = []
    for w in words:
        txt = w['text'].upper()
        if any(kw in txt for kw in ["DEBIT", "CREDIT", "BALANCE", "PARTICULARS"]):
            headers.append(f"{txt} at x0={w['x0']:.1f}, x1={w['x1']:.1f}, mid={(w['x0']+w['x1'])/2:.1f}")
    
    print("--- Headers Found ---")
    for h in headers:
        print(h)
    
    # 2. Extract First 10 Rows with Words
    print("\n--- Row Alignment (First 10 Amounts) ---")
    lines, current_line, last_y = [], [], -1
    sorted_words = sorted(words, key=lambda x: (x['top'], x['x0']))
    for w in sorted_words:
        if last_y == -1 or abs(w['top'] - last_y) < 3.5: current_line.append(w)
        else:
            lines.append(current_line); current_line = [w]
        last_y = w['top']
    if current_line: lines.append(current_line)
    
    found = 0
    for lw in lines:
        txt = " ".join([w['text'] for w in lw])
        if re.search(r'\d{1,2}-[A-Za-z]{3}-\d{4}', txt):
            print(f"\nRow: {txt}")
            for w in lw:
                if re.search(r'\d+\.\d{2}', w['text']):
                    print(f"  Amount {w['text']} at mid={(w['x0']+w['x1'])/2:.1f}")
            found += 1
            if found >= 10: break
