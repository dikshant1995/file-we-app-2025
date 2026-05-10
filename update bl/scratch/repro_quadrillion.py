import sys
import os
import pdfplumber

# Add backend to path
sys.path.append(r'd:\update bl\bank abb latest bl\till uco 1\backend')
from pdf_extractor import UniversalStatementBrain, clean_amount

def test_file(file_path):
    print(f"\nTesting {os.path.basename(file_path)}...")
    try:
        with pdfplumber.open(file_path) as pdf:
            brain = UniversalStatementBrain(pdf)
            brain.detect_layout()
            results = brain.extract()
            
            rows = results.get("ds1", [])
            print(f"Found {len(rows)} rows.")
            
            # Check for Quadrillion numbers
            found_quadrillion = False
            for i, row in enumerate(rows):
                bal = row.get("Balance", 0)
                if abs(bal) > 1000000000: # > 100 Crore
                    print(f"!!! Quadrillion Alert at row {i}: {bal}")
                    found_quadrillion = True
                    break
            
            if not found_quadrillion:
                if rows:
                    print(f"Sample Balance: {rows[0].get('Balance')}")
                else:
                    print("No rows found.")
    except Exception as e:
        print(f"Error testing {file_path}: {e}")

pdf_folder = r'd:\update bl\bank abb latest bl\till uco 1'
files_to_test = [
    os.path.join(pdf_folder, 'AXIS 1.pdf'),
    os.path.join(pdf_folder, 'AXIS 2.pdf'),
    os.path.join(pdf_folder, 'IndusInd.pdf'),
    os.path.join(pdf_folder, 'indusind bank new pdf.pdf')
]

for f in files_to_test:
    if os.path.exists(f):
        test_file(f)
    else:
        print(f"File not found: {f}")
