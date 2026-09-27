import pdfplumber

pdf_path = r"d:\proudct dashboard pl final pl\LATEST UPDATE PL BETA\deploy_to_vercel\file-we-app-2025\update bl\Mehra Od Statement.pdf"
with pdfplumber.open(pdf_path) as pdf:
    for i, page in enumerate(pdf.pages):
        print(f"--- Page {i+1} ---")
        text = page.extract_text()
        print(text[:1000]) # print first 1000 chars of each page
