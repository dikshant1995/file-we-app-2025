
import sys
import os
import pdf_extractor
import importlib
importlib.reload(pdf_extractor)
from pdf_extractor import parse_bank_statement
print(f">>> [IMPORT_PATH] {pdf_extractor.__file__}")
import json

pdfs = [r'd:\update bl\bank abb latest bl\till uco 1\IDFC TESTNG.pdf', 
        r'd:\update bl\bank abb latest bl\till uco 1\IDFCFIRSTBankstatement_10184748701-39 (1).pdf']

for pdf_path in pdfs:
    pdf_name = os.path.basename(pdf_path)
    print(f"\n--- Testing {pdf_name} ---")
    if not os.path.exists(pdf_path):
        print("File not found.")
        continue
    
    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()
    
    try:
        d1, d2, d3, meta = parse_bank_statement(pdf_bytes)
        print(f"Rows found: {len(d1)}")
        print(f"Metadata: {meta}")
        if d1:
            # Sort by balance to see ranges
            bals = sorted([r['Balance'] for r in d1])
            print(f"Balance range: {min(bals)} to {max(bals)}")
            print("First 5 rows (original order):")
            for row in d1[:5]:
                print(row)
    except Exception as e:
        print(f"Error: {e}")
