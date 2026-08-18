(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.CanadaTax2025 = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const FEDERAL_BRACKETS = [
    { upTo: 57375, rate: 0.145 },
    { upTo: 114750, rate: 0.205 },
    { upTo: 177882, rate: 0.26 },
    { upTo: 253414, rate: 0.29 },
    { upTo: Infinity, rate: 0.33 }
  ];

  const PROVINCES = {
    BC: {
      name: 'British Columbia',
      bpa: 12932,
      creditRate: 0.0506,
      brackets: [[49279, 0.0506], [98560, 0.077], [113158, 0.105], [137407, 0.1229], [186306, 0.147], [259829, 0.168], [Infinity, 0.205]]
    },
    AB: {
      name: 'Alberta',
      bpa: 22323,
      creditRate: 0.08,
      brackets: [[60000, 0.08], [151234, 0.10], [181481, 0.12], [241974, 0.13], [362961, 0.14], [Infinity, 0.15]]
    },
    SK: {
      name: 'Saskatchewan',
      bpa: 19491,
      creditRate: 0.105,
      brackets: [[53463, 0.105], [152750, 0.125], [Infinity, 0.145]]
    },
    MB: {
      name: 'Manitoba',
      bpa: manitobaBasicPersonalAmount,
      creditRate: 0.108,
      brackets: [[47000, 0.108], [100000, 0.1275], [Infinity, 0.174]]
    },
    ON: {
      name: 'Ontario',
      bpa: 12747,
      creditRate: 0.0505,
      brackets: [[52886, 0.0505], [105775, 0.0915], [150000, 0.1116], [220000, 0.1216], [Infinity, 0.1316]]
    },
    QC: {
      name: 'Quebec',
      bpa: 18571,
      creditRate: 0.14,
      brackets: [[53255, 0.14], [106495, 0.19], [129590, 0.24], [Infinity, 0.2575]],
      support: 'limited'
    },
    NB: {
      name: 'New Brunswick',
      bpa: 13396,
      creditRate: 0.094,
      brackets: [[51306, 0.094], [102614, 0.14], [190060, 0.16], [Infinity, 0.195]]
    },
    NS: {
      name: 'Nova Scotia',
      bpa: 11744,
      creditRate: 0.0879,
      brackets: [[30507, 0.0879], [61015, 0.1495], [95883, 0.1667], [154650, 0.175], [Infinity, 0.21]]
    },
    PE: {
      name: 'Prince Edward Island',
      bpa: 14650,
      creditRate: 0.095,
      brackets: [[33328, 0.095], [64656, 0.1347], [105000, 0.166], [140000, 0.1762], [Infinity, 0.19]]
    },
    NL: {
      name: 'Newfoundland and Labrador',
      bpa: 11067,
      creditRate: 0.087,
      brackets: [[44192, 0.087], [88382, 0.145], [157792, 0.158], [220910, 0.178], [282214, 0.198], [564429, 0.208], [1128858, 0.213], [Infinity, 0.218]]
    },
    YT: {
      name: 'Yukon',
      bpa: federalBasicPersonalAmount,
      creditRate: 0.064,
      includesEmploymentAmount: true,
      brackets: [[57375, 0.064], [114750, 0.09], [177882, 0.109], [500000, 0.128], [Infinity, 0.15]]
    },
    NT: {
      name: 'Northwest Territories',
      bpa: 17842,
      creditRate: 0.059,
      brackets: [[51964, 0.059], [103930, 0.086], [168967, 0.122], [Infinity, 0.1405]]
    },
    NU: {
      name: 'Nunavut',
      bpa: 19274,
      creditRate: 0.04,
      brackets: [[54707, 0.04], [109413, 0.07], [177881, 0.09], [Infinity, 0.115]]
    }
  };

  Object.keys(PROVINCES).forEach(function (code) {
    PROVINCES[code].brackets = PROVINCES[code].brackets.map(function (bracket) {
      return { upTo: bracket[0], rate: bracket[1] };
    });
  });

  const CONTRIBUTION_LIMITS = Object.freeze({
    cpp: { basicExemption: 3500, ympe: 71300, yampe: 81200, baseRate: 0.0495, enhancedRate: 0.01, secondRate: 0.04, baseMaximum: 3356.10, enhancedMaximum: 678, secondMaximum: 396 },
    qpp: { basicExemption: 3500, ympe: 71300, yampe: 81200, baseRate: 0.054, enhancedRate: 0.01, secondRate: 0.04, baseMaximum: 3661.20, enhancedMaximum: 678, secondMaximum: 396 },
    ei: { maximumEarnings: 65700, rate: 0.0164, maximum: 1077.48, quebecRate: 0.0131, quebecMaximum: 860.67 },
    qpip: { maximumEarnings: 98000, rate: 0.00494, maximum: 484.12, refundThreshold: 2000 }
  });

  function finiteNonNegative(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  }

  function roundMoney(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  function taxByBrackets(income, brackets) {
    const taxable = finiteNonNegative(income);
    let tax = 0;
    let lower = 0;
    for (let i = 0; i < brackets.length; i += 1) {
      const upper = Math.min(taxable, brackets[i].upTo);
      if (upper > lower) tax += (upper - lower) * brackets[i].rate;
      if (taxable <= brackets[i].upTo) break;
      lower = brackets[i].upTo;
    }
    return tax;
  }

  function federalBasicPersonalAmount(netIncome) {
    const income = finiteNonNegative(netIncome);
    if (income <= 177882) return 16129;
    if (income >= 253414) return 14538;
    return 14538 + Math.max(0, 1591 - ((income - 177882) / 75532) * 1591);
  }

  function manitobaBasicPersonalAmount(netIncome) {
    const income = finiteNonNegative(netIncome);
    if (income <= 200000) return 15780;
    if (income >= 400000) return 0;
    return 15780 - ((income - 200000) / 200000) * 15780;
  }

  function calculateEmploymentIncome(job) {
    const data = job || {};
    const warnings = [];
    const mode = data.mode === 'annual' ? 'annual' : 'hourly';
    let regularPay = 0;
    let vacationPay = 0;

    if (mode === 'annual') {
      regularPay = finiteNonNegative(data.annualSalary);
    } else {
      const rate = finiteNonNegative(data.hourlyRate);
      const hours = finiteNonNegative(data.hoursPerWeek);
      const workingWeeks = finiteNonNegative(data.workingWeeks);
      const paidVacationWeeks = finiteNonNegative(data.paidVacationWeeks);
      const vacationPayPercent = finiteNonNegative(data.vacationPayPercent);
      regularPay = rate * hours * workingWeeks;

      if (workingWeeks + paidVacationWeeks > 52) {
        warnings.push({ code: 'WEEKS_OVER_52', message: 'Working weeks plus paid vacation weeks exceed 52.' });
      }
      if (paidVacationWeeks > 0 && vacationPayPercent > 0) {
        warnings.push({ code: 'VACATION_METHOD_CONFLICT', message: 'Paid vacation weeks and vacation-pay percentage were both entered; paid weeks were used and the percentage was ignored.' });
      }
      vacationPay = paidVacationWeeks > 0
        ? rate * hours * paidVacationWeeks
        : regularPay * (vacationPayPercent / 100);
    }

    const supplementalPay = finiteNonNegative(data.bonus) + finiteNonNegative(data.allowance) + finiteNonNegative(data.commission);
    return {
      income: regularPay + vacationPay + supplementalPay,
      regularPay: regularPay,
      vacationPay: vacationPay,
      supplementalPay: supplementalPay,
      warnings: warnings
    };
  }

  function calculatePayrollContributions(employmentIncome, provinceCode) {
    const income = finiteNonNegative(employmentIncome);
    const isQuebec = provinceCode === 'QC';
    const pension = isQuebec ? CONTRIBUTION_LIMITS.qpp : CONTRIBUTION_LIMITS.cpp;
    const firstBand = Math.min(Math.max(0, income - pension.basicExemption), pension.ympe - pension.basicExemption);
    const secondBand = Math.min(Math.max(0, income - pension.ympe), pension.yampe - pension.ympe);
    const base = Math.min(firstBand * pension.baseRate, pension.baseMaximum);
    const firstEnhanced = Math.min(firstBand * pension.enhancedRate, pension.enhancedMaximum);
    const secondEnhanced = Math.min(secondBand * pension.secondRate, pension.secondMaximum);
    const cppOrQpp = base + firstEnhanced + secondEnhanced;

    const eiRate = isQuebec ? CONTRIBUTION_LIMITS.ei.quebecRate : CONTRIBUTION_LIMITS.ei.rate;
    const eiMaximum = isQuebec ? CONTRIBUTION_LIMITS.ei.quebecMaximum : CONTRIBUTION_LIMITS.ei.maximum;
    const ei = Math.min(income, CONTRIBUTION_LIMITS.ei.maximumEarnings) * eiRate;
    // Annual final-liability treatment: premiums are refunded when total
    // insurable earnings are $2,000 or less (CRA line 31200/45000).
    const cappedEi = income <= 2000 ? 0 : Math.min(ei, eiMaximum);
    const qpip = isQuebec && income >= CONTRIBUTION_LIMITS.qpip.refundThreshold
      ? Math.min(income, CONTRIBUTION_LIMITS.qpip.maximumEarnings) * CONTRIBUTION_LIMITS.qpip.rate
      : 0;
    const cappedQpip = Math.min(qpip, CONTRIBUTION_LIMITS.qpip.maximum);

    return {
      plan: isQuebec ? 'QPP' : 'CPP',
      basePension: base,
      firstEnhancedPension: firstEnhanced,
      secondEnhancedPension: secondEnhanced,
      enhancedPensionDeduction: firstEnhanced + secondEnhanced,
      cppOrQpp: cppOrQpp,
      ei: cappedEi,
      qpip: cappedQpip,
      total: cppOrQpp + cappedEi + cappedQpip
    };
  }

  function ontarioHealthPremium(taxableIncome) {
    const income = finiteNonNegative(taxableIncome);
    if (income <= 20000) return 0;
    if (income <= 25000) return (income - 20000) * 0.06;
    if (income <= 36000) return 300;
    if (income <= 38500) return 300 + (income - 36000) * 0.06;
    if (income <= 48000) return 450;
    if (income <= 48600) return 450 + (income - 48000) * 0.25;
    if (income <= 72000) return 600;
    if (income <= 72600) return 600 + (income - 72000) * 0.25;
    if (income <= 200000) return 750;
    if (income <= 200600) return 750 + (income - 200000) * 0.25;
    return 900;
  }

  function provincialLowIncomeReduction(code, netIncome) {
    const income = finiteNonNegative(netIncome);
    if (code === 'BC' && income < 40807) return Math.max(0, 562 - Math.max(0, income - 25020) * 0.0356);
    if (code === 'NB') return Math.max(0, 802 - Math.max(0, income - 21920) * 0.03);
    if (code === 'NS') return Math.max(0, 300 - Math.max(0, income - 15000) * 0.05);
    if (code === 'PE') return Math.max(0, 350 - Math.max(0, income - 22650) * 0.05);
    if (code === 'NL') return Math.max(0, 997 - Math.max(0, income - 23928) * 0.16);
    return 0;
  }

  function manitobaFamilyTaxBenefit(netIncome) {
    return Math.max(0, 2065 - finiteNonNegative(netIncome) * 0.09);
  }

  function calculateFederalTax(details) {
    const taxableIncome = finiteNonNegative(details.taxableIncome);
    const netIncome = finiteNonNegative(details.netIncome);
    const employmentIncome = finiteNonNegative(details.employmentIncome);
    const payroll = details.payroll;
    const basicPersonalAmount = federalBasicPersonalAmount(netIncome);
    const employmentAmount = Math.min(1471, employmentIncome);
    const creditBase = basicPersonalAmount + payroll.basePension + payroll.ei + payroll.qpip + employmentAmount;
    const nonRefundableCredits = creditBase * 0.145;
    const topUpTaxCredit = Math.max(0, (nonRefundableCredits - 8319.38) * 0.0345);
    const grossTax = taxByBrackets(taxableIncome, FEDERAL_BRACKETS);
    const basicFederalTax = Math.max(0, grossTax - nonRefundableCredits - topUpTaxCredit);
    const quebecAbatement = details.provinceCode === 'QC' ? basicFederalTax * 0.165 : 0;
    return {
      grossTax: grossTax,
      basicPersonalAmount: basicPersonalAmount,
      employmentAmount: employmentAmount,
      creditBase: creditBase,
      nonRefundableCredits: nonRefundableCredits,
      topUpTaxCredit: topUpTaxCredit,
      basicFederalTax: basicFederalTax,
      quebecAbatement: quebecAbatement,
      tax: Math.max(0, basicFederalTax - quebecAbatement)
    };
  }

  function calculateProvincialTax(details) {
    const code = details.provinceCode;
    const province = PROVINCES[code];
    if (!province) throw new RangeError('Unsupported province or territory code: ' + code);
    const netIncome = finiteNonNegative(details.netIncome);
    const taxableIncome = finiteNonNegative(details.taxableIncome);
    const employmentIncome = finiteNonNegative(details.employmentIncome);
    const payroll = details.payroll;
    const basicPersonalAmount = typeof province.bpa === 'function' ? province.bpa(netIncome) : province.bpa;
    const employmentAmount = province.includesEmploymentAmount ? Math.min(1471, employmentIncome) : 0;
    const familyTaxBenefit = code === 'MB' ? manitobaFamilyTaxBenefit(netIncome) : 0;
    const creditBase = code === 'QC'
      ? basicPersonalAmount
      : basicPersonalAmount + payroll.basePension + payroll.ei + employmentAmount + familyTaxBenefit;
    const nonRefundableCredits = creditBase * province.creditRate;
    const grossTax = taxByBrackets(taxableIncome, province.brackets);
    const baseTax = Math.max(0, grossTax - nonRefundableCredits);
    let surtax = 0;
    let taxReduction = 0;
    let liftCredit = 0;
    let healthPremium = 0;
    let supplementalTaxCredit = 0;
    let tax = baseTax;

    if (code === 'ON') {
      surtax = Math.max(0, baseTax - 5710) * 0.20 + Math.max(0, baseTax - 7307) * 0.36;
      const taxWithSurtax = baseTax + surtax;
      taxReduction = Math.max(0, 588 - taxWithSurtax);
      tax = Math.max(0, taxWithSurtax - taxReduction);
      liftCredit = Math.max(0, Math.min(875, employmentIncome * 0.0505) - Math.max(0, netIncome - 32500) * 0.05);
      tax = Math.max(0, tax - liftCredit);
      healthPremium = ontarioHealthPremium(taxableIncome);
      tax += healthPremium;
    } else {
      taxReduction = provincialLowIncomeReduction(code, netIncome);
      tax = Math.max(0, baseTax - taxReduction);
      if (code === 'AB') {
        // Worksheet AB428 line 61545: 25% of the amount by which the
        // supported line-58800 credits, valued at 8%, exceed $4,800.
        supplementalTaxCredit = Math.max(0, creditBase * 0.08 - 4800) * 0.25;
        tax = Math.max(0, tax - supplementalTaxCredit);
      }
    }

    return {
      grossTax: grossTax,
      basicPersonalAmount: basicPersonalAmount,
      employmentAmount: employmentAmount,
      familyTaxBenefit: familyTaxBenefit,
      creditBase: creditBase,
      nonRefundableCredits: nonRefundableCredits,
      baseTax: baseTax,
      surtax: surtax,
      taxReduction: taxReduction,
      liftCredit: liftCredit,
      healthPremium: healthPremium,
      supplementalTaxCredit: supplementalTaxCredit,
      tax: tax
    };
  }

  function calculateIncomeTaxes(input) {
    const provinceCode = input.provinceCode;
    const payroll = input.payroll || calculatePayrollContributions(input.employmentIncome, provinceCode);
    const grossCashIncome = finiteNonNegative(input.employmentIncome) + finiteNonNegative(input.otherOrdinaryIncome);
    const rrspDeduction = finiteNonNegative(input.rrspDeduction);
    const federalNetIncome = Math.max(0, grossCashIncome - rrspDeduction - payroll.enhancedPensionDeduction);
    const quebecWorkerDeduction = provinceCode === 'QC' ? Math.min(1420, finiteNonNegative(input.employmentIncome) * 0.06) : 0;
    const provincialNetIncome = Math.max(0, federalNetIncome - quebecWorkerDeduction);
    const federalTaxableIncome = federalNetIncome;
    const provincialTaxableIncome = provincialNetIncome;
    const federal = calculateFederalTax({
      taxableIncome: federalTaxableIncome,
      netIncome: federalNetIncome,
      employmentIncome: input.employmentIncome,
      payroll: payroll,
      provinceCode: provinceCode
    });
    const provincial = calculateProvincialTax({
      taxableIncome: provincialTaxableIncome,
      netIncome: provincialNetIncome,
      employmentIncome: input.employmentIncome,
      payroll: payroll,
      provinceCode: provinceCode
    });
    return {
      federalNetIncome: federalNetIncome,
      federalTaxableIncome: federalTaxableIncome,
      provincialNetIncome: provincialNetIncome,
      provincialTaxableIncome: provincialTaxableIncome,
      quebecWorkerDeduction: quebecWorkerDeduction,
      federal: federal,
      provincial: provincial,
      total: federal.tax + provincial.tax
    };
  }

  function calculateEstimate(input) {
    const data = input || {};
    const provinceCode = data.provinceCode || 'ON';
    if (!PROVINCES[provinceCode]) throw new RangeError('Unsupported province or territory code: ' + provinceCode);
    const warnings = [];
    let employmentIncome = 0;

    if (Array.isArray(data.jobs)) {
      data.jobs.forEach(function (job, jobIndex) {
        const result = calculateEmploymentIncome(job);
        employmentIncome += result.income;
        result.warnings.forEach(function (warning) {
          warnings.push(Object.assign({}, warning, { jobIndex: jobIndex }));
        });
      });
    } else {
      employmentIncome = finiteNonNegative(data.employmentIncome);
    }
    employmentIncome += finiteNonNegative(data.additionalEmploymentIncome);

    const otherOrdinaryIncome = finiteNonNegative(data.otherOrdinaryIncome);
    const grossCashIncome = employmentIncome + otherOrdinaryIncome;
    const payroll = calculatePayrollContributions(employmentIncome, provinceCode);
    const rrspContribution = finiteNonNegative(data.rrspContribution);
    const hasAvailableLimit = data.availableRrspDeductionLimit !== '' && data.availableRrspDeductionLimit !== null && data.availableRrspDeductionLimit !== undefined;
    const availableRrspDeductionLimit = hasAvailableLimit ? finiteNonNegative(data.availableRrspDeductionLimit) : 0;
    let rrspDeduction = 0;

    if (rrspContribution > 0 && !hasAvailableLimit) {
      warnings.push({ code: 'RRSP_LIMIT_REQUIRED', message: 'No RRSP deduction was applied because an available deduction limit was not entered.' });
    } else if (rrspContribution > 0) {
      rrspDeduction = Math.min(rrspContribution, availableRrspDeductionLimit);
      if (rrspContribution > availableRrspDeductionLimit) {
        warnings.push({ code: 'RRSP_LIMIT_EXCEEDED', message: 'The contribution exceeds the entered available RRSP deduction limit; only the available limit was deducted, while the full contribution reduces spendable cash.' });
      }
    }

    const netIncomeBeforeRrsp = Math.max(0, grossCashIncome - payroll.enhancedPensionDeduction);
    if (rrspDeduction > netIncomeBeforeRrsp) {
      rrspDeduction = netIncomeBeforeRrsp;
      warnings.push({ code: 'RRSP_NET_INCOME_LIMIT', message: 'The RRSP deduction was limited to estimated net income; the full contribution still reduces spendable cash.' });
    }
    if (provinceCode === 'QC') {
      warnings.push({ code: 'QUEBEC_LIMITED_SUPPORT', message: 'Quebec support covers basic employment income, the worker deduction, QPP, EI, QPIP, provincial tax and the federal abatement. The Quebec prescription drug insurance premium and situation-dependent credits are not modeled.' });
      if (otherOrdinaryIncome > 0) warnings.push({ code: 'QUEBEC_OTHER_INCOME_LIMITATION', message: 'Quebec income other than employment may trigger additional rules, including the health services fund contribution, that are outside this estimate.' });
    }

    const taxes = calculateIncomeTaxes({
      provinceCode: provinceCode,
      employmentIncome: employmentIncome,
      otherOrdinaryIncome: otherOrdinaryIncome,
      rrspDeduction: rrspDeduction,
      payroll: payroll
    });
    const taxesWithoutRrsp = rrspDeduction > 0
      ? calculateIncomeTaxes({ provinceCode: provinceCode, employmentIncome: employmentIncome, otherOrdinaryIncome: otherOrdinaryIncome, rrspDeduction: 0, payroll: payroll })
      : taxes;
    const rrspIncomeTaxReduction = Math.max(0, taxesWithoutRrsp.total - taxes.total);
    const incomeTaxPlusPayrollContributions = taxes.total + payroll.total;
    const afterTaxCashBeforeRrsp = grossCashIncome - incomeTaxPlusPayrollContributions;
    const spendableCashAfterRrsp = afterTaxCashBeforeRrsp - rrspContribution;

    let monthlyExpenses = 0;
    if (data.monthlyExpenses && typeof data.monthlyExpenses === 'object') {
      Object.keys(data.monthlyExpenses).forEach(function (key) { monthlyExpenses += finiteNonNegative(data.monthlyExpenses[key]); });
    } else {
      monthlyExpenses = finiteNonNegative(data.monthlyExpenses);
    }
    const monthlySpendableCash = spendableCashAfterRrsp / 12;
    const monthlySurplus = monthlySpendableCash - monthlyExpenses;
    const weeklySurplus = monthlySurplus * 12 / 52;

    return {
      taxYear: 2025,
      provinceCode: provinceCode,
      provinceName: PROVINCES[provinceCode].name,
      support: PROVINCES[provinceCode].support || 'supported',
      grossCashIncome: roundMoney(grossCashIncome),
      employmentIncome: roundMoney(employmentIncome),
      otherOrdinaryIncome: roundMoney(otherOrdinaryIncome),
      rrspContribution: roundMoney(rrspContribution),
      availableRrspDeductionLimit: roundMoney(availableRrspDeductionLimit),
      rrspDeduction: roundMoney(rrspDeduction),
      rrspIncomeTaxReduction: roundMoney(rrspIncomeTaxReduction),
      taxableIncome: roundMoney(taxes.federalTaxableIncome),
      federalNetIncome: roundMoney(taxes.federalNetIncome),
      provincialTaxableIncome: roundMoney(taxes.provincialTaxableIncome),
      quebecWorkerDeduction: roundMoney(taxes.quebecWorkerDeduction),
      federalIncomeTax: roundMoney(taxes.federal.tax),
      provincialIncomeTax: roundMoney(taxes.provincial.tax),
      ontarioSurtax: roundMoney(taxes.provincial.surtax),
      ontarioHealthPremium: roundMoney(taxes.provincial.healthPremium),
      federalQuebecAbatement: roundMoney(taxes.federal.quebecAbatement),
      cppOrQpp: roundMoney(payroll.cppOrQpp),
      pensionPlan: payroll.plan,
      employeeEi: roundMoney(payroll.ei),
      employeeQpip: roundMoney(payroll.qpip),
      payrollContributions: roundMoney(payroll.total),
      incomeTax: roundMoney(taxes.total),
      incomeTaxPlusPayrollContributions: roundMoney(incomeTaxPlusPayrollContributions),
      afterTaxCashBeforeRrsp: roundMoney(afterTaxCashBeforeRrsp),
      spendableCashAfterRrsp: roundMoney(spendableCashAfterRrsp),
      monthlySpendableCash: roundMoney(monthlySpendableCash),
      monthlyExpenses: roundMoney(monthlyExpenses),
      monthlySurplus: roundMoney(monthlySurplus),
      weeklySurplus: roundMoney(weeklySurplus),
      federalDetails: taxes.federal,
      provincialDetails: taxes.provincial,
      payrollDetails: payroll,
      warnings: warnings
    };
  }

  return Object.freeze({
    TAX_YEAR: 2025,
    FEDERAL_BRACKETS: FEDERAL_BRACKETS,
    PROVINCES: PROVINCES,
    CONTRIBUTION_LIMITS: CONTRIBUTION_LIMITS,
    taxByBrackets: taxByBrackets,
    federalBasicPersonalAmount: federalBasicPersonalAmount,
    manitobaBasicPersonalAmount: manitobaBasicPersonalAmount,
    manitobaFamilyTaxBenefit: manitobaFamilyTaxBenefit,
    calculateEmploymentIncome: calculateEmploymentIncome,
    calculatePayrollContributions: calculatePayrollContributions,
    ontarioHealthPremium: ontarioHealthPremium,
    calculateIncomeTaxes: calculateIncomeTaxes,
    calculateEstimate: calculateEstimate
  });
});
