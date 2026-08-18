# 2025 Canadian employment-income estimate: model and sources

## Model definition

This calculator estimates 2025 annual income tax, employee payroll contributions, and disposable cash for a basic employee who was resident and employed in one Canadian province or territory for the full year. It is fixed to tax year 2025.

The supported base case is a single adult age 19 to 64, resident in Canada throughout 2025, with no spouse or dependants, no disability amount, no tuition, donations, medical expenses, pension income, foreign income or tax, alternative minimum tax, split income, bankruptcy, or situation-dependent refundable credits. Employment compensation and an optional amount of other income taxed at ordinary rates are supported. Dividends, capital gains, self-employment, business income, investment-income deductions, and benefits are not.

This is an annual income-tax and normalized employee-contribution estimate. It is not an employer payroll-withholding calculation and does not reproduce pay-period withholding. With multiple jobs, the calculator combines employment income and applies one annual CPP/QPP basic exemption and the annual ceilings. Actual employer deductions can be higher or lower because each employer applies payroll rules separately; excess CPP/QPP contributions may be refunded after assessment, and optional make-up contributions are not modeled.

Quebec has limited support. The calculator implements the Quebec income-tax brackets, basic personal amount, worker deduction, QPP, EI, QPIP, and the 16.5% federal abatement for the supported employment-only base case. It does not model the Quebec prescription drug insurance premium, the health services fund contribution on income other than employment, or situation-dependent Quebec credits. A visible warning is shown for every Quebec result and an additional warning appears if other ordinary income is entered.

## Calculation pipeline

The pure engine in `js/tax-engine-2025.js` uses one calculation path:

1. Gross cash income = employment income + other ordinary taxable income.
2. Employment income = all modeled jobs + bonus + taxable allowance + commission + additional taxable employment compensation.
3. CPP/QPP, EI, and QPIP are calculated only from combined employment income.
4. The deductible enhanced CPP/QPP portions are deducted in calculating net and taxable income.
5. The allowed RRSP deduction is deducted, subject to the user-entered available deduction limit and estimated net income.
6. Quebec taxable income also deducts the supported worker deduction.
7. Federal and provincial/territorial gross tax is calculated by progressive brackets.
8. Supported non-refundable credits, reductions, surtax, premium, and Quebec abatement are applied.
9. Income tax plus payroll contributions = federal tax + provincial/territorial tax + employee CPP/QPP + EI + QPIP.
10. After-tax cash before RRSP = gross cash income − income tax − payroll contributions.
11. Spendable cash after RRSP = after-tax cash before RRSP − the full RRSP contribution.
12. Monthly surplus or deficit = spendable cash / 12 − monthly expenses. Weekly surplus or deficit is the annualized monthly result divided by 52.

Negative spendable cash and deficits are not clamped. Doughnut charts receive only non-negative magnitudes; a deficit or shortfall is labeled as such.

## RRSP behavior

The calculator never infers personal RRSP room from current-year income and does not automatically cap a person at the 2025 annual dollar limit of $32,490. The user must enter the available deduction limit from a Notice of Assessment, Notice of Reassessment, Form T1028, or CRA account.

- If a contribution is entered without an available limit, no RRSP deduction is applied and the full contribution reduces cash.
- If the contribution exceeds the entered limit, the deduction is limited to the entered amount and the full contribution reduces cash.
- If the requested deduction exceeds estimated net income, the deduction is limited to net income and the full contribution reduces cash.
- Overcontribution tax and penalties are not modeled.
- “Estimated income-tax reduction” compares supported federal and provincial/territorial income tax with and without the allowed RRSP deduction. It does not treat the contribution itself as a saving.

## Hourly and vacation-pay behavior

For hourly jobs, “working weeks” means weeks actually worked. The user chooses exactly one vacation-compensation method:

- paid vacation weeks: hourly rate × weekly hours × paid vacation weeks; or
- vacation-pay percentage: regular hourly earnings × entered percentage.

