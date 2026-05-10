import sys
import os

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from pdf_extractor import parse_bank_statement

pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\SBI 2.pdf"

with open(pdf_path, "rb") as f:
    pdf_bytes = f.read()

ds1, ds2, ds3, meta = parse_bank_statement(pdf_bytes)

print(f"Bank Identified: {meta.get('bank', 'Unknown')}")
print(f"Account Name: {meta.get('account_name', 'Unknown')}")
print("-" * 50)
print(f"{'Date':<12} | {'Dr':<12} | {'Cr':<12} | {'Balance':<12}")
print("-" * 50)

for row in ds1[:10]: # Print first 10 rows
    print(f"{row['Date']:<12} | {row['Dr']:<12.2f} | {row['Cr']:<12.2f} | {row['Balance']:<12.2f}")

# Check if first row is corrected
if len(ds1) > 0:
    first_txn = ds1[0]
    # In SBI 2.pdf, the first row should be 2024-04-01, Dr 0, Cr 25000, Bal 131880.98
    # Wait, the code prepends an OPENING BALANCE row if anchor is found.
    # So ds1[0] should be OPENING BALANCE 106880.98
    # and ds1[1] should be the first transaction 25000 Credit.
    print("-" * 50)
    print(f"Total Rows: {len(ds1)}")
