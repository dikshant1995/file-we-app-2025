import sys
import os
import pdfplumber
import re

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import extract_icici_detailed_statement

file_path = r"D:\update bl\till uco 1\limit acc icici (1).pdf"

with pdfplumber.open(file_path) as pdf:
    # Pattern 1 extractor takes (pdf, first_page_text)
    first_page_text = pdf.pages[0].extract_text()
    
    # Let's manually audit the first few rows' DateRaw
    # (Copied from extract_icici_detailed_statement logic)
    COL_SRNO = (35, 150)
    COL_TXNDATE = (105, 230)
    
    words = sorted(pdf.pages[0].extract_words(), key=lambda x: (x['top'], x['x0']))
    lines, current_line, last_y = [], [], -1
    for w in words:
        if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
        else:
            lines.append(current_line); current_line = [w]
        last_y = w['top']
    if current_line: lines.append(current_line)
    
    count = 0
    for lw in lines:
        first_word = lw[0]['text']
        if re.match(r'^\d+$', first_word) and COL_SRNO[0] <= lw[0]['x0'] <= COL_SRNO[1]:
            date_parts = []
            for w in lw:
                mid_x = (w['x0'] + w['x1']) / 2
                if COL_TXNDATE[0] <= mid_x <= COL_TXNDATE[1]:
                    date_parts.append(w['text'])
            print(f"ROW SlNo {first_word}: DateRaw='{''.join(date_parts)}'")
            count += 1
            if count >= 5: break
