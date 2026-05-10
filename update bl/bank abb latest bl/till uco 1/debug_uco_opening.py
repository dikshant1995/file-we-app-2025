import pdfplumber

def debug_uco_opening_bal():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        p = pdf.pages[0]
        W = p.width
        words = p.extract_words()
        
        target = "-1089860.46"
        for w in words:
            if target in w['text']:
                mid_x = (w['x0'] + w['x1']) / 2
                print(f"  {w['text']:<25} | mid_x: {mid_x:>6.1f} | rel_x: {mid_x/W:.3f}")
                # Print surrounding words
                idx = words.index(w)
                print("Context:")
                for i in range(max(0, idx-5), min(len(words), idx+6)):
                    ww = words[i]
                    m_x = (ww['x0'] + ww['x1']) / 2
                    print(f"    {ww['text']:<25} | mid_x: {m_x:>6.1f} | rel_x: {m_x/W:.3f}")

if __name__ == "__main__":
    debug_uco_opening_bal()
