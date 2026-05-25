import json
import re
from datetime import datetime

import os

class PolicyEngine:
    def __init__(self, policies_path=None):
        if policies_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            policies_path = os.path.join(base_dir, 'policies.json')
        with open(policies_path, 'r', encoding='utf-8') as f:
            self.policies = json.load(f)


    def calculate_bounce_ratio(self, transactions):
        if not transactions:
            return 0.0
        
        # Regex for inward returns (bounces)
        # Match I/W RTN, INWARD RETURN, etc.
        inward_regex = r'(?:I/W|INWARD|I-W)\s*(?:CHQ|CHEQ|CHEQUE|CLG)?\s*(?:RTN|RETURN|RET)'
        
        inward_bounces = 0
        total_credits = 0
        
        for t in transactions:
            narr = str(t.get('Narration', '')).upper()
            if re.search(inward_regex, narr):
                inward_bounces += 1
            if t.get('Cr', 0) > 0:
                total_credits += 1
                
        if total_credits == 0:
            return 0.0
        return (inward_bounces / total_credits) * 100

    def calculate_utilisation(self, transactions, limit):
        if not limit or limit <= 0 or not transactions:
            return 0.0, 0.0
        
        peak_used = 0
        total_used = 0
        count = 0
        
        for t in transactions:
            val = t.get('Balance', 0)
            # Strategy: 
            # 1. If balance is negative, the absolute value is the 'used' amount.
            # 2. If balance is positive, we check if it's likely 'headroom' or 'credit balance'.
            #    If val <= limit, we assume it might be headroom (Used = Limit - Val).
            #    If val > limit, it's a credit balance (Used = 0).
            
            if val < 0:
                used = abs(val)
            elif val <= limit:
                # This is an assumption that positive balance in CC means headroom
                # However, if it's a standard bank format, positive might mean credit.
                # We'll stick to the headroom assumption for now as it's common in limit extracts.
                used = limit - val
            else:
                used = 0
                
            util = (used / limit) * 100
            
            if util > peak_used:
                peak_used = util
            total_used += util
            count += 1
            
        avg_util = total_used / count if count > 0 else 0
        return avg_util, peak_used

    def calculate_net_bto(self, transactions, firm_name="", sister_firms=""):
        # Exclude cash deposits to find pure digital revenue
        cash_regex = r'(?:^|[^A-Z])(CASHDEP|BY CASH|CASH DEPOSIT|CASH RECEIPT|CSH DEP|CASH)(?:[^A-Z]|$)'
        total_credit = 0
        cash_credit = 0
        inter_firm_credit = 0
        
        firm_regex = None
        if firm_name and firm_name.strip():
            firm_regex = re.compile(re.escape(firm_name.strip()), re.IGNORECASE)
            
        sister_regex = None
        if sister_firms and sister_firms.strip():
            sister_regex = re.compile(re.escape(sister_firms.strip()), re.IGNORECASE)
        
        for t in transactions:
            cr = t.get('Cr', 0)
            if cr > 0:
                total_credit += cr
                narr = str(t.get('Narration', '')).upper()
                if re.search(cash_regex, narr):
                    cash_credit += cr
                else:
                    matched = False
                    if firm_regex and firm_regex.search(narr):
                        matched = True
                    if not matched and sister_regex and sister_regex.search(narr):
                        matched = True
                        
                    if matched:
                        inter_firm_credit += cr
                    
        return total_credit - cash_credit - inter_firm_credit

    def calculate_custom_abb(self, transactions, dates):
        """
        Calculates ABB specifically for the given dates (e.g., 5th, 10th, 15th).
        """
        if not transactions:
            return 0
            
        # Fallback to standard check dates if none are configured in policies
        if not dates:
            dates = [5, 10, 15, 20, 25, 30]

            
        # Group transactions by date
        daily_balances = {}
        for t in transactions:
            dt = t.get('Date')
            if dt:
                daily_balances[dt] = t.get('Balance', 0)
        
        # Sort dates to find the latest balance before/on each target date
        sorted_transaction_dates = sorted(daily_balances.keys())
        if not sorted_transaction_dates: return 0
        
        # We need to check each month in the statement
        months = sorted(list(set([d[:7] for d in sorted_transaction_dates])))
        
        total_sum = 0
        count = 0
        
        for month in months:
            for day in dates:
                target_date = f"{month}-{str(day).zfill(2)}"
                # Find the closest balance on or before this target date
                effective_balance = 0
                for td in sorted_transaction_dates:
                    if td <= target_date:
                        effective_balance = daily_balances[td]
                    else:
                        break
                total_sum += effective_balance
                count += 1
                
        return total_sum / count if count > 0 else 0

    def calculate_max_loan(self, emi_capacity, annual_rate=0.16, years=3):
        """
        Formula: P = (EMI * [ (1+R)^N - 1 ]) / (R * (1+R)^N)
        """
        if emi_capacity <= 0: return 0
        
        monthly_rate = annual_rate / 12
        months = years * 12
        
        # P = E * ((1+r)^n - 1) / (r * (1+r)^n)
        pow_val = pow(1 + monthly_rate, months)
        principal = (emi_capacity * (pow_val - 1)) / (monthly_rate * pow_val)
        
        return round(principal, 0)

    def evaluate(self, borrower_data, bank_data):
        results = []
        transactions = bank_data.get('transactions', [])
        
        # Deep Analytics Calculations
        bounce_ratio = self.calculate_bounce_ratio(transactions)
        
        firm_name = borrower_data.get('firm_name', '')
        sister_firms = borrower_data.get('sister_firms', '')
        net_bto = self.calculate_net_bto(transactions, firm_name, sister_firms)
        
        total_credit = sum([t.get('Cr', 0) for t in transactions])
        digital_ratio = (net_bto / total_credit * 100) if total_credit > 0 else 0
        
        active_months_set = set([t.get('Date', '')[:7] for t in transactions if t.get('Date')])
        active_months_count = len(active_months_set)
        
        limit = borrower_data.get('sanctioned_limit', 0)
        is_limit = borrower_data.get('account_type') == 'limit'
        avg_util, peak_util = self.calculate_utilisation(transactions, limit) if is_limit else (0, 0)
        
        # Auto-extract credit and debit counts from transactions
        credit_entries_count = len([t for t in transactions if t.get('Cr', 0) > 0])
        debit_entries_count = len([t for t in transactions if t.get('Dr', 0) > 0])
        
        for lender in self.policies:
            status = "ELIGIBLE"
            reasons = []
            
            # --- STEP A: BASIC ELIGIBILITY CHECKS ---
            # 1. Age check
            age = float(borrower_data.get('age', 25))
            min_age = float(lender.get('min_age', 21))
            if age < min_age:
                status = "REJECTED"
                reasons.append(f"Age {age} below required minimum {min_age}")
                
            # 2. Business Vintage check
            bus_vintage = float(borrower_data.get('business_vintage_years', 3))
            min_bus_vintage = float(lender.get('min_business_vintage', 3))
            if bus_vintage < min_bus_vintage:
                status = "REJECTED"
                reasons.append(f"Business Vintage {bus_vintage} years below required {min_bus_vintage} years")
                
            # 2b. Statement Period Required check
            min_active = 6
            try:
                min_active = int(lender.get('min_active_months', '6'))
            except:
                pass
            if active_months_count < min_active:
                status = "REJECTED"
                reasons.append(f"Insufficient Statement Period: Extracted {active_months_count} active months (Required: {min_active} months)")
                
            # 3. GST Vintage check
            required_gst = 3 if '3' in str(lender.get('gst_vintage', '')) else (2 if '2' in str(lender.get('gst_vintage', '')) else 0)
            gst_vintage = float(borrower_data.get('gst_vintage_years', 0))
            
            # 4. ITR Vintage check
            required_itr = 3 if '3' in str(lender.get('itr_vintage', '')) else (2 if '2' in str(lender.get('itr_vintage', '')) else 0)
            itr_vintage = float(borrower_data.get('itr_vintage_years', 0))
            
            # 5. Ownership Match check
            if borrower_data.get('residence_type') == "RENTED" and not lender.get('rented_residence_allowed', True):
                status = "REJECTED"
                reasons.append("Rented Residence profile not accepted")
            if borrower_data.get('office_type') == "RENTED" and not lender.get('rented_office_allowed', True):
                status = "REJECTED"
                reasons.append("Rented Office profile not accepted")
                
            # 6. Credit & Debit Entries (Min Trx Density) check
            min_entries = 0
            try:
                min_entries_str = str(lender.get('min_entries', '0'))
                match = re.search(r'\d+', min_entries_str)
                min_entries = int(match.group()) if match else 0
            except:
                pass
            if credit_entries_count < min_entries:
                status = "REJECTED"
                reasons.append(f"Low debit/credit entries: Credit entries {credit_entries_count} below required {min_entries}")
            if debit_entries_count < min_entries:
                status = "REJECTED"
                reasons.append(f"Low debit/credit entries: Debit entries {debit_entries_count} below required {min_entries}")
                
            # 6b. Firm Preference check
            borrower_firm_type = borrower_data.get('firm_type', 'Proprietorship')
            allowed_firm_types = lender.get('allowed_firm_types', ["Proprietorship", "Partnership", "Pvt Ltd", "LLP"])
            if borrower_firm_type not in allowed_firm_types:
                status = "REJECTED"
                reasons.append(f"Firm Type '{borrower_firm_type}' is not preferred by this lender")
                
            # 7. Geo Limit / Distance check
            dist = float(borrower_data.get('distance_from_center', 0))
            try:
                geo_limit_str = str(lender.get('geo_meter_km', ''))
                match = re.search(r'\d+', geo_limit_str)
                geo_limit = float(match.group()) if match else 50.0
            except:
                geo_limit = 50.0
            if dist > geo_limit and "INFINITY" not in geo_limit_str.upper():
                status = "REJECTED"
                reasons.append(f"Distance from city center {dist}km exceeds allowed limit {geo_limit}km")
                

            # 9. Utilisation check
            if is_limit:
                util_cap = 80.0
                try:
                    util_cap = float(str(lender.get('utilisation_cap', '80%')).replace('%', ''))
                except:
                    pass
                if peak_util > util_cap:
                    status = "REJECTED"
                    reasons.append(f"Excessive Limit Utilisation: {peak_util:.2f}% (Cap: {util_cap}%)")
            
            # --- STEP B: GST / ITR VALIDATION ---
            gst_itr_policy = lender.get('gst_itr_policy', 'None')
            has_firm_name = borrower_data.get('has_firm_name_in_itr', 'YES') == 'YES'
            
            # Check if lender's ITR policy requires firm name
            itr_policy_str = str(lender.get('itr_vintage', '')).upper()
            requires_firm_name = "FIRM NAME" in itr_policy_str or "FIRM KA NAM" in itr_policy_str or "SUNGAM ITR" in itr_policy_str
            
            if gst_itr_policy == "BOTH":
                # BOTH Required -> Need Any One (GST or ITR satisfies)
                gst_satisfied = gst_vintage >= required_gst
                itr_satisfied = itr_vintage >= required_itr
                if requires_firm_name and itr_satisfied and not has_firm_name and not gst_satisfied:
                    itr_satisfied = False
                    
                if not gst_satisfied and not itr_satisfied:
                    status = "REJECTED"
                    if requires_firm_name and itr_vintage >= required_itr and not has_firm_name:
                        reasons.append("GST and ITR Validation Failed: Lender requires firm name in the ITR, but it is not present")
                    else:
                        reasons.append(f"GST and ITR Validation Failed: Neither GST ({gst_vintage}yr) nor ITR ({itr_vintage}yr) meets requirement (GST req: {required_gst}yr, ITR req: {required_itr}yr)")
            elif gst_itr_policy == "GST_Only":
                if gst_vintage < required_gst:
                    status = "REJECTED"
                    reasons.append(f"GST Mandatory Check Failed: GST Vintage {gst_vintage}yr below required {required_gst}yr")
            elif gst_itr_policy == "ITR_Only" or (requires_firm_name and not has_firm_name and gst_vintage < required_gst):
                if itr_vintage < required_itr:
                    status = "REJECTED"
                    reasons.append(f"ITR Mandatory Check Failed: ITR Vintage {itr_vintage}yr below required {required_itr}yr")
                elif requires_firm_name and not has_firm_name:
                    status = "REJECTED"
                    reasons.append("ITR Validation Failed: Lender requires firm name to be mentioned in the ITR")
            # "None" means everyone eligible, so no checks needed.
            
            # --- STEP C: CIBIL VALIDATION ---
            cibil = int(borrower_data.get('cibil_score', 750))
            if cibil == -1 and not lender.get('allow_minus_one_cibil', True):
                status = "REJECTED"
                reasons.append("CIBIL -1 profile not accepted by lender")
                
            # --- STEP D & E: DETERMINE LOAN OBLIGATION TYPE & SOURCE ---
            ob_source = lender.get('obligation_source', 'Current_Active')
            if ob_source == "Business_Active":
                deduction = float(borrower_data.get('total_business_loan_emi', 0.0))
                deducted_type = "Business EMI Only"
            elif ob_source in ["Recent_Active", "Last_3_Months_Active"]:
                # Fallback to legacy total_recent_loan_emi if new 3M field is not provided
                deduction = float(borrower_data.get('total_recent_3m_loan_emi', 0.0))
                if deduction == 0:
                    deduction = float(borrower_data.get('total_recent_loan_emi', 0.0))
                deducted_type = "Last 3M Loans EMI Only"
            elif ob_source == "Last_6_Months_Active":
                deduction = float(borrower_data.get('total_recent_6m_loan_emi', 0.0))
                deducted_type = "Last 6M Loans EMI Only"
            else:
                deduction = float(borrower_data.get('total_active_emi', 0.0))
                deducted_type = "Total Active EMI"
                
            # --- STEP F: ABB-BASED EMI CAPACITY ---
            custom_abb = self.calculate_custom_abb(transactions, lender.get('abb_dates', []))
            abb_capacity = max(0.0, custom_abb - deduction)
            
            # --- STEP G: AO/TO VALIDATION ---
            bto = float(borrower_data.get('bto', 0.0))
            if bto <= 0:
                # Fallback to net_bto or total_credit if bto is not entered manually
                bto = net_bto if net_bto > 0 else total_credit
                
            try:
                ao_to_perc = float(str(lender.get('ao_to_percentage', '15%')).replace('%', '')) / 100.0
            except:
                ao_to_perc = 0.15
            
            aoto_annual_capacity = bto * ao_to_perc
            aoto_monthly_capacity = aoto_annual_capacity / 12.0
            
            # --- STEP H: FINAL EMI CAPACITY ---
            final_emi_capacity = min(aoto_monthly_capacity, abb_capacity)
            
            # Convert EMI Capacity to Max Loan Amount
            calculated_loan = self.calculate_max_loan(final_emi_capacity, annual_rate=0.16, years=3)
            
            # --- STEP I: BTO SLAB ELIGIBILITY ---
            if bto < 3000000: # Below 30L is rejected/skipped as per flowchart
                status = "REJECTED"
                reasons.append(f"Business Turnover (BTO) {bto:,.2f} is below minimum 30L threshold")
                bto_slab_cap = 0.0
            elif bto < 10000000: # 30L - 1Cr
                bto_slab_cap = 1500000.0
            elif bto < 20000000: # 1Cr - 2Cr
                bto_slab_cap = 2500000.0
            elif bto < 50000000: # 2Cr - 5Cr
                bto_slab_cap = 3500000.0
            else: # Above 5Cr -> Bank Max Capping
                try:
                    bto_slab_cap = float(lender.get('max_cap', 7500000))
                except:
                    bto_slab_cap = 7500000.0
                    
            # --- STEP J & K: FINAL LOAN ELIGIBILITY ---
            try:
                bank_max_cap = float(lender.get('max_cap', 7500000))
            except:
                bank_max_cap = 7500000.0
                
            base_eligible_amount = min(calculated_loan, bto_slab_cap)
            final_eligible_amount = min(base_eligible_amount, bank_max_cap)
            
            if status == "REJECTED":
                final_eligible_amount = 0.0
                
            # --- STEP L: ROI SLAB DETERMINATION ---
            if final_eligible_amount <= 0:
                roi = 0.0
            elif final_eligible_amount < 1500000: # Under 15L
                roi = 16.50
            elif final_eligible_amount <= 2500000: # 15L - 25L
                roi = 17.50
            elif final_eligible_amount <= 3500000: # 25L - 35L
                roi = 15.00
            else: # Above 35L
                roi = 14.00
                
            # --- STEP M: EMI CALCULATION ---
            monthly_rate = (roi / 100) / 12
            months = 36 # 3 years tenure
            if final_eligible_amount > 0 and monthly_rate > 0:
                actual_emi = (final_eligible_amount * monthly_rate * pow(1 + monthly_rate, months)) / (pow(1 + monthly_rate, months) - 1)
                actual_emi = round(actual_emi)
            else:
                actual_emi = 0.0
                
            results.append({
                "lender_name": lender['name'],
                "status": status,
                "reasons": reasons,
                "custom_abb": round(custom_abb, 2),
                "max_loan_amount": final_eligible_amount,
                "emi_capacity": round(final_emi_capacity, 2),
                "raw_emi_capacity": round(abb_capacity, 2),
                "deducted_emi": round(deduction, 2),
                "deducted_type": deducted_type,
                "roi": roi,
                "calculated_emi": actual_emi,
                "aoto_capacity": round(aoto_monthly_capacity, 2),
                "bto_slab_cap": bto_slab_cap,
                "capping_status": "Max Capped" if final_eligible_amount == bank_max_cap and final_eligible_amount > 0 else "Normal",
                "deep_analytics": {
                    "bounce_ratio": f"{bounce_ratio:.2f}%",
                    "net_bto": round(net_bto, 2),
                    "digital_ratio": f"{digital_ratio:.2f}%",
                    "active_months": active_months_count,
                    "peak_utilisation": f"{peak_util:.2f}%" if is_limit else "N/A",
                    "credit_entries_count": credit_entries_count,
                    "debit_entries_count": debit_entries_count
                },
                "policy_summary": {
                    "abb_dates": lender.get('abb_dates', []),
                    "co_app": lender.get('co_app_policy', 'SINGLE APP')
                }
            })
            
        return results

