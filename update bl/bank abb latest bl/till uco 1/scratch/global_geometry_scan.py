import sys
import os
import re
from collections import Counter
import pdfplumber

def scan_failures():
    # Only scan the ones that failed in the last audit
    failures = [
        "AU 1.pdf", "AU 2.pdf", "BOM TESTING.pdf", "city union bank limit acc.pdf",
        "IDFCFIRSTBankstatement_10184748701-39 (1).pdf", "INDIAN BANK TESTING.pdf",
        "indusind bank new pdf.pdf", "IndusInd.pdf", "karnataka bank limit acc.pdf",
        "limit acc uco.pdf", "uco limit account.pdf"
    ]
    
    pdf_dir = "d:/update bl/bank abb latest bl/till uco 1"
    
    print(f"=== GLOBAL GEOMETRY SCAN (V10.1) ===")
    
    for pdf_name in failures:
        pdf_path = os.path.join(pdf_dir, pdf_name)
        if not os.path.exists(pdf_path): continue
        
        print(f"\nScanning: {pdf_name}")
        try:
            with pdfplumber.open(pdf_path) as pdf:
                p = pdf.pages[0]
                words = p.extract_words()
                
                # Find all money-looking numbers (Pillar DNA)
                x_centers = []
                for w in words:
                    txt = w['text'].replace(",","")
                    if re.search(r'\d+\.\d{2}', txt): # Money pattern
                        x_centers.append(round((w['x0'] + w['x1'])/2))
                
                # Find most common columns
                top_pillars = [p[0] for p in Counter(x_centers).most_common(6)]
                print(f"  Detected Columns (X): {sorted(top_pillars)}")
                
                # Check for Date headers
                headers = [w for w in words if any(k in w['text'].upper() for k in ["DATE", "TXN", "PARTICULARS", "BALANCE"])]
                if headers:
                    print(f"  Header Keywords Found at Y={headers[0]['top']}")
                    for h in headers[:5]:
                        print(f"    - '{h['text']}' at X={round((h['x0']+h['x1'])/2)}")
                else:
                    print("  !!! NO HEADERS DETECTED")
                    
        except Exception as e:
            print(f"  Error scanning: {e}")

if __name__ == "__main__":
    scan_failures()
