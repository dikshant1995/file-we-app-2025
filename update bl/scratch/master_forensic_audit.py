import sys
import os
import io
import re
from collections import Counter

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from pdf_extractor import parse_bank_statement
import pdfplumber

def run_master_audit():
    pdf_dir = "d:/update bl/bank abb latest bl/till uco 1"
    pdf_files = [f for f in os.listdir(pdf_dir) if f.lower().endswith('.pdf')]
    
    print(f"=== MASTER FORENSIC AUDIT (V10.0) ===")
    print(f"Found {len(pdf_files)} PDFs to audit.\n")
    
    report = []
    
    for pdf_name in pdf_files:
        pdf_path = os.path.join(pdf_dir, pdf_name)
        print(f"Auditing: {pdf_name}...", end=" ", flush=True)
        
        try:
            with open(pdf_path, 'rb') as f:
                pdf_bytes = f.read()
            
            # Run the extraction
            ds1, ds2, ds3, metadata = parse_bank_statement(pdf_bytes)
            
            if not ds3:
                print("FAILED (Zero Rows Extracted)")
                report.append({"file": pdf_name, "status": "FAIL", "reason": "Zero Rows", "error_count": 0})
                continue
            
            # Perform Mathematical Parity Audit
            math_errors = 0
            total_rows = len(ds3)
            
            # Check for negative balance clusters (The corruption we are fighting)
            neg_balances = sum(1 for r in ds3 if r.get("Balance", 0) < 0)
            
            for i in range(1, len(ds3)):
                prev_bal = ds3[i-1]["Balance"]
                curr_bal = ds3[i]["Balance"]
                dr = ds3[i]["Dr"]
                cr = ds3[i]["Cr"]
                
                # Formula: Prev + Cr - Dr = Curr
                expected = round(prev_bal + cr - dr, 2)
                if abs(expected - curr_bal) > 0.05: # Allow small rounding tolerance
                    math_errors += 1
            
            if math_errors == 0:
                status = "SUCCESS"
                if neg_balances > (total_rows * 0.5):
                    status = "WARNING (Mostly Negative)"
                print(f"PASS ({total_rows} rows, Math Parity: Perfect)")
            else:
                status = "FAIL"
                print(f"FAIL ({math_errors} Math Glitches found)")
            
            report.append({
                "file": pdf_name,
                "status": status,
                "rows": total_rows,
                "math_errors": math_errors,
                "neg_count": neg_balances
            })
            
        except Exception as e:
            print(f"CRITICAL ERROR ({str(e)})")
            report.append({"file": pdf_name, "status": "CRASH", "reason": str(e), "error_count": 0})

    # Summary Table
    print("\n\n" + "="*80)
    print(f"{'FILENAME':<40} | {'ROWS':<5} | {'ERRORS':<7} | {'NEGATIVES':<10} | {'STATUS'}")
    print("-" * 80)
    
    success_count = 0
    for r in report:
        neg_tag = f"{r.get('neg_count', 0)}"
        print(f"{r['file'][:40]:<40} | {r.get('rows', 0):<5} | {r.get('math_errors', 0):<7} | {neg_tag:<10} | {r['status']}")
        if r['status'] == "SUCCESS":
            success_count += 1
            
    print("-" * 80)
    print(f"FINAL RESULT: {success_count}/{len(pdf_files)} PDFs passed with 100% Math Parity.")
    print("="*80)

if __name__ == "__main__":
    run_master_audit()
