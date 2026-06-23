import sys
import pdfplumber
from pdf_extractor import parse_bank_statement

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/BOI.pdf"
with open(file_path, "rb") as f:
    pdf_bytes = f.read()

try:
    ds1, ds2, ds3, meta = parse_bank_statement(pdf_bytes, bank_name="BOI")
    print(f"Extracted {len(ds3)} rows.")
except Exception as e:
    print(f"FAILED: {e}")

