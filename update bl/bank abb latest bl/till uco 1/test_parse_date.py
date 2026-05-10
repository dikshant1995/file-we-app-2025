from datetime import datetime
import re

def parse_date(date_str):
    if not date_str:
        return None
    date_str = str(date_str).strip()
    date_str = re.sub(r'[\s\/\-]+', '-', date_str).title()
    print(f"DEBUG Normalized: {date_str}")
    
    for fmt in ('%d-%m-%Y', '%d-%b-%Y', '%d-%m-%y', '%Y-%m-%d', '%d/%m/%y', '%d/%m/%Y', '%d %b %Y', '%d-%b-%y', '%d/%b/%y', '%d/%b/%Y'):
        try:
            res = datetime.strptime(date_str, fmt).strftime('%Y-%m-%d')
            print(f"DEBUG Found: {res} with fmt {fmt}")
            return res
        except ValueError:
            pass
    return None

print(f"RESULT: {parse_date('01/Sep/20')}")
print(f"RESULT 2: {parse_date('01/Sep/2024')}")
