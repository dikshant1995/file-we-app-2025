
import os
import sys

# Add backend to path
sys.path.append(r"d:\update bl\bank abb latest bl\till uco 1\backend")

from pdf_extractor import parse_bank_statement

pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\indusind bank new pdf.pdf"

with open(pdf_path, "rb") as f:
    pdf_bytes = f.read()

ds1, ds2, ds3, meta = parse_bank_statement(pdf_bytes)

print(f"Total Rows: {len(ds1)}")
print("\nLast 5 rows of DS1 (Financial - Newest):")
for r in ds1[-5:]:
    print(r)
