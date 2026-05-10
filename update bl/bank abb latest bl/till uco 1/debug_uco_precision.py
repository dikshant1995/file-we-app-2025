import pdfplumber

def debug_uco_precision():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        p = pdf.pages[0]
        words = p.extract_words()
        
        # Take a sample transaction line or opening balance line
        # Based on previous output, Line 35 was an opening balance line
        # Line 5 was likely a transaction line.
        
        lines, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 3:
                current_line.append(w)
            else:
                lines.append(current_line)
                current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        # Find a line with a date
        for lw in lines:
            line_text = " ".join([w['text'] for w in lw])
            if "MARBLES" in line_text or "Opening Balance" in line_text:
                print(f"\nAnalyzing Line: {line_text}")
                for w in lw:
                    print(f"  {w['text']:<20} | x0: {w['x0']:>6.1f} | x1: {w['x1']:>6.1f}")

if __name__ == "__main__":
    debug_uco_precision()
