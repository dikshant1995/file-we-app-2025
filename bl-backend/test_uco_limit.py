import sys
import pdfplumber

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/UCO error.pdf"
with pdfplumber.open(file_path) as pdf:
    text = pdf.pages[0].extract_text()
    if "LIMIT" in text.upper():
        print("LIMIT FOUND!")
        for line in text.split("\n"):
            if "LIMIT" in line.upper(): print(line)
    else:
        print("NO LIMIT")

