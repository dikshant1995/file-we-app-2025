import re
from datetime import datetime

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
    pattern = r'\b(' + '|'.join([re.escape(k) for k in keywords]) + r')\b'
    COMPILED_RISK_REGEX[category] = re.compile(pattern, re.IGNORECASE)

# Cash withdrawal patterns
CASH_WDL_PATTERN = re.compile(r'(CASH WDL|ATM WDL|CASH WITHDRAWAL|CSH WDL|ATM WITHDRAWAL)', re.IGNORECASE)

# POS / CC Patterns
POS_REGEX = re.compile(r'(?i)(TERMINAL|CARDSSETT|POS SETTLEMENT|SWIPE|MSWIPE|PINE LABS|INNOVITI|EZETAP)')
CC_REGEX = re.compile(r'(?i)\b(ONECARD|CRED|CC PAY|CREDIT CARD|PAYU.*CARD|SBI CARD|HDFC CC|AXIS CC|CHEQ|ICICI CC)\b')

def parse_date(date_str):
    try:
        # Assuming YYYY-MM-DD or DD-MM-YYYY or DD/MM/YYYY
        # A simple fallback parser
        if not date_str: return None
        date_str = str(date_str).split(' ')[0]
        if '-' in date_str:
            parts = date_str.split('-')
            if len(parts[0]) == 4:
                return datetime.strptime(date_str, '%Y-%m-%d')
            else:
                return datetime.strptime(date_str, '%d-%m-%Y')
        elif '/' in date_str:
             return datetime.strptime(date_str, '%d/%m/%Y')
        return None
    except:
        return None

def analyze_risk_flags(transactions):
    flagged_transactions = []
    
    total_debits = 0.0
    total_cash_wdl = 0.0
    cash_wdl_count = 0
    
    crypto_exposure = False
    gambling_exposure = False
    cc_rotation_detected = False
    
    pos_credits = []
    cc_debits = []
    
    for t in transactions:
        narr = str(t.get('Narration', ''))
        dr = float(t.get('Dr') or 0.0)
        cr = float(t.get('Cr') or 0.0)
        d_obj = parse_date(t.get('Date', ''))
        
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
                
        # Check against basic risk dictionary
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
                    
        # CC Rotation Tracking
        if d_obj:
            if cr > 0 and POS_REGEX.search(narr):
                pos_credits.append({'t': t, 'cr': cr, 'date': d_obj})
            if dr > 0 and CC_REGEX.search(narr):
                cc_debits.append({'t': t, 'dr': dr, 'date': d_obj})
                
    # Evaluate CC Rotation (±3 days, >= 5000 amount, within 20% diff)
    matched_pos_ids = set()
    matched_cc_ids = set()
    
    for pos in pos_credits:
        for cc in cc_debits:
            if pos['cr'] >= 5000 and cc['dr'] >= 5000:
                day_diff = abs((pos['date'] - cc['date']).days)
                if day_diff <= 3:
                    diff_ratio = abs(pos['cr'] - cc['dr']) / max(pos['cr'], cc['dr'])
                    if diff_ratio <= 0.20:
                        cc_rotation_detected = True
                        # To avoid duplicate flagging of the same row if matched multiple times
                        pos_ref = str(pos['t'])
                        cc_ref = str(cc['t'])
                        if pos_ref not in matched_pos_ids:
                            f_pos = pos['t'].copy()
                            f_pos['Risk Category'] = 'Suspected CC Rotation (POS Settlement)'
                            flagged_transactions.append(f_pos)
                            matched_pos_ids.add(pos_ref)
                            
                        if cc_ref not in matched_cc_ids:
                            f_cc = cc['t'].copy()
                            f_cc['Risk Category'] = 'Suspected CC Rotation (Card Payment)'
                            flagged_transactions.append(f_cc)
                            matched_cc_ids.add(cc_ref)
                    
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
            "gambling_exposure": gambling_exposure,
            "cc_rotation_detected": cc_rotation_detected
        },
        "flagged_transactions": flagged_transactions
    }
