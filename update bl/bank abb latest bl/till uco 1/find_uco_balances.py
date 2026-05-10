import pdfplumber

def find_uco_balances():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        p = pdf.pages[0]
        W = p.width
        words = p.extract_words()
        print(f"Page Width: {W}")
        
        # Look for words containing numbers and '-' or 'DR'
        for w in words:
            txt = w['text'].upper()
            if any(c.isdigit() for c in txt) and ('-' in txt or 'DR' in txt):
                mid_x = (w['x0'] + w['x1']) / 2
                print(f"  {w['text']:<25} | x0: {w['x0']:>6.1f} | x1: {w['x1']:>6.1f} | rel_x: {mid_x/W:.3f}")

if __name__ == "__main__":
    find_uco_balances()
