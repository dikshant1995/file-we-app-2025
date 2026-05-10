import os
import sys
import pdfplumber
import traceback
import re

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import parse_bank_statement

def run_v8_audit():
    pdf_dir = os.getcwd()
    print(f"\n{'='*60}")
    print(f"V8.2 IRONCLAD MASTER AUDIT - STRICT EXTRACTION MODE")
    print(f"{'='*60}")
    
    files = [f for f in os.listdir(pdf_dir) if f.endswith(".pdf")]
    total_files = len(files)
    print(f"Auditing {total_files} PDFs...")
    
    report = []
    success_count = 0
    fail_count = 0
    
    for idx, filename in enumerate(files):
        file_path = os.path.join(pdf_dir, filename)
        print(f"[{idx+1}/{total_files}] {filename[:30]:<30} ", end="", flush=True)
        
        try:
            with open(file_path, "rb") as f:
                pdf_bytes = f.read()
            
            ds1, ds2, ds3, metadata = parse_bank_statement(pdf_bytes)
            
            if not ds3:
                print("[FAIL: EMPTY]")
                report.append(f"FAIL: {filename} - No transactions extracted.")
                fail_count += 1
                continue

            # 1. Metadata Check
            meta_ok = (metadata.get("account_name") == "N/A")
            
            # 2. Header Row Check
            # V8.5: Allow exactly one OPENING BALANCE row if it's the first row
            header_rows = [r for r in ds3 if "OPENING BALANCE" in r["Narration"].upper()]
            headers_found = len(header_rows)
            if headers_found == 1 and "OPENING BALANCE" in ds3[0]["Narration"].upper():
                headers_found = 0 # It's a valid anchor row
            
            # 3. Math Audit
            math_errors = 0
            for i in range(1, len(ds3)):
                prev = ds3[i-1]["Balance"]
                curr = ds3[i]["Balance"]
                dr = ds3[i]["Dr"]
                cr = ds3[i]["Cr"]
                if abs(round(prev + cr - dr, 2) - curr) > 0.01:
                    math_errors += 1
            
            # Summary Result
            if math_errors == 0 and headers_found == 0 and meta_ok:
                print("[PASS]")
                success_count += 1
            else:
                issues = []
                if math_errors > 0: issues.append(f"{math_errors} Math Errors")
                if headers_found > 0: issues.append(f"{headers_found} Header Rows")
                if not meta_ok: issues.append("Meta Leak")
                issue_str = ", ".join(issues)
                print(f"[FAIL: {issue_str}]")
                report.append(f"FAIL: {filename} - {issue_str}")
                fail_count += 1
                
        except Exception as e:
            print(f"[ERROR: {str(e)[:20]}]")
            report.append(f"ERROR: {filename} - {str(e)}")
            fail_count += 1
            
    print(f"\n{'='*60}")
    print(f"AUDIT COMPLETE")
    print(f"Total Success: {success_count}")
    print(f"Total Failed:  {fail_count}")
    print(f"Success Rate:  {round(success_count/total_files*100, 2)}%")
    print(f"{'='*60}\n")

    if report:
        print("Failure Details:")
        for line in report:
            print(f"  {line}")

if __name__ == "__main__":
    run_v8_audit()
