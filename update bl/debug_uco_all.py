import pdfplumber

def debug_all_uco_amounts():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        # Check first 5 pages to get a good sample
        for page_idx in range(min(5, len(pdf.pages))):
            p = pdf.pages[page_idx]
            W = p.width
            words = p.extract_words()
            
            lines, current_line, last_y = [], [], -1
            for w in words:
                if last_y == -1 or abs(w['top'] - last_y) < 3: current_line.append(w)
                else: lines.append(current_line); current_line = [w]
                last_y = w['top']
            if current_line: lines.append(current_line)
            
            print(f"\n--- PAGE {page_idx+1} (Width: {W}) ---")
            for lw in lines:
                amounts = [w for w in lw if any(c.isdigit() for c in w['text']) and '.' in w['text']]
                if len(amounts) >= 1:
                    line_text = " ".join([w['text'] for w in lw])
                    if "2025" in line_text: # Only transaction dates
                        print(f"\nRow: {line_text}")
                        for w in lw:
                            # Only print potential values and the indicator
                            if any(c.isdigit() for c in w['text']) or w['text'] in ['DR', 'CR']:
                                mid_x = (w['x0'] + w['x1']) / 2
                                print(f"  {w['text']:<20} | x0: {w['x0']:>6.1f} | rel_x: {mid_x/W:.3f}")

if __name__ == "__main__":
    debug_all_uco_amounts()
