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

# 2. Load the Master Excel file for exact/substring matches
master_excel_path = 'D:/proudct dashboard pl final pl/LATEST UPDATE PL BETA/deploy_to_vercel/file-we-app-2025/update bl/narrations for emi 68 pages.xlsx'
df_master = pd.read_excel(master_excel_path)
# Clean and prepare master narrations (ignoring very short strings to prevent catastrophic false positives)
master_narrations = df_master['narration '].dropna().astype(str).str.upper().str.strip().tolist()
master_narrations = [m for m in master_narrations if len(m) > 4] 

def pinpoint_emi(narration, is_dr):
    if not is_dr:
        return None
    
    narr_upper = str(narration).upper()
    
    # Tier 1: The "Kill Switch" (Negative Keywords)
    # Exclude Investments, Insurance, Penalties, Utilities. These are NOT EMIs.
    # We run this FIRST to protect against generic Master matches like "AUTO DEBIT" flagging an LIC Premium.
    kill_switch_pattern = r'\b(SIP|MUTUAL FUND|MF|AMC|NIPPON|ZERODHA|GROWW|UPSTOX|LIC|INSURANCE|PREMIUM|LIFE|HDFC LIFE|ICICI PRU|MAX LIFE|BOUNCE|RETURN|RTN|REJECT|PENALTY|CHG|CHARGE|BILL|ELECTRICITY|WATER|BESCOM)\b'
    if re.search(kill_switch_pattern, narr_upper):
        return None
    
    # Tier 2: The "Master Excel" Pipeline
    # If the narration contains any string from the Master Excel, it is instantly considered an EMI.
    for master_str in master_narrations:
        if master_str in narr_upper:
            # We found a match in the Master Excel!
            return {
                "Wrapper": "MASTER_MATCH",
                "NBFC": master_str
            }
    
    # Tier 3: The "Manual Transfer" Filter

    # Ignore generic UPI and standard transfers to prevent false positives
    if re.search(r'\b(UPI|IBNEFT|IMPS|NEFT|RTGS)\b', narr_upper):
        if 'EMI' not in narr_upper and 'LOAN' not in narr_upper:
            return None
    
    wrapper_match = wrapper_regex.search(narr_upper)
    nbfc_match = nbfc_regex.search(narr_upper)
    is_explicit_emi = bool(re.search(r'\b(EMI|LOAN)\b', narr_upper))
    
    # Tier 3 & 4: Explicit Match & NBFC Match
    # Fix the "OR" logic trap: we don't accept JUST a wrapper (like "NACH") without an NBFC or explicit EMI keyword.
    valid_emi = False
    if is_explicit_emi:
        valid_emi = True
    elif nbfc_match:
        valid_emi = True
        
    if not valid_emi:
        return None
        
    wrapper_found = wrapper_match.group(0) if wrapper_match else "DIRECT DEBIT"
    nbfc_found = nbfc_match.group(0) if nbfc_match else "UNKNOWN NBFC"
    
    # Tier 5: Generic Bank Safeguard
    # If the matched NBFC is a generic bank, require a strict EMI/Loan keyword
    generic_banks = ['HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'IDFC', 'YES BANK', 'INDUSIND', 'PNB', 'BOB', 'CANARA', 'UNION']
    if any(b in nbfc_found.upper() for b in generic_banks):
        if not is_explicit_emi:
            return None
            
    return {
        "Wrapper": wrapper_found,
        "NBFC": nbfc_found
    }

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
    
    test_files = [
        ('mayank sbi.pdf', '27570070993'),
        ('lalita hdfc.pdf', ''),
        ('tarun acc statement hdfc.pdf', ''),
        ('BOI.pdf', ''),
        ('CANARA.pdf', ''),
        ('icici 1.pdf', ''),
        ('AXIS 1.pdf', ''),
        ('KOTAK 1.pdf', ''),
        ('IDFC TESTNG.pdf', ''),
        ('INDUSIND 1.pdf', ''),
        ('BOM TESTING.pdf', ''),
        ('INDIAN BANK TESTING.pdf', ''),
        ('UNION TESTING (1).pdf', ''),
        ('marudhar hari om.pdf', ''),
        ('AU 1.pdf', ''),
        ('SBI 2.pdf', '')
    ]
    
    for fname, pwd in test_files:
        test_on_pdf(fname, pwd)
