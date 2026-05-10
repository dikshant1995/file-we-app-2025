import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import parse_bank_statement
from policy_engine import PolicyEngine

# Force UTF-8 encoding
sys.stdout.reconfigure(encoding='utf-8')

def run_case_study():
    pdf_path = "axis new.pdf"
    if not os.path.exists(pdf_path):
        print(f"Error: {pdf_path} not found in workspace.")
        return
        
    print(f"--- CASE STUDY: {pdf_path} ---\n")
    
    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()
        
    d1, d2, d3, meta = parse_bank_statement(pdf_bytes)
    engine = PolicyEngine()
    
    # 1. Let's see the balances on specific days of the month
    # Let's group transactions by day of month
    dates_balances = {}
    for r in d3:
        date_str = r.get('Date', '') # YYYY-MM-DD
        if date_str:
            day = int(date_str.split('-')[2])
            dates_balances[day] = r.get('Balance', 0.0)
            
    print("Calculated Daily Balances on key days of the month from PDF:")
    for d in sorted([5, 10, 15, 20, 25, 30]):
        bal = dates_balances.get(d, 0.0)
        print(f"  Day {d}: ₹{bal:,.2f}")
    print()
    
    # Let's perform exact calculations
    # 2. ADITYA BIRLA (Dates: 5, 10, 15, 20, 25, 30)
    ab_dates = [5, 10, 15, 20, 25, 30]
    ab_abb = engine.calculate_custom_abb(d3, ab_dates)
    ab_deduction = 25000.0
    ab_capacity = max(0.0, ab_abb - ab_deduction)
    
    print("--- ADITYA BIRLA MATH ---")
    print(f"  ABB Dates: {ab_dates}")
    print(f"  Custom ABB (Average Balance on these days): ₹{ab_abb:,.2f}")
    print(f"  Existing EMI Deduction: ₹{ab_deduction:,.2f}")
    print(f"  Calculated Net Capacity: ₹{ab_capacity:,.2f}")
    ab_loan = engine.calculate_max_loan(ab_capacity, annual_rate=0.16, years=3)
    print(f"  Calculated Max Eligible Loan: ₹{ab_loan:,.2f}\n")
    
    # 3. AXIS BANK LTD. (Dates: 5, 10, 15, 25)
    axis_dates = [5, 10, 15, 25]
    axis_abb = engine.calculate_custom_abb(d3, axis_dates)
    axis_deduction = 25000.0
    axis_capacity = max(0.0, axis_abb - axis_deduction)
    
    print("--- AXIS BANK LTD. MATH ---")
    print(f"  ABB Dates: {axis_dates}")
    print(f"  Custom ABB (Average Balance on these days): ₹{axis_abb:,.2f}")
    print(f"  Existing EMI Deduction: ₹{axis_deduction:,.2f}")
    print(f"  Calculated Net Capacity: ₹{axis_capacity:,.2f}")
    axis_loan = engine.calculate_max_loan(axis_capacity, annual_rate=0.16, years=3)
    print(f"  Calculated Max Eligible Loan: ₹{axis_loan:,.2f}\n")

if __name__ == "__main__":
    run_case_study()
