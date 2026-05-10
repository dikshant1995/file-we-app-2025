import sys
import os
import pdfplumber

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import extract_icici_detailed_statement

file_path = r"D:\update bl\till uco 1\limit acc icici (1).pdf"

with pdfplumber.open(file_path) as pdf:
    # Pattern 1 extractor takes (pdf, first_page_text)
    first_page_text = pdf.pages[0].extract_text()
    result = extract_icici_detailed_statement(pdf, first_page_text)
    
    dataset_3 = result.get("dataset_3", [])
    output = f"--- DETAILED EXTRACTION AUDIT for {os.path.basename(file_path)} ---\n"
    output += f"Total Rows Extracted: {len(dataset_3)}\n"
    
    if dataset_3:
        for i, r in enumerate(dataset_3[:10]):
            output += f"\nROW {i+1}:\n"
            output += f"  Date: '{r.get('Date')}'\n"
            output += f"  Narration: '{r.get('Narration')}'\n"
    else:
        output += "\n[ERROR] No rows extracted!"
        
    with open("verify_icici_results.txt", "w") as f:
        f.write(output)
