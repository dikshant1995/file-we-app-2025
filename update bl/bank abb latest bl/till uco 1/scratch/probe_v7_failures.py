import os
import sys
import pdfplumber
import re

# Ensure we can import from the backend
sys.path.append(os.getcwd())
from backend.pdf_extractor import parse_bank_statement, extract_standard_statement

def probe_failures():
    targets = [
        ("AXIS 1", "AXIS 1.pdf"),
        ("City Union", "city union bank limit acc.pdf"),
        ("AU 1", "AU 1.pdf"),
        ("ICICI 1", "icici 1.pdf")
    ]
    
    for name, path in targets:
        print(f"\n{'='*60}")
        print(f"PROBING: {name} ({path})")
        print(f"{'='*60}")
        
        if not os.path.exists(path):
            print(f"FILE NOT FOUND: {path}")
            continue
            
        try:
            with open(path, 'rb') as f:
                pdf_bytes = f.read()
            
            ds1, ds2, ds3, meta = parse_bank_statement(pdf_bytes)
            
            print(f"Detected As: {meta.get('account_type', 'Universal/Standard')}")
            print(f"Rows: {len(ds1)}")
            
            if len(ds1) > 0:
                print("\nFIRST 3 ROWS:")
                for i in range(min(3, len(ds1))):
                    print(f"  {ds1[i]}")
                    print(f"  Narr: {ds2[i]['Narration'][:60]}...")
                
                print("\nLAST 2 ROWS:")
                for i in range(max(0, len(ds1)-2), len(ds1)):
                    print(f"  {ds1[i]}")
            
            # Diagnostic: check raw tokens for the first transaction line
            with pdfplumber.open(path) as pdf:
                page = pdf.pages[0]
                text = page.extract_text()
                if text:
                    lines = text.split('\n')
                    date_regex = re.compile(r'\d{2}[/\- ]+(?:\d{2}|[A-Za-z]{3})[/\- ]+\d{2,4}')
                    for line in lines:
                        if date_regex.search(line):
                            print(f"\nRAW SAMPLE LINE: {line}")
                            print(f"TOKENS: {line.split()}")
                            break

        except Exception as e:
            print(f"ERROR: {e}")

if __name__ == "__main__":
    probe_failures()
