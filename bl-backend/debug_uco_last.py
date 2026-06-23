import sys
import pdfplumber

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/UCO error.pdf"
with pdfplumber.open(file_path) as pdf:
    for page in pdf.pages[-1:]:
        text = page.extract_text()
        for line in text.split("\n"):
            if "03-2022" in line or "Balance" in line:
                print(line)

