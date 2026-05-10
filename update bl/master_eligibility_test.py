import os
import sys
import traceback

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from pdf_extractor import parse_bank_statement
from policy_engine import PolicyEngine

# Force UTF-8 encoding on standard output for Rupee symbols
sys.stdout.reconfigure(encoding='utf-8')

def run_bulk_eligibility():
    pdf_dir = os.path.dirname(os.path.abspath(__file__))
    print(f"Starting Bulk Eligibility Audit in: {pdf_dir}\n")
    
    files = sorted([f for f in os.listdir(pdf_dir) if f.endswith(".pdf")])
    if not files:
        print("No PDF statement files found in workspace.")
        return
        
    print(f"Found {len(files)} PDFs. Initializing Policy Engine...\n")
    engine = PolicyEngine()
    
    # Test Borrower Inputs
    borrower_data = {
        "loan_amount": 1500000.0,
        "gst_vintage_years": 3.0,
        "itr_vintage_years": 2.0,
        "residence_type": "OWNED",
        "office_type": "OWNED",
        "pincode": "342001",
        "account_type": "savings",
        "sanctioned_limit": 0.0,
        "num_active_loans": 2,
        "total_active_emi": 25000.0,
        "num_active_business_loans": 1,
        "total_business_loan_emi": 15000.0,
        "age": 25.0,
        "business_vintage_years": 3.0,
        "bto": 0.0,
        "firm_type": "Proprietorship",
        "distance_from_center": 5.0,
        "cibil_score": 750,
        "total_recent_loans": 0,
        "total_recent_loan_emi": 0.0
    }
    
    results_summary = []
    
    for idx, filename in enumerate(files):
        file_path = os.path.join(pdf_dir, filename)
        print(f"[{idx+1}/{len(files)}] Processing: {filename}")
        
        try:
            with open(file_path, "rb") as f:
                pdf_bytes = f.read()
            
            # 1. Parse statement
            d1, d2, d3, meta = parse_bank_statement(pdf_bytes)
            
            bank_data = {
                "transactions": d3,
                "credit_entries_count": len([r for r in d3 if r.get('Cr', 0) > 0])
            }
            
            # 2. Evaluate against policies
            evaluation = engine.evaluate(borrower_data, bank_data)
            
            eligible_lenders = []
            for res in evaluation:
                if res["status"] == "ELIGIBLE":
                    eligible_lenders.append(f"{res['lender_name']} (₹{res['max_loan_amount']:,} @ {res['roi']}%)")
            
            if eligible_lenders:
                print(f"  --> ELIGIBLE FOR {len(eligible_lenders)} LENDERS: {', '.join(eligible_lenders[:3])}...")
                results_summary.append({
                    "file": filename,
                    "status": "ELIGIBLE",
                    "count": len(eligible_lenders),
                    "lenders": eligible_lenders
                })
            else:
                print("  --> REJECTED BY ALL LENDERS (Incompatible Profile / Low Balance)")
                results_summary.append({
                    "file": filename,
                    "status": "REJECTED BY ALL",
                    "count": 0,
                    "lenders": []
                })
                
        except Exception as e:
            print(f"  --> ERROR: {str(e)[:100]}")
            results_summary.append({
                "file": filename,
                "status": f"ERROR: {str(e)[:50]}",
                "count": 0,
                "lenders": []
            })
            
    # Output final summary report
    report_lines = []
    report_lines.append("=" * 80)
    report_lines.append("BULK ELIGIBILITY ENGINE PORTFOLIO REPORT")
    report_lines.append("=" * 80)
    report_lines.append(f"Total PDFs Audited: {len(files)}")
    report_lines.append(f"Tested Borrower Loan Requirement: ₹15,00,000 (OWNED Residence/Office, Active EMI ₹25,000)\n")
    
    for r in results_summary:
        report_lines.append(f"📄 {r['file']}")
        report_lines.append(f"   Status: {r['status']}")
        if r['count'] > 0:
            report_lines.append(f"   Eligible Lenders ({r['count']}):")
            for l in r['lenders']:
                report_lines.append(f"     - {l}")
        report_lines.append("-" * 50)
        
    report_content = "\n".join(report_lines)
    with open("bulk_eligibility_report.txt", "w", encoding="utf-8") as out_f:
        out_f.write(report_content)
        
    print(f"\nPortfolio Audit Complete! Detailed report saved to: bulk_eligibility_report.txt\n")

if __name__ == "__main__":
    run_bulk_eligibility()
