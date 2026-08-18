(function () {
  'use strict';

  const engine = globalThis.CanadaTax2025;
  if (!engine) throw new Error('The 2025 tax engine did not load.');

  const $ = function (selector) { return document.querySelector(selector); };
  const $$ = function (selector) { return Array.from(document.querySelectorAll(selector)); };
  const byId = function (id) { return document.getElementById(id); };
  const numberValue = function (id) {
    const input = byId(id);
    const number = Number(input && input.value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  };
  const selected = function (name) {
    const radio = document.querySelector('input[name="' + name + '"]:checked');
    return radio ? radio.value : 'hourly';
  };
  const currency = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const TRANSLATIONS = {
    fr: {
      title: "Estimation canadienne 2025 du revenu d'emploi annuel et des liquidités disponibles",
      subtitle: 'Règles annuelles 2025 finalisées · Situations simples de salariés · Toutes les provinces et tous les territoires',
      disclaimerTitle: 'Portée et limites importantes',
      disclaimer: "Il s'agit d'une estimation annuelle simplifiée pour 2025 visant un salarié célibataire de 19 à 64 ans, et non d'une déclaration de revenus, d'un calcul des retenues à la source ni de conseils fiscaux, juridiques, de paie ou financiers. L'impôt réel dépend des déductions, crédits, prestations, de la résidence, de la fréquence de paie, de la situation personnelle et de la cotisation de l'ARC ou de Revenu Québec. Confirmez vos droits REER dans votre dernier avis de cotisation ou votre compte de l'ARC. Les dividendes, gains en capital et revenus de travail autonome ne sont pas modélisés.",
      methodology: 'Méthode, hypothèses et sources officielles',
      vacationHelp: "Pour un salaire horaire, les semaines travaillées excluent les congés payés. Choisissez les semaines payées ou un pourcentage; les deux ne sont jamais appliqués ensemble. Le salaire annuel est réputé inclure les congés payés.",
      additionalHelp: "Utilisez seulement une rémunération d'emploi en espèces qui n'est pas déjà saisie. Elle est incluse pour le RPC/RRQ et l'AE.",
      otherHelp: "Imposé aux taux ordinaires, mais exclu du RPC/RRQ et de l'AE. N'inscrivez pas de dividendes ni de gains en capital.",
      rrspHelp: "Inscrivez le plafond personnel figurant dans votre dernier avis de cotisation ou votre compte de l'ARC. Le plafond annuel de 32 490 $ n'est pas automatiquement votre marge disponible. Si la cotisation dépasse le plafond inscrit, toute la cotisation réduit les liquidités, mais seul le plafond inscrit est déduit. Les pénalités de cotisation excédentaire ne sont pas modélisées.",
      provinceHelp: "Suppose la même province ou le même territoire de résidence et d'emploi pendant toute l'année 2025. Les situations multiterritoriales et les années partielles sont hors portée.",
      annualContributionHelp: "Le RPC/RRQ et l'AE utilisent un calcul annuel normalisé sur le revenu d'emploi combiné. Avec plusieurs employeurs, les retenues réelles peuvent différer; les cotisations excédentaires peuvent être remboursées après la cotisation.",
      spendable: 'Liquidités disponibles après financement du REER',
      beforeRrsp: 'Liquidités après impôt avant financement du REER',
      rrspSaving: "Réduction estimée de l'impôt sur le revenu grâce à la déduction REER",
      expenseHeading: '3. Dépenses mensuelles et excédent ou déficit'
    },
    'zh-CN': {
      title: '2025 年加拿大年度就业收入与可支配现金估算',
      subtitle: '固定使用已最终确定的 2025 全年规则 · 基本雇员情形 · 所有省和地区',
      disclaimerTitle: '范围与重要限制',
      disclaimer: '这是面向 19 至 64 岁单身雇员的简化 2025 年年度估算，并非报税表、工资预扣计算，也不构成税务、法律、工资或财务建议。实际税额取决于扣除、抵免、福利、居住地、发薪频率、个人情况以及加拿大税务局或魁北克税务局的评税。请在最新评税通知或 CRA 账户中确认 RRSP 额度。本工具不计算股息、资本利得或自雇收入。',
      methodology: '计算方法、假设与官方来源',
      vacationHelp: '按小时计薪时，工作周数不包括带薪休假。请选择带薪休假周数或假期工资百分比，计算器不会同时应用两者。年薪视为已包含假期补偿。',
      additionalHelp: '仅填写上方尚未计入的额外现金就业报酬；该金额计入 CPP/QPP 和 EI。',
      otherHelp: '按普通收入税率计税，但不计入 CPP/QPP 和 EI。请勿填写股息或资本利得。',
      rrspHelp: '请填写最新评税通知或 CRA 账户中的个人可扣除额度。32,490 加元的年度上限并不自动等于个人可用额度。若供款超过所填额度，全部供款都会减少现金，但仅扣除所填额度。本工具不计算超额供款罚款。',
      provinceHelp: '假设 2025 全年居住省区与工作省区相同。不涵盖跨省区或部分年度居民情况。',
      annualContributionHelp: 'CPP/QPP 和 EI 按合并就业收入进行标准化年度计算。多个雇主的实际预扣可能不同；超额供款可在评税后退还。',
      spendable: '支付 RRSP 供款后的可支配现金',
      beforeRrsp: '支付 RRSP 供款前的税后现金',
      rrspSaving: 'RRSP 扣除带来的估计所得税减少额',
      expenseHeading: '3. 每月支出及盈余或赤字'
    },
    hi: {
      title: '2025 कनाडाई वार्षिक रोज़गार आय और खर्च-योग्य नकदी का अनुमान',
      subtitle: 'अंतिम पूर्ण-वर्ष 2025 नियम · सामान्य कर्मचारी स्थितियाँ · सभी प्रांत और क्षेत्र',
      disclaimerTitle: 'दायरा और महत्वपूर्ण सीमाएँ',
      disclaimer: 'यह 19 से 64 वर्ष के एकल कर्मचारी के लिए 2025 का सरलीकृत वार्षिक अनुमान है, टैक्स रिटर्न, पेरोल विदहोल्डिंग गणना, या कर, कानूनी, पेरोल अथवा वित्तीय सलाह नहीं। वास्तविक कर कटौतियों, क्रेडिट, लाभ, निवास, वेतन आवृत्ति, व्यक्तिगत परिस्थितियों और CRA या Revenu Québec के आकलन पर निर्भर करता है। अपनी नवीनतम Notice of Assessment या CRA खाते में RRSP सीमा की पुष्टि करें। लाभांश, पूंजीगत लाभ और स्वरोज़गार को मॉडल नहीं किया गया है।',
      methodology: 'पद्धति, मान्यताएँ और आधिकारिक स्रोत',
      vacationHelp: 'प्रति घंटा वेतन में काम के सप्ताह सवेतन अवकाश को शामिल नहीं करते। सवेतन सप्ताह या प्रतिशत में से एक चुनें; दोनों कभी साथ लागू नहीं होते। वार्षिक वेतन में अवकाश भुगतान शामिल माना जाता है।',
      additionalHelp: 'केवल वह अतिरिक्त नकद रोज़गार मुआवज़ा दर्ज करें जो ऊपर पहले से दर्ज नहीं है। इसे CPP/QPP और EI में शामिल किया जाता है।',
      otherHelp: 'सामान्य दरों पर करयोग्य, पर CPP/QPP और EI से बाहर। लाभांश या पूंजीगत लाभ दर्ज न करें।',
      rrspHelp: 'अपनी नवीनतम Notice of Assessment या CRA खाते की व्यक्तिगत सीमा दर्ज करें। $32,490 की वार्षिक सीमा स्वतः आपकी उपलब्ध सीमा नहीं है। योगदान दर्ज सीमा से अधिक हो तो पूरा योगदान नकदी घटाता है, लेकिन केवल दर्ज सीमा की कटौती होती है। अधिक योगदान के दंड मॉडल नहीं किए गए हैं।',
      provinceHelp: 'पूरे 2025 में निवास और रोजगार का प्रांत या क्षेत्र समान माना गया है। बहु-क्षेत्र और आंशिक-वर्ष निवास दायरे से बाहर हैं।',
      annualContributionHelp: 'CPP/QPP और EI संयुक्त रोज़गार आय पर एक मानकीकृत वार्षिक गणना का उपयोग करते हैं। कई नियोक्ताओं के साथ वास्तविक स्रोत कटौतियाँ अलग हो सकती हैं; अतिरिक्त योगदान आकलन के बाद वापस मिल सकते हैं।',
      spendable: 'RRSP योगदान के बाद खर्च-योग्य नकदी',
      beforeRrsp: 'RRSP देने से पहले कर-पश्चात नकदी',
      rrspSaving: 'RRSP कटौती से अनुमानित आयकर कमी',
      expenseHeading: '3. मासिक खर्च और अधिशेष या घाटा'
    }
  };

  Object.assign(TRANSLATIONS.fr, {
    incomeHeading: '1. Revenu annuel et REER',
    payMethod: "Mode de saisie de l'emploi principal",
    hourly: 'Taux horaire',
    annual: 'Salaire annuel',
    hourlyRate: 'Taux horaire ($)',
    hoursPerWeek: 'Heures par semaine',
    workingWeeks: 'Semaines travaillées',
    annualSalary: 'Salaire annuel ($), vacances payées incluses',
    vacationMethod: "Méthode d'indemnisation des vacances",
    vacationNone: 'Aucune',
    vacationWeeksOption: 'Semaines de vacances payées',
    vacationPercentOption: 'Pourcentage de paie de vacances',
    paidVacationWeeks: 'Semaines de vacances payées',
    vacationPayPercent: 'Paie de vacances (%)',
    bonus: 'Prime annuelle ($)',
    allowance: 'Allocation imposable ($)',
    commission: 'Commission ($)',
    addJob: '+ Ajouter un deuxième emploi',
    secondJob: 'Deuxième emploi',
    payMethod2: 'Mode de saisie du deuxième emploi',
    removeJob: 'Supprimer le deuxième emploi',
    additionalEmployment: "Revenu d'emploi imposable supplémentaire ($)",
    otherIncome: 'Autre revenu ordinaire imposable ($)',
    rrspContribution: 'Cotisation REER financée en 2025 ($)',
    rrspLimit: 'Plafond de déduction REER disponible ($)',
    grossCash: 'Revenu brut en espèces',
    employmentIncome: "Revenu d'emploi",
    otherOrdinary: 'Autre revenu ordinaire',
    rrspDeduction: 'Déduction REER utilisée',
    taxableIncome: 'Revenu imposable fédéral',
    taxHeading: "2. Impôt sur le revenu et cotisations salariales de 2025",
    province: "Province ou territoire de résidence et d'emploi",
    provinceON: 'Ontario', provinceBC: 'Colombie-Britannique', provinceAB: 'Alberta', provinceSK: 'Saskatchewan', provinceMB: 'Manitoba',
    provinceQC: 'Québec — soutien limité', provinceNB: 'Nouveau-Brunswick', provinceNS: 'Nouvelle-Écosse', provincePE: 'Île-du-Prince-Édouard',
    provinceNL: 'Terre-Neuve-et-Labrador', provinceYT: 'Yukon', provinceNT: 'Territoires du Nord-Ouest', provinceNU: 'Nunavut',
    federalTax: 'Impôt fédéral sur le revenu',
    provTax: 'Impôt provincial ou territorial sur le revenu',
    taxPayroll: 'Impôt sur le revenu plus cotisations salariales',
    rrspCash: 'Cotisation REER',
    rent: 'Hypothèque ou loyer',
    carInsurance: 'Assurance automobile',
    commuting: 'Transport domicile-travail',
    phone: 'Internet et téléphone',
    groceries: 'Épicerie',
    loans: 'Autres assurances ou prêts',
    addExpense: '+ Ajouter une dépense personnalisée',
    monthlySpendable: 'Liquidités mensuelles disponibles',
    monthlyExpenses: 'Dépenses mensuelles',
    monthlySurplus: 'Excédent mensuel',
    monthlyDeficit: 'Déficit mensuel',
    weeklySurplus: 'Excédent hebdomadaire',
    weeklyDeficit: 'Déficit hebdomadaire',
    warningWeeks: "Emploi {job} : les semaines travaillées plus les semaines de vacances payées dépassent 52.",
    warningVacationConflict: "Emploi {job} : les semaines payées et le pourcentage ont tous deux été saisis; les semaines payées sont utilisées et le pourcentage est ignoré.",
    warningRrspLimitRequired: "Aucune déduction REER n'a été appliquée, car aucun plafond disponible n'a été saisi.",
    warningRrspLimitExceeded: 'La cotisation dépasse le plafond REER saisi; seul ce plafond est déduit, mais la cotisation entière réduit les liquidités.',
    warningRrspNetIncomeLimit: 'La déduction REER est limitée au revenu net estimé; la cotisation entière réduit toujours les liquidités.',
    warningQuebecLimited: "Le soutien du Québec couvre le revenu d'emploi de base, la déduction pour travailleurs, le RRQ, l'AE, le RQAP, l'impôt provincial et l'abattement fédéral. La prime d'assurance médicaments et les crédits dépendant de la situation ne sont pas modélisés.",
    warningQuebecOtherIncome: "Au Québec, un revenu autre que d'emploi peut entraîner des règles supplémentaires, notamment la cotisation au Fonds des services de santé, qui sont hors portée.",
    chartUnavailable: 'Graphique non disponible; les résultats numériques demeurent valides.',
    noCashActivity: 'Aucun mouvement de trésorerie',
    incomeTaxChart: 'Impôt sur le revenu',
    payrollChart: 'RPC/RRQ, AE et RQAP',
    rrspContributionChart: 'Cotisation REER',
    spendableCashChart: 'Liquidités disponibles',
    cashShortfall: 'Insuffisance de trésorerie',
    annualShortfallNote: "Les sorties dépassent le revenu brut en espèces; le graphique présente l'insuffisance comme une valeur positive.",
    annualAllocationNote: 'Répartition annuelle des liquidités; toutes les valeurs du graphique sont non négatives.',
    noMonthlyActivity: 'Aucun mouvement mensuel de trésorerie',
    spendableCashAvailable: 'Liquidités disponibles',
    monthlyDeficitNote: 'Les dépenses dépassent les liquidités mensuelles; le déficit est représenté comme une valeur positive.',
    monthlyAllocationNote: "Les liquidités mensuelles sont réparties entre les dépenses et l'excédent.",
    ontarioDetails: 'Surtaxe de l’Ontario {surtax}; prime-santé {healthPremium}.',
    quebecDetails: 'Revenu imposable du Québec après la déduction pour travailleurs : {taxableIncome}. Abattement fédéral : {abatement}.',
    customExpenseName: 'Nom de la dépense personnalisée',
    customExpenseAmount: 'Montant mensuel de la dépense personnalisée',
    expenseNamePlaceholder: 'Nom de la dépense',
    removeCustomExpense: 'Supprimer la dépense personnalisée',
    taxChartAria: 'Graphique de la répartition annuelle des liquidités',
    cashChartAria: 'Graphique des flux de trésorerie mensuels'
  });

  Object.assign(TRANSLATIONS['zh-CN'], {
    incomeHeading: '1. 年度收入与 RRSP',
    payMethod: '主要工作的薪酬输入方式',
    hourly: '时薪',
    annual: '年薪',
    hourlyRate: '时薪（加元）',
    hoursPerWeek: '每周工时',
    workingWeeks: '工作周数',
    annualSalary: '年薪（加元，含带薪休假）',
    vacationMethod: '休假补偿方式',
    vacationNone: '无',
    vacationWeeksOption: '带薪休假周数',
    vacationPercentOption: '休假工资百分比',
    paidVacationWeeks: '带薪休假周数',
    vacationPayPercent: '休假工资（%）',
    bonus: '年度奖金（加元）',
    allowance: '应税津贴（加元）',
    commission: '佣金（加元）',
    addJob: '+ 添加第二份工作',
    secondJob: '第二份工作',
    payMethod2: '第二份工作的薪酬输入方式',
    removeJob: '移除第二份工作',
    additionalEmployment: '额外应税就业收入（加元）',
    otherIncome: '其他按普通税率计税的收入（加元）',
    rrspContribution: '2025 年实际支付的 RRSP 供款（加元）',
    rrspLimit: '可用 RRSP 扣除额度（加元）',
    grossCash: '现金总收入',
    employmentIncome: '就业收入',
    otherOrdinary: '其他普通收入',
    rrspDeduction: '已使用的 RRSP 扣除额',
    taxableIncome: '联邦应税收入',
    taxHeading: '2. 2025 年所得税与雇员供款',
    province: '居住及就业所在省或地区',
    provinceON: '安大略省', provinceBC: '不列颠哥伦比亚省', provinceAB: '阿尔伯塔省', provinceSK: '萨斯喀彻温省', provinceMB: '曼尼托巴省',
    provinceQC: '魁北克省 — 有限支持', provinceNB: '新不伦瑞克省', provinceNS: '新斯科舍省', provincePE: '爱德华王子岛省',
    provinceNL: '纽芬兰与拉布拉多省', provinceYT: '育空地区', provinceNT: '西北地区', provinceNU: '努纳武特地区',
    federalTax: '联邦所得税',
    provTax: '省或地区所得税',
    taxPayroll: '所得税与工资供款合计',
    rrspCash: 'RRSP 供款',
    rent: '房贷或房租',
    carInsurance: '汽车保险',
    commuting: '通勤',
    phone: '网络与电话',
    groceries: '食品杂货',
    loans: '其他保险或贷款',
    addExpense: '+ 添加自定义支出',
    monthlySpendable: '每月可支配现金',
    monthlyExpenses: '每月支出',
    monthlySurplus: '每月盈余',
    monthlyDeficit: '每月赤字',
    weeklySurplus: '每周盈余',
    weeklyDeficit: '每周赤字',
    warningWeeks: '工作 {job}：工作周数与带薪休假周数之和超过 52。',
    warningVacationConflict: '工作 {job}：同时填写了带薪休假周数和休假工资百分比；计算采用周数并忽略百分比。',
    warningRrspLimitRequired: '由于未填写可用 RRSP 扣除额度，本次未应用 RRSP 扣除。',
    warningRrspLimitExceeded: '供款超过所填 RRSP 额度；仅扣除所填额度，但全部供款都会减少现金。',
    warningRrspNetIncomeLimit: 'RRSP 扣除额被限制为估计净收入；全部供款仍会减少现金。',
    warningQuebecLimited: '魁北克支持涵盖基本就业收入、工人扣除、QPP、EI、QPIP、省税和联邦减免。本工具不计算处方药保险费和取决于个人情况的抵免。',
    warningQuebecOtherIncome: '魁北克的非就业收入可能触发额外规则，包括卫生服务基金供款；这些不在本估算范围内。',
    chartUnavailable: '图表不可用；数值结果仍然有效。',
    noCashActivity: '无现金活动',
    incomeTaxChart: '所得税',
    payrollChart: 'CPP/QPP、EI 与 QPIP',
    rrspContributionChart: 'RRSP 供款',
    spendableCashChart: '可支配现金',
    cashShortfall: '现金缺口',
    annualShortfallNote: '现金流出超过现金总收入；图表以正数表示现金缺口。',
    annualAllocationNote: '年度现金分配；图表中的所有数值均为非负数。',
    noMonthlyActivity: '无每月现金活动',
    spendableCashAvailable: '可用的可支配现金',
    monthlyDeficitNote: '支出超过每月可支配现金；图表以正数表示赤字。',
    monthlyAllocationNote: '每月可支配现金分为支出与盈余。',
    ontarioDetails: '安大略附加税 {surtax}；安大略健康保费 {healthPremium}。',
    quebecDetails: '扣除工人扣除额后的魁北克应税收入：{taxableIncome}。联邦减免：{abatement}。',
    customExpenseName: '自定义支出名称',
    customExpenseAmount: '每月自定义支出金额',
    expenseNamePlaceholder: '支出名称',
    removeCustomExpense: '移除自定义支出',
    taxChartAria: '年度现金分配图',
    cashChartAria: '每月现金流图'
  });

  Object.assign(TRANSLATIONS.hi, {
    incomeHeading: '1. वार्षिक आय और RRSP',
    payMethod: 'मुख्य नौकरी का वेतन इनपुट',
    hourly: 'प्रति घंटा',
    annual: 'वार्षिक वेतन',
    hourlyRate: 'प्रति घंटा दर ($)',
    hoursPerWeek: 'प्रति सप्ताह घंटे',
    workingWeeks: 'काम किए गए सप्ताह',
    annualSalary: 'वार्षिक वेतन ($), सवेतन अवकाश सहित',
    vacationMethod: 'अवकाश मुआवज़ा विधि',
    vacationNone: 'कोई नहीं',
    vacationWeeksOption: 'सवेतन अवकाश सप्ताह',
    vacationPercentOption: 'अवकाश वेतन प्रतिशत',
    paidVacationWeeks: 'सवेतन अवकाश सप्ताह',
    vacationPayPercent: 'अवकाश वेतन (%)',
    bonus: 'वार्षिक बोनस ($)',
    allowance: 'करयोग्य भत्ता ($)',
    commission: 'कमीशन ($)',
    addJob: '+ दूसरी नौकरी जोड़ें',
    secondJob: 'दूसरी नौकरी',
    payMethod2: 'दूसरी नौकरी का वेतन इनपुट',
    removeJob: 'दूसरी नौकरी हटाएँ',
    additionalEmployment: 'अतिरिक्त करयोग्य रोज़गार आय ($)',
    otherIncome: 'अन्य सामान्य करयोग्य आय ($)',
    rrspContribution: '2025 में वित्तपोषित RRSP योगदान ($)',
    rrspLimit: 'उपलब्ध RRSP कटौती सीमा ($)',
    grossCash: 'सकल नकद आय',
    employmentIncome: 'रोज़गार आय',
    otherOrdinary: 'अन्य सामान्य आय',
    rrspDeduction: 'उपयोग की गई RRSP कटौती',
    taxableIncome: 'संघीय करयोग्य आय',
    taxHeading: '2. 2025 आयकर और कर्मचारी योगदान',
    province: 'निवास और रोज़गार का प्रांत या क्षेत्र',
    provinceON: 'ओंटारियो', provinceBC: 'ब्रिटिश कोलंबिया', provinceAB: 'अल्बर्टा', provinceSK: 'सस्केचेवान', provinceMB: 'मैनिटोबा',
    provinceQC: 'क्यूबेक — सीमित समर्थन', provinceNB: 'न्यू ब्रंसविक', provinceNS: 'नोवा स्कोटिया', provincePE: 'प्रिंस एडवर्ड आइलैंड',
    provinceNL: 'न्यूफ़ाउंडलैंड और लैब्राडोर', provinceYT: 'युकोन', provinceNT: 'नॉर्थवेस्ट टेरिटरीज़', provinceNU: 'नुनावुत',
    federalTax: 'संघीय आयकर',
    provTax: 'प्रांतीय या क्षेत्रीय आयकर',
    taxPayroll: 'आयकर और पेरोल योगदान',
    rrspCash: 'RRSP योगदान',
    rent: 'बंधक या किराया',
    carInsurance: 'वाहन बीमा',
    commuting: 'आवागमन',
    phone: 'इंटरनेट और फ़ोन',
    groceries: 'किराना',
    loans: 'अन्य बीमा या ऋण',
    addExpense: '+ कस्टम खर्च जोड़ें',
    monthlySpendable: 'मासिक खर्च-योग्य नकदी',
    monthlyExpenses: 'मासिक खर्च',
    monthlySurplus: 'मासिक अधिशेष',
    monthlyDeficit: 'मासिक घाटा',
    weeklySurplus: 'साप्ताहिक अधिशेष',
    weeklyDeficit: 'साप्ताहिक घाटा',
    warningWeeks: 'नौकरी {job}: काम के सप्ताह और सवेतन अवकाश सप्ताह मिलाकर 52 से अधिक हैं।',
    warningVacationConflict: 'नौकरी {job}: सवेतन सप्ताह और अवकाश वेतन प्रतिशत दोनों दर्ज किए गए; सप्ताह उपयोग किए गए और प्रतिशत अनदेखा किया गया।',
    warningRrspLimitRequired: 'उपलब्ध RRSP कटौती सीमा दर्ज न होने के कारण कोई RRSP कटौती लागू नहीं की गई।',
    warningRrspLimitExceeded: 'योगदान दर्ज RRSP सीमा से अधिक है; केवल दर्ज सीमा की कटौती होती है, लेकिन पूरा योगदान नकदी घटाता है।',
    warningRrspNetIncomeLimit: 'RRSP कटौती अनुमानित शुद्ध आय तक सीमित है; पूरा योगदान फिर भी नकदी घटाता है।',
    warningQuebecLimited: 'क्यूबेक समर्थन में मूल रोज़गार आय, कर्मचारी कटौती, QPP, EI, QPIP, प्रांतीय कर और संघीय छूट शामिल हैं। प्रिस्क्रिप्शन दवा बीमा प्रीमियम और परिस्थिति-आधारित क्रेडिट मॉडल नहीं किए गए हैं।',
    warningQuebecOtherIncome: 'क्यूबेक में रोज़गार के अलावा आय पर अतिरिक्त नियम लागू हो सकते हैं, जिनमें स्वास्थ्य सेवा निधि योगदान शामिल है; ये इस अनुमान के दायरे से बाहर हैं।',
    chartUnavailable: 'चार्ट उपलब्ध नहीं है; संख्यात्मक परिणाम वैध हैं।',
    noCashActivity: 'कोई नकद गतिविधि नहीं',
    incomeTaxChart: 'आयकर',
    payrollChart: 'CPP/QPP, EI और QPIP',
    rrspContributionChart: 'RRSP योगदान',
    spendableCashChart: 'खर्च-योग्य नकदी',
    cashShortfall: 'नकदी की कमी',
    annualShortfallNote: 'नकद बहिर्वाह सकल नकद आय से अधिक है; चार्ट कमी को धनात्मक मान के रूप में दिखाता है।',
    annualAllocationNote: 'वार्षिक नकद आवंटन; चार्ट के सभी मान गैर-ऋणात्मक हैं।',
    noMonthlyActivity: 'कोई मासिक नकद गतिविधि नहीं',
    spendableCashAvailable: 'उपलब्ध खर्च-योग्य नकदी',
    monthlyDeficitNote: 'खर्च मासिक खर्च-योग्य नकदी से अधिक हैं; घाटे को धनात्मक मान के रूप में दिखाया गया है।',
    monthlyAllocationNote: 'मासिक खर्च-योग्य नकदी खर्च और अधिशेष में विभाजित है।',
    ontarioDetails: 'ओंटारियो अधिभार {surtax}; स्वास्थ्य प्रीमियम {healthPremium}।',
    quebecDetails: 'कर्मचारी कटौती के बाद क्यूबेक करयोग्य आय: {taxableIncome}। संघीय छूट: {abatement}।',
    customExpenseName: 'कस्टम खर्च का नाम',
    customExpenseAmount: 'मासिक कस्टम खर्च राशि',
    expenseNamePlaceholder: 'खर्च का नाम',
    removeCustomExpense: 'कस्टम खर्च हटाएँ',
    taxChartAria: 'वार्षिक नकद आवंटन चार्ट',
    cashChartAria: 'मासिक नकदी प्रवाह चार्ट'
  });

  const ENGLISH_DYNAMIC = Object.freeze({
    monthlySurplus: 'Monthly surplus', monthlyDeficit: 'Monthly deficit', weeklySurplus: 'Weekly surplus', weeklyDeficit: 'Weekly deficit',
    warningWeeks: 'Job {job}: Working weeks plus paid vacation weeks exceed 52.',
    warningVacationConflict: 'Job {job}: Paid vacation weeks and vacation-pay percentage were both entered; paid weeks were used and the percentage was ignored.',
    warningRrspLimitRequired: 'No RRSP deduction was applied because an available deduction limit was not entered.',
    warningRrspLimitExceeded: 'The contribution exceeds the entered available RRSP deduction limit; only the available limit was deducted, while the full contribution reduces spendable cash.',
    warningRrspNetIncomeLimit: 'The RRSP deduction was limited to estimated net income; the full contribution still reduces spendable cash.',
    warningQuebecLimited: 'Quebec support covers basic employment income, the worker deduction, QPP, EI, QPIP, provincial tax and the federal abatement. The Quebec prescription drug insurance premium and situation-dependent credits are not modeled.',
    warningQuebecOtherIncome: 'Quebec income other than employment may trigger additional rules, including the health services fund contribution, that are outside this estimate.',
    chartUnavailable: 'Chart unavailable; numeric results remain valid.', noCashActivity: 'No cash activity', incomeTaxChart: 'Income tax',
    payrollChart: 'CPP/QPP, EI and QPIP', rrspContributionChart: 'RRSP contribution', spendableCashChart: 'Spendable cash', cashShortfall: 'Cash shortfall',
    annualShortfallNote: 'Outflows exceed gross cash income; the chart shows the shortfall as a positive magnitude.',
    annualAllocationNote: 'Annual cash allocation; all chart values are non-negative.', noMonthlyActivity: 'No monthly cash activity',
    spendableCashAvailable: 'Spendable cash available', monthlyDeficitNote: 'Expenses exceed monthly spendable cash; the deficit is charted as a positive magnitude.',
    monthlyAllocationNote: 'Monthly spendable cash is divided between expenses and surplus.',
    ontarioDetails: 'Ontario surtax {surtax}; health premium {healthPremium}.',
    quebecDetails: 'Quebec taxable income after worker deduction: {taxableIncome}. Federal abatement: {abatement}.',
    customExpenseName: 'Custom expense name', customExpenseAmount: 'Monthly custom expense amount', expenseNamePlaceholder: 'Expense name',
    removeCustomExpense: 'Remove custom expense', taxChartAria: 'Annual cash allocation chart', cashChartAria: 'Monthly cash flow chart'
  });

  let currentLanguage = 'en';
  let secondJobEnabled = false;
  let taxChart = null;
  let cashChart = null;
  let customExpenseCount = 0;
  let updateQueued = false;

  const LANGUAGE_STORAGE_KEY = 'taxPlannerLanguage';
  const WARNING_TRANSLATION_KEYS = Object.freeze({
    WEEKS_OVER_52: 'warningWeeks',
    VACATION_METHOD_CONFLICT: 'warningVacationConflict',
    RRSP_LIMIT_REQUIRED: 'warningRrspLimitRequired',
    RRSP_LIMIT_EXCEEDED: 'warningRrspLimitExceeded',
    RRSP_NET_INCOME_LIMIT: 'warningRrspNetIncomeLimit',
    QUEBEC_LIMITED_SUPPORT: 'warningQuebecLimited',
    QUEBEC_OTHER_INCOME_LIMITATION: 'warningQuebecOtherIncome'
  });

  function translate(key, replacements) {
    const languageValue = TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][key];
    let value = languageValue || ENGLISH_DYNAMIC[key] || key;
    Object.keys(replacements || {}).forEach(function (replacement) {
      value = value.split('{' + replacement + '}').join(replacements[replacement]);
    });
    return value;
  }

  function applyTranslations() {
    $$('[data-i18n]').forEach(function (element) {
      if (!element.dataset.i18nDefault) element.dataset.i18nDefault = element.textContent;
      const languageValue = TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][element.dataset.i18n];
      element.textContent = languageValue || element.dataset.i18nDefault;
    });
    $$('[data-i18n-placeholder]').forEach(function (element) {
      if (!element.dataset.i18nPlaceholderDefault) element.dataset.i18nPlaceholderDefault = element.getAttribute('placeholder') || '';
      const languageValue = TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][element.dataset.i18nPlaceholder];
      element.setAttribute('placeholder', languageValue || element.dataset.i18nPlaceholderDefault);
    });
    $$('[data-i18n-aria-label]').forEach(function (element) {
      if (!element.dataset.i18nAriaLabelDefault) element.dataset.i18nAriaLabelDefault = element.getAttribute('aria-label') || '';
      const languageValue = TRANSLATIONS[currentLanguage] && TRANSLATIONS[currentLanguage][element.dataset.i18nAriaLabel];
      element.setAttribute('aria-label', languageValue || element.dataset.i18nAriaLabelDefault);
    });
  }

  function isSupportedLanguage(language) {
    return language === 'en' || Object.prototype.hasOwnProperty.call(TRANSLATIONS, language);
  }

  function storedLanguage() {
    try {
      const language = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      return isSupportedLanguage(language) ? language : 'en';
    } catch (error) {
      return 'en';
    }
  }

  function setLanguage(language) {
    currentLanguage = isSupportedLanguage(language) ? language : 'en';
    document.documentElement.lang = currentLanguage;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLanguage);
    } catch (error) {
      // The calculator still works when storage is unavailable.
    }
    applyTranslations();
    update();
  }

  function jobInput(suffix) {
    const method = byId('vacationMethod' + suffix).value;
    return {
      mode: selected('mode' + suffix),
      hourlyRate: numberValue('hourlyRate' + suffix),
      hoursPerWeek: numberValue('hoursPerWeek' + suffix),
      workingWeeks: numberValue('weeksPerYear' + suffix),
      annualSalary: numberValue('annualSalary' + suffix),
      paidVacationWeeks: method === 'weeks' ? numberValue('paidVacationWeeks' + suffix) : 0,
      vacationPayPercent: method === 'percent' ? numberValue('vacationPayPercent' + suffix) : 0,
      bonus: numberValue('bonusVal' + suffix),
      allowance: numberValue('allowanceVal' + suffix),
      commission: numberValue('commissionVal' + suffix)
    };
  }

  function monthlyExpenses() {
    const values = {
      rent: numberValue('expRent'),
      carInsurance: numberValue('expCarIns'),
      commuting: numberValue('expTransit'),
      phone: numberValue('expInternet'),
      groceries: numberValue('expGrocery'),
      loans: numberValue('expLoan')
    };
    $$('.custom-expense-amount').forEach(function (input, index) {
      values['custom' + index] = Number(input.value) > 0 ? Number(input.value) : 0;
    });
    return values;
  }

  function calculatorInput() {
    const limitInput = byId('rrspLimit').value.trim();
    const jobs = [jobInput('')];
    if (secondJobEnabled) jobs.push(jobInput('2'));
    return {
      provinceCode: byId('province').value,
      jobs: jobs,
      additionalEmploymentIncome: numberValue('additionalEmploymentIncome'),
      otherOrdinaryIncome: numberValue('otherOrdinaryIncome'),
      rrspContribution: numberValue('rrspContribution'),
      availableRrspDeductionLimit: limitInput === '' ? undefined : Number(limitInput),
      monthlyExpenses: monthlyExpenses()
    };
  }

  function setMoney(id, value) {
    byId(id).textContent = currency.format(value);
  }

  function renderWarnings(result) {
    const box = byId('validationWarnings');
    byId('rrspContribution').removeAttribute('aria-invalid');
    byId('rrspLimit').removeAttribute('aria-invalid');
    ['', '2'].forEach(function (suffix) {
      byId('weeksPerYear' + suffix).removeAttribute('aria-invalid');
      byId('paidVacationWeeks' + suffix).removeAttribute('aria-invalid');
    });
    if (!result.warnings.length) {
      box.replaceChildren();
      box.classList.add('hidden');
      return;
    }
    const list = document.createElement('ul');
    list.className = 'list-disc pl-5 space-y-1';
    result.warnings.forEach(function (warning) {
      const item = document.createElement('li');
      const translationKey = WARNING_TRANSLATION_KEYS[warning.code];
      item.textContent = translationKey
        ? translate(translationKey, { job: String((warning.jobIndex || 0) + 1) })
        : warning.message;
      list.appendChild(item);
      if (warning.code.indexOf('RRSP_') === 0) {
        byId('rrspContribution').setAttribute('aria-invalid', 'true');
        byId('rrspLimit').setAttribute('aria-invalid', 'true');
      }
      if (warning.code === 'WEEKS_OVER_52') {
        const suffix = warning.jobIndex === 1 ? '2' : '';
        byId('weeksPerYear' + suffix).setAttribute('aria-invalid', 'true');
        byId('paidVacationWeeks' + suffix).setAttribute('aria-invalid', 'true');
      }
    });
    box.replaceChildren(list);
    box.classList.remove('hidden');
  }

  function chartDefaults() {
    return {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#e5e7eb' } },
        tooltip: { callbacks: { label: function (context) { return context.label + ': ' + currency.format(context.parsed); } } }
      }
    };
  }

  function renderTaxChart(result) {
    if (typeof Chart === 'undefined') {
      byId('taxChartNote').textContent = translate('chartUnavailable');
      return;
    }
    let labels;
    let data;
    let colors;
    if (result.grossCashIncome === 0 && result.rrspContribution === 0) {
      labels = [translate('noCashActivity')];
      data = [1];
      colors = ['#3f3f46'];
    } else if (result.spendableCashAfterRrsp >= 0) {
      labels = [translate('incomeTaxChart'), translate('payrollChart'), translate('rrspContributionChart'), translate('spendableCashChart')];
      data = [result.incomeTax, result.payrollContributions, result.rrspContribution, result.spendableCashAfterRrsp];
      colors = ['#ef4444', '#f97316', '#60a5fa', '#22c55e'];
    } else {
      labels = [translate('incomeTaxChart'), translate('payrollChart'), translate('rrspContributionChart'), translate('cashShortfall')];
      data = [result.incomeTax, result.payrollContributions, result.rrspContribution, Math.abs(result.spendableCashAfterRrsp)];
      colors = ['#ef4444', '#f97316', '#60a5fa', '#f87171'];
    }
    if (taxChart) taxChart.destroy();
    taxChart = new Chart(byId('taxDonut'), { type: 'doughnut', data: { labels: labels, datasets: [{ data: data, backgroundColor: colors, borderWidth: 0 }] }, options: chartDefaults() });
    byId('taxChartNote').textContent = result.spendableCashAfterRrsp < 0
      ? translate('annualShortfallNote')
      : translate('annualAllocationNote');
  }

  function renderCashChart(result) {
    if (typeof Chart === 'undefined') {
      byId('cashChartNote').textContent = translate('chartUnavailable');
      return;
    }
    const deficit = result.monthlySurplus < 0;
    let labels;
    let data;
    let colors;
    if (result.monthlyExpenses === 0 && result.monthlySpendableCash === 0) {
      labels = [translate('noMonthlyActivity')];
      data = [1];
      colors = ['#3f3f46'];
    } else if (deficit) {
      labels = [translate('spendableCashAvailable'), translate('monthlyDeficit')];
      data = [Math.max(0, result.monthlySpendableCash), Math.abs(result.monthlySurplus)];
      colors = ['#60a5fa', '#f87171'];
    } else {
      labels = [translate('monthlyExpenses'), translate('monthlySurplus')];
      data = [result.monthlyExpenses, result.monthlySurplus];
      colors = ['#fb7185', '#22c55e'];
    }
    if (cashChart) cashChart.destroy();
    cashChart = new Chart(byId('leftDonut'), { type: 'doughnut', data: { labels: labels, datasets: [{ data: data, backgroundColor: colors, borderWidth: 0 }] }, options: chartDefaults() });
    byId('cashChartNote').textContent = deficit
      ? translate('monthlyDeficitNote')
      : translate('monthlyAllocationNote');
  }

  function render(result) {
    setMoney('outAnnualGross', result.grossCashIncome);
    setMoney('outEmploymentIncome', result.employmentIncome);
    setMoney('outOtherIncome', result.otherOrdinaryIncome);
    setMoney('outRrspDeduction', result.rrspDeduction);
    setMoney('outTaxableIncome', result.taxableIncome);
    setMoney('outFedTax', result.federalIncomeTax);
    setMoney('outProvTax', result.provincialIncomeTax);
    setMoney('outCPPQPP', result.cppOrQpp);
    setMoney('outEI', result.employeeEi);
    setMoney('outQPIP', result.employeeQpip);
    setMoney('outTotalDeductions', result.incomeTaxPlusPayrollContributions);
    setMoney('outRrspSaving', result.rrspIncomeTaxReduction);
    setMoney('outAfterTaxBeforeRrsp', result.afterTaxCashBeforeRrsp);
    setMoney('outRrspContribution', result.rrspContribution);
    setMoney('outSpendable', result.spendableCashAfterRrsp);
    setMoney('outMonthlyNet', result.monthlySpendableCash);
    setMoney('outMonthlyExp', result.monthlyExpenses);
    setMoney('outMonthlyLeft', result.monthlySurplus);
    setMoney('outWeeklyLeft', result.weeklySurplus);

    byId('cppLabel').textContent = result.pensionPlan;
    byId('qpipCard').classList.toggle('hidden', result.provinceCode !== 'QC');
    const provincialDetails = [];
    if (result.provinceCode === 'ON') provincialDetails.push(translate('ontarioDetails', {
      surtax: currency.format(result.ontarioSurtax),
      healthPremium: currency.format(result.ontarioHealthPremium)
    }));
    if (result.provinceCode === 'QC') provincialDetails.push(translate('quebecDetails', {
      taxableIncome: currency.format(result.provincialTaxableIncome),
      abatement: currency.format(result.federalQuebecAbatement)
    }));
    byId('outProvDetails').textContent = provincialDetails.join(' ');

    const deficit = result.monthlySurplus < 0;
    byId('monthlyFlowLabel').textContent = translate(deficit ? 'monthlyDeficit' : 'monthlySurplus');
    byId('weeklyFlowLabel').textContent = translate(deficit ? 'weeklyDeficit' : 'weeklySurplus');
    byId('cashFlowResults').classList.toggle('deficit-state', deficit);
    byId('outMonthlyLeft').classList.toggle('text-red-400', deficit);
    byId('outMonthlyLeft').classList.toggle('text-accent', !deficit);
    byId('outWeeklyLeft').classList.toggle('text-red-300', deficit);

    renderWarnings(result);
    renderTaxChart(result);
    renderCashChart(result);
  }

  function update() {
    if (!byId('calculator')) return;
    render(engine.calculateEstimate(calculatorInput()));
  }

  function queueUpdate() {
    if (updateQueued) return;
    updateQueued = true;
    requestAnimationFrame(function () {
      updateQueued = false;
      update();
    });
  }

  function syncPayMode(suffix) {
    const annual = selected('mode' + suffix) === 'annual';
    byId('hourlyFields' + suffix).classList.toggle('hidden', annual);
    byId('annualField' + suffix).classList.toggle('hidden', !annual);
    byId('vacationFields' + suffix).classList.toggle('hidden', annual);
  }

  function syncVacation(suffix) {
    const method = byId('vacationMethod' + suffix).value;
    byId('paidVacationWrap' + suffix).classList.toggle('hidden', method !== 'weeks');
    byId('vacationPercentWrap' + suffix).classList.toggle('hidden', method !== 'percent');
  }

  function addCustomExpense() {
    customExpenseCount += 1;
    const row = document.createElement('div');
    const nameId = 'customName' + customExpenseCount;
    const amountId = 'customAmount' + customExpenseCount;
    row.className = 'grid grid-cols-[1fr_8rem_auto] gap-2 items-center';
    row.innerHTML = '<label class="sr-only" data-i18n="customExpenseName" for="' + nameId + '">' + translate('customExpenseName') + '</label>' +
      '<input id="' + nameId + '" type="text" data-i18n-placeholder="expenseNamePlaceholder" placeholder="' + translate('expenseNamePlaceholder') + '" class="rounded-md bg-zinc-800 px-3 py-2 focus:ring-accent">' +
      '<label class="sr-only" data-i18n="customExpenseAmount" for="' + amountId + '">' + translate('customExpenseAmount') + '</label>' +
      '<input id="' + amountId + '" type="number" min="0" step="10" value="0" class="custom-expense-amount rounded-md bg-zinc-800 px-3 py-2 focus:ring-accent">' +
      '<button type="button" class="remove-custom rounded-md bg-white/10 px-3 py-2" data-i18n-aria-label="removeCustomExpense" aria-label="' + translate('removeCustomExpense') + '">×</button>';
    row.querySelector('.remove-custom').addEventListener('click', function () { row.remove(); queueUpdate(); });
    row.querySelector('.custom-expense-amount').addEventListener('input', queueUpdate);
    byId('customList').appendChild(row);
  }

  function initialize() {
    const navButton = byId('nav-toggle');
    const navDrawer = byId('nav-drawer');
    navButton.addEventListener('click', function () {
      const opening = navDrawer.classList.contains('hidden');
      navDrawer.classList.toggle('hidden', !opening);
      navButton.setAttribute('aria-expanded', String(opening));
    });
    $$('[data-lang]').forEach(function (link) {
      link.addEventListener('click', function (event) { event.preventDefault(); setLanguage(link.dataset.lang); });
    });
    $$('input[name="mode"], input[name="mode2"]').forEach(function (radio) {
      radio.addEventListener('change', function () { syncPayMode(radio.name === 'mode2' ? '2' : ''); queueUpdate(); });
    });
    byId('vacationMethod').addEventListener('change', function () { syncVacation(''); queueUpdate(); });
    byId('vacationMethod2').addEventListener('change', function () { syncVacation('2'); queueUpdate(); });
    byId('btnToggleJob2').addEventListener('click', function () {
      secondJobEnabled = true;
      byId('job2Wrap').classList.remove('hidden');
      byId('btnToggleJob2').classList.add('hidden');
      byId('btnToggleJob2').setAttribute('aria-expanded', 'true');
      queueUpdate();
    });
    byId('btnRemoveJob2').addEventListener('click', function () {
      secondJobEnabled = false;
      byId('job2Wrap').classList.add('hidden');
      byId('btnToggleJob2').classList.remove('hidden');
      byId('btnToggleJob2').setAttribute('aria-expanded', 'false');
      queueUpdate();
    });
    byId('btnAddCustom').addEventListener('click', addCustomExpense);
    byId('calculator').addEventListener('input', queueUpdate);
    byId('calculator').addEventListener('change', queueUpdate);
    window.addEventListener('scroll', function () {
      const root = document.documentElement;
      const maximum = root.scrollHeight - root.clientHeight;
      byId('progress').style.width = (maximum > 0 ? root.scrollTop / maximum * 100 : 0) + '%';
    }, { passive: true });
    syncPayMode('');
    syncPayMode('2');
    syncVacation('');
    syncVacation('2');
    setLanguage(storedLanguage());
  }

  document.addEventListener('DOMContentLoaded', initialize);
})();
