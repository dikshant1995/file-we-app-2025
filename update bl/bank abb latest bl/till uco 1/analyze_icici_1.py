import pdfplumber
import os
import json

def analyze_pdf(pdf_path, output_txt):
    if not os.path.exists(pdf_path):
        return

    with open(output_txt, 'w', encoding='utf-8') as f:
        with pdfplumber.open(pdf_path) as pdf:
            f.write(f"--- Analyzing {pdf_path} ---\n")
            f.write(f"Number of pages: {len(pdf.pages)}\n\n")
            
            for i, page in enumerate(pdf.pages):
                f.write(f"--- Page {i+1} ---\n")
                # Metadata extraction check
                text = page.extract_text()
                if text:
                    f.write("TEXT PREVIEW:\n")
                    f.write(text[:2000] + "\n\n")
                
                # Column structure check via words
                words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
                f.write("WORD CLUSTERING:\n")
                
                # Group words by Y-coordinate
                y_groups = {}
                for w in words:
                    y = round(w['top'], 1)
                    if y not in y_groups:
                        y_groups[y] = []
                    y_groups[y].append(w)
                
                sorted_y = sorted(y_groups.keys())
                for y in sorted_y:
                    line = " ".join([f"[{w['x0']}-{w['x1']}]{w['text']}" for w in y_groups[y]])
                    f.write(f"Y={y}: {line}\n")
                
                f.write("\n" + "="*50 + "\n\n")
                if i >= 2: break # Only first 3 pages

if __name__ == "__main__":
    analyze_pdf(r"d:\update bl\till uco 1\icici 1.pdf", r"d:\update bl\till uco 1\icici_1_analysis.txt")
