import pdfplumber
import io
import os

pdf_path = r"d:\update bl\bank abb latest bl\till uco 1\indusind bank new pdf.pdf"

with pdfplumber.open(pdf_path) as pdf:
    # Print the first page text to see the layout
    page = pdf.pages[0]
    text = page.extract_text()
    print("--- FIRST PAGE TEXT ---")
    print(text[:2000])
    
    # Print words with coordinates for the first few lines to see if dates are split
    words = sorted(page.extract_words(), key=lambda x: (x['top'], x['x0']))
    print("\n--- WORD COORDINATES (First 50 words) ---")
    for w in words[:50]:
        print(f"Text: {w['text']:<15} | Top: {w['top']:<8.2f} | x0: {w['x0']:<8.2f} | x1: {w['x1']:<8.2f}")
