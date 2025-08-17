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
    if (!annualIncome || annualIncome <= 0) {
      return { federal: 0, provincial: 0, total: 0, after: 0, avgRate: 0 };
    }
    let fed = calcTaxByBrackets(annualIncome, TAX_2025.federal);
    if (province === 'Quebec') {
      fed = fed * (1 - TAX_2025.qcFedAbatement);
    }
    const provTaxBeforeSurtax = calcTaxByBrackets(annualIncome, TAX_2025.provinces[province] || []);
    let prov = provTaxBeforeSurtax;
    if (province === 'Ontario') {
      const { t1, r1, t2, r2 } = TAX_2025.onSurtax;
      if (provTaxBeforeSurtax > t1) prov += (provTaxBeforeSurtax - t1) * r1;
      if (provTaxBeforeSurtax > t2) prov += (provTaxBeforeSurtax - t2) * r2;
    }
    const total = fed + prov;
    const after = Math.max(0, annualIncome - total);
    const avgRate = total / annualIncome;
    return { federal: fed, provincial: prov, total, after, avgRate };
  }

  // ===== 税阶分段可视化（横向堆叠条） =====
  function taxAtIncome(income, province, wantBeforeSurtax=false) {
    // 返回 {fedRaw, fedAdj, provBeforeSurtax, provTotal}
    // fedRaw: 联邦未做魁省退税的税额；fedAdj: 若魁省则扣除16.5%后的联邦税，其它省等于fedRaw
    const fedRaw = calcTaxByBrackets(income, TAX_2025.federal);
    const fedAdj = (province === 'Quebec') ? fedRaw * (1 - TAX_2025.qcFedAbatement) : fedRaw;
    const provBefore = calcTaxByBrackets(income, TAX_2025.provinces[province] || []);
    let provTotal = provBefore;
    if (province === 'Ontario') {
      const { t1, r1, t2, r2 } = TAX_2025.onSurtax;
      if (provBefore > t1) provTotal += (provBefore - t1) * r1;
      if (provBefore > t2) provTotal += (provBefore - t2) * r2;
    }
    return { fedRaw, fedAdj, provBeforeSurtax: provBefore, provTotal };
  }

  function computeBracketSegments(annualIncome, province) {
    // 合并联邦与省级上限，生成 0->income 的分段；每段计算该段税额（含安省附加税、魁省退税按比例分摊）
    const provBr = TAX_2025.provinces[province] || [];
    const breakpoints = new Set([0]);
    TAX_2025.federal.forEach(b => breakpoints.add(Math.min(b.upTo, annualIncome)));
    provBr.forEach(b => breakpoints.add(Math.min(b.upTo, annualIncome)));
    breakpoints.add(annualIncome);
    const pts = Array.from(breakpoints).filter(x => !isNaN(x)).sort((a,b)=>a-b);

    // 预先计算总省税（附加税前后）和联邦税（退税前后），用于按比例分配
    const total0 = taxAtIncome(annualIncome, province);
    const fedRawTotal = total0.fedRaw;
    const fedAdjTotal = total0.fedAdj;
    const fedAbate = Math.max(0, fedRawTotal - fedAdjTotal);
    const provBeforeTotal = total0.provBeforeSurtax;
    const provSurtax = Math.max(0, total0.provTotal - provBeforeTotal);

    const segments = [];
    for (let i=0;i<pts.length-1;i++) {
      const a = pts[i], b = pts[i+1];
      if (b <= a) continue;
      const w = Math.min(b, annualIncome) - a;
      const taxA = taxAtIncome(a, province);
      const taxB = taxAtIncome(b, province);

      // 该段联邦税（未退税）与省税（附加税前）——使用差分
      const fedRawSeg = taxB.fedRaw - taxA.fedRaw;
      const provBeforeSeg = taxB.provBeforeSurtax - taxA.provBeforeSurtax;

      // 退税和附加税按比例分摊到各段
      const fedAbateSeg = fedRawTotal>0 ? fedAbate * (fedRawSeg / fedRawTotal) : 0;
      const provSurtaxSeg = provBeforeTotal>0 ? provSurtax * (provBeforeSeg / provBeforeTotal) : 0;

      const fedSeg = fedRawSeg - fedAbateSeg;
      const provSeg = provBeforeSeg + provSurtaxSeg;
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

  function computeAnnualGross() {
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
    return Math.max(0, base + vacPay + bonus + allow + comm);
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

  let taxChart, expChart, bracketChart;

  function ensureTaxChart() {
    const ctx = document.getElementById('taxDonut');
    if (!ctx) return;
    if (!taxChart) {
      taxChart = new Chart(ctx, {
        type: 'doughnut',
        data: { labels: ['联邦税','省/地区税','税后收入'], datasets: [{ data: [0,0,1], borderWidth: 0 }] },
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
    const { federal, provincial, total, after, avgRate } = computeTaxes(annualGross, province);
    els.outFedTax.textContent = fmt.format(federal);
    els.outProvTax.textContent = fmt.format(provincial);
    els.outTotalTax.textContent = fmt.format(total);
    els.outAfterTax.textContent = fmt.format(after);
    els.outAvgRate.textContent = (avgRate * 100).toFixed(1) + '%';
    ensureTaxChart();
    if (taxChart) {
      taxChart.data.datasets[0].data = [federal, provincial, Math.max(0, after)];
      const afterPct = annualGross > 0 ? Math.round((after / annualGross) * 100) : 0;
      taxChart.options.plugins.centerText.text = `${afterPct}% 税后`;
      taxChart.update();
    }
    renderBracketBar(province, annualGross);
    return { afterAnnual: after };
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
      expChart.options.plugins.centerText.text = `${Math.round(leftPct * 100)}% 剩余`;
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

    const annualGross = computeAnnualGross();
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
    'bonusVal','allowanceVal','commissionVal','province',
    'expRent','expCarIns','expTransit','expInternet','expGrocery','expLoan'
  ].forEach(id => document.getElementById(id)?.addEventListener('input', scheduleUpdate));

  document.getElementById('chkBonus').addEventListener('change', scheduleUpdate);
  document.getElementById('chkAllowance').addEventListener('change', scheduleUpdate);
  document.getElementById('chkCommission').addEventListener('change', scheduleUpdate);

  document.getElementById('btnAddCustom')?.addEventListener('click', (e) => {
    e.preventDefault();
    addCustomRow();
  });

  window.addEventListener('DOMContentLoaded', () => {
    ensureTaxChart(); ensureExpChart();
    scheduleUpdate();
  });
})();