import sys
import os
import pandas as pd
import re

sys.path.append('D:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/bl-backend')
from pdf_extractor import parse_multiple_statements

# 1. Load the 10000 Narrations Patterns we just generated!
excel_path = 'D:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/scratch/10000_EMI_Permutations.xlsx'
df_patterns = pd.read_excel(excel_path)

# Extract unique NBFCs from the Excel to build our dynamic dictionary
unique_nbfcs = set(df_patterns['Expected NBFC Extracted'].dropna().str.upper().str.strip())
# Add some generic fallbacks just in case
nbfc_list = sorted(list(unique_nbfcs), key=len, reverse=True)

# Build a fast regex for all 10000 variations
nbfc_pattern = r'\b(?:' + '|'.join([re.escape(n) for n in nbfc_list]) + r')\b'
nbfc_regex = re.compile(nbfc_pattern, re.IGNORECASE)

# Known EMI Wrappers from our 10000 permutations
wrappers = ['ACH', 'NACH', 'CMS', 'ATD', 'AUTO DEBIT', 'SI MATCH', 'EMI', 'LOAN', 'PDC', 'STANDING INSTRUCTION', 'CLG ACH']
wrapper_pattern = r'\b(?:' + '|'.join(wrappers) + r')\b'
wrapper_regex = re.compile(wrapper_pattern, re.IGNORECASE)

def pinpoint_emi(narration, is_dr):
    if not is_dr:
        return None
    
    narr_upper = str(narration).upper()
    
    # 1. FIX: Ignore generic UPI transactions to prevent false positives (like Zomato)
    if narr_upper.startswith('UPI/') or narr_upper.startswith('UPI '):
        if 'EMI' not in narr_upper and 'LOAN' not in narr_upper:
            return None
    
    # Check if it has an EMI Wrapper OR an NBFC name from our 10000 patterns
    wrapper_match = wrapper_regex.search(narr_upper)
    nbfc_match = nbfc_regex.search(narr_upper)
    
    if wrapper_match or nbfc_match:
        wrapper_found = wrapper_match.group(0) if wrapper_match else "DIRECT DEBIT"
        nbfc_found = nbfc_match.group(0) if nbfc_match else "UNKNOWN NBFC"
        
        # Refine NBFC found if it's generic
        if nbfc_found == "UNKNOWN NBFC":
            # try to extract whatever word comes after the wrapper if no explicit NBFC matched
            pass
            
        return {
            "Wrapper": wrapper_found,
            "NBFC": nbfc_found
        }
    return None

def test_on_pdf(pdf_name, pass_word=""):
    print(f"\n============================================================")
    print(f" TESTING EMI PINPOINT ON: {pdf_name}")
    print(f"============================================================")
    
    pdf_path = f'D:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/{pdf_name}'
    with open(pdf_path, 'rb') as f:
        pdf_bytes = f.read()
    
    try:
        d1, d2, d3, metadata = parse_multiple_statements([pdf_bytes], pass_word)
        df = pd.DataFrame(d3)
        
        # 2. FIX: Map HDFC 'Debit' or 'Withdrawal Amount' columns to 'Dr' to prevent KeyError
        if 'Dr' not in df.columns:
            if 'Debit' in df.columns:
                df['Dr'] = df['Debit']
            elif 'Withdrawal Amount' in df.columns:
                df['Dr'] = df['Withdrawal Amount']
            else:
                print(f"Error: Could not find Debit column. Available: {list(df.columns)}")
                return
                
        df['Dr'] = pd.to_numeric(df['Dr'], errors='coerce').fillna(0)
        
        print(f"Total Transactions Parsed: {len(df)}")
        emi_count = 0
        
        for idx, row in df.iterrows():
            if row['Dr'] > 0:
                res = pinpoint_emi(row['Narration'], True)
                if res:
                    emi_count += 1
                    print(f"[EMI DETECTED] Date: {row['Date']:<10} | Amt: {row['Dr']:>8.2f} | NBFC: {res['NBFC']:<15} | Wrapper: {res['Wrapper']:<10} | Raw: {row['Narration'][:60]}")
        
        print(f"--> Total EMIs Pinpointed: {emi_count}")
    except Exception as e:
        print(f"Error parsing {pdf_name}: {e}")

if __name__ == "__main__":
    print(f"Loaded {len(nbfc_list)} dynamic NBFC signatures from the 10,000 permutations excel!")
    
    test_on_pdf('mayank sbi.pdf', '27570070993')
    test_on_pdf('lalita hdfc.pdf', '')
    test_on_pdf('tarun acc statement hdfc.pdf', '')
