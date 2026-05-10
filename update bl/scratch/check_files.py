import os
pdf_files = [f for f in os.listdir('.') if f.lower().endswith('.pdf')]
print(len(pdf_files))
for f in sorted(pdf_files):
    print(f)
