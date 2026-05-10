import os
import sys
import io
import time
import traceback

# Ensure we can import from the backend
sys.path.append(os.getcwd())
try:
    from backend.pdf_extractor import parse_bank_statement
except ImportError:
    print("!!! ERROR: Could not find backend.pdf_extractor. Ensure you are running from the root.")
    sys.exit(1)

def audit_all_banks():
    pdf_files = [f for f in os.listdir('.') if f.lower().endswith('.pdf')]
    pdf_files.sort()
    
    results = []
    
    print(f"\n{'='*80}")
    print(f"      IRONCLAD V7.0 GLOBAL AUDIT: STABILITY & MATH PARITY")
    print(f"{'='*80}")
    print(f"Targeting {len(pdf_files)} PDF statements...")
    
    for filename in pdf_files:
        # SKIP ultra-large files for the quick stability pass
        if os.path.getsize(filename) > 5 * 1024 * 1024:
            print(f"\n[SKIPPING] {filename} (Too large for initial pass)")
            continue

        print(f"\n[TESTING] {filename}...", flush=True)
        start_time = time.time()
        
        try:
            with open(filename, 'rb') as f:
                pdf_bytes = f.read()
            
            print(f"  - Dispatching...", flush=True)
            ds1, ds2, ds3, meta = parse_bank_statement(pdf_bytes)
            print(f"  - Dispatch returned.", flush=True)
            
            elapsed = time.time() - start_time
            stability = "STABLE" if meta.get("error") is None else f"TRAPPED: {meta.get('error')}"
            
            row_count = len(ds1)
            parity_error = 0.0
            
            if row_count > 1:
                # Re-calculate parity: Sum(Cr) - Sum(Dr) vs Closing - Opening
                total_cr = sum(r.get('Cr', 0) for r in ds1)
                total_dr = sum(r.get('Dr', 0) for r in ds1)
                bal_shift = ds1[-1]['Balance'] - ds1[0]['Balance']
                parity_error = abs(bal_shift - (total_cr - total_dr))
            
            results.append({
                "file": filename,
                "rows": row_count,
                "stability": stability,
                "parity_err": round(parity_error, 2),
                "account": str(meta.get("account_name", "Unknown")),
                "time": round(elapsed, 2)
            })
            
            status_text = "[PASS]" if parity_error < 0.1 else "[FAIL]"
            if row_count == 0: status_text = "[EMPTY]"
            
            print(f"  - Status:    {status_text} {stability}", flush=True)
            print(f"  - Rows:      {row_count}", flush=True)
            print(f"  - Parity:    {parity_error:.2f} Error", flush=True)
            print(f"  - Account:   {meta.get('account_name', 'Unknown')[:40]}...")
            print(f"  - Time:      {elapsed:.2f}s")
            
        except Exception as e:
            # This shouldn't happen with the new Ironclad shield, but catch just in case
            print(f"  - !!! [CRASH]: {str(e)}")
            results.append({
                "file": filename,
                "rows": 0,
                "stability": f"UNTRAPPED CRASH: {str(e)}",
                "parity_err": 0.0,
                "account": "ERROR",
                "time": 0.0
            })

    # Final Summary Report
    report_path = "scratch/audit_report_v7.txt"
    with open(report_path, "w", encoding='utf-8') as f:
        f.write("="*80 + "\n")
        f.write("      IRONCLAD V7.0 GLOBAL AUDIT REPORT\n")
        f.write("="*80 + "\n")
        f.write(f"Total Files Tested:  {len(results)}\n")
        f.write(f"Stable (Trapped):    {len([r for r in results if 'CRASH' not in r['stability'].upper()])}\n")
        f.write(f"Math Pass (Err<0.1): {len([r for r in results if r['parity_err'] < 0.1 and r['rows'] > 0])}\n")
        f.write(f"Zero Rows Found:     {len([r for r in results if r['rows'] == 0])}\n")
        f.write("-" * 80 + "\n")
        f.write(f"{'FILENAME':<40} | {'ROWS':<5} | {'PARITY':<8} | {'STABILITY':<15}\n")
        f.write("-" * 80 + "\n")
        for r in results:
            f.write(f"{r['file'][:40]:<40} | {r['rows']:<5} | {r['parity_err']:<8} | {r['stability'][:15]:<15}\n")
        f.write("-" * 80 + "\n")

    print(f"\n{'='*80}")
    print(f"AUDIT COMPLETE. Report saved to {report_path}")
    print(f"{'='*80}")

if __name__ == "__main__":
    audit_all_banks()
