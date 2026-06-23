import sys
import pdfplumber
from pdf_extractor import extract_uco_statement

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/UCO error.pdf"
with pdfplumber.open(file_path) as pdf:
    text = pdf.pages[0].extract_text()
    d1, d2, d3, m = extract_uco_statement(pdf, text)
    print(f"Extracted {len(d3)} rows.")
    for r in d3[:5]: print(r)

