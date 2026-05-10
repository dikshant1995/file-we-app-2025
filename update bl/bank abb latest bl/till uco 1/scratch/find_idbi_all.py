import pdfplumber
import os

def find_idbi_statements():
    files = [f for f in os.listdir('.') if f.endswith('.pdf')]
    for f in files:
        try:
            with pdfplumber.open(f) as pdf:
                text = pdf.pages[0].extract_text().upper()
                if 'IDBI' in text:
                    print(f"\n>>> FOUND IDBI: {f}")
                    print(f"    Sample: {text[:300]}")
                    if 'LIMIT' in text or 'SANCTION' in text:
                        print(f"    !!! Potential LIMIT/SANCTION field found in {f}")
        except:
            pass

if __name__ == "__main__":
    find_idbi_statements()
