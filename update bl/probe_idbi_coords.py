import pdfplumber
import io

def probe(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        p = pdf.pages[0]
        words = p.extract_words()
        print(f"Page Width: {p.width}")
        for w in words:
            if "BALANCE" in w['text'].upper():
                print(f"HEADER 'BALANCE' found at x0={w['x0']}, x1={w['x1']}, top={w['top']}")
            
            # Look for numbers that look like balances (e.g. -226788.94)
            if "." in w['text'] and any(c.isdigit() for c in w['text']):
                print(f"NUMBER '{w['text']}' found at mid_x={(w['x0']+w['x1'])/2}")

if __name__ == "__main__":
    # We'll use a dummy call just to show the logic, but I will run it on the system
    pass
