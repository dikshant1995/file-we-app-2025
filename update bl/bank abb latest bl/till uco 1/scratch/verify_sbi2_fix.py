import sys
import os
import io

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from pdf_extractor import parse_bank_statement

pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\SBI 2.pdf"

with open(pdf_path, 'rb') as f:
    pdf_bytes = f.read()

d1, d2, d3, meta = parse_bank_statement(pdf_bytes)

print(f"Extraction Status: {meta.get('account_name', 'Unknown')}")
print(f"Rows extracted: {len(d1)}")

if d1:
    print("\nFirst 10 rows from Dataset 1:")
    for i, row in enumerate(d1[:10]):
        print(f"Row {i+1}: Date={row['Date']}, Dr={row['Dr']}, Cr={row['Cr']}, Bal={row['Balance']}")
else:
    print("!! No rows extracted.")
    if 'error' in meta:
        print(f"Error: {meta['error']}")
