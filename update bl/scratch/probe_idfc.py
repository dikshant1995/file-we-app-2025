import pdfplumber
pdf_path = r'd:\update bl\bank abb latest bl\till uco 1\IDFC TESTNG.pdf'
with pdfplumber.open(pdf_path) as pdf:
    # Get the raw first page text
    raw_text = pdf.pages[0].extract_text()
    print("--- RAW FIRST PAGE TEXT ---")
    print(raw_text[:500])
    
    # Normalize it exactly like the dispatcher does
    head_text = raw_text[:1000].upper().replace(" ", "").replace("\n", "")
    print("\n--- NORMALIZED PROBE TEXT ---")
    print(head_text[:1000])
