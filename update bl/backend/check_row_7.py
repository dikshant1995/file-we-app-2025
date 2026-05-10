import pdfplumber
import re

def hdfc_row_check_7(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        W = page.width
        words = page.extract_words()
        
        row_count = 0
        for w in sorted(words, key=lambda x: (x['top'], x['x0'])):
            if re.match(r'^\d{2}/\d{2}/\d{2}$', w['text']) and w['x0'] < 100:
                row_count += 1
                if row_count == 7: # This should be the 30000 row
                    line = [sw for sw in words if abs(sw['top'] - w['top']) < 2]
                    print(f"Row 7 at y={w['top']:.1f} (W={W})")
                    for sw in sorted(line, key=lambda x: x['x0']):
                        mid_x = (sw['x0'] + sw['x1']) / 2
                        print(f"  {sw['text']:<20} | rel_mid: {mid_x/W:.3f}")

if __name__ == "__main__":
    hdfc_row_check_7(r"d:\update bl\till uco 1\Acct Statement_XX7958_24082023.pdf")
