import os
import sys
import pandas as pd

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import parse_bank_statement

def test_fix():
    pdf_file = "30-11-2023 TO 5-10-2024.pdf"
    if not os.path.exists(pdf_file):
        print(f"!! PDF not found: {pdf_file}")
        return

    print(f"Testing extraction for: {pdf_file}")
    with open(pdf_file, "rb") as f:
        pdf_bytes = f.read()
    
    ds1, ds2, ds3, metadata = parse_bank_statement(pdf_bytes)
    
    if not ds3:
        print("!! No data extracted.")
        return

    df = pd.DataFrame(ds3)
    
    # Check for the phantom row 2023-11-30 with 0,0
    phantom = df[(df['Date'] == '2023-11-30') & (df['Dr'] == 0) & (df['Cr'] == 0)]
    
    if not phantom.empty:
        print("!! PHANTOM ROW STILL EXISTS:")
        print(phantom)
    else:
        print(">> SUCCESS: Phantom row suppressed.")

    # Check the dates of the first 10 rows
    print("\nFirst 10 rows:")
    print(df.head(10)[['Date', 'Dr', 'Cr', 'Balance']])

if __name__ == "__main__":
    test_fix()
