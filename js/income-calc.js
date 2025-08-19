/* js/income-calc.js
   Canada Income & Tax Planner (2025)
   - 实时收入/税收/支出计算
   - 图表：Chart.js 甜甜圈 + 百分比标签/中心文本
*/
(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const fmt = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
  const fmt2 = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 });

  const TAX_2025 = {
    federal: [
      { upTo: 57375, rate: 0.145 },
      { upTo: 114750, rate: 0.205 },
      { upTo: 177882, rate: 0.26 },
      { upTo: 253414, rate: 0.29 },
      { upTo: Infinity, rate: 0.33 }
    ],
    provinces: {
      "British Columbia": [
        { upTo: 49279, rate: 0.0506 },
        { upTo: 98560, rate: 0.0770 },
        { upTo: 113158, rate: 0.1050 },
        { upTo: 137407, rate: 0.1229 },
        { upTo: 186306, rate: 0.1470 },
        { upTo: 259829, rate: 0.1680 },
        { upTo: Infinity, rate: 0.2050 },
      ],
      "Alberta": [
        { upTo: 60000, rate: 0.08 },
        { upTo: 151234, rate: 0.10 },
        { upTo: 181481, rate: 0.12 },
        { upTo: 241974, rate: 0.13 },
        { upTo: 362961, rate: 0.14 },
        { upTo: Infinity, rate: 0.15 },
      ],
      "Saskatchewan": [
        { upTo: 53463, rate: 0.105 },
        { upTo: 152750, rate: 0.125 },
        { upTo: Infinity, rate: 0.145 },
      ],
      "Manitoba": [
        { upTo: 47000, rate: 0.108 },
        { upTo: 100000, rate: 0.1275 },
        { upTo: Infinity, rate: 0.174 },
      ],
      "Ontario": [
        { upTo: 52886, rate: 0.0505 },
        { upTo: 105775, rate: 0.0915 },
        { upTo: 150000, rate: 0.1116 },
        { upTo: 220000, rate: 0.1216 },
        { upTo: Infinity, rate: 0.1316 },
      ],
      "Quebec": [
        { upTo: 53255, rate: 0.14 },
        { upTo: 106495, rate: 0.19 },
        { upTo: 129590, rate: 0.24 },
        { upTo: Infinity, rate: 0.2575 },
      ],
      "New Brunswick": [
        { upTo: 51306, rate: 0.094 },
        { upTo: 102614, rate: 0.14 },
        { upTo: 190060, rate: 0.16 },
        { upTo: Infinity, rate: 0.195 },
      ],
      "Nova Scotia": [
        { upTo: 29590, rate: 0.0879 },
        { upTo: 59180, rate: 0.1495 },
        { upTo: 93000, rate: 0.1667 },
        { upTo: 150000, rate: 0.175 },
        { upTo: Infinity, rate: 0.21 },
      ],
      "Prince Edward Island": [
        { upTo: 33328, rate: 0.095 },
        { upTo: 64656, rate: 0.1347 },
        { upTo: 105000, rate: 0.166 },
        { upTo: 140000, rate: 0.1762 },
        { upTo: Infinity, rate: 0.19 },
      ],
      "Newfoundland and Labrador": [
        { upTo: 44192, rate: 0.087 },
        { upTo: 88382, rate: 0.145 },
        { upTo: 157792, rate: 0.158 },
        { upTo: 220910, rate: 0.178 },
        { upTo: 282214, rate: 0.198 },
        { upTo: 564429, rate: 0.208 },
        { upTo: 1128858, rate: 0.213 },
        { upTo: Infinity, rate: 0.218 },
      ],
      "Yukon": [
        { upTo: 57375, rate: 0.064 },
        { upTo: 114750, rate: 0.09 },
        { upTo: 177882, rate: 0.109 },
        { upTo: 500000, rate: 0.128 },
        { upTo: Infinity, rate: 0.15 },
      ],
      "Northwest Territories": [
        { upTo: 51964, rate: 0.059 },
        { upTo: 103930, rate: 0.086 },
        { upTo: 168967, rate: 0.122 },
        { upTo: Infinity, rate: 0.1405 },
      ],
      "Nunavut": [
        { upTo: 54707, rate: 0.04 },
        { upTo: 109413, rate: 0.07 },
        { upTo: 177881, rate: 0.09 },
        { upTo: Infinity, rate: 0.115 },
      ]
    },
    onSurtax: { t1: 5710, r1: 0.20, t2: 7307, r2: 0.36 },
    qcFedAbatement: 0.165
  };
  // ===== 基本个人免税额（BPA）2025 —— 只用于修正低收入时不应缴纳联邦/省税 =====
  // 这里给出一个保守的默认值：联邦按 ~15.7k，加拿大多数省份 ≥10k。
  // 目标：确保在年收入很低（例如 $2,000）时显示为 0 联邦税与 0 省税。
  // 注意：这些数值可按需要进一步精修；本改动不调整 UI，仅修正计算逻辑。
  const BPA_2025 = {
    federal: 15705,
    // 如需更精确，可把各省数字补齐；此处仅为保守默认，足以避免低收入误算。
    provinces: {
      "Ontario": 11865
    },
    defaultProvince: 12000
  };
  function _getProvinceBPA(province){
    return (BPA_2025.provinces && BPA_2025.provinces[province]) || BPA_2025.defaultProvince;
  }


  // ===== 2025 CPP/QPP/EI & RRSP 限额（参考 CRA / Retraite Québec 公告） =====
  const CPP_2025 = {
    ympe: 71300, // Year's Maximum Pensionable Earnings
    yampe: 81200, // Second ceiling
    ybe: 3500,    // Year's Basic Exemption
    rateEmp: 0.0595,       // Employee rate (CPP1)
    rateSE: 0.119,         // Self-employed (both shares)
    maxEmp: 4034.10,       // Maximum employee CPP1
    cpp2RateEmp: 0.04,     // CPP2 employee
    cpp2RateSE: 0.08,      // CPP2 self-employed
    maxCPP2Emp: 396.00     // Maximum employee CPP2
  };
  const QPP_2025 = {
    mpe: 71300,
    yampe: 81200,
    ybe: 3500,
    baseRateEmp: 0.054,  // 5.4%
    addRateEmp: 0.01,    // +1% additional (合计 6.4%)
    baseRateSE: 0.108,   // 10.8%
    addRateSE: 0.02,     // +2% (合计 12.8%)
    add2RateEmp: 0.04,   // 4% on [MPE, YAMPE]
    add2RateSE: 0.08     // 8% self-employed
  };
  const EI_2025 = {
    mie: 65700,                // Maximum Insurable Earnings
    rate: { default: 0.0164, quebec: 0.0131 }, // employee
    maxEmp: { default: 1077.48, quebec: 860.67 }
  };
  const RRSP_2025 = {
    dollarLimit: 32490,  // 2025 RRSP dollar limit
    earnedPct: 0.18
  };


  function calcTaxByBrackets(income, brackets) {
    let tax = 0, lastCap = 0;
    for (const b of brackets) {
      const cap = Math.min(income, b.upTo);
      if (cap > lastCap) {
        tax += (cap - lastCap) * b.rate;
        lastCap = cap;
      }
      if (income <= b.upTo) break;
    }
    return Math.max(0, tax);
  }

  
  function computeTaxes(annualIncome, province) {
    // annualIncome 此处为“应税收入”（已考虑 RRSP 抵扣）。
    if (!annualIncome || annualIncome <= 0) {
      return { federal: 0, provincial: 0, total: 0, after: 0, avgRate: 0 };
    }
    // —— 联邦：先按税阶算出“基本税”，再减去基本个人免税额（按最低档税率乘以 BPA）。
    const fedRaw = calcTaxByBrackets(annualIncome, TAX_2025.federal);
    const fedCredit = (TAX_2025.federal[0]?.rate || 0) * (BPA_2025.federal || 0);
    const fedAfterCredit = Math.max(0, fedRaw - fedCredit);
    // 魁省联邦退税：对“抵免后”的联邦税再做 16.5% 抵扣。
    const fed = (province === 'Quebec') ? (fedAfterCredit * (1 - TAX_2025.qcFedAbatement)) : fedAfterCredit;

    // —— 省税：先按税阶算“基本省税”，再减去省 BPA（按该省最低档税率）。
    const provBr = TAX_2025.provinces[province] || [];
    const provRaw = calcTaxByBrackets(annualIncome, provBr);
    const provCredit = (provBr[0]?.rate || 0) * _getProvinceBPA(province);
    const provBase = Math.max(0, provRaw - provCredit);

    // 安省附加税基于“省基本税（抵免后）”计算。
    let prov = provBase;
    if (province === 'Ontario') {
      const { t1, r1, t2, r2 } = TAX_2025.onSurtax;
      if (provBase > t1) prov += (provBase - t1) * r1;
      if (provBase > t2) prov += (provBase - t2) * r2;
    }

    const total = fed + prov;
    const after = Math.max(0, annualIncome - total);
    const avgRate = total / annualIncome;
    return { federal: fed, provincial: prov, total, after, avgRate };
  }

  // ===== 税阶分段可视化（横向堆叠条） =====
  
  function taxAtIncome(income, province, wantBeforeSurtax=false) {
    // 返回 {fedRaw, fedAdj, provBeforeSurtax, provTotal}
    // fedAdj 已考虑联邦 BPA 抵免与（如魁省）联邦退税；provTotal 已考虑省 BPA 与（如安省）附加税。
    const fedRaw = calcTaxByBrackets(income, TAX_2025.federal);
    const fedCredit = (TAX_2025.federal[0]?.rate || 0) * (BPA_2025.federal || 0);
    const fedAfterCredit = Math.max(0, fedRaw - fedCredit);
    const fedAdj = (province === 'Quebec') ? (fedAfterCredit * (1 - TAX_2025.qcFedAbatement)) : fedAfterCredit;

    const provBr = TAX_2025.provinces[province] || [];
    const provBefore = calcTaxByBrackets(income, provBr);
    const provCredit = (provBr[0]?.rate || 0) * _getProvinceBPA(province);
    const provBase = Math.max(0, provBefore - provCredit);
    let provTotal = provBase;
    if (province === 'Ontario') {
      const { t1, r1, t2, r2 } = TAX_2025.onSurtax;
      if (provBase > t1) provTotal += (provBase - t1) * r1;
      if (provBase > t2) provTotal += (provBase - t2) * r2;
    }
    return { fedRaw, fedAdj, provBeforeSurtax: provBefore, provTotal };
  }

  
  function computeBracketSegments(annualIncome, province) {
    const provBr = TAX_2025.provinces[province] || [];
    const breakpoints = new Set([0]);
    TAX_2025.federal.forEach(b => breakpoints.add(Math.min(b.upTo, annualIncome)));
    provBr.forEach(b => breakpoints.add(Math.min(b.upTo, annualIncome)));
    breakpoints.add(annualIncome);
    const pts = Array.from(breakpoints).filter(x => !isNaN(x)).sort((a,b)=>a-b);

    // —— 计算总额：联邦/省基本税、BPA 抵免、魁省联邦退税、安省附加税 ——
    const fedRawTotal = calcTaxByBrackets(annualIncome, TAX_2025.federal);
    const fedCreditTotalCap = (TAX_2025.federal[0]?.rate || 0) * (BPA_2025.federal || 0);
    const fedCreditTotal = Math.min(fedRawTotal, fedCreditTotalCap);
    const fedAfterCreditTotal = Math.max(0, fedRawTotal - fedCreditTotal);
    const fedAbateTotal = (province === 'Quebec') ? (fedAfterCreditTotal * TAX_2025.qcFedAbatement) : 0;
    const fedNetTotal = Math.max(0, fedAfterCreditTotal - fedAbateTotal);

    const provBeforeTotal = calcTaxByBrackets(annualIncome, provBr);
    const provCreditCap = (provBr[0]?.rate || 0) * _getProvinceBPA(province);
    const provCreditTotal = Math.min(provBeforeTotal, provCreditCap);
    const provBaseTotal = Math.max(0, provBeforeTotal - provCreditTotal);
    let provSurtaxTotal = 0;
    if (province === 'Ontario') {
      const { t1, r1, t2, r2 } = TAX_2025.onSurtax;
      if (provBaseTotal > t1) provSurtaxTotal += (provBaseTotal - t1) * r1;
      if (provBaseTotal > t2) provSurtaxTotal += (provBaseTotal - t2) * r2;
    }
    const provNetTotal = provBaseTotal + provSurtaxTotal;

    const segments = [];
    for (let i=0;i<pts.length-1;i++) {
      const a = pts[i], b = pts[i+1];
      if (b <= a) continue;
      const w = Math.min(b, annualIncome) - a;

      // 差分法：先取“基本税”的段额，再按总额占比分摊抵免/退税/附加税。
      const fedRawA = calcTaxByBrackets(a, TAX_2025.federal);
      const fedRawB = calcTaxByBrackets(b, TAX_2025.federal);
      const fedRawSeg = fedRawB - fedRawA;

      const provBeforeA = calcTaxByBrackets(a, provBr);
      const provBeforeB = calcTaxByBrackets(b, provBr);
      const provBeforeSeg = provBeforeB - provBeforeA;

      const fedCreditSeg = (fedRawTotal > 0) ? (fedCreditTotal * (fedRawSeg / fedRawTotal)) : 0;
      const fedAfterCreditSeg = Math.max(0, fedRawSeg - fedCreditSeg);
      const fedAbateSeg = (fedAfterCreditTotal > 0 && province === 'Quebec')
        ? (fedAbateTotal * (fedAfterCreditSeg / fedAfterCreditTotal))
        : 0;
      const fedSeg = Math.max(0, fedAfterCreditSeg - fedAbateSeg);

      const provCreditSeg = (provBeforeTotal > 0) ? (provCreditTotal * (provBeforeSeg / provBeforeTotal)) : 0;
      const provBaseSeg = Math.max(0, provBeforeSeg - provCreditSeg);
      let provSurtaxSeg = 0;
      if (province === 'Ontario' && provBaseTotal > 0) {
        // 将附加税按“抵免后的基本省税”占比分摊
        provSurtaxSeg = provSurtaxTotal * (provBaseSeg / provBaseTotal);
      }
      const provSeg = provBaseSeg + provSurtaxSeg;

      const segTax = Math.max(0, fedSeg + provSeg);
      segments.push({
        label: `${fmt.format(a)}–${fmt.format(b)}`,
        width: w,
        tax: segTax,
        keep: Math.max(0, w - segTax)
      });
    }
    return segments;
  }

  function ensureBracketChart() {
    const ctx = document.getElementById('bracketBar');
    if (!ctx) return;
    if (!bracketChart) {
      bracketChart = new Chart(ctx, {
        type: 'bar',
        data: { labels: [], datasets: [
          { label: '到手（该段）', data: [], stack: 's', borderWidth: 0, backgroundColor: '#22c55e' },
          { label: '税款（该段）', data: [], stack: 's', borderWidth: 0, backgroundColor: '#ef4444' },
        ]},
        options: {
          indexAxis: 'y',
          responsive: true,
          scales: {
            x: { ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(255,255,255,0.05)' } },
            y: { ticks: { color: '#e5e7eb' }, grid: { display: false } }
          },
          plugins: {
            legend: { labels: { color: '#e5e7eb' } },
            tooltip: {
              callbacks: {
                label: (c) => `${c.dataset.label}: ${fmt2.format(c.parsed.x ?? c.parsed)}`
              }
            }
          }
        }
      });
    }
  }

  function renderBracketBar(province, annualIncome) {
    ensureBracketChart();
    if (!bracketChart) return;
    const segs = computeBracketSegments(annualIncome, province);
    bracketChart.data.labels = segs.map(s => s.label);
    bracketChart.data.datasets[0].data = segs.map(s => s.keep);
    bracketChart.data.datasets[1].data = segs.map(s => s.tax);
    bracketChart.update();
  }


  const els = {
    mode: $$('input[name="mode"]'),
    hourlyFields: $('#hourlyFields'),
    annualField: $('#annualField'),
    hourlyRate: $('#hourlyRate'),
    hoursPerWeek: $('#hoursPerWeek'),
    weeksPerYear: $('#weeksPerYear'),
    annualSalary: $('#annualSalary'),
    paidVacationPreset: $('#paidVacationPreset'),
    paidVacationCustom: $('#paidVacationCustom'),
    vacPayPreset: $('#vacPayPreset'),
    vacPayCustom: $('#vacPayCustom'),
    chkBonus: $('#chkBonus'),
    chkAllowance: $('#chkAllowance'),
    chkCommission: $('#chkCommission'),
    bonusVal: $('#bonusVal'),
    allowanceVal: $('#allowanceVal'),
    commissionVal: $('#commissionVal'),
    chkRRSP: $('#chkRRSP'), rrspVal: $('#rrspVal'),
    chkStock: $('#chkStock'), stockVal: $('#stockVal'),
    chkOther: $('#chkOther'), otherVal: $('#otherVal'),
    chkSelfEmp: $('#chkSelfEmp'),
    outCPPQPP: $('#outCPPQPP'), outEI: $('#outEI'),
    outAnnualGross: $('#outAnnualGross'),
    outMonthlyGross: $('#outMonthlyGross'),
    outWeeklyGross: $('#outWeeklyGross'),
    weeksCheck: $('#weeksCheck'),
    province: $('#province'),
    outFedTax: $('#outFedTax'),
    outProvTax: $('#outProvTax'),
    outTotalTax: $('#outTotalTax'),
    outAfterTax: $('#outAfterTax'),
    outAvgRate: $('#outAvgRate'),
    expRent: $('#expRent'),
    expCarIns: $('#expCarIns'),
    expTransit: $('#expTransit'),
    expInternet: $('#expInternet'),
    expGrocery: $('#expGrocery'),
    expLoan: $('#expLoan'),
    btnAddCustom: $('#btnAddCustom'),
    customList: $('#customList'),
    outMonthlyNet: $('#outMonthlyNet'),
    outMonthlyExp: $('#outMonthlyExp'),
    outMonthlyLeft: $('#outMonthlyLeft'),
    outLeftPct: $('#outLeftPct'),
    outWeeklyLeft: $('#outWeeklyLeft'),
  };
  // ===== 第二份工作（可选）逻辑 =====
  function el2(id){ return document.getElementById(id); }
  function isJob2Enabled(){ return !el2('job2Wrap')?.classList.contains('hidden'); }

  function getPaidVacationWeeks2() {
    const sel = el2('paidVacationPreset2');
    if (!sel) return 0;
    const v = sel.value;
    if (v === 'custom') return Number(el2('paidVacationCustom2')?.value || 0);
    return Number(v || 0);
  }
  function getVacPayPct2() {
    const sel = el2('vacPayPreset2');
    if (!sel) return 0;
    const v = sel.value;
    if (v === 'custom') return Number(el2('vacPayCustom2')?.value || 0);
    return Number(v || 0);
  }

  function computeJobGross2() {
    if (!isJob2Enabled()) return 0;
    const mode2 = Array.from(document.querySelectorAll('input[name="mode2"]')).find(r=>r.checked)?.value || 'hourly';
    let base = 0;
    if (mode2 === 'annual') {
      base = Number(el2('annualSalary2')?.value || 0);
    } else {
      const hr = Number(el2('hourlyRate2')?.value || 0);
      const hpw = Number(el2('hoursPerWeek2')?.value || 0);
      const wpy = Number(el2('weeksPerYear2')?.value || 0);
      const vacWeeks = getPaidVacationWeeks2();
      const totalWeeks = wpy + vacWeeks;
      el2('weeksCheck2')?.classList.toggle('hidden', totalWeeks <= 52);
      base = hr * hpw * wpy + hr * hpw * vacWeeks;
    }
    const vacPay = base * (getVacPayPct2() / 100);
    const bonus = el2('chkBonus2')?.checked ? Number(el2('bonusVal2')?.value || 0) : 0;
    const allow = el2('chkAllowance2')?.checked ? Number(el2('allowanceVal2')?.value || 0) : 0;
    const comm = el2('chkCommission2')?.checked ? Number(el2('commissionVal2')?.value || 0) : 0;
    return Math.max(0, base + vacPay + bonus + allow + comm);
  }


  function getPaidVacationWeeks() {
    const v = els.paidVacationPreset.value;
    if (v === 'custom') return Number(els.paidVacationCustom.value || 0);
    return Number(v || 0);
  }
  function getVacPayPct() {
    const v = els.vacPayPreset.value;
    if (v === 'custom') return Number(els.vacPayCustom.value || 0);
    return Number(v || 0);
  }

  

  function clampRRSP(earnedIncome, inputRRSP) {
    const limit = Math.min(RRSP_2025.dollarLimit, earnedIncome * RRSP_2025.earnedPct);
    return Math.max(0, Math.min(Number(inputRRSP||0), limit));
  }

  function computeIncomeBreakdown() {
    // Employment components from job1 + job2
    const mode = els.mode.find(r => r.checked)?.value || 'hourly';
    let base = 0;
    if (mode === 'annual') {
      base = Number(els.annualSalary.value || 0);
    } else {
      const hr = Number(els.hourlyRate.value || 0);
      const hpw = Number(els.hoursPerWeek.value || 0);
      const wpy = Number(els.weeksPerYear.value || 0);
      const vacWeeks = getPaidVacationWeeks();
      base = hr * hpw * (wpy + vacWeeks);
    }
    const vacPay = base * (getVacPayPct() / 100);
    const bonus = els.chkBonus.checked ? Number(els.bonusVal.value || 0) : 0;
    const allow = els.chkAllowance.checked ? Number(els.allowanceVal.value || 0) : 0;
    const comm = els.chkCommission.checked ? Number(els.commissionVal.value || 0) : 0;
    const job1Employment = Math.max(0, base + vacPay + bonus + allow + comm);

    const job2 = computeJobGross2(); // job2 already includes its bonus/allowance/commission
    const employmentIncome = job1Employment + job2;

    const stock = els.chkStock?.checked ? Number(els.stockVal?.value || 0) : 0;
    const other = els.chkOther?.checked ? Number(els.otherVal?.value || 0) : 0;
    const rrspIn = els.chkRRSP?.checked ? Number(els.rrspVal?.value || 0) : 0;

    const totalGross = employmentIncome + stock + other;
    const rrspDed = clampRRSP(employmentIncome, rrspIn);
    const taxableIncome = Math.max(0, totalGross - rrspDed);
    return { totalGross, employmentIncome, stock, other, rrspDed, taxableIncome };
  }

  function computeCPP_QPP_EI(employmentIncome, province, selfEmp) {
    // CPP/QPP: only on employment income
    const isQC = (province === 'Quebec');
    let cppqpp = 0;
    if (!isQC) {
      // CPP
      const earnings1 = Math.max(0, Math.min(CPP_2025.ympe, employmentIncome) - CPP_2025.ybe);
      const rate1 = selfEmp ? CPP_2025.rateSE : CPP_2025.rateEmp;
      let part1 = earnings1 * rate1;
      if (!selfEmp) part1 = Math.min(part1, CPP_2025.maxEmp);
      // CPP2
      const earnings2 = Math.max(0, Math.min(CPP_2025.yampe, employmentIncome) - CPP_2025.ympe);
      const rate2 = selfEmp ? CPP_2025.cpp2RateSE : CPP_2025.cpp2RateEmp;
      let part2 = earnings2 * rate2;
      if (!selfEmp) part2 = Math.min(part2, CPP_2025.maxCPP2Emp);
      cppqpp = part1 + part2;
    } else {
      // QPP
      const earnings1 = Math.max(0, Math.min(QPP_2025.mpe, employmentIncome) - QPP_2025.ybe);
      const rate1 = selfEmp ? (QPP_2025.baseRateSE + QPP_2025.addRateSE) : (QPP_2025.baseRateEmp + QPP_2025.addRateEmp);
      let part1 = earnings1 * rate1;
      // Official maximums (derived by formula) are respected via earnings caps

      const earnings2 = Math.max(0, Math.min(QPP_2025.yampe, employmentIncome) - QPP_2025.mpe);
      const rate2 = selfEmp ? QPP_2025.add2RateSE : QPP_2025.add2RateEmp;
      let part2 = earnings2 * rate2;
      cppqpp = part1 + part2;
    }

    // EI (employees only by default; self-employed not covered unless opted-in -> treat as 0)
    let ei = 0;
    if (!selfEmp) {
      const mie = EI_2025.mie;
      const rate = isQC ? EI_2025.rate.quebec : EI_2025.rate.default;
      const cap = isQC ? EI_2025.maxEmp.quebec : EI_2025.maxEmp.default;
      ei = Math.min((Math.min(employmentIncome, mie)) * rate, cap);
    }
    const planLabel = isQC ? 'QPP' : 'CPP';
    return { cppqpp, ei, planLabel };
  }

  function computeAnnualGross() {
    // job1（原始）+ job2（可选）
    const mode = els.mode.find(r => r.checked)?.value || 'hourly';
    let base = 0;
    if (mode === 'annual') {
      base = Number(els.annualSalary.value || 0);
    } else {
      const hr = Number(els.hourlyRate.value || 0);
      const hpw = Number(els.hoursPerWeek.value || 0);
      const wpy = Number(els.weeksPerYear.value || 0);
      const vacWeeks = getPaidVacationWeeks();
      const totalWeeks = wpy + vacWeeks;
      els.weeksCheck.classList.toggle('hidden', totalWeeks <= 52);
      base = hr * hpw * wpy + hr * hpw * vacWeeks;
    }
    const vacPay = base * (getVacPayPct() / 100);
    const bonus = els.chkBonus.checked ? Number(els.bonusVal.value || 0) : 0;
    const allow = els.chkAllowance.checked ? Number(els.allowanceVal.value || 0) : 0;
    const comm = els.chkCommission.checked ? Number(els.commissionVal.value || 0) : 0;

    const job1 = Math.max(0, base + vacPay + bonus + allow + comm);
    const job2 = computeJobGross2();
    return job1 + job2;
  }


  function renderIncomeOutputs(annual) {
    els.outAnnualGross.textContent = fmt.format(annual);
    els.outMonthlyGross.textContent = fmt2.format(annual / 12);
    els.outWeeklyGross.textContent = fmt2.format(annual / 52);
  }

  function syncModeUI() {
    const mode = els.mode.find(r => r.checked)?.value || 'hourly';
    els.hourlyFields.classList.toggle('hidden', mode !== 'hourly');
    els.annualField.classList.toggle('hidden', mode !== 'annual');
  }
  function syncVacUI() {
    els.paidVacationCustom.classList.toggle('hidden', els.paidVacationPreset.value !== 'custom');
    els.vacPayCustom.classList.toggle('hidden', els.vacPayPreset.value !== 'custom');
  }
  function syncBenefitInputs() {
    els.bonusVal.classList.toggle('hidden', !els.chkBonus.checked);
    els.allowanceVal.classList.toggle('hidden', !els.chkAllowance.checked);
    els.commissionVal.classList.toggle('hidden', !els.chkCommission.checked);
    els.rrspVal?.classList.toggle('hidden', !els.chkRRSP?.checked);
    els.stockVal?.classList.toggle('hidden', !els.chkStock?.checked);
    els.otherVal?.classList.toggle('hidden', !els.chkOther?.checked);
    els.rrspVal?.classList.toggle('hidden', !els.chkRRSP?.checked);
    els.stockVal?.classList.toggle('hidden', !els.chkStock?.checked);
    els.otherVal?.classList.toggle('hidden', !els.chkOther?.checked);
  }

  const PercentLabels = {
    id: 'percentLabels',
    afterDatasetsDraw(chart) {
      const ds = chart.data.datasets[0];
      if (!ds) return;
      const total = ds.data.reduce((a, b) => a + b, 0) || 1;
      const meta = chart.getDatasetMeta(0);
      const ctx = chart.ctx;
      ctx.save();
      ctx.fillStyle = '#e5e7eb';
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      meta.data.forEach((arc, i) => {
        const val = ds.data[i];
        if (!val || val <= 0) return;
        const props = arc.getProps(['x','y','startAngle','endAngle','innerRadius','outerRadius'], true);
        const angle = (props.startAngle + props.endAngle) / 2;
        const r = (props.innerRadius + props.outerRadius) / 2;
        const x = props.x + Math.cos(angle) * r;
        const y = props.y + Math.sin(angle) * r;
        const pct = Math.round((val / total) * 100);
        ctx.fillText(`${pct}%`, x, y);
      });
      ctx.restore();
    }
  };
  const CenterText = {
    id: 'centerText',
    afterDraw(chart) {
      const text = chart.options.plugins?.centerText?.text;
      if (!text) return;
      const {left, right, top, bottom} = chart.chartArea;
      const x = (left + right) / 2;
      const y = (top + bottom) / 2;
      const ctx = chart.ctx;
      ctx.save();
      ctx.fillStyle = '#e5e7eb';
      ctx.font = 'bold 18px Inter, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, x, y);
      ctx.restore();
    }
  };
  if (window.Chart) {
    Chart.register(PercentLabels, CenterText);
  }

  let taxChart, expChart, bracketChart, leftChart;

  function ensureTaxChart() {
    const ctx = document.getElementById('taxDonut');
    if (!ctx) return;
    if (!taxChart) {
      taxChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['联邦税','省/地区税','CPP/QPP','EI','税后收入'], datasets: [{ data: [0,0,0,0,1], borderWidth: 0 }] }, options: {
          plugins: {
            legend: { labels: { color: '#e5e7eb' } },
            tooltip: { callbacks: { label: (c) => `${c.label}: ${fmt2.format(c.parsed)}` } },
            centerText: { text: '' }
          },
          cutout: '60%'
        }
      });
    }
  }

  
  function ensureLeftChart() {
    const ctx = document.getElementById('leftDonut');
    if (!ctx) return;
    if (!leftChart) {
      leftChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['剩余', '支出'],
          datasets: [{
            data: [0, 0],
            borderWidth: 0,
            backgroundColor: ['#22c55e', '#ef4444']
          }]
        },
        options: {
          plugins: {
            legend: { labels: { color: '#e5e7eb' } },
            tooltip: { callbacks: { label: (c) => `${c.label}: ${fmt2.format(c.parsed)}` } },
            centerText: { text: '' }
          },
          cutout: '60%'
        }
      });
    }
  }
