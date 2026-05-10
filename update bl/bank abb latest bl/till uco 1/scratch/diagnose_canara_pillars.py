import pdfplumber
import re

def analyze_canara_pillars(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        words = page.extract_words()
        
        # Search for transaction headers
        header_y = 0
        for w in words:
            txt = w['text'].upper()
            if "DEBIT" in txt or "WITHDRAWAL" in txt or "CREDIT" in txt or "DEPOSIT" in txt:
                header_y = w['top']
                print(f"Candidate Header Found: '{w['text']}' at Y={header_y}")
                break
        
        print(f"Header Y: {header_y}")
        
        # Print all words on the header line
        print("Words on Header Line:")
        for w in words:
            if abs(w['top'] - header_y) < 10:
                print(f"  {w['text']} at ({w['x0']}, {w['x1']})")

if __name__ == "__main__":
    analyze_canara_pillars("d:/update bl/bank abb latest bl/till uco 1/CANARA.pdf")
