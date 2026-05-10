import pdfplumber

def check_coords_txn(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[0]
        W = page.width
        print(f"Page Width (W): {W}")
        words = page.extract_words()
        # Find some transaction dates (likely XX/XX/XX)
        import re
        for w in sorted(words, key=lambda x: (x['top'], x['x0'])):
            if re.match(r'^\d{2}/\d{2}/\d{2}$', w['text']) and w['x0'] < 100:
                print(f"Row at y={w['top']:.1f}")
                # Look for other words on the same line
                same_line = [sw for sw in words if abs(sw['top'] - w['top']) < 2]
                for sw in sorted(same_line, key=lambda x: x['x0']):
                    print(f"  {sw['text']} at x0={sw['x0']:.1f} (rel={sw['x0']/W:.22f})")
                
                # Check for just two lines
                break

if __name__ == "__main__":
    check_coords_txn(r"d:\update bl\till uco 1\Acct Statement_XX7958_24082023.pdf")
