import pdfplumber

with pdfplumber.open('AXIS 1.pdf') as pdf:
    page = pdf.pages[0]
    words = page.extract_words()
    for w in words:
        if "Statement" in w['text'] or "period" in w['text']:
            print(f"[{w['text']}] at y={w['top']}, x={w['x0']}")
    
    print("\nSAMPLE LINES (Full Page):")
    text = page.extract_text()
    for line in text.split('\n')[:20]:
        print(line)
