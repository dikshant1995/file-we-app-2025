import pdfplumber

def full_debug(name, path):
    print(f"\n--- [FULL DEBUG] {name} ---")
    with pdfplumber.open(path) as pdf:
        text = pdf.pages[0].extract_text()
        print("-" * 50)
        print(text if text else "NO TEXT FOUND")
        print("-" * 50)

full_debug('HDFC', r'd:\update bl\bank abb latest bl\till uco 1\hdfc.pdf')
full_debug('ICICI', r'd:\update bl\bank abb latest bl\till uco 1\icici 1.pdf')
