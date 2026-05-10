import pdfplumber

def view_hdfc_header():
    path = r'd:\update bl\bank abb latest bl\till uco 1\hdfc.pdf'
    with pdfplumber.open(path) as pdf:
        text = pdf.pages[0].extract_text()
        print("HDFC HEADER TEXT:")
        print("-" * 50)
        print(text[:1500] if text else "NO TEXT FOUND")
        print("-" * 50)

if __name__ == "__main__":
    view_hdfc_header()
