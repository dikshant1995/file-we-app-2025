import pdfplumber
import re

pdf_path = "icici 1.pdf"
with pdfplumber.open(pdf_path) as pdf:
    total_words = 0
    all_text = ""
    for page in pdf.pages:
        all_text += page.extract_text() or ""
        
    # Count occurrences of "Sr No" pattern start?
    # Or just check how many dates are found by regex
    dates = re.findall(r'\d{2}-[A-Za-z]{3}-\d{4}', all_text)
    print(f"Total Dates found by regex: {len(dates)}")
    
    # Check for "NA" values in Dr/Cr
    nas = re.findall(r'\sNA\s', all_text)
    print(f"Total 'NA' found: {len(nas)}")
