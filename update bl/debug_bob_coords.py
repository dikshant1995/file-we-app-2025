import pdfplumber
import sys

def debug_bob_layout(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        p = pdf.pages[0]
        # Only look at the first few transaction rows
        words = p.extract_words()
        lines, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        for lw in lines:
            line_txt = " ".join([f"{w['text']}({int(w['x0'])})" for w in lw])
            # Focus on rows that look like transactions
            if "2025" in line_txt or "2024" in line_txt:
                print(line_txt)

if __name__ == "__main__":
    debug_bob_layout("bob limit acc.pdf")
