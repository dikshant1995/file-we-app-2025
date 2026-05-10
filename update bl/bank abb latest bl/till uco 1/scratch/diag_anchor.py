import pdfplumber
import re

pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\SBI 2.pdf"

with pdfplumber.open(pdf_path) as pdf:
    page = pdf.pages[0]
    h_text = page.within_bbox((0, 0, page.width, 245)).extract_text()
    print("--- H_TEXT START ---")
    print(h_text)
    print("--- H_TEXT END ---")
    
    h_text = h_text.replace("(cid:9)", " ").replace("\x00", "")
    pattern = r'(?:OPENING\s*BALANCE|Balance\s*b/f|Start\s*Balance|Balance\s*at\s*start\s*of|Balance\s*as\s*on).*?[:\-]?\s*(-?[\d,]+\.\d{2})'
    m = re.search(pattern, h_text, re.I)
    if m:
        print(f"Match Found: {m.group(1)}")
    else:
        print("No Match Found")
