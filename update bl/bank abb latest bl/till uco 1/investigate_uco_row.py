import pdfplumber

def investigate_uco_row_order():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        p = pdf.pages[0]
        W = p.width
        words = p.extract_words()
        
        lines, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else: lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        for lw in lines:
            txt = " ".join([w['text'] for w in lw])
            if "389" in txt and "40000" in txt:
                print(f"\nTarget Row: {txt}")
                for w in lw:
                    mid_x = (w['x0'] + w['x1']) / 2
                    print(f"  {w['text']:<25} | mid_x: {mid_x:>6.1f} | rel_x: {mid_x/W:.3f}")

if __name__ == "__main__":
    investigate_uco_row_order()