The engine warns if working weeks plus paid vacation weeks exceed 52. Its lower-level function also detects conflicting paid-week and percentage inputs and uses paid weeks only. Annual salary is assumed to already include paid vacation, so vacation inputs are hidden in annual mode.

## Supported credits, reductions, and premiums

For the base case, federal tax includes the income-dependent basic personal amount, the base CPP/QPP contribution credit, EI and QPIP premium credits where applicable, and the Canada employment amount. The enhanced CPP/QPP portions are deductions rather than credits.

Provincial and territorial tax includes each jurisdiction’s 2025 basic personal amount and the applicable base CPP/QPP and EI credits. Yukon also includes its Canada employment amount. The following general reductions and premiums are implemented where they can be determined for the supported single-person base case:

- British Columbia tax reduction
- Manitoba family tax benefit (basic amount only), included in the non-refundable credit base before applying the 10.8% credit rate
- Ontario surtax, basic tax reduction, LIFT credit, and Ontario Health Premium
- New Brunswick low-income tax reduction
- Nova Scotia low-income tax reduction
- Prince Edward Island low-income tax reduction
- Newfoundland and Labrador low-income tax reduction
- Quebec worker deduction and federal abatement

Alberta’s supplemental tax credit formula is implemented. It is zero for the supported credit base, which cannot reach its $60,000 eligible-amount threshold. Refundable benefits and credits that require age, family, property, rent, medical, donation, disability, tuition, or other facts are outside scope.

## Official source table

Only official government sources were used for implemented constants and rules.

