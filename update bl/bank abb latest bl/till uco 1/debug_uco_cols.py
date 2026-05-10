import pdfplumber

def debug_uco_columns():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        p = pdf.pages[0]
        W = p.width
        words = p.extract_words()
        
        lines, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        print(f"Page Width: {W}")
        for lw in lines:
            # Look for lines with multiple numeric values (likely transaction rows)
            numeric_count = sum(1 for w in lw if any(c.isdigit() for c in w['text']) and '.' in w['text'])
            if numeric_count >= 2:
                line_text = " ".join([w['text'] for w in lw])
                print(f"\nLine: {line_text}")
                for w in lw:
                    mid_x = (w['x0'] + w['x1']) / 2
                    print(f"  {w['text']:<25} | mid_x: {mid_x:>6.1f} | rel_x: {mid_x/W:.3f}")

if __name__ == "__main__":
    debug_uco_columns()
