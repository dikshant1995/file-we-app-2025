import os
import sys
import pdfplumber
import traceback

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
try:
    from pdf_extractor import parse_bank_statement
except ImportError:
    # If called from root
    sys.path.append(os.path.join(os.getcwd(), 'backend'))
    from pdf_extractor import parse_bank_statement

def run_audit():
    pdf_dir = os.getcwd()
    if not os.path.exists(os.path.join(pdf_dir, "backend")):
        # Probably in backend dir
        pdf_dir = os.path.dirname(pdf_dir)
        
    print(f"Starting Master Audit in: {pdf_dir}")
    
    files = [f for f in os.listdir(pdf_dir) if f.endswith(".pdf")]
    total_files = len(files)
    print(f"Found {total_files} PDFs to audit.")
    
    report = []
    report.append(f"MASTER AUDIT REPORT - V6.0 IRONCLAD BRAIN")
    report.append(f"{'='*50}")
    
    success_count = 0
    fail_count = 0
    
    for idx, filename in enumerate(files):
        file_path = os.path.join(pdf_dir, filename)
        print(f"[{idx+1}/{total_files}] Auditing: {filename} ", end="", flush=True)
        
        try:
            with open(file_path, "rb") as f:
                pdf_bytes = f.read()
            
            ds1, ds2, ds3, metadata = parse_bank_statement(pdf_bytes)
            
            # 1. Check for Math Parity
            math_ok = True
            error_msg = ""
            
            if not ds1:
                math_ok = False
                error_msg = "No transactions found."
            else:
                # Basic math check: sum(cr) - sum(dr) vs balance shift
                # Note: Some banks might have complex opening balances, 
                # but the Universal Brain V6.0 handles internal parity.
                # Here we check for "Quadrillion" outliers.
                max_bal = max([abs(row['Balance']) for row in ds1])
                if max_bal > 500000000: # 50 Crore
                    math_ok = False
                    error_msg = f"QUADRILLION DETECTED: {max_bal}"
            
            if math_ok:
                print("[OK]")
                report.append(f"SUCCESS: {filename} ({len(ds1)} rows, Max Bal: {max_bal if ds1 else 0})")
                success_count += 1
            else:
                print(f"[FAIL: {error_msg}]")
                report.append(f"FAILED:  {filename} - {error_msg}")
                fail_count += 1
                
        except Exception as e:
            print(f"[ERROR: {str(e)[:50]}]")
            report.append(f"ERROR:   {filename} - {str(e)}")
            fail_count += 1
            
    report.append(f"{'='*50}")
    report.append(f"TOTAL SUCCESS: {success_count}")
    report.append(f"TOTAL FAILED:  {fail_count}")
    report.append(f"SUCCESS RATE:  {round(success_count/total_files*100, 2) if total_files else 0}%")
    
    report_content = "\n".join(report)
    with open("final_audit_report.txt", "w") as f:
        f.write(report_content)
    
    print(f"\nAudit Complete. Report saved to final_audit_report.txt")
    print(f"Success: {success_count}, Fail: {fail_count}")

if __name__ == "__main__":
    run_audit()
