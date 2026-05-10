import pdfplumber

def debug_header(name, path):
    print(f"\n--- [DEBUG] {name} ---")
    with pdfplumber.open(path) as pdf:
        text = pdf.pages[0].extract_text()
        print("FIRST 1000 CHARACTERS:")
        print("-" * 30)
        print(text[:1000] if text else "NO TEXT FOUND")
        print("-" * 30)

debug_header('HDFC', r'd:\update bl\bank abb latest bl\till uco 1\hdfc.pdf')
debug_header('ICICI', r'd:\update bl\bank abb latest bl\till uco 1\icici 1.pdf')
