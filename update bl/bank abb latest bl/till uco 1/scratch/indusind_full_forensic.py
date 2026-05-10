import pdfplumber

def indusind_full_forensic():
    path = r'd:\update bl\bank abb latest bl\till uco 1\IndusInd.pdf'
    with pdfplumber.open(path) as pdf:
        # 1. Capture Header Name Anchor
        text = pdf.pages[0].extract_text()
        print("\n--- INDUSIND HEADER (TOP 1000) ---")
        print(text[:1000])
        
        # 2. Capture Column Pillars for Locking
        print("\n--- INDUSIND COLUMN DNA ---")
        words = pdf.pages[0].extract_words()
        for w in words[:200]:
            # Print headers and numeric words to find the pillars
            if w['top'] < 300:
                print(f"[{w['x0']:.1f}-{w['x1']:.1f}] top={w['top']:.1f}: {w['text']}")

if __name__ == "__main__":
    indusind_full_forensic()
