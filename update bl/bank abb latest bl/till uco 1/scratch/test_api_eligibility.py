import requests
import sys

# Reconfigure stdout to use UTF-8 to prevent Rupee character console encoding crash on Windows
sys.stdout.reconfigure(encoding='utf-8')

def test_eligibility():
    url = "http://localhost:8000/api/evaluate-eligibility"
    # Let's use KOTAK 1.pdf which exists in root
    files = {'file': open('KOTAK 1.pdf', 'rb')}
    
    data = {
        "loan_amount": "1500000",
        "gst_vintage": "3",
        "itr_vintage": "2",
        "residence_type": "OWNED",
        "office_type": "OWNED",
        "pincode": "342001",
        "account_type": "savings",
        "sanctioned_limit": "0.0",
        "num_active_loans": "2",
        "total_active_emi": "25000",
        "num_active_business_loans": "1",
        "total_business_loan_emi": "15000"
    }
    
    try:
        r = requests.post(url, files=files, data=data)
        res = r.json()
        print("API Response Status:", res.get("status"))
        if res.get("status") == "success":
            print("\nEvaluation Results:\n")
            for lender in res["results"][:5]:  # show top 5 results
                print(f"Lender: {lender['lender_name']}")
                print(f"  Status: {lender['status']}")
                print(f"  Reasons: {lender['reasons']}")
                print(f"  Custom ABB: ₹{lender['custom_abb']:,}")
                print(f"  Max Eligible Loan Amount: ₹{lender['max_loan_amount']:,}")
                print(f"  Applied ROI: {lender['roi']}%")
                print(f"  Calculated Monthly EMI: ₹{lender['calculated_emi']:,}")
                print(f"  Net BTO (Turnover): ₹{lender['deep_analytics']['net_bto']:,}")
                print(f"  ATO Ratio: {lender['ato_ratio']}%")
                print("-" * 40)
        else:
            print("Error message:", res.get("message"))
    except Exception as e:
        print("Error during API request:", e)

if __name__ == "__main__":
    test_eligibility()
