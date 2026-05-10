import pdfplumber
import json

file_path = r"D:\update bl\till uco 1\limit acc icici (1).pdf"

with pdfplumber.open(file_path) as pdf:
    first_page = pdf.pages[0]
    text = first_page.extract_text()
    words = first_page.extract_words()
    
    print("--- FIRST PAGE TEXT ---")
    print(text[:2000])
    
    print("\n--- FIRST 20 WORDS ---")
    for w in words[:20]:
        print(w)

    # Check for specific Pattern 2 markers
    if "YOURDETAILSWITHUS" in text.replace(" ", ""):
        print("\n[MATCH] Potential Pattern 2 (Corporate)")
    else:
        print("\n[NO MATCH] Not Pattern 2")
