
import pdfplumber
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from pdf_extractor import UniversalStatementBrain, parse_bank_statement

pdf_path = r'd:\update bl\bank abb latest bl\till uco 1\indusind bank new pdf.pdf'

def test_universal_brain():
    print(f"Testing Universal Brain on: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        brain = UniversalStatementBrain(pdf)
        brain.detect_layout()
        print(f"Pillars: {brain.pillars}")
        print(f"Named Pillars: {brain.named_pillars}")
        print(f"Header Y: {brain.header_y}")
        print(f"Is Descending: {brain.is_descending}")
        
        results = brain.extract()
        print(f"Extraction results: {len(results['ds1'])} rows found.")
        
        if len(results['ds1']) > 0:
            print("First 5 rows:")
            for row in results['ds3'][:5]:
                print(row)
        else:
            print("No rows found by Universal Brain.")

def test_parse_bank_statement():
    print(f"\nTesting parse_bank_statement on: {pdf_path}")
    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()
    
    try:
        ds1, ds2, ds3, metadata = parse_bank_statement(pdf_bytes)
        print(f"parse_bank_statement results: {len(ds1)} rows found.")
        print(f"Metadata: {metadata}")
    except Exception as e:
        print(f"Error in parse_bank_statement: {e}")

if __name__ == "__main__":
    test_universal_brain()
    test_parse_bank_statement()
