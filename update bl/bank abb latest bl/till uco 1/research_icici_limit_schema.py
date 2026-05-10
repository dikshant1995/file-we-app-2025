import pdfplumber
import re

file_path = r"D:\update bl\till uco 1\limit acc icici (1).pdf"

with pdfplumber.open(file_path) as pdf:
    page = pdf.pages[0]
    words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
    
    # We found a row starting at TOP ~ 747.8 earlier
    # Let's find every word on that Y-level to see the full column layout
    print(f"--- FULL ROW AUDIT for {file_path} at Y ~ 747 ---")
    for w in words:
        if 745 <= w['top'] <= 750:
            print(f"Text: '{w['text']}' | x0: {w['x0']:.1f} | x1: {w['x1']:.1f} | mid: {((w['x0'] + w['x1'])/2):.1f}")

    # Let's also find the header to see if there's a unique "Limit" keyword
    text = page.extract_text()
    if "SANCTIONED LIMIT" in text.upper():
        print("\n[MARKER] Found 'SANCTIONED LIMIT'")
    if "OVERDRAFT" in text.upper():
        print("\n[MARKER] Found 'OVERDRAFT'")
    if "CASH CREDIT" in text.upper():
        print("\n[MARKER] Found 'CASH CREDIT'")
    if "LIMIT ACCOUNT" in text.upper():
        print("\n[MARKER] Found 'LIMIT ACCOUNT'")
    
    # Look for "Detailed Statement" line specifically
    for line in text.split('\n')[:20]:
        print(f"Header Line: {line}")
