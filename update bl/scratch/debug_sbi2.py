
import os
import sys

# Add backend to path
sys.path.append(r"d:\update bl\bank abb latest bl\till uco 1\backend")

from pdf_extractor import parse_bank_statement
import pdfplumber

pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\SBI 2.pdf"

if not os.path.exists(pdf_path):
    print(f"PDF not found at {pdf_path}")
    sys.exit(1)

with pdfplumber.open(pdf_path) as pdf:
    page = pdf.pages[0]
    words = page.extract_words()
    print("Top 100 words with coordinates:")
    for w in words[:100]:
        print(f"'{w['text']}' at x0={w['x0']}, x1={w['x1']}, top={w['top']}, bottom={w['bottom']}")

with open(pdf_path, "rb") as f:
    pdf_bytes = f.read()

ds1, ds2, ds3, meta = parse_bank_statement(pdf_bytes)

print(f"\nMetadata: {meta}")
print("\nFirst 10 rows of DS1:")
for r in ds1[:10]:
    print(r)