| Official source | Implemented rule or constant |
| --- | --- |
| [CRA: 2025 federal and provincial/territorial income tax rates](https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/last-year.html) | Finalized full-year federal 14.5%, 20.5%, 26%, 29%, and 33% rates and thresholds; published 2025 provincial and territorial brackets. Final income-tax package forms below govern where a finalized return form differs. |
| [CRA: 2025 Federal Income Tax and Benefit Return](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5006-r/5006-r-25e.pdf) | RRSP deduction line 20800; enhanced CPP/QPP deduction line 22215; federal brackets; federal non-refundable credits; Canada employment amount; 14.5% credit rate; Quebec abatement placement. |
| [CRA: 2025 Federal Worksheet](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5000-d1/5000-d1-25e.pdf) | Income-dependent federal BPA: $16,129 maximum, $14,538 minimum, $177,882 and $253,414 phase-out thresholds; top-up tax-credit formula. |
| [CRA: line 34990 top-up tax credit](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-34990-top-up-tax-credit.html) | Confirms the 2025 top-up credit preserves a 15% value for qualifying non-refundable credits above the first-bracket threshold; the Federal Worksheet supplies the implemented formula. |
| [CRA: line 31260 Canada employment amount](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-31260-canada-employment-amount.html) | Lesser of 2025 employment income and the $1,471 maximum claim. |
| [CRA: line 22215](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-22215-deduction-for-cpp-qpp-enhanced-contributions-on-employment-income.html) | First and second enhanced CPP/QPP contributions are deductions; 2025 YMPE $71,300 and YAMPE $81,200. |
| [CRA T4032: 2025 CPP and EI parameters](https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables-previous-years/t4032oc-july-2025/t4032oc-july-general-information.html) | CPP $3,500 exemption; 4.95% base plus 1% first enhanced rate; 4% CPP2; $4,034.10 first-ceiling employee maximum; $396 CPP2 maximum; EI $65,700 maximum insurable earnings, 1.64% rate, and $1,077.48 maximum. |
| [CRA: EI premium rates and maximums](https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html) | Quebec employee EI rate 1.31% and maximum $860.67 for 2025. |
| [CRA: line 31200 EI premiums](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-31200-employment-insurance-premiums-through-employment.html) | Annual EI credit and refund treatment: premiums are refunded when total insurable earnings are $2,000 or less; 2025 non-Quebec and Quebec maximum claims. |
| [CRA: line 31205 PPIP premiums](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-31205-provincial-parental-insurance-plan-ppip-premiums-paid.html) | Federal QPIP premium credit, $484.12 maximum, and refund treatment below $2,000 of insurable earnings. |
| [CRA: line 30800 CPP/QPP contributions](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-30800-cpp-qpp-contributions-through-employment.html) | Base/first additional/second contribution structure and Schedule 8 annual treatment. |
| [CRA: line 44800 CPP/QPP overpayment](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-44800-cpp-overpayment.html) | Excess employee CPP/QPP contributions can be refunded; supports the combined annual-liability disclosure for multiple employers. |
| [CRA: RRSP deduction-limit calculation](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/contributing-a-rrsp-prpp/contributions-affect-your-rrsp-prpp-deduction-limit.html) | Prior-year earned income, unused room, PA, PAR and PSPA affect personal room; $32,490 is the 2025 annual dollar limit, not automatic personal room. |
| [CRA: where to find an RRSP deduction limit](https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans/contributing-a-rrsp-prpp/where-you-find-your-rrsp-prpp-deduction-limit.html) | Latest Notice of Assessment/Reassessment, T1028, or CRA account is authoritative for the user’s available limit. |
| [CRA Form BC428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5010-c/5010-c-25e.pdf) | British Columbia brackets, $12,932 BPA, 5.06% credit rate, and tax reduction ($562, $25,020 and $40,807 thresholds, 3.56% phase-out). |
| [CRA Form AB428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5009-c/5009-c-25e.pdf) and [Worksheet AB428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5009-d/5009-d-25e.pdf) | Alberta brackets, $22,323 BPA, 8% credit rate, and supplemental tax-credit threshold/formula. |
| [CRA Form SK428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5008-c/5008-c-25e.pdf) | Saskatchewan brackets, $19,491 BPA, and 10.5% credit rate. |
| [CRA Form MB428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5007-c/5007-c-25e.pdf), [Worksheet MB428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5007-d/5007-d-25e.pdf), and [Schedule MB428-A](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5007-a/5007-a-25e.pdf) | Final return brackets $47,000/$100,000; 10.8% credit rate; BPA $15,780 through $200,000 then linear phase-out to zero at $400,000; $2,065 basic family tax benefit reduced by 9% of net income and added at MB428 line 61470 before the non-refundable credit rate is applied. |
| [CRA Form ON428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5006-c/5006-c-25e.pdf) and [Schedule ON428-A](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5006-a/5006-a-25e.pdf) | Ontario brackets, $12,747 BPA, 5.05% credit rate, surtax thresholds $5,710/$7,307 and rates 20%/36%, $294 basic reduction, Health Premium bands, and single-person LIFT credit ($875 maximum, $32,500 threshold, 5% phase-out). |
| [CRA Form NB428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5004-c/5004-c-25e.pdf) | New Brunswick brackets, $13,396 BPA, 9.4% credit rate, and single-person $802 low-income reduction phased out at 3% above $21,920. |
| [CRA Form NS428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5003-c/5003-c-25e.pdf) | Finalized Nova Scotia thresholds $30,507/$61,015/$95,883/$154,650; $11,744 BPA; 8.79% credit rate; $300 low-income reduction phased out at 5% above $15,000. |
| [CRA Form PE428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5002-c/5002-c-25e.pdf) | Prince Edward Island brackets, $14,650 BPA, 9.5% credit rate, and $350 low-income reduction phased out at 5% above $22,650. |
| [CRA Form NL428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5001-c/5001-c-25e.pdf) | Newfoundland and Labrador brackets, $11,067 BPA, 8.7% credit rate, and $997 low-income reduction phased out at 16% above $23,928. |
| [CRA Form YT428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5011-c/5011-c-25e.pdf) | Yukon brackets, income-dependent BPA matching the federal BPA, 6.4% credit rate, base CPP/EI credits, and Yukon Canada employment amount. |
| [CRA Form NT428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5012-c/5012-c-25e.pdf) | Northwest Territories brackets, $17,842 BPA, and 5.9% credit rate. |
| [CRA Form NU428](https://www.canada.ca/content/dam/cra-arc/formspubs/pbg/5014-c/5014-c-25e.pdf) | Nunavut brackets, $19,274 BPA, and 4% credit rate. |
| [Revenu Québec: income-tax rates](https://www.revenuquebec.ca/en/citizens/your-situation/new-residents/the-quebec-tax-system/income-tax-rates/) | 2025 Quebec rates 14%, 19%, 24%, and 25.75% and thresholds $53,255/$106,495/$129,590. |
| [Revenu Québec: basic personal amount](https://www.revenuquebec.ca/en/citizens/income-tax-return/completing-your-income-tax-return/how-to-complete-your-income-tax-return/line-by-line-help/350-to-398-1-non-refundable-tax-credits/line-350/) | 2025 Quebec BPA $18,571 and its treatment of QPP, EI, and QPIP contributions. |
| [Revenu Québec 2025 return](https://www.revenuquebec.ca/documents/en/formulaires/tp/2025-12/TP-1.D-V%282025-12%29.pdf) and [work charts](https://www.revenuquebec.ca/documents/en/formulaires/tp/2025-12/TP-1.D.GR-V%282025-12%29.pdf) | Quebec employment-income flow, RRSP and enhanced QPP deductions, 6% worker deduction with $1,420 maximum, and provincial tax calculation. |
| [Revenu Québec: 2025 employer changes](https://www.revenuquebec.ca/en/businesses/source-deductions-and-employer-contributions/employers-kit/principal-changes-for-2025-employers-kit/) | QPP employee rate 6.4%, $3,500 exemption, YMPE $71,300, first-ceiling maximum $4,339.20, QPP2 rate 4%, YAMPE $81,200, and $396 QPP2 maximum. |
| [Revenu Québec: QPIP rates and maximum](https://www.revenuquebec.ca/en/businesses/source-deductions-and-employer-contributions/calculating-source-deductions-and-contributions/qpip-premiums/maximum-insurable-earnings-and-premium-rate/) | 2025 QPIP maximum insurable earnings $98,000, employee rate 0.494%, and maximum $484.12. |
| [Revenu Québec: line 97 QPIP premium](https://www.revenuquebec.ca/en/citizens/income-tax-return/completing-your-income-tax-return/how-to-complete-your-income-tax-return/line-by-line-help/96-to-164-total-income/line-97/) | Annual QPIP premiums are refunded when the applicable work income is less than $2,000; at exactly $2,000, the premium remains payable in this base-case model. |
| [CRA T4032-QC](https://www.canada.ca/en/revenue-agency/services/forms-publications/payroll/t4032-payroll-deductions-tables-previous-years/t4032qc-january-2025/t4032qc-january-general-information.html) | Quebec federal tax abatement rate of 16.5%. |

## Intentionally unsupported items

The estimate does not include spouse/dependant, age, disability, caregiver, pension, tuition, student-loan interest, medical, donation, volunteer, political, labour-sponsored fund, foreign tax, dividend, alternative minimum tax, Canada Workers Benefit, or other situation-dependent credits. It also excludes refundable benefits and credits, OAS/EI benefit repayments, workers’ compensation and social-assistance adjustments, security-option deductions, union/professional dues, employment expenses, moving/child-care expenses, FHSA/RPP deductions, northern-resident deductions, and every form requiring facts the calculator does not collect.

The model assumes all entered compensation is cash received. Non-cash taxable benefits require a separate cash-flow treatment and should not be entered. “Other ordinary taxable income” is included in taxable income but not in CPP/QPP, EI, or QPIP; it must not be used for dividends, capital gains, self-employment, or income subject to special provincial rules.
