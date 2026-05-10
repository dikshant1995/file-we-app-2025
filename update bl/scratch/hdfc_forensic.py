import pdfplumber

def hdfc_forensic():
    path = r'd:\update bl\bank abb latest bl\till uco 1\hdfc.pdf'
    with pdfplumber.open(path) as pdf:
        text = pdf.pages[0].extract_text()
        print("\n--- HDFC FORENSIC HEADER ---")
        print(text[:2000] if text else "NO TEXT FOUND")
        print("-" * 30)

if __name__ == "__main__":
    hdfc_forensic()
