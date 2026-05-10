import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import parse_bank_statement
from policy_engine import PolicyEngine

# Force UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')

def run_matrix_audit():
    engine = PolicyEngine()
    
    # Define 8 unique customer personas with totally different parameters
    personas = [
        {
            "name": "Rajesh Malhotra",
            "business": "Malhotra Enterprises",
            "pdf": "axis new.pdf",
            "data": {
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
            },
            "desc": "Testing high-balance day 20 with owned properties."
        },
        {
            "name": "Amit Sharma",
            "business": "Sharma Diagnostics",
            "pdf": "KOTAK 1.pdf",
            "data": {
                "loan_amount": 2500000.0,
                "gst_vintage_years": 4.0,
                "itr_vintage_years": 3.0,
                "residence_type": "RENTED",
                "office_type": "OWNED",
                "pincode": "302001",
                "account_type": "savings",
                "sanctioned_limit": 0.0,
                "num_active_loans": 1,
                "total_active_emi": 40000.0,
                "num_active_business_loans": 0,
                "total_business_loan_emi": 0.0,
                "age": 32.0,
                "business_vintage_years": 4.0,
                "bto": 0.0,
                "firm_type": "Partnership",
                "distance_from_center": 8.0,
                "cibil_score": 780,
                "total_recent_loans": 0,
                "total_recent_loan_emi": 0.0
            },
            "desc": "Testing Rented Residence eligibility with high existing EMI."
        },
        {
            "name": "Priya Patel",
            "business": "Patel Textures",
            "pdf": "IndusInd.pdf",
            "data": {
                "loan_amount": 1000000.0,
                "gst_vintage_years": 1.0,
                "itr_vintage_years": 1.0,
                "residence_type": "RENTED",
                "office_type": "RENTED",
                "pincode": "380001",
                "account_type": "savings",
                "sanctioned_limit": 0.0,
                "num_active_loans": 4,
                "total_active_emi": 10000.0,
                "num_active_business_loans": 2,
                "total_business_loan_emi": 5000.0,
                "age": 28.0,
                "business_vintage_years": 1.5,
                "bto": 0.0,
                "firm_type": "Proprietorship",
                "distance_from_center": 12.0,
                "cibil_score": 680,
                "total_recent_loans": 1,
                "total_recent_loan_emi": 3000.0
            },
            "desc": "Testing low vintage (1 Yr) and completely Rented profile."
        },
        {
            "name": "Vikram Singh",
            "business": "Singh Logistics",
            "pdf": "AU 2.pdf",
            "data": {
                "loan_amount": 3000000.0,
                "gst_vintage_years": 2.0,
                "itr_vintage_years": 2.0,
                "residence_type": "OWNED",
                "office_type": "RENTED",
                "pincode": "342005",
                "account_type": "savings",
                "sanctioned_limit": 0.0,
                "num_active_loans": 0,
                "total_active_emi": 0.0,
                "num_active_business_loans": 0,
                "total_business_loan_emi": 0.0,
                "age": 45.0,
                "business_vintage_years": 2.0,
                "bto": 0.0,
                "firm_type": "LLP",
                "distance_from_center": 4.0,
                "cibil_score": 720,
                "total_recent_loans": 0,
                "total_recent_loan_emi": 0.0
            },
            "desc": "Testing Rented Office with clean slate (Zero active EMIs)."
        },
        {
            "name": "Sunita Rao",
            "business": "Rao Medicals",
            "pdf": "AU 1.pdf",
            "data": {
                "loan_amount": 1500000.0,
                "gst_vintage_years": 3.0,
                "itr_vintage_years": 2.0,
                "residence_type": "OWNED",
                "office_type": "OWNED",
                "pincode": "560001",
                "account_type": "savings",
                "sanctioned_limit": 0.0,
                "num_active_loans": 3,
                "total_active_emi": 80000.0,
                "num_active_business_loans": 2,
                "total_business_loan_emi": 40000.0,
                "age": 52.0,
                "business_vintage_years": 5.0,
                "bto": 0.0,
                "firm_type": "Pvt Ltd",
                "distance_from_center": 2.0,
                "cibil_score": 790,
                "total_recent_loans": 0,
                "total_recent_loan_emi": 0.0
            },
            "desc": "Testing extremely high debt-burden (₹80,000 Existing EMI)."
        },
        {
            "name": "Devendra Kumar",
            "business": "Kumar Metals",
            "pdf": "axis limit acc.pdf",
            "data": {
                "loan_amount": 2000000.0,
                "gst_vintage_years": 5.0,
                "itr_vintage_years": 3.0,
                "residence_type": "OWNED",
                "office_type": "OWNED",
                "pincode": "342008",
                "account_type": "limit",
                "sanctioned_limit": 1000000.0,
                "num_active_loans": 1,
                "total_active_emi": 30000.0,
                "num_active_business_loans": 1,
                "total_business_loan_emi": 15000.0,
                "age": 39.0,
                "business_vintage_years": 6.0,
                "bto": 0.0,
                "firm_type": "Partnership",
                "distance_from_center": 15.0,
                "cibil_score": 740,
                "total_recent_loans": 0,
                "total_recent_loan_emi": 0.0
            },
            "desc": "Testing CC/OD limit account with dynamic peak utilisation check."
        },
        {
            "name": "Gagan Deep",
            "business": "Deep Travels",
            "pdf": "BOI.pdf",
            "data": {
                "loan_amount": 1200000.0,
                "gst_vintage_years": 3.0,
                "itr_vintage_years": 2.0,
                "residence_type": "OWNED",
                "office_type": "OWNED",
                "pincode": "342002",
                "account_type": "savings",
                "sanctioned_limit": 0.0,
                "num_active_loans": 0,
                "total_active_emi": 0.0,
                "num_active_business_loans": 0,
                "total_business_loan_emi": 0.0,
                "age": 22.0,
                "business_vintage_years": 3.0,
                "bto": 0.0,
                "firm_type": "Proprietorship",
                "distance_from_center": 6.0,
                "cibil_score": -1,
                "total_recent_loans": 0,
                "total_recent_loan_emi": 0.0
            },
            "desc": "Testing younger age (22 Yr) and CIBIL -1 score (No History)."
        },
        {
            "name": "Megha Joshi",
            "business": "Joshi & Sons",
            "pdf": "UNION TESTING (1).pdf",
            "data": {
                "loan_amount": 1800000.0,
                "gst_vintage_years": 3.0,
                "itr_vintage_years": 2.0,
                "residence_type": "RENTED",
                "office_type": "OWNED",
                "pincode": "342003",
                "account_type": "savings",
                "sanctioned_limit": 0.0,
                "num_active_loans": 2,
                "total_active_emi": 20000.0,
                "num_active_business_loans": 1,
                "total_business_loan_emi": 10000.0,
                "age": 29.0,
                "business_vintage_years": 3.0,
                "bto": 0.0,
                "firm_type": "Proprietorship",
                "distance_from_center": 9.0,
                "cibil_score": 760,
                "total_recent_loans": 0,
                "total_recent_loan_emi": 0.0
            },
            "desc": "Testing Union Bank statement with Rented Residence."
        }
    ]
    
    # Generate Markdown Matrix Report
    report = []
    report.append("# 🌐 Multi-Persona Portfolio Testing Matrix")
    report.append("This high-fidelity matrix details the testing of 8 distinct customer personas, each mapped to a different PDF bank statement with completely unique manual application parameters.")
    report.append("\n---\n")
    
    for idx, p in enumerate(personas):
        report.append(f"## 👤 Scenario {idx+1}: {p['name']} ({p['business']})")
        report.append(f"**Target PDF:** `{p['pdf']}`")
        report.append(f"**Scenario Description:** *{p['desc']}*")
        report.append("\n**Application Inputs Entered:**")
        report.append(f"- **Residence:** `{p['data']['residence_type']}` | **Office:** `{p['data']['office_type']}`")
        report.append(f"- **GST Vintage:** `{p['data']['gst_vintage_years']} Years` | **Age:** `{p['data']['age']} Years`")
        report.append(f"- **Existing Active EMI:** `₹{p['data']['total_active_emi']:,}/month` | **CIBIL Score:** `{p['data']['cibil_score']}`")
        
        pdf_path = p['pdf']
        if not os.path.exists(pdf_path):
            report.append(f"\n⚠️ *Error: Statement file `{pdf_path}` not found in workspace.*")
            report.append("\n" + "="*40 + "\n")
            continue
            
        try:
            with open(pdf_path, "rb") as f:
                pdf_bytes = f.read()
            d1, d2, d3, meta = parse_bank_statement(pdf_bytes)
            
            bank_data = {
                "transactions": d3,
                "credit_entries_count": len([r for r in d3 if r.get('Cr', 0) > 0])
            }
            
            evaluation = engine.evaluate(p['data'], bank_data)
            
            report.append("\n**Lender Eligibility Matrix Outcomes:**\n")
            report.append("| Lender Name | Status | Approved Loan Amount | Allotted Rate (ROI) | Key Decisions / Reasons |")
            report.append("| :--- | :--- | :--- | :--- | :--- |")
            
            for res in evaluation[:12]: # Show first 12 lenders for clean visualization
                reasons_str = ", ".join(res['reasons']) if res['reasons'] else "Passed all barriers"
                report.append(f"| **{res['lender_name']}** | `{res['status']}` | ₹{res['max_loan_amount']:,} | {res['roi']}% | {reasons_str} |")
                
        except Exception as e:
            report.append(f"\n❌ *Execution Error: {str(e)}*")
            
        report.append("\n" + "="*80 + "\n")
        
    report_content = "\n".join(report)
    out_path = "C:/Users/Dikshant/.gemini/antigravity/brain/fc7ca1b0-3b92-476c-bc00-b8d49a327417/multi_persona_case_study.md"
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(report_content)
        
    print("Matrix Audit Report Generated successfully!")

if __name__ == "__main__":
    run_matrix_audit()
