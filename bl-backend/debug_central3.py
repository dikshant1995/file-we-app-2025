import sys
import pdfplumber

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/CENTRAL BANK ERROR.pdf"
with pdfplumber.open(file_path) as pdf:
    for page in pdf.pages:
        text = page.extract_text()
        for line in text.split("\n"):
            if "PhonePe" in line or "18000" in line:
                print(line)

