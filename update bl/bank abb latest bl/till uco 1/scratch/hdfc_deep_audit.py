import pdfplumber

def hdfc_deep_audit():
    path = r'd:\update bl\bank abb latest bl\till uco 1\hdfc.pdf'
    with pdfplumber.open(path) as pdf:
        text = pdf.pages[0].extract_text()
        print("\n--- HDFC DEEP AUDIT ---")
        print("-" * 50)
        # Print first 3000 chars to find the name
        print(text[:3000] if text else "NO TEXT FOUND")
        print("-" * 50)

if __name__ == "__main__":
    hdfc_deep_audit()
