import pdfplumber

def indusind_header_fix():
    path = r'd:\update bl\bank abb latest bl\till uco 1\IndusInd.pdf'
    with pdfplumber.open(path) as pdf:
        # Extract name anchor
        text = pdf.pages[0].extract_text()
        print("\n--- INDUSIND HEADER (TOP 800 CHARS) ---")
        print(text[:800])
        
        # Analyze Column Pillars
        print("\n--- INDUSIND PILLAR ALIGNMENT ---")
        words = pdf.pages[0].extract_words()
        for w in words[:150]:
            # Print words that look like headers or numbers
            if w['top'] < 300:
                print(f"[{w['x0']:.1f}-{w['x1']:.1f}] top={w['top']:.1f}: {w['text']}")

if __name__ == "__main__":
    indusind_header_fix()
