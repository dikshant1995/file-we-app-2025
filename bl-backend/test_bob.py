import sys
import pdfplumber
from pdf_extractor import parse_bank_statement

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/vishnu milk bob (1).pdf"
with open(file_path, "rb") as f:
    pdf_bytes = f.read()

try:
    ds1, ds2, ds3, meta = parse_bank_statement(pdf_bytes, bank_name="BOB")
    print(f"Extracted {len(ds3)} rows.")
    if len(ds3) > 0:
        for r in ds3[:5]: print(r)
except Exception as e:
    print(f"FAILED: {e}")

