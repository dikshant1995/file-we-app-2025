import pdfplumber
import re

def analyze_statement(name, path):
    print(f"\n--- [ANALYZE] {name} ---")
    with pdfplumber.open(path) as pdf:
        text = pdf.pages[0].extract_text()
        print("HEADER TEXT (First 1000):")
        print(text[:1000])
        
        # Test tentative regex
        name_match = re.search(r'(?:Account|Cust) Name\s*:\s*(.+?)(?:\n|$)', text, re.I)
        print(f"TEST REGEX [Account Name]: {name_match.group(1).strip() if name_match else 'FAILED'}")

analyze_statement('HDFC', r'd:\update bl\bank abb latest bl\till uco 1\hdfc.pdf')
analyze_statement('ICICI', r'd:\update bl\bank abb latest bl\till uco 1\icici 1.pdf')
