/* js/income-calc.js
   Canada Income & Tax Planner (2025)
   - real-time income/tax/expenses calculation
   - :Chart.js  + /
*/
(() => {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const fmt = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
  const fmt2 = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 2 });

  // ===== I18N (en, fr, zh-CN, hi) =====
  let __lang = (localStorage.getItem('lang') || document.documentElement.lang || 'en');
  const I18N = {
    "fr": {
      "Canada Income & Tax Planner": "Planificateur de revenu et d’impôt (Canada)",
      "Based on 2025 tax rates · Real-time calculation · Covers all 13 provinces/territories": "Basé sur les taux 2025 · Calcul en temps réel · 13 provinces/territoires",
      "🧩 Module 1: Income (incl. benefits)": "🧩 Module 1 : Revenu (avantages inclus)",
      "Pay input method": "Mode de saisie du salaire",
      "Hourly": "Horaire",
      "Annual": "Annuel",
      "Hourly($/h)": "Taux horaire ($/h)",
      "Hours per week": "Heures/semaine",
      "Weeks per year": "Semaines/an",
      "annual($)": "Salaire annuel ($)",
      "Hint: Entering a positive value here will switch to Annual mode automatically.": "Astuce : entrer une valeur positive ici basculera en mode « Annuel ».",
      "Paid vacation (weeks)": "Congés payés (sem.)",
      "Vacation Pay(%)": "Indemnité de congés (%)",
      "None": "Aucun",
      "2 weeks": "2 semaines",
      "3 weeks": "3 semaines",
      "4 weeks": "4 semaines",
      "Custom": "Personnalisé",
      "Work weeks are actual working weeks; paid vacation is added on top. A warning appears if total weeks exceed 52.": "Les semaines de travail sont réelles ; les congés payés s’ajoutent. Un avertissement apparaît si le total dépasse 52.",
      "Vacation pay is taxable (per CRA).": "L’indemnité de congés est imposable (CRA).",
      "Bonus": "Prime",
      "Allowance": "Allocation",
      "Commission": "Commission",
      "RRSP Contribution": "Cotisation RRSP",
      "Stock (taxable)": "Actions (impos.)",
      "Other (taxable)": "Autres (impos.)",
      "RRSP input mode": "Mode de saisie RRSP",
      "Amount ($)": "Montant ($)",
      "Percentage (%)": "Pourcentage (%)",
      "RRSP contribution (annual) $": "Cotisation RRSP (annuelle) $",
      "RRSP contribution (% of pay)": "Cotisation RRSP (% du salaire)",
      "Stock (taxable, annual) $": "Actions (impos., annuel) $",
      "Other (taxable, annual) $": "Autres (impos., annuel) $",
      "RRSP is a deduction (not part of gross pay) and reduces taxable income (auto-checked against 2025 limits). Stock/Other are treated as taxable income (dividend/capital gains rules not detailed here).": "Le RRSP est une déduction (hors brut) qui réduit le revenu imposable (contrôlé vs limites 2025). Actions/Autres sont imposables (sans détail dividendes/CG).",
      "I'm self-employed": "Je suis travailleur autonome",
      "Self-employed pay both the employee and employer shares (CPP/QPP doubled); EI not applicable by default.": "Les autonomes paient les parts employé et employeur (CPP/QPP doublé) ; EI non applicable par défaut.",
      "+ Add a second job": "+ Ajouter un second emploi",
      "Optional: for part-time/extra income": "Optionnel : temps partiel/appoint",
      "Second Job": "Second emploi",
      "Remove second job": "Supprimer le second emploi",
      "Total annual income (incl. benefits)": "Revenu annuel total (avantages inclus)",
      "Monthly gross": "Brut mensuel",
      "Weekly gross": "Brut hebdo",
      "⚠️ 'Work weeks + paid vacation weeks' exceed 52. Please check inputs to avoid double-counting.": "⚠️ « Semaines de travail + congés payés » > 52. Vérifiez pour éviter le double comptage.",
      "🧩 Module 2: Taxes (2025 latest rates)": "🧩 Module 2 : Impôts (taux 2025)",
      "Province/Territory": "Province/Territoire",
      "Federal tax": "Impôt fédéral",
      "Provincial/Territorial tax": "Impôt provincial/territorial",
      "CPP / QPP": "CPP / QPP",
      "EI": "EI",
      "Total tax": "Impôts totaux",
      "After-tax income (annual)": "Revenu après impôt (annuel)",
      "Average tax rate": "Taux d’imposition moyen",
      "Includes Ontario surtax and Quebec federal tax abatement (16.5%); CPP/QPP and EI computed separately (2025 rules); credits are not included.": "Inclut la surtaxe de l’Ontario et l’abattement fédéral du Québec (16,5 %) ; CPP/QPP et EI calculés séparément (règles 2025) ; crédits exclus.",
      "By tax bands: green = take-home for that segment; red = taxes for that segment": "Par tranches : vert = net pour la tranche ; rouge = impôt de la tranche",
      "🧩 Module 3: Expenses & leftover analysis": "🧩 Module 3 : Dépenses & reste",
      "Mortgage/Rent (monthly)": "Hypothèque/Loyer (mens.)",
      "Auto Insurance (monthly)": "Assurance auto (mens.)",
      "Commuting (monthly)": "Déplacements (mens.)",
      "Internet/Phone (monthly)": "Internet/Téléphone (mens.)",
      "Groceries (monthly)": "Épicerie (mens.)",
      "Insurance/Loans (monthly)": "Assurances/Prêts (mens.)",
      "+ Add custom expense": "+ Ajouter une dépense",
      "How to use": "Mode d’emploi",
      "Use this area for discretionary or uncommon expenses (e.g., premium car leases, pet care, lessons, hobbies). Name it and enter a monthly amount. You can add multiple custom rows and remove them anytime.": "Pour des dépenses discrétionnaires/inhabituelles (ex. location auto premium, animaux, cours, loisirs). Donnez un nom et un montant mensuel. Plusieurs lignes possibles, supprimables.",
      "Monthly after-tax income": "Revenu net mensuel",
      "Monthly expenses": "Dépenses mensuelles",
      "Monthly leftover": "Reste mensuel",
      "Weekly leftover": "Reste hebdo",
      "Leftover": "Reste",
      "Leftover Share": "Part du reste",
      "Expenses": "Dépenses",
      "Take-home (segment)": "Net (tranche)",
      "Tax (segment)": "Impôt (tranche)",
      "After-tax": "Après impôt",
      "After-tax Income": "Revenu après impôt"
    },
    "zh-CN": {
      "Canada Income & Tax Planner": "加拿大收入与税务规划器",
      "Based on 2025 tax rates · Real-time calculation · Covers all 13 provinces/territories": "基于 2025 年税率 · 实时计算 · 覆盖 13 个省/地区",
      "🧩 Module 1: Income (incl. benefits)": "🧩 模块 1：收入（含福利）",
      "Pay input method": "薪酬录入方式",
      "Hourly": "按小时",
      "Annual": "按年",
      "Hourly($/h)": "时薪($/h)",
      "Hours per week": "每周小时",
      "Weeks per year": "每年周数",
      "annual($)": "年薪($)",
      "Hint: Entering a positive value here will switch to Annual mode automatically.": "提示：此处输入正数会自动切换到“按年”。",
      "Paid vacation (weeks)": "带薪休假（周）",
      "Vacation Pay(%)": "假期工资(%)",
      "None": "无",
      "2 weeks": "2 周",
      "3 weeks": "3 周",
      "4 weeks": "4 周",
      "Custom": "自定义",
      "Work weeks are actual working weeks; paid vacation is added on top. A warning appears if total weeks exceed 52.": "工作周是实际工作周；带薪休假另外加上。若总周数超过 52 将显示警告。",
      "Vacation pay is taxable (per CRA).": "假期工资需纳税（依据 CRA）。",
      "Bonus": "奖金",
      "Allowance": "津贴",
      "Commission": "佣金",
      "RRSP Contribution": "RRSP 供款",
      "Stock (taxable)": "股票（计税）",
      "Other (taxable)": "其他（计税）",
      "RRSP input mode": "RRSP 输入方式",
      "Amount ($)": "金额 ($)",
      "Percentage (%)": "百分比 (%)",
      "RRSP contribution (annual) $": "RRSP 供款（年）$",
      "RRSP contribution (% of pay)": "RRSP 供款（薪酬百分比）",
      "Stock (taxable, annual) $": "股票（计税，年）$",
      "Other (taxable, annual) $": "其他（计税，年）$",
      "RRSP is a deduction (not part of gross pay) and reduces taxable income (auto-checked against 2025 limits). Stock/Other are treated as taxable income (dividend/capital gains rules not detailed here).": "RRSP 属于扣除项（不计入税前收入），可降低应税收入（自动按 2025 限额校验）。股票/其他按应税收入处理（未细化分红/资本增值规则）。",
      "I'm self-employed": "我是自雇人士",
      "Self-employed pay both the employee and employer shares (CPP/QPP doubled); EI not applicable by default.": "自雇需承担雇员与雇主份额（CPP/QPP 加倍）；默认不适用 EI。",
      "+ Add a second job": "+ 添加第二份工作",
      "Optional: for part-time/extra income": "可选：兼职/额外收入",
      "Second Job": "第二份工作",
      "Remove second job": "移除第二份工作",
      "Total annual income (incl. benefits)": "年总收入（含福利）",
      "Monthly gross": "月度税前",
      "Weekly gross": "每周税前",
      "⚠️ 'Work weeks + paid vacation weeks' exceed 52. Please check inputs to avoid double-counting.": "⚠️ “工作周 + 带薪假周”超过 52。请检查输入避免重复计算。",
      "🧩 Module 2: Taxes (2025 latest rates)": "🧩 模块 2：税费（2025 最新税率）",
      "Province/Territory": "省/地区",
      "Federal tax": "联邦税",
      "Provincial/Territorial tax": "省/地区税",
      "CPP / QPP": "CPP / QPP",
      "EI": "EI",
      "Total tax": "税费合计",
      "After-tax income (annual)": "税后收入（年）",
      "Average tax rate": "平均税率",
      "Includes Ontario surtax and Quebec federal tax abatement (16.5%); CPP/QPP and EI computed separately (2025 rules); credits are not included.": "已包含安省附加税和魁省联邦税减免（16.5%）；CPP/QPP 与 EI 单独计算（2025 规则）；不含各类抵免。",
      "By tax bands: green = take-home for that segment; red = taxes for that segment": "分税档显示：绿色＝该段到手；红色＝该段税额",
      "🧩 Module 3: Expenses & leftover analysis": "🧩 模块 3：支出与结余分析",
      "Mortgage/Rent (monthly)": "房贷/房租（每月）",
      "Auto Insurance (monthly)": "车险（每月）",
      "Commuting (monthly)": "通勤（每月）",
      "Internet/Phone (monthly)": "网络/电话（每月）",
      "Groceries (monthly)": "杂货（每月）",
      "Insurance/Loans (monthly)": "保险/贷款（每月）",
      "+ Add custom expense": "+ 添加自定义支出",
      "How to use": "如何使用",
      "Use this area for discretionary or uncommon expenses (e.g., premium car leases, pet care, lessons, hobbies). Name it and enter a monthly amount. You can add multiple custom rows and remove them anytime.": "此处用于可自由支配或非常见支出（如高端车辆租赁、宠物照护、课程、爱好等）。请命名并填入月金额。可添加多行并随时删除。",
      "Monthly after-tax income": "月度税后收入",
      "Monthly expenses": "月度支出",
      "Monthly leftover": "月度结余",
      "Weekly leftover": "每周结余",
      "Leftover": "结余",
      "Leftover Share": "结余占比",
      "Expenses": "支出",
      "Take-home (segment)": "到手（该段）",
      "Tax (segment)": "税（该段）",
      "After-tax": "税后",
      "After-tax Income": "税后收入"
    },
    "hi": {
      "Canada Income & Tax Planner": "कनाडा आय व कर योजनाकार",
      "Based on 2025 tax rates · Real-time calculation · Covers all 13 provinces/territories": "2025 कर दरों पर आधारित · रियल‑टाइम गणना · 13 प्रांत/क्षेत्र शामिल",
      "🧩 Module 1: Income (incl. benefits)": "🧩 मॉड्यूल 1: आय (लाभ सहित)",
      "Pay input method": "वेतन इनपुट तरीका",
      "Hourly": "घंटे के हिसाब से",
      "Annual": "वार्षिक",
      "Hourly($/h)": "घंटे का दर ($/h)",
      "Hours per week": "साप्ताहिक घंटे",
      "Weeks per year": "वर्ष में सप्ताह",
      "annual($)": "वार्षिक वेतन ($)",
      "Hint: Entering a positive value here will switch to Annual mode automatically.": "संकेत: यहाँ धनात्मक मान दर्ज करने पर स्वतः ‘वार्षिक’ मोड चुना जाएगा।",
      "Paid vacation (weeks)": "सवैतनिक अवकाश (सप्ताह)",
      "Vacation Pay(%)": "अवकाश वेतन (%)",
      "None": "कोई नहीं",
      "2 weeks": "2 सप्ताह",
      "3 weeks": "3 सप्ताह",
      "4 weeks": "4 सप्ताह",
      "Custom": "कस्टम",
      "Work weeks are actual working weeks; paid vacation is added on top. A warning appears if total weeks exceed 52.": "कार्य सप्ताह वास्तविक काम के सप्ताह हैं; सवैतनिक अवकाश अतिरिक्त जोड़ा जाता है। कुल 52 से अधिक होने पर चेतावनी दिखाई देगी।",
      "Vacation pay is taxable (per CRA).": "अवकाश वेतन करयोग्य है (CRA के अनुसार)।",
      "Bonus": "बोनस",
      "Allowance": "भत्ता",
      "Commission": "कमीशन",
      "RRSP Contribution": "RRSP अंशदान",
      "Stock (taxable)": "शेयर (करयोग्य)",
      "Other (taxable)": "अन्य (करयोग्य)",
      "RRSP input mode": "RRSP इनपुट मोड",
      "Amount ($)": "राशि ($)",
      "Percentage (%)": "प्रतिशत (%)",
      "RRSP contribution (annual) $": "RRSP अंशदान (वार्षिक) $",
      "RRSP contribution (% of pay)": "RRSP अंशदान (वेतन %)",
      "Stock (taxable, annual) $": "शेयर (करयोग्य, वार्षिक) $",
      "Other (taxable, annual) $": "अन्य (करयोग्य, वार्षिक) $",
      "RRSP is a deduction (not part of gross pay) and reduces taxable income (auto-checked against 2025 limits). Stock/Other are treated as taxable income (dividend/capital gains rules not detailed here).": "RRSP कटौती है (ग्रॉस में शामिल नहीं) और करयोग्य आय घटाती है (2025 सीमा के अनुसार स्वतः जाँच)। शेयर/अन्य को करयोग्य आय माना गया है (लाभांश/पूँजीगत लाभ का विस्तार यहाँ नहीं)।",
      "I'm self-employed": "मैं स्व-नियोजित हूँ",
      "Self-employed pay both the employee and employer shares (CPP/QPP doubled); EI not applicable by default.": "स्व-नियोजित को कर्मचारी व नियोक्ता दोनों हिस्से (CPP/QPP दोगुना) देने होते हैं; डिफ़ॉल्ट रूप से EI लागू नहीं।",
      "+ Add a second job": "+ दूसरी नौकरी जोड़ें",
      "Optional: for part-time/extra income": "वैकल्पिक: पार्ट‑टाइम/अतिरिक्त आय",
      "Second Job": "दूसरी नौकरी",
      "Remove second job": "दूसरी नौकरी हटाएँ",
      "Total annual income (incl. benefits)": "वार्षिक कुल आय (लाभ सहित)",
      "Monthly gross": "मासिक ग्रॉस",
      "Weekly gross": "साप्ताहिक ग्रॉस",
      "⚠️ 'Work weeks + paid vacation weeks' exceed 52. Please check inputs to avoid double-counting.": "⚠️ ‘कार्य सप्ताह + सवैतनिक अवकाश सप्ताह’ 52 से अधिक हैं। दोहरी गणना से बचने हेतु इनपुट जाँचें।",
      "🧩 Module 2: Taxes (2025 latest rates)": "🧩 मॉड्यूल 2: कर (2025 नवीनतम दरें)",
      "Province/Territory": "प्रांत/क्षेत्र",
      "Federal tax": "फेडरल टैक्स",
      "Provincial/Territorial tax": "प्रांतीय/क्षेत्रीय टैक्स",
      "CPP / QPP": "CPP / QPP",
      "EI": "EI",
      "Total tax": "कुल कर",
      "After-tax income (annual)": "कर‑बाद आय (वार्षिक)",
      "Average tax rate": "औसत कर दर",
      "Includes Ontario surtax and Quebec federal tax abatement (16.5%); CPP/QPP and EI computed separately (2025 rules); credits are not included.": "ओंटारियो सरचार्ज और क्यूबेक संघीय कर में 16.5% छूट शामिल; CPP/QPP व EI अलग से (2025 नियम); क्रेडिट शामिल नहीं।",
      "By tax bands: green = take-home for that segment; red = taxes for that segment": "कर बैंड अनुसार: हरा = उस खंड की घर‑ले राशि; लाल = उस खंड का कर",
      "🧩 Module 3: Expenses & leftover analysis": "🧩 मॉड्यूल 3: खर्च व शेष",
      "Mortgage/Rent (monthly)": "बंधक/किराया (मासिक)",
      "Auto Insurance (monthly)": "ऑटो बीमा (मासिक)",
      "Commuting (monthly)": "आवागमन (मासिक)",
      "Internet/Phone (monthly)": "इंटरनेट/फोन (मासिक)",
      "Groceries (monthly)": "किराना (मासिक)",
      "Insurance/Loans (monthly)": "बीमा/ऋण (मासिक)",
      "+ Add custom expense": "+ कस्टम खर्च जोड़ें",
      "How to use": "कैसे उपयोग करें",
      "Use this area for discretionary or uncommon expenses (e.g., premium car leases, pet care, lessons, hobbies). Name it and enter a monthly amount. You can add multiple custom rows and remove them anytime.": "यह क्षेत्र विवेकाधीन/अप्रचलित खर्चों के लिए है (जैसे प्रीमियम कार लीज, पालतू देखभाल, कक्षाएँ, शौक)। नाम दें और मासिक राशि दर्ज करें। कई पंक्तियाँ जोड़ें और कभी भी हटाएँ।",
      "Monthly after-tax income": "मासिक कर‑बाद आय",
      "Monthly expenses": "मासिक खर्च",
      "Monthly leftover": "मासिक शेष",
      "Weekly leftover": "साप्ताहिक शेष",
      "Leftover": "शेष",
      "Leftover Share": "शेष का अनुपात",
      "Expenses": "खर्च",
      "Take-home (segment)": "टेक‑होम (खंड)",
      "Tax (segment)": "कर (खंड)",
      "After-tax": "कर‑बाद",
      "After-tax Income": "कर‑बाद आय"
    }
  };
  const __I18N_ORIG__ = new WeakMap();
  function i18n_t(s){
    try{
      const pack = I18N[__lang] || {};
      return pack[s] || s;
    }catch(e){ return s; }
  }
  
