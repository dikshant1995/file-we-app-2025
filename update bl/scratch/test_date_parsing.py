
from datetime import datetime
import re

def parse_date(date_str, year_context=None):
    if not date_str:
        return None
    
    date_str = str(date_str).strip().replace('.', '-')
    date_str = re.sub(r'[^a-zA-Z0-9]+$', '', date_str)
    date_str = re.sub(r'[\s\/\-]+', '-', date_str).title()
    
    if re.match(r'^\d{1,2}-[A-Za-z]{3}$', date_str) or re.match(r'^\d{1,2}-\d{1,2}$', date_str):
        if year_context:
            date_str = f"{date_str}-{year_context}"
    
    # Original list from pdf_extractor.py
    formats = ('%d-%m-%Y', '%d-%b-%Y', '%d-%m-%y', '%Y-%m-%d', '%d/%m/%y', '%d/%m/%Y', '%d %b %Y', '%d-%b-%y', '%d/%b/%y', '%d/%b/%Y', '%d-%B-%Y', '%d-%B-%y')
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime('%Y-%m-%d')
        except ValueError:
            pass
    return None

# Test cases based on my analysis
test_dates = [
    "20-04-01", # Expected 2020-04-01 (YY-MM-DD), current behavior?
    "20-03-31", # Expected 2020-03-31 (YY-MM-DD), current behavior?
    "2024-05-12" # Expected 2024-05-12
]

print("Current behavior:")
for d in test_dates:
    print(f"{d} -> {parse_date(d)}")

def parse_date_fixed(date_str, year_context=None):
    if not date_str:
        return None
    
    date_str = str(date_str).strip().replace('.', '-')
    date_str = re.sub(r'[^a-zA-Z0-9]+$', '', date_str)
    date_str = re.sub(r'[\s\/\-]+', '-', date_str).title()
    
    if re.match(r'^\d{1,2}-[A-Za-z]{3}$', date_str) or re.match(r'^\d{1,2}-\d{1,2}$', date_str):
        if year_context:
            date_str = f"{date_str}-{year_context}"
    
    # Improved format list: prioritize YYYY-MM-DD and add YY-MM-DD
    # We should be careful about YY-MM-DD vs DD-MM-YY
    # If the first part is 4 digits, it's definitely YYYY-MM-DD
    # If the first part is 2 digits and matches YY-MM-DD pattern...
    
    formats = (
        '%Y-%m-%d', '%d-%m-%Y', '%d-%b-%Y', 
        '%y-%m-%d', # Added for YY-MM-DD
        '%d-%m-%y', '%d/%m/%y', '%d/%m/%Y', '%d %b %Y', '%d-%b-%y', '%d/%b/%y', '%d/%b/%Y', '%d-%B-%Y', '%d-%B-%y'
    )
    
    for fmt in formats:
        try:
            return datetime.strptime(date_str, fmt).strftime('%Y-%m-%d')
        except ValueError:
            pass
    return None

print("\nFixed behavior:")
for d in test_dates:
    print(f"{d} -> {parse_date_fixed(d)}")
