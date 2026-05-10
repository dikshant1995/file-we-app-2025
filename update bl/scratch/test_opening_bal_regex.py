import re

def clean_amount(val_str):
    if val_str is None: return 0.0
    numeric_clean = re.sub(r'[^\d\.]', '', str(val_str))
    try:
        return float(numeric_clean)
    except:
        return 0.0

h_text = "Balance at start of 1 Apr 2024 : 1,06,880.98"

# Original regex
pattern_old = r'(?:OPENING\s*BALANCE|Balance\s*b/f|Start\s*Balance|Balance\s*as\s*on[^\n:]*)\s*[:\-]?\s*[^\d\-]*?(-?[\d,]+\.\d{2})'
m_old = re.search(pattern_old, h_text, re.I)
print(f"Old Regex Match: {m_old.group(1) if m_old else 'None'}")

# Proposed regex
pattern_new = r'(?:OPENING\s*BALANCE|Balance\s*b/f|Start\s*Balance|Balance\s*at\s*start\s*of|Balance\s*as\s*on).*?[:\-]?\s*(-?[\d,]+\.\d{2})'
m_new = re.search(pattern_new, h_text, re.I)
print(f"New Regex Match: {m_new.group(1) if m_new else 'None'}")
print(f"Cleaned: {clean_amount(m_new.group(1)) if m_new else 0.0}")
