import sys
import os
import io
import pandas as pd

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import parse_bank_statement

def export_all_to_excel():
    pdf_dir = "d:/update bl/bank abb latest bl/till uco 1"
    pdf_files = [f for f in os.listdir(pdf_dir) if f.lower().endswith('.pdf')]
    
    master_path = os.path.join(pdf_dir, "Master_Extractions_Final.xlsx")
    
    with pd.ExcelWriter(master_path, engine='xlsxwriter') as writer:
        for pdf_name in pdf_files:
            pdf_path = os.path.join(pdf_dir, pdf_name)
            print(f"Exporting to Excel: {pdf_name}")
            
            try:
                with open(pdf_path, 'rb') as f:
                    pdf_bytes = f.read()
                
                ds1, ds2, ds3, metadata = parse_bank_statement(pdf_bytes)
                
                if ds3:
                    df = pd.DataFrame(ds3)
                    # Clean sheet name (max 31 chars, no special chars)
                    sheet_name = re.sub(r'[\[\]\:\*\?\/\\]', '', pdf_name[:30])
                    df.to_excel(writer, sheet_name=sheet_name, index=False)
            except Exception as e:
                print(f"Error exporting {pdf_name}: {e}")
                
    print(f"\nSUCCESS: Master Excel created at {master_path}")

if __name__ == "__main__":
    import re # Needed for re.sub
    export_all_to_excel()
