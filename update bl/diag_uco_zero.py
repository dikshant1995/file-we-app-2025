import pdfplumber
import re

def diag_uco_extraction():
    date_regex = re.compile(r'^\d{2}-\d{2}-\d{4}$')
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        p = pdf.pages[0]
        words = sorted(p.extract_words(), key=lambda x: (x['top'], x['x0']))
        W = p.width
        
        header_y = 0
        for w in words:
            txt_up = w['text'].upper().replace(" ", "")
            if "HONOURSYOURTRUST" in txt_up or "UCOBANK" in txt_up:
                header_y = max(header_y, w['bottom'] + 5)
            if "PARTICULARS" in txt_up or "WITHDRAWALS" in txt_up:
                header_y = max(header_y, w['bottom'] + 5)

        print(f"Header Y: {header_y}")
        
        lines, current_line, last_y = [], [], -1
        for w in words:
            if w['top'] < header_y: continue
            if last_y == -1 or abs(w['top'] - last_y) < 15: current_line.append(w)
            else:
                lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        print(f"Total Clusters: {len(lines)}")
        for i, lw in enumerate(lines[:10]):
            txt = " ".join([w['text'] for w in lw])
            first_word = lw[0]['text']
            is_date = bool(date_regex.match(first_word))
            x0 = lw[0]['x0']
            print(f"Row {i}: '{txt[:50]}...' | First: '{first_word}' | IsDate: {is_date} | x0: {x0}")

if __name__ == "__main__":
    diag_uco_extraction()
