import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))
from pdf_extractor import clean_amount

def test_dr_logic():
    examples = [
        ("800000 dr", -800000.0),
        ("- 800000", -800000.0),
        ("-800000 dr", -800000.0),
        ("1,25,000.50 DR", -125000.5),
        ("50000", 50000.0),
        ("100.00 Cr", 100.0)
    ]
    
    passed = 0
    for input_str, expected in examples:
        result = clean_amount(input_str)
        if result == expected:
            print(f"PASS: '{input_str}' -> {result}")
            passed += 1
        else:
            print(f"FAIL: '{input_str}' -> {result} (Expected {expected})")
            
    print(f"\nFinal Result: {passed}/{len(examples)} passed.")

if __name__ == "__main__":
    test_dr_logic()
