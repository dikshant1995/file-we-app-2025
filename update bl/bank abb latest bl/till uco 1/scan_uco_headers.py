import pdfplumber

def scan_uco_table_headers():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        p = pdf.pages[0]
        W = p.width
        words = p.extract_words()
        
        # Table headers usually are in a row together.
        lines, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else: lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        for lw in lines:
            txt = " ".join([w['text'] for w in lw]).upper()
            if "DATE" in txt and "WITHDRAWALS" in txt and "BALANCE" in txt:
                print(f"\nHeader Row Found at Y={lw[0]['top']}:")
                for w in lw:
                    mid_x = (w['x0'] + w['x1']) / 2
                    print(f"  {w['text']:<20} | mid_x: {mid_x:>6.1f} | rel_x: {mid_x/W:.3f}")

if __name__ == "__main__":
    scan_uco_table_headers()
