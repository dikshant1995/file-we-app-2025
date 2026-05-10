import pdfplumber
import re

def research_smart_idbi(pdf_path):
    print(f">>> [SMART AUDIT] Analyzing DNA Patterns: {pdf_path}")
    with pdfplumber.open(pdf_path) as pdf:
        p = pdf.pages[0]
        words = p.extract_words()
        
        # Cluster words into rows
        rows = {}
        for w in words:
            if 400 < w['top'] < 500:
                rows.setdefault(int(w['top']), []).append(w)
        
        for y, row in sorted(rows.items()):
            row_sorted = sorted(row, key=lambda x: x['x0'])
            print(f"\nRow Y:{y}")
            for w in row_sorted:
                text = w['text']
                x0 = int(w['x0'])
                # Scoring DNA
                is_date = 1 if re.match(r'\d{2}/\d{2}/\d{2,4}', text) else 0
                is_time = 1 if re.match(r'\d{2}:\d{2}:\d{2}', text) else 0
                is_sno = 1 if re.match(r'^\d{1,3}$', text) else 0
                
                print(f"  [{text:^15}] X:{x0} | Date:{is_date} | Time:{is_time} | SNo:{is_sno}")

if __name__ == "__main__":
    research_smart_idbi("idbi limit acc.pdf")
