import pdfplumber

def debug_uco_credits():
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
        
        # Current logic for Credit rows (shifted gates)
        for lw in lines:
            line_text = " ".join([w['text'] for w in lw])
            # Check if this row had a deposit in our previous run (which found 58)
            # Actually, I'll just look for any row with 3+ amounts
            amounts = [w for w in lw if any(c.isdigit() for c in w['text']) and '.' in w['text']]
            if len(amounts) >= 3:
                print(f"\nPotential Credit/Debit Row: {line_text}")
                for w in lw:
                    mid_x = (w['x0'] + w['x1']) / 2
                    print(f"  {w['text']:<20} | x0: {w['x0']:>6.1f} | x1: {w['x1']:>6.1f} | rel_x: {mid_x/W:.3f}")

if __name__ == "__main__":
    debug_uco_credits()
