import pdfplumber

def find_uco_100_deposit():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        for p in pdf.pages:
            words = p.extract_words()
            W = p.width
            for w in words:
                if "100.00" in w['text']:
                    mid_x = (w['x0'] + w['x1']) / 2
                    print(f"  {w['text']:<25} | mid_x: {mid_x:>6.1f} | rel_x: {mid_x/W:.3f}")
                    # Print context
                    idx = words.index(w)
                    for i in range(max(0, idx-10), min(len(words), idx+11)):
                        ww = words[i]
                        m_x = (ww['x0'] + ww['x1']) / 2
                        current_row = "SAME ROW" if abs(ww['top'] - w['top']) < 3 else "OTHER ROW"
                        print(f"    {ww['text']:<25} | mid_x: {m_x:>6.1f} | rel_x: {m_x/W:.3f} | {current_row}")

if __name__ == "__main__":
    find_uco_100_deposit()