function ensureExpChart() {
    const ctx = document.getElementById('expDonut');
    if (!ctx) return;
    if (!expChart) {
      expChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: [], datasets: [{ data: [], borderWidth: 0, backgroundColor: [] }] },
        options: {
          plugins: {
            legend: { labels: { color: '#e5e7eb' } },
            tooltip: { callbacks: { label: (c) => `${c.label}: ${fmt2.format(c.parsed)}` } },
            centerText: { text: '' }
          },
          cutout: '60%'
        }
      });
    }
  }


  function renderTax(province, annualGross) {
    // Use breakdown: RRSP deduction reduces taxable income; CPP/QPP & EI reduce net cash but not taxable income
    const selfEmp = !!els.chkSelfEmp?.checked;
    const br = computeIncomeBreakdown();
    const taxable = Math.max(0, br.taxableIncome);
    const { federal, provincial, total, after, avgRate } = computeTaxes(taxable, province);
    const { cppqpp, ei, planLabel } = computeCPP_QPP_EI(br.employmentIncome, province, selfEmp);

    els.outFedTax.textContent = fmt.format(federal);
    els.outProvTax.textContent = fmt.format(provincial);
    els.outTotalTax.textContent = fmt.format(total);
    els.outCPPQPP && (els.outCPPQPP.textContent = fmt.format(cppqpp));
    els.outEI && (els.outEI.textContent = fmt.format(ei));

    const afterAll = Math.max(0, annualGross - total - cppqpp - ei);
    els.outAfterTax.textContent = fmt.format(afterAll);
    els.outAvgRate.textContent = ( (total + cppqpp + ei) / (annualGross||1) * 100 ).toFixed(1) + '%';

    ensureTaxChart();
    if (taxChart) {
      taxChart.data.labels = ['联邦税','省/地区税', planLabel, 'EI','税后收入'];
      taxChart.data.datasets[0].data = [federal, provincial, cppqpp, ei, Math.max(0, afterAll)];
      const afterPct = annualGross > 0 ? Math.round((afterAll / annualGross) * 100) : 0;
      taxChart.options.plugins.centerText.text = `${afterPct}% 税后`;
      taxChart.update();
    }
    // 税阶分段基于 taxable（已扣 RRSP）
    renderBracketBar(province, taxable);
    return { afterAnnual: afterAll };
  }

  function getMonthlyExpenses() {
    const basics = [
      Number(els.expRent.value || 0),
      Number(els.expCarIns.value || 0),
      Number(els.expTransit.value || 0),
      Number(els.expInternet.value || 0),
      Number(els.expGrocery.value || 0),
      Number(els.expLoan.value || 0),
    ].reduce((a, b) => a + b, 0);
    const customs = Array.from(document.querySelectorAll('#customList input[type="number"]')).reduce((sum, el) => sum + Number(el.value || 0), 0);
    return basics + customs;
  }


  function getExpenseBreakdown() {
    // 收集所有支出项（含自定义）
    const items = [
      ['房贷/租金', Number(els.expRent.value||0)],
      ['车险', Number(els.expCarIns.value||0)],
      ['通勤交通', Number(els.expTransit.value||0)],
      ['网络/电话', Number(els.expInternet.value||0)],
      ['食品杂货', Number(els.expGrocery.value||0)],
      ['保险/贷款', Number(els.expLoan.value||0)],
    ];
    document.querySelectorAll('#customList .grid input[type="text"]').forEach((nameEl, idx) => {
      const valEl = nameEl.parentElement.querySelector('input[type="number"]');
      items.push([nameEl.value || '自定义', Number(valEl?.value||0)]);
    });
    // 过滤 <=0
    const filtered = items.filter(([_,v]) => v>0);
    // 排序取前5
    filtered.sort((a,b)=>b[1]-a[1]);
    const top5 = filtered.slice(0,5);
    const others = filtered.slice(5).reduce((s,[,v])=>s+v,0);
    if (others>0) top5.push(['其他支出', others]);
    return top5;
  }

  function renderExpense(afterAnnual) {
    const monthlyNet = afterAnnual / 12;
    const monthlyExp = getMonthlyExpenses();
    const monthlyLeft = Math.max(0, monthlyNet - monthlyExp);
    const leftPct = monthlyNet > 0 ? (monthlyLeft / monthlyNet) : 0;
    els.outMonthlyNet.textContent = fmt2.format(monthlyNet);
    els.outMonthlyExp.textContent = fmt2.format(monthlyExp);
    els.outMonthlyLeft.textContent = fmt2.format(monthlyLeft);
    els.outWeeklyLeft.textContent = fmt2.format(monthlyLeft / 4.345);
    els.outLeftPct.textContent = (leftPct * 100).toFixed(1) + '%';
    ensureLeftChart();
    if (leftChart) {
      leftChart.data.labels = ['剩余','支出'];
      leftChart.data.datasets[0].data = [monthlyLeft, monthlyExp];
      leftChart.options.plugins.centerText.text = '剩余占比';
      leftChart.update();
    }
    ensureExpChart();
    if (expChart) {
      const parts = getExpenseBreakdown();
      const labels = parts.map(p=>p[0]);
      const data = parts.map(p=>p[1]);
      expChart.data.labels = labels;
      expChart.data.datasets[0].data = data;
      // 构造调色板（顶多6段：前5 + 其他）
      const n = data.length;
      const colors = [];
      for (let i=0;i<n;i++) {
        const hue = Math.round((i * 360) / Math.max(6, n+1));
        colors.push(`hsl(${hue} 70% 55%)`);
      }
      expChart.data.datasets[0].backgroundColor = colors;
      expChart.options.plugins.centerText.text = '支出构成';
      expChart.update();
    }
  }

  function addCustomRow() {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-2 gap-2';
    row.innerHTML = `
      <input type="text" placeholder="名称" class="rounded-md bg-zinc-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" value="自定义">
      <div class="flex items-center gap-2">
        <input type="number" min="0" step="10" value="0"
              class="w-full rounded-md bg-zinc-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent">
        <button aria-label="Remove" class="shrink-0 rounded-md bg-white/10 px-2 py-2 hover:bg-white/20 text-xs">✕</button>
      </div>
    `;
    const removeBtn = row.querySelector('button');
    removeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      row.remove();
      scheduleUpdate();
    });
    row.querySelectorAll('input').forEach(el => el.addEventListener('input', scheduleUpdate));
    document.getElementById('customList').appendChild(row);
  }

  let rafToken = 0;
  function scheduleUpdate() {
    cancelAnimationFrame(rafToken);
    rafToken = requestAnimationFrame(updateAll);
  }

  function updateAll() {
    const mode = els.mode.find(r => r.checked)?.value || 'hourly';
    els.hourlyFields.classList.toggle('hidden', mode !== 'hourly');
    els.annualField.classList.toggle('hidden', mode !== 'annual');
    els.paidVacationCustom.classList.toggle('hidden', els.paidVacationPreset.value !== 'custom');
    els.vacPayCustom.classList.toggle('hidden', els.vacPayPreset.value !== 'custom');
    els.bonusVal.classList.toggle('hidden', !els.chkBonus.checked);
    els.allowanceVal.classList.toggle('hidden', !els.chkAllowance.checked);
    els.commissionVal.classList.toggle('hidden', !els.chkCommission.checked);
    els.rrspVal?.classList.toggle('hidden', !els.chkRRSP?.checked);
    els.stockVal?.classList.toggle('hidden', !els.chkStock?.checked);
    els.otherVal?.classList.toggle('hidden', !els.chkOther?.checked);

    
    // --- job2 UI sync ---
    const mode2 = Array.from(document.querySelectorAll('input[name="mode2"]')).find(r=>r.checked)?.value || 'hourly';
    el2('hourlyFields2')?.classList.toggle('hidden', mode2 !== 'hourly');
    el2('annualField2')?.classList.toggle('hidden', mode2 !== 'annual');
    el2('paidVacationCustom2')?.classList.toggle('hidden', el2('paidVacationPreset2')?.value !== 'custom');
    el2('vacPayCustom2')?.classList.toggle('hidden', el2('vacPayPreset2')?.value !== 'custom');
    el2('bonusVal2')?.classList.toggle('hidden', !el2('chkBonus2')?.checked);
    el2('allowanceVal2')?.classList.toggle('hidden', !el2('chkAllowance2')?.checked);
    el2('commissionVal2')?.classList.toggle('hidden', !el2('chkCommission2')?.checked);
    const br = computeIncomeBreakdown();
    const annualGross = br.totalGross;
    els.outAnnualGross.textContent = fmt.format(annualGross);
    els.outMonthlyGross.textContent = fmt2.format(annualGross / 12);
    els.outWeeklyGross.textContent = fmt2.format(annualGross / 52);

    const province = els.province.value;
    const { afterAnnual } = renderTax(province, annualGross);
    renderExpense(afterAnnual);
  }

  els.mode.forEach(r => r.addEventListener('change', scheduleUpdate));
  els.annualSalary?.addEventListener('input', () => {
    const v = Number(els.annualSalary.value || 0);
    if (v > 0) {
      const annualRadio = els.mode.find(m => m.value === 'annual');
      if (annualRadio && !annualRadio.checked) annualRadio.checked = true;
    }
    scheduleUpdate();
  });

  [
    'hourlyRate','hoursPerWeek','weeksPerYear','paidVacationPreset','paidVacationCustom','vacPayPreset','vacPayCustom',
    'bonusVal','allowanceVal','commissionVal','rrspVal','stockVal','otherVal','province',
    'expRent','expCarIns','expTransit','expInternet','expGrocery','expLoan'
  ].forEach(id => document.getElementById(id)?.addEventListener('input', scheduleUpdate));

  document.getElementById('chkBonus').addEventListener('change', scheduleUpdate);
  document.getElementById('chkAllowance').addEventListener('change', scheduleUpdate);
  document.getElementById('chkCommission').addEventListener('change', scheduleUpdate);
  document.getElementById('chkRRSP')?.addEventListener('change', scheduleUpdate);
  document.getElementById('chkStock')?.addEventListener('change', scheduleUpdate);
  document.getElementById('chkOther')?.addEventListener('change', scheduleUpdate);
  document.getElementById('chkSelfEmp')?.addEventListener('change', scheduleUpdate);

  
  // Toggle second job
  document.getElementById('btnToggleJob2')?.addEventListener('click', (e) => {
    e.preventDefault();
    const wrap = el2('job2Wrap');
    if (!wrap) return;
    const willShow = wrap.classList.contains('hidden');
    wrap.classList.toggle('hidden', !willShow);
    const btn = document.getElementById('btnToggleJob2');
    if (btn) btn.textContent = willShow ? '✓ 已添加第二份工作' : '+ 添加第二份工作';
    scheduleUpdate();
  });
  el2('btnRemoveJob2')?.addEventListener('click', (e)=>{
    e.preventDefault();
    el2('job2Wrap')?.classList.add('hidden');
    const btn = document.getElementById('btnToggleJob2');
    if (btn) btn.textContent = '+ 添加第二份工作';
    scheduleUpdate();
  });

  // job2 inputs
  Array.from(document.querySelectorAll('input[name="mode2"]')).forEach(r=>r.addEventListener('change', scheduleUpdate));
  el2('annualSalary2')?.addEventListener('input', () => {
    const v = Number(el2('annualSalary2')?.value || 0);
    if (v > 0) {
      const annualRadio2 = Array.from(document.querySelectorAll('input[name="mode2"]')).find(m=>m.value==='annual');
      if (annualRadio2 && !annualRadio2.checked) annualRadio2.checked = true;
    }
    scheduleUpdate();
  });

  ;[
    'hourlyRate2','hoursPerWeek2','weeksPerYear2','paidVacationPreset2','paidVacationCustom2','vacPayPreset2','vacPayCustom2',
    'bonusVal2','allowanceVal2','commissionVal2'
  ].forEach(id => el2(id)?.addEventListener('input', scheduleUpdate));

  el2('chkBonus2')?.addEventListener('change', scheduleUpdate);
  el2('chkAllowance2')?.addEventListener('change', scheduleUpdate);
  el2('chkCommission2')?.addEventListener('change', scheduleUpdate);

  // Info tooltip for custom expenses
  const hintBtn = document.getElementById('btnCustomHint');
  const hintPop = document.getElementById('customHintPop');
  const hintWrap = document.getElementById('customHintWrap');
  function showHint(){ hintPop && hintPop.classList.remove('hidden'); }
  function hideHint(){ hintPop && hintPop.classList.add('hidden'); }
  hintBtn?.addEventListener('click', (e)=>{ e.preventDefault(); if (hintPop) hintPop.classList.toggle('hidden'); });
  hintBtn?.addEventListener('mouseenter', showHint);
  hintWrap?.addEventListener('mouseleave', hideHint);
  document.addEventListener('click', (e)=>{ if (hintPop && !hintWrap.contains(e.target) && e.target !== hintBtn) hideHint(); });
document.getElementById('btnAddCustom')?.addEventListener('click', (e) => {
    e.preventDefault();
    addCustomRow();
  });

  window.addEventListener('DOMContentLoaded', () => {
    ensureTaxChart(); ensureExpChart(); ensureLeftChart();
    scheduleUpdate();
  });
})();