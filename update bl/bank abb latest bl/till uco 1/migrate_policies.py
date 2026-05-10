import json

def migrate():
    path = 'backend/policies.json'
    with open(path, 'r') as f:
        policies = json.load(f)
    
    defaults = {
        "min_active_months": "6",
        "min_digital_ratio": "60%",
        "max_bounce_ratio": "5%",
        "utilisation_cap": "80%",
        "ao_to_percentage": "15%",
        "allow_minus_one_cibil": True,
        "gst_itr_policy": "None",
        "obligation_source": "Current_Active",
        "min_age": "21",
        "min_business_vintage": "3",
        "max_cap": "7500000"
    }
    
    for p in policies:
        # Remove emi_multiplier if it exists
        p.pop('emi_multiplier', None)
        for key, val in defaults.items():
            if key not in p:
                p[key] = val
                
    with open(path, 'w') as f:
        json.dump(policies, f, indent=4)
    print("Migration complete.")

if __name__ == "__main__":
    migrate()

