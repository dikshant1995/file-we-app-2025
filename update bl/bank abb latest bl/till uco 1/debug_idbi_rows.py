import pdfplumber
import re

def debug_idbi_rows(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        p = pdf.pages[0]
        words = p.extract_words()
        # Cluster words into lines (3px tolerance)
        lines, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        # Check first 20 lines
        for lw in lines[:50]:
            print(" ".join([w['text'] for w in lw]))

if __name__ == "__main__":
    debug_idbi_rows("idbi limit acc.pdf")
