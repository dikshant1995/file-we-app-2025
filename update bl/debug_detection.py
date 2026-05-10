import pdfplumber
import io

pdf_path = "icici 1.pdf"
with pdfplumber.open(pdf_path) as pdf:
    first_page_text = pdf.pages[0].extract_text() or ""
    first_page_text = first_page_text.replace("(cid:9)", " ")
    text_upper = first_page_text.upper().replace(" ", "")
    
    print(f"--- TEXT_UPPER ---")
    print(text_upper[:1000])
    
    print(f"\n'DETAILEDSTATEMENT' in text_upper: {'DETAILEDSTATEMENT' in text_upper}")
    print(f"'ACCOUNTNAME' in text_upper: {'ACCOUNTNAME' in text_upper}")
