import pdfplumber

def debug_uco():
    with pdfplumber.open("limit acc uco.pdf") as pdf:
        p = pdf.pages[0]
        print(f"Page Size: {p.width} x {p.height}")
        
        words = p.extract_words()
        for w in words[:150]:
            print(f"{w['text']:<20} | x0: {w['x0']:>6.1f} | x1: {w['x1']:>6.1f} | top: {w['top']:>6.1f}")

if __name__ == "__main__":
    debug_uco()
