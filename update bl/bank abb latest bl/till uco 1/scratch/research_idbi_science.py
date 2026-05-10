import pdfplumber
import os
import re

def research_idbi_limits():
    files = [f for f in os.listdir('.') if f.endswith('.pdf')]
    for f in files:
        try:
            with pdfplumber.open(f) as pdf:
                page = pdf.pages[0]
                text = page.extract_text()
                if 'IDBI' in text.upper():
                    print(f"\n>>> Checking IDBI Candidate: {f}")
                    # Look for Limit/Sanction keywords
                    matches = re.finditer(r'(?:LIMIT|SANCTION|OD|CC|FACILITY)(?:\s+AMOUNT)?\s*[:\-]?\s*([\d,\.]+)', text, re.IGNORECASE)
                    for m in matches:
                        print(f"    Possible Limit Match: {m.group(0)}")
                    
                    # Look for drawing power
                    dp_match = re.search(r'DRAWING\s+POWER\s*[:\-]?\s*([\d,\.]+)', text, re.IGNORECASE)
                    if dp_match: print(f"    Drawing Power: {dp_match.group(0)}")
        except Exception as e:
            print(f"Error checking {f}: {e}")

if __name__ == "__main__":
    research_idbi_limits()
