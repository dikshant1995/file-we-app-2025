import sys
import pdfplumber
from pdf_extractor import extract_au_statement

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/AU SMALL ERROR.pdf"
with pdfplumber.open(file_path) as pdf:
    first_page_text = pdf.pages[0].extract_text()
    d1, d2, d3, meta = extract_au_statement(pdf, first_page_text)

print(f"Total Rows Extracted: {len(d3)}")
if len(d3) > 0:
    for i in range(min(15, len(d3))):
        print(d3[i])

