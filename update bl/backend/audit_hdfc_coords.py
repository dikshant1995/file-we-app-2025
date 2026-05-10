import pdfplumber
import re

def audit_hdfc_row_coords(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        W = page.width
        words = page.extract_words()
        
        # Look for a clear transaction row with amounts
        for w in sorted(words, key=lambda x: (x['top'], x['x0'])):
            if re.match(r'^\d{2}/\d{2}/\d{2}$', w['text']) and w['x0'] < 100:
                # Same line words
                line = [sw for sw in words if abs(sw['top'] - w['top']) < 2]
                print(f"Row at y={w['top']:.1f} (Width W={W})")
                for sw in sorted(line, key=lambda x: x['x0']):
                    mid_x = (sw['x0'] + sw['x1']) / 2
                    print(f"  Word: '{sw['text']:<20}' | x0: {sw['x0']:>6.1f} | x1: {sw['x1']:>6.1f} | rel_mid: {mid_x/W:.3f}")
                
                # Check one more row
                print("-" * 20)
                continue
                
if __name__ == "__main__":
    audit_hdfc_row_coords(r"d:\update bl\till uco 1\Acct Statement_XX7958_24082023.pdf")
