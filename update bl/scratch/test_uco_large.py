import os
import sys
sys.path.append(os.getcwd())
from backend.pdf_extractor import parse_bank_statement

filename = 'UCO 1.pdf'
with open(filename, 'rb') as f:
    pdf_bytes = f.read()

print(f"Testing {filename}...")
ds1, ds2, ds3, meta = parse_bank_statement(pdf_bytes)

row_count = len(ds1)
total_cr = sum(r.get('Cr', 0) for r in ds1)
total_dr = sum(r.get('Dr', 0) for r in ds1)
parity_err = 0.0
if row_count > 1:
    bal_shift = ds1[-1]['Balance'] - ds1[0]['Balance']
    parity_err = abs(bal_shift - (total_cr - total_dr))

print(f"Rows: {row_count}")
print(f"Parity Error: {parity_err:.2f}")
print(f"Account: {meta.get('account_name')}")
print(f"Bank: {meta.get('bank')}")
