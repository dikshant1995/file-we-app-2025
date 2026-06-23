import sys
import pdfplumber
from test_central5 import extract_central_statement

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/CENTRAL BANK ERROR.pdf"
with pdfplumber.open(file_path) as pdf:
    text = pdf.pages[0].extract_text()
    d1, d2, d3, m = extract_central_statement(pdf, text)
    for r in d3[:5]: print(r)
    for r in d3[75:80]: print(r)

