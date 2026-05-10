import pdfplumber

def audit_y_coords(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        words = page.extract_words()
        
        # Look for Row 8/9 area (y around 485)
        print(f"--- Audit Vertical Alignment (y ~ 485) ---")
        row_words = [w for w in words if abs(w['top'] - 485.4) < 15]
        # Sort by top then x0
        for w in sorted(row_words, key=lambda x: (x['top'], x['x0'])):
            print(f"Text: {w['text']:<25} | y_top: {w['top']:>8.4f} | y_bottom: {w['bottom']:>8.4f} | x0: {w['x0']:>8.2f}")

if __name__ == "__main__":
    audit_y_coords(r"d:\update bl\till uco 1\Acct Statement_XX9619_26112025 (2).pdf")
