import pdfplumber

def final_uco_research():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        p = pdf.pages[0]
        W = p.width
        words = p.extract_words()
        
        # Sort words by top, then x0 to ensure we see the physical flow
        words.sort(key=lambda w: (w['top'], w['x0']))
        
        lines, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 2: current_line.append(w)
            else: lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        for lw in lines:
            line_text = " ".join([w['text'] for w in lw])
            if any(c.isdigit() for c in line_text) and "." in line_text:
                print(f"\nLine Y={lw[0]['top']:.1f} | Text: {line_text}")
                for w in lw:
                    mid_x = (w['x0'] + w['x1']) / 2
                    print(f"  {w['text']:<20} | x0: {w['x0']:>6.1f} | rel_x: {mid_x/W:.3f}")

if __name__ == "__main__":
    final_uco_research()
