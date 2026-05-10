import pdfplumber
import re
from collections import Counter
import sys

def prototype_extraction_brain(pdf_path):
    print(f"\n>>> [BRAIN] Analyzing: {pdf_path}")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            p = pdf.pages[0]
            W = p.width
            words = p.extract_words()
            
            # DNA Finder: Look for clustered decimal numbers
            x_centers = []
            for w in words:
                # Match currency-like decimals
                if re.match(r'^-?[\d,]+\.\d{2}$', w['text'].replace(",","")):
                    x_centers.append(round((w['x0'] + w['x1'])/2))
            
            if not x_centers:
                print("!! No numeric pillars detected.")
                return

            # Find the 3 most common X-centers
            pillars = sorted([p[0] for p in Counter(x_centers).most_common(3)])
            print(f"Detected Pillars: {pillars}")
            
            # semantic Header Finder
            lines, current_line, last_y = [], [], -1
            for w in words:
                if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
                else: lines.append(current_line); current_line = [w]
                last_y = w['top']
            if current_line: lines.append(current_line)
            
            header_y = 0
            for lw in lines:
                txt = " ".join([w['text'] for w in lw]).upper()
                if any(k in txt for k in ["DATE", "TXN", "VALUE"]) and any(k in txt for k in ["BALANCE", "DEPOSIT", "WITHDRAW"]):
                    header_y = lw[0]['bottom']
                    print(f"Header Row found at Y={header_y}")
                    break
            
            rows_found = 0
            for lw in lines:
                if lw[0]['top'] <= header_y: continue
                # Date DNA detection
                if re.match(r'^\d{1,2}[/\- ]+(?:\d{1,2}|[A-Za-z]{3})[/\- ]+\d{2,4}', lw[0]['text']):
                    row_vals = {"Date": lw[0]['text'], "Data": []}
                    for pill_x in pillars:
                        val = " ".join([w['text'] for w in lw if abs(((w['x0']+w['x1'])/2) - pill_x) < 25])
                        row_vals["Data"].append(val or "0.0")
                    print(f"Validated Txn: {row_vals}")
                    rows_found += 1
                    if rows_found >= 5: break
            if rows_found == 0:
                print("!! No transactions matched the Date/Pillar pattern.")
    except Exception as e:
        print(f"!! Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python prototype_brain.py <pdf_path>")
    else:
        prototype_extraction_brain(sys.argv[1])
