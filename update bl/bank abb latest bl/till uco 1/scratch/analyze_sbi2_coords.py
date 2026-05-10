import pdfplumber
import re
import os

def clean_amount(val_str):
    if val_str is None:
        return 0.0
    val_str = str(val_str).replace("(cid:9)", " ").replace(",", "").strip()
    if not val_str or val_str.upper() == 'NA':
        return 0.0
    
    # Simulating the bug fix
    is_negative = False
    if '-' in val_str: 
        is_negative = True

    if len(val_str) > 15:
        return 0.0
        
    match = re.search(r'-?\d+(?:\.\d+)?', val_str)
    if match:
        try:
            val = float(match.group(0))
            return -abs(val) if is_negative else abs(val)
        except ValueError:
            return 0.0
    return 0.0

pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\SBI 2.pdf"

with pdfplumber.open(pdf_path) as pdf:
    # Check first few rows of Page 1
    page = pdf.pages[0]
    words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
    
    lines, current_line, last_y = [], [], -1
    for w in words:
        if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
        else: lines.append(current_line); current_line = [w]
        last_y = w['top']
    if current_line: lines.append(current_line)
    
    print(f"--- SBI 2 Layout Analysis ---")
    for i, lw in enumerate(lines[18:40]): # Transaction area
        line_txt = " ".join([w['text'] for w in lw])
        print(f"\nLine {i+18}: {line_txt}")
        for w in lw:
            mid_x = (w['x0'] + w['x1']) / 2
            print(f"  '{w['text']}' at mid_x={mid_x:.2f}")
