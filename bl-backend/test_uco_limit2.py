import sys
import pdfplumber

file_path = "d:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/UCO error.pdf"
with pdfplumber.open(file_path) as pdf:
    text = ""
    for i in range(min(4, len(pdf.pages))):
        text += (pdf.pages[i].extract_text() or "") + "\n"
    if "LIMIT" in text.upper():
        print("LIMIT FOUND in combined!")
    else:
        print("NO LIMIT")

