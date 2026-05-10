import pdfplumber
import io
import re

def diagnostic_probe(pdf_path):
    print(f">>> Investigating IDBI PDF: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        for i, page in enumerate(pdf.pages[:1]): # Page 1 is usually where pillars are set
            print(f"\n--- PAGE {i+1} DIAGNOSTICS ---")
            words = page.extract_words()
            # Sort by top, then x0 to simulate reading order
            sorted_words = sorted(words, key=lambda x: (x['top'], x['x0']))
            
            for w in sorted_words:
                txt = w['text']
                # Highlight anything that looks like a date or money
                is_date = re.match(r'\d{1,2}[/\- ]+(?:\d{1,2}|[A-Za-z]{3})[/\- ]+\d{2,4}', txt)
                is_money = re.search(r'-?\d+\.\d{2}', txt.replace(",",""))
                
                if is_date or is_money or len(txt) > 15:
                    print(f"WORD: '{txt:25}' | x0: {w['x0']:>6.1f} | x1: {w['x1']:>6.1f} | top: {w['top']:>6.1f}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python forensic_idbi_probe.py <pdf_path>")
    else:
        diagnostic_probe(sys.argv[1])
