import pdfplumber

def find_uco_headers():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        p = pdf.pages[0]
        W = p.width
        words = p.extract_words()
        print(f"Page Width: {W}")
        
        target_headers = ["DATE", "PARTICULARS", "CHQ.NO.", "WITHDRAWALS", "DEPOSITS", "BALANCE"]
        for w in words:
            txt = w['text'].upper()
            if txt in target_headers:
                mid_x = (w['x0'] + w['x1']) / 2
                print(f"  {w['text']:<20} | x0: {w['x0']:>6.1f} | x1: {w['x1']:>6.1f} | rel_x: {mid_x/W:.3f}")

if __name__ == "__main__":
    find_uco_headers()
