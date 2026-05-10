import sys
sys.path.append('../backend')
from policy_engine import PolicyEngine

engine = PolicyEngine('../backend/policies.json')

# create some mock transactions
transactions = [
    {"Date": "2023-01-01", "Balance": 100000},
    {"Date": "2023-01-06", "Balance": 200000},
    {"Date": "2023-01-11", "Balance": 300000},
    {"Date": "2023-01-16", "Balance": 400000},
    {"Date": "2023-01-21", "Balance": 500000},
    {"Date": "2023-01-26", "Balance": 600000},
]

print("ADITYA BIRLA (has dates):")
lender1 = next(l for l in engine.policies if l['id'] == 'aditya_birla')
print(engine.calculate_custom_abb(transactions, lender1['abb_dates']))

print("AXIS FINANCE (empty list dates):")
lender2 = next(l for l in engine.policies if l['id'] == 'axis_finance')
print(engine.calculate_custom_abb(transactions, lender2['abb_dates']))
