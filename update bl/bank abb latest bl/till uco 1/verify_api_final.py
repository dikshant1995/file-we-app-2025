import requests

def verify_full_stack():
    print(">>> [FINAL AUDIT] Verifying Full-Stack IDBI Bridge...")
    url = "http://localhost:8000/api/upload-statement"
    files = {'file': open('idbi limit acc.pdf', 'rb')}
    
    try:
        r = requests.post(url, files=files)
        data = r.json()
        if data["status"] == "success":
            rows = len(data["data"]["dataset_1"])
            name = data["data"]["metadata"].get("account_name")
            bal = data["data"]["dataset_1"][-1].get("Balance")
            print(f"  [SUCCESS] API returned {rows} transactions.")
            print(f"  [SUCCESS] Identity: {name}")
            print(f"  [SUCCESS] Final Balance: {bal}")
            print("\n>>> FULL-STACK BRIDGE IS LIVE. 10/10 REPO VICTORY.")
        else:
            print(f"  [FAILURE] API reported error: {data.get('message')}")
    except Exception as e:
        print(f"  [CRASH] Verification script failed: {e}")

if __name__ == "__main__":
    verify_full_stack()
