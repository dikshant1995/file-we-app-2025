import os
import sys
import io
import pandas as pd
from datetime import datetime

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
try:
    from pdf_extractor import parse_bank_statement
except ImportError:
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    from pdf_extractor import parse_bank_statement

def generate_master_excel(pdf_dir, output_file="Master_Extractions_Final.xlsx"):
    print(f"Generating Master Excel in: {pdf_dir}")
    files = [f for f in os.listdir(pdf_dir) if f.endswith(".pdf")]
    
    writer = pd.ExcelWriter(output_file, engine='xlsxwriter')
    
    success_count = 0
    
    for filename in files:
        file_path = os.path.join(pdf_dir, filename)
        print(f"Extracting: {filename}...")
        
        try:
            with open(file_path, "rb") as f:
                pdf_bytes = f.read()
            
            ds1, ds2, ds3, metadata = parse_bank_statement(pdf_bytes)
            
            if ds3:
                df = pd.DataFrame(ds3)
                # Sheet names can't be longer than 31 chars and can't have certain chars
                sheet_name = filename.replace(".pdf", "")[:31]
                sheet_name = "".join([c for c in sheet_name if c.isalnum() or c in " _-"])
                df.to_excel(writer, sheet_name=sheet_name, index=False)
                success_count += 1
            else:
                print(f"  [WARNING] No data extracted for {filename}")
                
        except Exception as e:
            print(f"  [ERROR] Failed to extract {filename}: {e}")

    writer.close()
    print(f"Master Excel generated: {output_file} ({success_count} sheets)")

if __name__ == "__main__":
    pdf_dir = os.getcwd()
    generate_master_excel(pdf_dir)
