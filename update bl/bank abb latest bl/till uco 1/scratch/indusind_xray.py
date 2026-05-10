import pdfplumber

def indusind_xray():
    path = r'd:\update bl\bank abb latest bl\till uco 1\IndusInd.pdf'
    with pdfplumber.open(path) as pdf:
        first_page = pdf.pages[0]
        text = first_page.extract_text()
        print("\n--- INDUSIND RAW TEXT (FIRST 1000) ---")
        print(text[:1000] if text else "NO TEXT FOUND")
        
        print("\n--- INDUSIND WORD COORDINATES (SAMPLE ROWS) ---")
        words = first_page.extract_words()
        # Find some transaction lines
        for w in words[:100]:
            print(f"[{w['x0']:.1f} - {w['x1']:.1f}] top={w['top']:.1f}: {w['text']}")

if __name__ == "__main__":
    indusind_xray()
