import sys
import os
import pdfplumber

# Add backend to path
sys.path.append(r'd:\update bl\bank abb latest bl\till uco 1\backend')
from pdf_extractor import parse_bank_statement

def forensic_idbi_audit():
    file_path = r'd:\update bl\bank abb latest bl\till uco 1\idbi limit acc.pdf'
    print(f"Performing Forensic Audit on: {os.path.basename(file_path)}")
    
    try:
        with open(file_path, "rb") as f:
            pdf_bytes = f.read()
            
        ds1, ds2, ds3, metadata = parse_bank_statement(pdf_bytes)
        
        print(f"Metadata: {metadata}")
        print(f"Total Rows Extracted: {len(ds1)}")
        
        if not ds1:
            print("!!! FAILED: No rows extracted.")
            return

        # Check for gaps or math errors
        prev_bal = ds1[0]['Balance']
        errors = []
        for i in range(1, len(ds1)):
            row = ds1[i]
            expected = round(prev_bal + row['Cr'] - row['Dr'], 2)
            if abs(expected - row['Balance']) > 0.05:
                errors.append(f"Row {i} Math Fault: Prev={prev_bal}, Dr={row['Dr']}, Cr={row['Cr']}, Expected={expected}, Actual={row['Balance']}")
            prev_bal = row['Balance']
        
        if errors:
            print(f"!!! MATH DISCREPANCIES FOUND ({len(errors)}):")
            for e in errors[:5]:
                print(f"  {e}")
        else:
            print("MATH INTEGRITY: 100% Correct")

        # Check if the Narration contains data that looks like Dr/Cr/Bal
        # (This is often where the 90% accuracy issue comes from)
        leaks = 0
        for r in ds3:
            if any(char.isdigit() for char in r['Narration']):
                # Simple check: does narration have large numbers?
                numbers = [n for n in r['Narration'].split() if n.replace(',','').replace('.','').isdigit()]
                for n in numbers:
                    if len(n) > 5 and '.' in n:
                        leaks += 1
                        break
        
        print(f"Data Leakage Check: {leaks} rows have numeric-like narration parts.")

        # Print samples
        print("\nFirst 3 rows:")
        for r in ds3[:3]:
            print(f"  {r['Date']} | {r['Narration'][:40]:<40} | Dr: {r['Dr']:>10} | Cr: {r['Cr']:>10} | Bal: {r['Balance']:>10}")
            
        print("\nLast 3 rows:")
        for r in ds3[-3:]:
            print(f"  {r['Date']} | {r['Narration'][:40]:<40} | Dr: {r['Dr']:>10} | Cr: {r['Cr']:>10} | Bal: {r['Balance']:>10}")

    except Exception as e:
        print(f"Error during audit: {str(e)}")

if __name__ == "__main__":
    forensic_idbi_audit()
