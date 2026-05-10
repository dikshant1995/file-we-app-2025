import pdfplumber

def check_uco_rel_x():
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
        
        for lw in lines:
            line_text = " ".join([w['text'] for w in lw])
            # Find a line with MARBLES or 01-02-2025 (ignoring opening balance)
            if "MARBLES" in line_text:
                print(f"\nLine: {line_text}")
                for w in lw:
                    mid_x = (w['x0'] + w['x1']) / 2
                    print(f"  {w['text']:<20} | x0: {w['x0']:>6.1f} | x1: {w['x1']:>6.1f} | rel_x: {mid_x/W:.3f}")
                break

if __name__ == "__main__":
    check_uco_rel_x()
