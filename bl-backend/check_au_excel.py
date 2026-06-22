import pandas as pd
df = pd.read_excel(r'D:\proudct dashboard pl final pl\LATEST UPDATE PL BETA\deploy_to_vercel\file-we-app-2025\update bl\AU SMALL ERROR.xlsx')
print(f'Total Rows: {len(df)}')
print(df.head(10).to_string())
print('...')
print(df.tail(10).to_string())
