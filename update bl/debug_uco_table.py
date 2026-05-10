import pdfplumber
import re

def debug_uco_table():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        p = pdf.pages[0]
        words = p.extract_words()
        
        # Cluster into lines
        lines, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 3:
                current_line.append(w)
            else:
                lines.append(current_line)
                current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        print(f"Total logical lines: {len(lines)}")
        for i, lw in enumerate(lines):
            line_text = " ".join([w['text'] for w in lw])
            # Print lines that look like transaction rows or headers
            if i < 20 or any(re.match(r'^\d{2}-\d{2}-\d{4}', w['text']) for w in lw):
                print(f"Line {i:2}: x0={lw[0]['x0']:>6.1f} | {line_text}")

if __name__ == "__main__":
    debug_uco_table()
