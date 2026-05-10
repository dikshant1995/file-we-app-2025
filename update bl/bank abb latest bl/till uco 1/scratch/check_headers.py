import pdfplumber
pdf_path = r'd:\update bl\bank abb latest bl\till uco 1\IDFC TESTNG.pdf'
with pdfplumber.open(pdf_path) as pdf:
    for i, p in enumerate(pdf.pages):
        txt = p.extract_text().upper()
        h = "TRANSACTION" in txt and "PARTICULARS" in txt and "BALANCE" in txt
        print(f"Page {i+1}: Header={h}")
