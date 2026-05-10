import pdfplumber

def debug_uco_final():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        p = pdf.pages[0]
        words = p.extract_words()
        
        # Table Header detection
        header_y = 0
        for w in words:
            if w['text'].upper() == "PARTICULARS":
                header_y = w['top']
                break
        
        print(f"Header Y found at: {header_y}")
        
        # Word analysis around the header
        header_words = [w for w in words if abs(w['top'] - header_y) < 5]
        print("\n--- Header Row Coordinates ---")
        for w in header_words:
            print(f"{w['text']:<20} | x0: {w['x0']:>6.1f} | x1: {w['x1']:>6.1f}")
            
        # Sample row below header
        print("\n--- Sample Transaction Row ---")
        lines, current_line, last_y = [], [], -1
        for w in words:
            if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
            else:
                lines.append(current_line); current_line = [w]
            last_y = w['top']
        if current_line: lines.append(current_line)
        
        for lw in lines:
            line_text = " ".join([w['text'] for w in lw])
            if "MARBLES" in line_text:
                for w in lw:
                    print(f"{w['text']:<20} | x0: {w['x0']:>6.1f} | x1: {w['x1']:>6.1f}")
                break

if __name__ == "__main__":
    debug_uco_final()
