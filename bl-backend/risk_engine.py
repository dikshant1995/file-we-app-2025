import re

RISK_DICTIONARY = {
    "Crypto Exchanges": [
        "CoinDCX", "CoinSwitch", "WazirX", "ZebPay", "Mudrex", "Binance", 
        "Unocoin", "Giottus", "Delta Exchange", "BuyUcoin", "Bitbns"
    ],
    "Fantasy Gaming": [
        "Dream11", "My11Circle", "MPL", "Mobile Premier League", "Howzat", "MyTeam11", 
        "PlayerzPot", "Vision11", "BalleBaazi", "FanFight", "Real11", "11Wickets", "Gamezy"
    ],
    "Real-Money Gaming & Rummy": [
        "RummyCircle", "Junglee Rummy", "A23", "Ace2Three", "Taj Rummy", 
        "RummyCulture", "WinZO", "Classic Rummy", "Octro PlayRummy", "PokerBaazi"
    ],
    "Betting & Gambling": [
        "1xBet", "Parimatch", "Betway", "Dafabet", "Lotus365", "FairPlay", 
        "Stake", "Bet365", "4rabet", "Megapari", "Rajabets"
    ]
}

# Pre-compile regexes for performance
COMPILED_RISK_REGEX = {}
for category, keywords in RISK_DICTIONARY.items():
    pattern = r'(' + '|'.join([re.escape(k) for k in keywords]) + r')'
    COMPILED_RISK_REGEX[category] = re.compile(pattern, re.IGNORECASE)

# Cash withdrawal patterns
CASH_WDL_PATTERN = re.compile(r'(CASH WDL|ATM WDL|CASH WITHDRAWAL|CSH WDL|ATM WITHDRAWAL)', re.IGNORECASE)

def analyze_risk_flags(transactions):
    flagged_transactions = []
    
    total_debits = 0.0
    total_cash_wdl = 0.0
    cash_wdl_count = 0
    
    crypto_exposure = False
    gambling_exposure = False
    
    for t in transactions:
        narr = str(t.get('Narration', ''))
        dr = t.get('Dr', 0.0)
        cr = t.get('Cr', 0.0)
        
        if dr > 0:
            total_debits += dr
            
            # Check for cash withdrawal
            if CASH_WDL_PATTERN.search(narr):
                total_cash_wdl += dr
                cash_wdl_count += 1
                flagged = t.copy()
                flagged['Risk Category'] = 'Cash Withdrawal'
                flagged_transactions.append(flagged)
                continue
                
        # Check against risk dictionary
        for category, regex in COMPILED_RISK_REGEX.items():
            match = regex.search(narr)
            if match:
                flagged = t.copy()
                flagged['Risk Category'] = f"{category} - {match.group(1)}"
                flagged_transactions.append(flagged)
                
                if category == "Crypto Exchanges":
                    crypto_exposure = True
                elif category == "Betting & Gambling":
                    gambling_exposure = True
                    
    # Calculate percentage
    cash_wdl_percentage = 0.0
    if total_debits > 0:
        cash_wdl_percentage = (total_cash_wdl / total_debits) * 100
        
    return {
        "summary": {
            "total_debits": total_debits,
            "total_cash_withdrawals": total_cash_wdl,
            "cash_withdrawal_percentage": cash_wdl_percentage,
            "cash_withdrawal_count": cash_wdl_count,
            "excessive_cash_withdrawals": cash_wdl_percentage > 10.0,
            "crypto_exposure": crypto_exposure,
            "gambling_exposure": gambling_exposure
        },
        "flagged_transactions": flagged_transactions
    }
