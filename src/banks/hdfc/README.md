# HDFC Bank Loan Eligibility Calculator

This document explains the implementation of the HDFC Bank loan eligibility calculator based on the provided FOIR table.

## FOIR Table Structure

The HDFC Bank uses a Fixed Obligation to Income Ratio (FOIR) methodology for determining loan eligibility with the following structure:

| Salary Range | Super A | A | B | C | Govt |
|--------------|---------|---|---|---|------|
| 25k-50k      | 55%     | 55% | 55% | 50% | 55% |
| 50k-75k      | 65%     | 65% | 65% | 65% | 65% |
| 75k-100k     | 70%     | 70% | 70% | 70% | 70% |
| >100k        | 70%     | 70% | 70% | 70% | 70% |

## Key Features

1. **Category-based Calculation**: Different company categories have different FOIR percentages in certain salary bands
2. **Salary Band Boundaries**: Clear boundaries for different salary ranges with no gaps or overlaps
3. **Government Employee Special Handling**: Government employees are categorized as "Govt"
4. **Special Treatment for Category C**: In the 25K-50K salary band, Category C employees get a lower FOIR percentage (50%) compared to others (55%)
5. **Minimum Salary Requirements**: All categories (Super A, A, B, C, Govt) require a minimum net take-home salary of ₹25,000

## Implementation Details

### Salary Band Mapping
- 25,000 - 50,000: '25000-50000'
- 50,001 - 75,000: '50001-75000'
- 75,001 - 100,000: '75001-100000'
- 100,001+: '100001+'

### Category Mapping
- Government employees: 'Govt'
- Top-tier companies (Google, Microsoft, Amazon): 'Super A'
- Major IT companies (TCS, Infosys, Wipro): 'A'
- Mid-tier companies (HCL, Tech Mahindra): 'B'
- Local/Regional companies: 'C'

### Minimum Salary Requirements
- Super A, A, B, Govt categories: ₹25,000 minimum net take-home salary
- Category C: ₹35,000 minimum net take-home salary

### Calculation Methodology
1. Determine the applicant's salary band based on their monthly income
2. Identify the company category
3. Verify minimum salary requirement for the category
4. Apply the corresponding FOIR percentage from the table
5. Calculate FOIR Cap = Monthly Income × FOIR Percentage
6. Calculate Available EMI = FOIR Cap - Existing EMIs
7. Calculate maximum loan amount based on Available EMI, interest rate, and tenure

## Test Results

The implementation has been tested with various scenarios:
1. Government employee with ₹75,000 salary: FOIR 65% → Loan Amount ₹22,98,509
2. Super A category with ₹1,20,000 salary: FOIR 70% → Loan Amount ₹38,87,764
3. Category C with ₹40,000 salary: FOIR 50% → Loan Amount ₹9,45,672
4. Boundary case with ₹50,000 salary: FOIR 55% → Loan Amount ₹12,87,165
5. Minimum salary boundary tests: All categories correctly enforce ₹25,000 minimum

## Special Notes

1. All categories converge to 70% FOIR for salaries above ₹100,000
2. Category C employees receive preferential treatment with a lower FOIR percentage in the lowest salary band
3. Government employees are treated with the same FOIR percentages as Category A employees in most bands
4. Category C has a higher minimum salary requirement of ₹35,000 compared to other categories (₹25,000)