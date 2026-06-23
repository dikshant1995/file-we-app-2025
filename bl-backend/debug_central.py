import sys
import pdfplumber

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/CENTRAL BANK ERROR.pdf"
with pdfplumber.open(file_path) as pdf:
    for page in pdf.pages[:1]:
        text = page.extract_text()
        print("--- PAGE TEXT ---")
        for i, line in enumerate(text.split("\n")):
            if i > 25: break
            print(line)

