import pdfplumber
import os

def analyze_pdf(pdf_path):
    print(f"--- Analyzing {pdf_path} ---")
    if not os.path.exists(pdf_path):
        print(f"File {pdf_path} not found.")
        return

    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"Number of pages: {len(pdf.pages)}")
            for i, page in enumerate(pdf.pages[:2]): # Check first 2 pages
                print(f"--- Page {i+1} ---")
                text = page.extract_text()
                if text:
                    print(text[:1500]) # Print first 1500 chars
                else:
                    print("No text extracted.")
                
                # Column check
                words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
                # Print first few rows to see column structure
                y_coords = sorted(list(set([round(w['top']) for w in words])))
                for y in y_coords[:20]:
                    row_words = [w['text'] for w in words if abs(w['top'] - y) < 2]
                    if row_words:
                        print(f"Y={y}: {' '.join(row_words)}")
                
    except Exception as e:
        print(f"Error analyzing {pdf_path}: {e}")
    print("\n")

if __name__ == "__main__":
    analyze_pdf(r"d:\update bl\till uco 1\icici 1.pdf")
    analyze_pdf(r"d:\update bl\till uco 1\icic 2.pdf")