function i18n_apply(){
    try{
      const pack = I18N[__lang] || null;
      // Walk all text nodes and translate based on ORIGINAL text
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      while (walker.nextNode()){
        const node = walker.currentNode;
        if (!node || !node.nodeValue) continue;
        const raw = node.nodeValue;
        const trimmed = raw.trim();
        if (!trimmed) continue;
        const original = __I18N_ORIG__.has(node) ? __I18N_ORIG__.get(node) : trimmed;
        if (!__I18N_ORIG__.has(node)) __I18N_ORIG__.set(node, original);
        const target = (pack && pack[original]) ? pack[original] : original;
        if (target !== trimmed){
          // Replace only the trimmed portion to preserve spaces
          node.nodeValue = raw.replace(trimmed, target);
        }
      }
      // Attributes: placeholder, aria-label — store originals in data-*
      document.querySelectorAll('[placeholder]').forEach(el=>{
        const key = el.getAttribute('data-i18n-ph') || el.getAttribute('placeholder');
        if (!el.hasAttribute('data-i18n-ph')) el.setAttribute('data-i18n-ph', key);
        const t = (pack && pack[key]) ? pack[key] : key;
        if (el.getAttribute('placeholder') !== t) el.setAttribute('placeholder', t);
      });
      document.querySelectorAll('[aria-label]').forEach(el=>{
        const key = el.getAttribute('data-i18n-aria') || el.getAttribute('aria-label');
        if (!el.hasAttribute('data-i18n-aria')) el.setAttribute('data-i18n-aria', key);
        const t = (pack && pack[key]) ? pack[key] : key;
        if (el.getAttribute('aria-label') !== t) el.setAttribute('aria-label', t);
      });
      document.title = (pack && pack[document.title]) ? pack[document.title] : document.title;
    }catch(e){}
  }
  function i18n_set(lang){
    __lang = lang || 'en';
    localStorage.setItem('lang', __lang);
    document.documentElement.setAttribute('lang', __lang);
    i18n_apply();
    // retrigger charts/outputs to refresh labels
    try{ scheduleUpdate(); }catch(e){}
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('[data-lang]').forEach(a=>{
      a.addEventListener('click', (e)=>{
        e.preventDefault();
        i18n_set(a.getAttribute('data-lang'));
      });
    });
    // initial
    i18n_set(__lang);
  });

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
  // ===== (BPA)2025 — /Provincial Tax =====
  // : ~15.7k, Province ≥10k.
  // :( $2,000) 0 Federal Tax 0 Provincial Tax.
  // :;  UI, .
  const BPA_2025 = {
    federal: 15705,
    // , ; , .
    provinces: {
      "Ontario": 11865
    },
    defaultProvince: 12000
  };
  function _getProvinceBPA(province){
    return (BPA_2025.provinces && BPA_2025.provinces[province]) || BPA_2025.defaultProvince;
  }


  // ===== 2025 CPP/QPP/EI & RRSP ( CRA / Retraite Québec ) =====
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
    addRateEmp: 0.01,    // +1% additional ( 6.4%)
    baseRateSE: 0.108,   // 10.8%
    addRateSE: 0.02,     // +2% ( 12.8%)
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
    // annualIncome “”( RRSP ).
    if (!annualIncome || annualIncome <= 0) {
      return { federal: 0, provincial: 0, total: 0, after: 0, avgRate: 0 };
    }
    // — :“”, ( BPA).
    const fedRaw = calcTaxByBrackets(annualIncome, TAX_2025.federal);
    const fedCredit = (TAX_2025.federal[0]?.rate || 0) * (BPA_2025.federal || 0);
    const fedAfterCredit = Math.max(0, fedRaw - fedCredit);
    // Quebec:“”Federal Tax 16.5% .
    const fed = (province === 'Quebec') ? (fedAfterCredit * (1 - TAX_2025.qcFedAbatement)) : fedAfterCredit;

    // — Provincial Tax:“Provincial Tax”,  BPA().
    const provBr = TAX_2025.provinces[province] || [];
    const provRaw = calcTaxByBrackets(annualIncome, provBr);
    const provCredit = (provBr[0]?.rate || 0) * _getProvinceBPA(province);
    const provBase = Math.max(0, provRaw - provCredit);

    // Ontario“()”.
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

  // ===== () =====
  
  function taxAtIncome(income, province, wantBeforeSurtax=false) {
    // returns {fedRaw, fedAdj, provBeforeSurtax, provTotal}
    // fedAdj  BPA (Quebec); provTotal  BPA (Ontario).
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

    // — :/, BPA , Quebec, Ontario —
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

      // :“”, //.
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
        // Allocate surtax proportionally to post-credit provincial base tax
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
          { label: 'Take-home (segment)', data: [], stack: 's', borderWidth: 0, backgroundColor: '#22c55e' },
          { label: 'Tax (segment)', data: [], stack: 's', borderWidth: 0, backgroundColor: '#ef4444' },
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
    rrspMode: $('#rrspMode'), rrspPct: $('#rrspPct'), rrspModeWrap: $('#rrspModeWrap'),
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
  // ===== Second Job() =====
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
      let hpw = Number(el2('hoursPerWeek2')?.value || 0);
      if (hpw > 168) { hpw = 168; el2('hoursPerWeek2').value = 168; }
      if (hpw < 0) { hpw = 0; }
      let wpy = Number(el2('weeksPerYear2')?.value || 0);
      if (wpy > 52) { wpy = 52; el2('weeksPerYear2').value = 52; }
      if (wpy < 0) { wpy = 0; }
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
      let hpw = Number(els.hoursPerWeek.value || 0);
      if (hpw > 168) { hpw = 168; els.hoursPerWeek.value = 168; }
      if (hpw < 0) { hpw = 0; }
      let wpy = Number(els.weeksPerYear.value || 0);
      if (wpy > 52) { wpy = 52; els.weeksPerYear.value = 52; }
      if (wpy < 0) { wpy = 0; }
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
    let rrspCandidate = 0;
    if (els.chkRRSP?.checked) {
      const mode = els.rrspMode?.value || 'amount';
      if (mode === 'percent') {
        const pct = Math.max(0, Number(els.rrspPct?.value || 0));
        rrspCandidate = employmentIncome * (pct / 100);
      } else {
        rrspCandidate = Number(els.rrspVal?.value || 0);
      }
    }


    const totalGross = employmentIncome + stock + other;
    const rrspDed = clampRRSP(employmentIncome, rrspCandidate);
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
    // job1()+ job2()
    const mode = els.mode.find(r => r.checked)?.value || 'hourly';
    let base = 0;
    if (mode === 'annual') {
      base = Number(els.annualSalary.value || 0);
    } else {
      const hr = Number(els.hourlyRate.value || 0);
      let hpw = Number(els.hoursPerWeek.value || 0);
      if (hpw > 168) { hpw = 168; els.hoursPerWeek.value = 168; }
      if (hpw < 0) { hpw = 0; }
      let wpy = Number(els.weeksPerYear.value || 0);
      if (wpy > 52) { wpy = 52; els.weeksPerYear.value = 52; }
      if (wpy < 0) { wpy = 0; }
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
      taxChart = new Chart(ctx, { type: 'doughnut', data: { labels: ['Federal Tax','Provincial/Territorial Tax','CPP/QPP','EI','After-tax Income'], datasets: [{ data: [0,0,0,0,1], borderWidth: 0 }] }, options: {
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
          labels: ['Leftover', 'Expenses'],
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
      taxChart.data.labels = [i18n_t('Federal Tax'), i18n_t('Provincial/Territorial Tax'), planLabel, i18n_t('EI'), i18n_t('After-tax Income')];
      taxChart.data.datasets[0].data = [federal, provincial, cppqpp, ei, Math.max(0, afterAll)];
      const afterPct = annualGross > 0 ? Math.round((afterAll / annualGross) * 100) : 0;
      taxChart.options.plugins.centerText.text = `${afterPct}% ` + i18n_t('After-tax');
      taxChart.update();
    }
    //  taxable( RRSP)
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
    // Expenses(Custom)
    const items = [
      ['Mortgage/Rent', Number(els.expRent.value||0)],
      ['Auto Insurance', Number(els.expCarIns.value||0)],
      ['Commuting', Number(els.expTransit.value||0)],
      ['Internet/Phone', Number(els.expInternet.value||0)],
      ['Groceries', Number(els.expGrocery.value||0)],
      ['Insurance/Loans', Number(els.expLoan.value||0)],
    ];
    document.querySelectorAll('#customList .grid input[type="text"]').forEach((nameEl, idx) => {
      const valEl = nameEl.parentElement.querySelector('input[type="number"]');
      items.push([nameEl.value || 'Custom', Number(valEl?.value||0)]);
    });
    // Filter <= 0
    const filtered = items.filter(([_,v]) => v>0);
    // Sort and take top 5
    filtered.sort((a,b)=>b[1]-a[1]);
    const top5 = filtered.slice(0,5);
    const others = filtered.slice(5).reduce((s,[,v])=>s+v,0);
    if (others>0) top5.push(['Other Expenses', others]);
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
      leftChart.data.labels = [i18n_t('Leftover'), i18n_t('Expenses')];
      leftChart.data.datasets[0].data = [monthlyLeft, monthlyExp];
      leftChart.options.plugins.centerText.text = i18n_t('Leftover Share');
      leftChart.update();
    }
    ensureExpChart();
    if (expChart) {
      const parts = getExpenseBreakdown();
      const labels = parts.map(p=>p[0]);
      const data = parts.map(p=>p[1]);
      expChart.data.labels = labels;
      expChart.data.datasets[0].data = data;
      // (6:5 + )
      const n = data.length;
      const colors = [];
      for (let i=0;i<n;i++) {
        const hue = Math.round((i * 360) / Math.max(6, n+1));
        colors.push(`hsl(${hue} 70% 55%)`);
      }
      expChart.data.datasets[0].backgroundColor = colors;
      expChart.options.plugins.centerText.text = i18n_t('Expenses');
      expChart.update();
    }
  }

  function addCustomRow() {
    const row = document.createElement('div');
    row.className = 'grid grid-cols-2 gap-2';
    row.innerHTML = `
      <input type="text" placeholder="Name" class="rounded-md bg-zinc-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent" value="Custom">
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
    // RRSP amount/percent mode UI
    {
      const rrspOn = !!els.chkRRSP?.checked;
      els.rrspModeWrap?.classList.toggle('hidden', !rrspOn);
      const isPct = (els.rrspMode?.value === 'percent');
      els.rrspVal?.classList.toggle('hidden', !rrspOn || isPct);
      els.rrspPct?.classList.toggle('hidden', !rrspOn || !isPct);
    }


    
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
    'bonusVal','allowanceVal','commissionVal','rrspVal','rrspPct','rrspMode','stockVal','otherVal','province',
    'expRent','expCarIns','expTransit','expInternet','expGrocery','expLoan'
  ].forEach(id => document.getElementById(id)?.addEventListener('input', scheduleUpdate));

  document.getElementById('chkBonus').addEventListener('change', scheduleUpdate);
  document.getElementById('chkAllowance').addEventListener('change', scheduleUpdate);
  document.getElementById('chkCommission').addEventListener('change', scheduleUpdate);
  document.getElementById('chkRRSP')?.addEventListener('change', scheduleUpdate);
  document.getElementById('rrspMode')?.addEventListener('change', scheduleUpdate);
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
    if (btn) btn.textContent = willShow ? '✓ Second Job Added' : '+ Add a second job';
    scheduleUpdate();
  });
  el2('btnRemoveJob2')?.addEventListener('click', (e)=>{
    e.preventDefault();
    el2('job2Wrap')?.classList.add('hidden');
    const btn = document.getElementById('btnToggleJob2');
    if (btn) btn.textContent = '+ Add a second job';
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