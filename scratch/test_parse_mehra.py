import sys
import os
sys.path.append(r"d:\proudct dashboard pl final pl\LATEST UPDATE PL BETA\deploy_to_vercel\file-we-app-2025\update bl\backend")

from pdf_extractor import parse_bank_statement

pdf_path = r"d:\proudct dashboard pl final pl\LATEST UPDATE PL BETA\deploy_to_vercel\file-we-app-2025\update bl\Mehra Od Statement.pdf"
with open(pdf_path, 'rb') as f:
    pdf_bytes = f.read()

d1, d2, d3, meta = parse_bank_statement(pdf_bytes)

print("First 15 rows in dataset_3 (Transactions):")
for row in d3[:15]:
    print(row)
