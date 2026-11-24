/* ETRANOM Arcane Mage specialization data. Turn-based/text combat: no spatial ranges or meters. */
export const ARCANE_MAGE = {
  id: 'wizard_arcane_mage', classId: 'wizard', className: 'جادوگر', specialization: 'آرکین‌میج', specializationEn: 'Arcane Mage', version: 1,
  identity: {
    role: 'آسیب جادویی، کنترل نوبتی میدان نبرد، دفاع انرژی و انفجارهای آرکین',
    resource: 'مانا', secondaryResource: 'شارژ آرکین', maxCharges: 5,
    strengths: ['آسیب جادویی بالا','آسیب به چند دشمن','کنترل نوبتی دشمنان','سپر و دفاع جادویی','ترکیب مهارت‌ها با پژواک'],
    weaknesses: ['وابستگی به مانا','دفاع فیزیکی پایه پایین','نیاز به مدیریت شارژ','خنک‌شدن نسبتاً طولانی مهارت‌های بزرگ'],
    attributes: { primary: 'intellect', secondary: ['perception','vitality','endurance'], description: 'هوش قدرت جادویی و مانا را افزایش می‌دهد؛ ادراک دقت جادو را تقویت می‌کند؛ سرزندگی و استقامت برای بقا مفیدند.' }
  },
  combatRules: {
    mode: 'turn_based_text', distance: false, targeting: 'هدف انتخابی، همه دشمنان یا خود بازیکن؛ هیچ برد یا شعاع مکانی وجود ندارد.',
    turnDuration: 'تمام مدت‌ها با تعداد نوبت بیان می‌شوند.', cooldownUnit: 'نوبت بازیکن',
    charges: { max: 5, expireOutsideCombat: true, outsideCombatExpirySeconds: 20, overflow: 'شارژ اضافه ذخیره نمی‌شود.' },
    manaCostBasis: 'درصدی از حداکثر مانای مؤثر شخصیت؛ هزینه نهایی رو به بالا گرد می‌شود.',
    apFormula: 'قدرت جادویی مؤثر = هوش مؤثر × ضریب جادویی تخصص + پاداش تجهیزات و استعدادها؛ موتور نبرد باید از یک محاسبه‌گر مشترک استفاده کند.',
    control: 'کنترل کامل روی باس‌ها اعمال نمی‌شود؛ اثر آن به کاهش آسیب/قدرت محدود تبدیل می‌شود.'
  },
  skills: [
    {id:'arcane_bolt',name:'گلوله آرکین',en:'Arcane Bolt',unlockLevel:1,type:'single_damage',target:'یک دشمن انتخابی',manaPct:3,cooldownTurns:0,chargeGain:1,damagePct:130,description:'یک گلوله فشرده از انرژی آرکین به هدف شلیک می‌کند. در صورت اصابت یک شارژ آرکین تولید می‌شود.',upgrades:[
      {damagePct:145,description:'آسیب به ۱۴۵٪ قدرت جادویی افزایش می‌یابد.'},{damagePct:160,description:'آسیب به ۱۶۰٪ قدرت جادویی افزایش می‌یابد.'},{accuracyBonus:5,description:'دقت این مهارت ۵ واحد درصد افزایش می‌یابد؛ سرعت پرتاب در نبرد نوبتی اثری ندارد.'},{critBonus:5,description:'شانس ضربه بحرانی جادویی ۵ واحد درصد افزایش می‌یابد.'},{extraChargeChance:15,description:'۱۵٪ احتمال دارد پس از اصابت، یک شارژ آرکین اضافه تولید شود.'},{damagePct:210,defensePenetrationPct:20,description:'آسیب به ۲۱۰٪ می‌رسد و ۲۰٪ دفاع جادویی هدف نادیده گرفته می‌شود.'}]},
    {id:'arcane_shield',name:'سپر آرکین',en:'Arcane Shield',unlockLevel:2,type:'shield',target:'خود بازیکن',manaPct:8,cooldownTurns:3,durationTurns:2,shieldPct:180,description:'پوششی از انرژی آرکین ایجاد می‌کند که تا پایان دو نوبت دشمن یا تخلیه کامل، آسیب را جذب می‌کند.',upgrades:[
      {shieldPct:210,description:'قدرت جذب به ۲۱۰٪ قدرت جادویی افزایش می‌یابد.'},{durationTurns:3,description:'سپر تا سه نوبت دشمن باقی می‌ماند.'},{shieldPct:250,description:'قدرت جذب به ۲۵۰٪ افزایش می‌یابد.'},{damageReductionPct:10,description:'تا وقتی سپر پابرجاست، آسیب دریافتی ۱۰٪ کاهش می‌یابد.'},{reflectPct:10,description:'۱۰٪ آسیب جذب‌شده به مهاجم بازتاب داده می‌شود.'},{shieldPct:350,cleanseCount:1,description:'جذب به ۳۵۰٪ می‌رسد و یک اثر منفی قابل پاک‌سازی حذف می‌شود.'}]},
    {id:'arcane_explosion',name:'انفجار آرکین',en:'Arcane Explosion',unlockLevel:3,type:'all_damage',target:'تمام دشمنان زنده',manaPct:9,cooldownTurns:2,chargeCost:2,damagePct:100,description:'انرژی آرکین را در میدان نبرد منفجر می‌کند و به همه دشمنان زنده آسیب می‌زند؛ در نبرد متنی هیچ شعاع یا فاصله‌ای بررسی نمی‌شود.',upgrades:[
      {damagePct:120,description:'آسیب به ۱۲۰٪ قدرت جادویی افزایش می‌یابد.'},{damagePct:140,description:'آسیب به ۱۴۰٪ قدرت جادویی افزایش می‌یابد.'},{secondWavePct:30,description:'پس از موج نخست، موج دوم با ۳۰٪ آسیب پایه به همه دشمنان می‌رسد.'},{critBonus:10,description:'شانس ضربه بحرانی این مهارت ۱۰ واحد درصد افزایش می‌یابد.'},{damagePct:170,description:'آسیب موج اصلی به ۱۷۰٪ افزایش می‌یابد.'},{damagePct:200,secondWavePct:30,description:'آسیب موج اصلی به ۲۰۰٪ و موج دوم حفظ می‌شود.'}]},
    {id:'arcane_blink',name:'لغزش آرکین',en:'Arcane Blink',unlockLevel:4,type:'evasion_counter',target:'خود بازیکن',manaPct:5,cooldownTurns:2,evadeNextAttack:true,description:'آرکین‌میج با لغزشی جادویی از حمله بعدی دشمن می‌گریزد. در نبرد نوبتی هیچ جابه‌جایی، مختصات یا فاصله مکانی ثبت نمی‌شود.',upgrades:[
      {evasionDurationTurns:2,description:'جاخالی می‌تواند دو اقدام تهاجمی دشمن را خنثی کند.'},{cooldownTurns:1,description:'خنک‌شدن به یک نوبت کاهش می‌یابد.'},{counterDamagePct:50,description:'پس از جاخالی، موج بازگشتی با ۵۰٪ قدرت جادویی به مهاجم آسیب می‌زند.'},{nextSpellDamagePct:10,description:'مهارت تهاجمی بعدی ۱۰٪ آسیب بیشتر وارد می‌کند.'},{counterDamagePct:75,description:'موج بازگشتی پس از جاخالی به ۷۵٪ قدرت جادویی افزایش می‌یابد.'},{shieldPct:100,description:'پس از جاخالی، سپری برابر ۱۰۰٪ قدرت جادویی برای یک نوبت دشمن ایجاد می‌شود.'}]},
    {id:'ancient_rune',name:'نشان باستانی',en:'Ancient Rune',unlockLevel:5,type:'all_control_damage',target:'تمام دشمنان زنده',manaPct:8,cooldownTurns:3,damagePct:50,slowTurns:2,enemyAttackReductionPct:20,description:'مهر باستانی روی همه دشمنان زنده نقش می‌بندد؛ در دو نوبت بعدی قدرت حمله آن‌ها کاهش می‌یابد و هنگام پایان نشان، آسیب پایانی وارد می‌شود.',upgrades:[
      {durationTurns:3,description:'مدت نشان و اثر تضعیف به سه نوبت دشمن افزایش می‌یابد.'},{enemyAttackReductionPct:30,description:'قدرت حمله دشمنان عادی ۳۰٪ کاهش می‌یابد.'},{damagePct:75,description:'آسیب اولیه به ۷۵٪ قدرت جادویی می‌رسد.'},{allEnemyDamageBonusPct:10,description:'آسیب نشان روی همه دشمنان ۱۰٪ بیشتر می‌شود.'},{stunChance:20,stunTurns:1,description:'۲۰٪ احتمال دارد دشمن عادی برای یک نوبت از اقدام بازبماند؛ باس فقط تضعیف می‌شود.'},{finalDamagePct:150,description:'هنگام پایان نشان، همه دشمنان ۱۵۰٪ قدرت جادویی آسیب می‌بینند.'}]},
    {id:'prismatic_lance',name:'نیزه منشوری',en:'Prismatic Lance',unlockLevel:6,type:'multi_target_damage',target:'تا پنج دشمن زنده به ترتیب انتخاب موتور نبرد',manaPct:12,cooldownTurns:2,chargeCost:1,damagePct:190,description:'نیزه‌ای منشوری از انرژی آرکین چند دشمن را به‌ترتیب هدف می‌گیرد. در نبرد متنی، تعداد هدف‌ها جایگزین مفهوم مسیر و فاصله است.',upgrades:[
      {damagePct:210,description:'آسیب پایه به ۲۱۰٪ افزایش می‌یابد.'},{maxTargets:4,description:'تعداد اهداف از سه به چهار افزایش می‌یابد.'},{damagePct:240,description:'آسیب پایه به ۲۴۰٪ افزایش می‌یابد.'},{defenseDownPct:15,defenseDownTurns:2,description:'دفاع جادویی اهداف برای دو نوبت ۱۵٪ کاهش می‌یابد.'},{lastTargetBurstPct:50,description:'هدف آخر یک انفجار اضافه با ۵۰٪ قدرت جادویی دریافت می‌کند.'},{damagePct:300,maxTargets:5,description:'آسیب به ۳۰۰٪ و تعداد اهداف به پنج افزایش می‌یابد.'}]},
    {id:'arcane_echo',name:'پژواک جادویی',en:'Arcane Echo',unlockLevel:7,type:'repeat_last_spell',target:'تکرار آخرین مهارت تهاجمی مجاز',manaPct:10,cooldownTurns:4,repeatPct:40,description:'آخرین مهارت تهاجمی مجاز را با درصدی از قدرت اصلی دوباره اجرا می‌کند. پژواک شارژ تولید نمی‌کند و خودش، مهارت تعالی‌یافته و قلمرو را تکرار نمی‌کند.',upgrades:[
      {repeatPct:45,description:'قدرت پژواک به ۴۵٪ می‌رسد.'},{repeatPct:50,description:'قدرت پژواک به ۵۰٪ می‌رسد.'},{cooldownTurns:3,description:'خنک‌شدن به سه نوبت کاهش می‌یابد.'},{repeatPct:60,description:'قدرت پژواک به ۶۰٪ می‌رسد.'},{repeatSideEffectsPct:50,description:'نیمی از اثرات جانبی قابل تکرار مهارت نیز بازاجرا می‌شوند.'},{repeatPct:80,description:'قدرت پژواک به ۸۰٪ می‌رسد.'}]},
    {id:'gravity_well',name:'چاه گرانشی',en:'Gravity Well',unlockLevel:8,type:'all_dot_control',target:'تمام دشمنان زنده',manaPct:15,cooldownTurns:4,chargeCost:2,dotPct:45,dotTurns:3,enemyAttackReductionPct:15,description:'میدان گرانشی نوبتی ایجاد می‌کند؛ همه دشمنان برای سه نوبت آسیب تدریجی می‌گیرند و قدرت حمله‌شان کاهش می‌یابد. باس‌ها کشیده یا متوقف نمی‌شوند.',upgrades:[
      {dotTurns:4,description:'مدت آسیب تدریجی به چهار نوبت افزایش می‌یابد.'},{enemyAttackReductionPct:20,description:'قدرت حمله دشمنان ۲۰٪ کاهش می‌یابد.'},{dotPct:55,description:'آسیب هر نوبت به ۵۵٪ قدرت جادویی افزایش می‌یابد.'},{allEnemyDamageBonusPct:10,description:'آسیب چاه گرانشی به همه دشمنان ۱۰٪ افزایش می‌یابد.'},{enemyAttackReductionPct:25,description:'کاهش قدرت حمله دشمنان به ۲۵٪ می‌رسد.'},{finalDamagePct:150,description:'در پایان اثر، انفجار نهایی با ۱۵۰٪ قدرت جادویی به همه دشمنان وارد می‌شود.'}]},
    {id:'arcane_overload',name:'اضافه‌بار آرکین',en:'Arcane Overload',unlockLevel:9,type:'self_buff',target:'خود بازیکن',manaPct:18,cooldownTurns:5,chargeCost:3,durationTurns:3,magicPowerPct:20,castSpeedPct:10,description:'انرژی آرکین را در بدن فشرده می‌کند؛ قدرت جادویی و کارایی اجرای مهارت‌ها برای سه نوبت بازیکن افزایش می‌یابد.',upgrades:[
      {magicPowerPct:25,description:'افزایش قدرت جادویی به ۲۵٪ می‌رسد.'},{durationTurns:4,description:'مدت اثر به چهار نوبت بازیکن افزایش می‌یابد.'},{castSpeedPct:15,description:'سرعت اجرای جادو ۱۵٪ افزایش می‌یابد؛ در موتور نوبتی به کاهش یک نوبت از خنک‌شدن مهارت بعدی تبدیل نمی‌شود.'},{magicPowerPct:30,description:'افزایش قدرت جادویی به ۳۰٪ می‌رسد.'},{manaCostReductionPct:15,description:'هزینه مانای مهارت‌ها در مدت اثر ۱۵٪ کاهش می‌یابد.'},{magicPowerPct:40,finalDamagePct:200,description:'قدرت جادویی ۴۰٪ افزایش می‌یابد و با پایان اثر، انفجاری با ۲۰۰٪ قدرت جادویی به همه دشمنان وارد می‌شود.'}]},
    {id:'arcane_singularity',name:'تکینگی',en:'Arcane Singularity',unlockLevel:10,type:'ultimate_all_damage',target:'تمام دشمنان زنده',manaPct:30,cooldownTurns:8,chargeCost:'all',initialDamagePct:150,damagePct:350,channelTurns:1,description:'هسته آرکین شکل می‌گیرد، دشمنان را درگیر فشرده‌سازی انرژی می‌کند و سپس منفجر می‌شود. در نبرد نوبتی، آماده‌سازی یک نوبت بازیکن زمان می‌برد.',upgrades:[
      {initialDamagePct:180,description:'آسیب ایجاد هسته به ۱۸۰٪ می‌رسد.'},{damagePct:400,description:'آسیب انفجار نهایی به ۴۰۰٪ می‌رسد.'},{allEnemyDamageBonusPct:10,description:'آسیب این مهارت به همه دشمنان ۱۰٪ افزایش می‌یابد.'},{chargeBonusPct:5,description:'به‌ازای هر شارژ مصرف‌شده، آسیب نهایی ۵٪ افزایش می‌یابد.'},{damagePct:470,description:'آسیب انفجار نهایی به ۴۷۰٪ می‌رسد.'},{damagePct:550,description:'آسیب انفجار نهایی به ۵۵۰٪ می‌رسد؛ پاداش شارژ نیز حفظ می‌شود.'}]}
  ],
  talentBranches: [
    {id:'arcane_mastery',name:'تسلط بر آرکین',en:'Arcane Mastery',focus:'قدرت جادویی و آسیب',talents:[
      ['arcane_force','نیروی آرکین','افزایش قدرت جادویی ۵٪.',{magicPowerPct:5}],['spell_focus','تمرکز جادویی','افزایش دقت جادو ۵ واحد درصد.',{accuracyBonus:5}],['condensed_energy','انرژی متراکم','افزایش آسیب مهارت‌ها ۵٪.',{skillDamagePct:5}],['arcane_penetration','نفوذ آرکین','نادیده‌گرفتن ۵٪ دفاع جادویی دشمن.',{defensePenetrationPct:5}],['enhanced_blast','انفجار تقویت‌شده','افزایش آسیب انفجاری ۸٪.',{explosionDamagePct:8}],['critical_focus','تمرکز بحرانی','افزایش شانس ضربه بحرانی جادویی ۳ واحد درصد.',{critBonus:3}],['ancient_destroyer','ویرانگر باستانی','افزایش آسیب به باس‌ها ۸٪.',{bossDamagePct:8}],['arcane_master','استاد آرکین','افزایش آسیب جادویی ۱۲٪.',{magicPowerPct:12},'ancient_destroyer']
    ]},
    {id:'arcane_defense',name:'محافظت انرژی',en:'Arcane Defense',focus:'سلامتی، دفاع و مقاومت',talents:[
      ['life_force','نیروی حیات','افزایش حداکثر سلامتی ۵٪.',{hpPct:5}],['energy_skin','پوست انرژی','افزایش دفاع ۵٪.',{defensePct:5}],['magic_resistance','مقاومت جادویی','افزایش مقاومت جادویی ۷٪.',{magicResistancePct:7}],['reinforced_shield','سپر تقویت‌شده','افزایش جذب سپر ۱۰٪.',{shieldPowerPct:10}],['steady_mind','پایداری ذهن','کاهش مدت اثر کنترل دشمن ۱۰٪.',{controlResistancePct:10}],['energy_recovery','بازیابی انرژی','افزایش بازیابی سلامتی ۵٪ در هر نوبت بازیکن.',{hpRegenPct:5}],['defensive_reflex','واکنش دفاعی','یک‌بار در هر نبرد، هنگام افت HP به زیر ۳۰٪، سپر ۱۵۰٪ قدرت جادویی ایجاد می‌کند.',{emergencyShieldPct:150}],['arcane_guardian','نگهبان آرکین','افزایش سلامتی و دفاع هرکدام ۱۰٪.',{hpPct:10,defensePct:10},'defensive_reflex']
    ]},
    {id:'mana_flow',name:'جریان مانا',en:'Mana Flow',focus:'مدیریت مانا و شارژ',talents:[
      ['mana_reserve','ذخیره مانا','افزایش حداکثر مانا ۵٪.',{mpPct:5}],['steady_flow','جریان پایدار','افزایش بازیابی مانا ۸٪ در هر نوبت بازیکن.',{mpRegenPct:8}],['efficient_cost','مصرف بهینه','کاهش هزینه مانا ۵٪.',{manaCostReductionPct:5}],['energy_return','بازگشت انرژی','۵٪ احتمال بازگشت ۵۰٪ مانای مهارت پس از اجرا.',{manaRefundChance:5}],['quick_focus','تمرکز سریع','کاهش خنک‌شدن مهارت‌ها ۳٪؛ گردکردن فقط پس از محاسبه کامل انجام می‌شود.',{cooldownReductionPct:3}],['ancient_reserve','ذخیره باستانی','افزایش حداکثر شارژ آرکین از ۵ به ۶.',{maxArcaneChargesBonus:1}],['energy_cycle','گردش انرژی','با شکست هر دشمن ۲٪ حداکثر مانا بازیابی می‌شود.',{manaOnKillPct:2}],['arcane_heart','قلب آرکین','افزایش حداکثر مانا و بازیابی مانا هرکدام ۱۲٪.',{mpPct:12,mpRegenPct:12},'energy_cycle']
    ]},
    {id:'arcane_wisdom',name:'دانش و سرنوشت',en:'Arcane Wisdom',focus:'ویژگی‌های عمومی و تسلط',talents:[
      ['powerful_mind','ذهن نیرومند','افزایش هوش ۵٪.',{intellectPct:5}],['arcane_sight','دید جادویی','افزایش ادراک ۵٪.',{perceptionPct:5}],['battle_reflex','واکنش رزمی','افزایش شانس جاخالی ۵ واحد درصد؛ بدون تغییر فاصله یا سرعت حرکت.',{evasionBonus:5}],['mage_luck','بخت جادوگر','افزایش شانس ۵٪.',{luckPct:5}],['ancient_precision','دقت باستانی','افزایش دقت جادو و شانس بحرانی هرکدام ۲ واحد درصد.',{accuracyBonus:2,critBonus:2}],['mystic_knowledge','دانش اسرارآمیز','افزایش مدت اثرات مثبت مهارت‌ها یک نوبت، حداکثر تا سقف تعریف‌شده هر مهارت.',{buffDurationBonusTurns:1}],['field_mastery','تسلط بر میدان','افزایش آسیب مهارت‌های چندهدفه ۱۰٪؛ مفهوم شعاع حذف شده است.',{multiTargetDamagePct:10}],['arcane_heir','وارث آرکین','افزایش همه هشت ویژگی ۵٪ و قدرت جادویی ۱۰٪.',{allStatsPct:5,magicPowerPct:10},'field_mastery']
    ]}
  ],
  domain: {
    id:'infinite_singularity',name:'تکینگی بی‌نهایت',en:'Infinite Singularity',unlockLevel:25,
    use:{manaPct:20,cooldownBattles:1,oncePerBattle:true,durationPlayerTurns:5,target:'تمام میدان نبرد؛ تمام دشمنان زنده تحت اثر قرار می‌گیرند.',distance:false},
    baseEffects:{magicPowerPct:15,manaRegenPct:20,castEfficiencyPct:10,controlResistancePct:30,enemyAttackReductionPct:10,bossEnemyAttackReductionPct:5},
    stages:[
      {id:'awakening',name:'بیداری قلمرو',en:'Domain Awakening',level:25,durationPlayerTurns:5,magicPowerPct:15,manaRegenPct:20,castEfficiencyPct:10,controlResistancePct:30,enemyAttackReductionPct:10,bossEnemyAttackReductionPct:5,visual:'بُعد آرکین با آسمان بنفش و آبی، حلقه‌های رونیک و هسته مرکزی آشکار می‌شود.',feature:'قلمرو برای نخستین بار فعال می‌شود و اجازه اجرای یک مهارت تعالی‌یافته را می‌دهد.'},
      {id:'mastery',name:'تسلط بر قلمرو',en:'Domain Mastery',level:40,durationPlayerTurns:6,magicPowerPct:25,manaRegenPct:30,castEfficiencyPct:15,controlResistancePct:40,enemyAttackReductionPct:15,bossEnemyAttackReductionPct:7,visual:'حلقه‌های دوم و سوم و رگه‌های گرانشی در بُعد پدیدار می‌شوند.',feature:'هر دو نوبت بازیکن، موج جاذبه آرکین فعال می‌شود؛ دشمنان عادی یک نوبت تضعیف می‌شوند و باس‌ها فقط ۷٪ کاهش قدرت حمله می‌گیرند.'},
      {id:'ascension',name:'تعالی قلمرو',en:'Domain Ascension',level:50,durationPlayerTurns:7,magicPowerPct:35,manaRegenPct:40,castEfficiencyPct:20,controlResistancePct:50,enemyAttackReductionPct:20,bossEnemyAttackReductionPct:10,visual:'سه هسته ثانویه در پس‌زمینه ظاهر می‌شوند و هر نوبت یک موج آرکین آزاد می‌کنند.',feature:'در پایان هر نوبت بازیکن، هسته‌های ثانویه به همه دشمنان زنده ۳۰٪ قدرت جادویی آسیب می‌زنند؛ هر موج فقط یک‌بار در هر نوبت اجرا می‌شود.'},
      {id:'absolute',name:'قلمرو مطلق',en:'Absolute Domain',level:50,requiresQuest:true,durationPlayerTurns:8,magicPowerPct:45,manaRegenPct:50,castEfficiencyPct:25,controlResistancePct:60,enemyAttackReductionPct:25,bossEnemyAttackReductionPct:12,visual:'ظاهر میدان به یک بُعد کیهانی کامل تغییر می‌کند؛ تکینگی مرکزی و حلقه‌های بی‌نهایت سراسر صحنه را می‌پوشانند.',feature:'هسته مرکزی هر دو نوبت بازیکن به همه دشمنان ۵۰٪ قدرت جادویی آسیب می‌زند و در پایان قلمرو انفجار ۲۰۰٪ قدرت جادویی ایجاد می‌کند.'}
    ],
    quest:{id:'heart_of_infinity',name:'قلب بی‌نهایت',description:'برای پایدارکردن قلمرو، سه قطعه هسته آرکین را از سه نگهبان باستانی به دست آور و در آزمون نهایی تکینگی را مهار کن.',requirements:['رسیدن به سطح ۵۰','بازکردن بیداری، تسلط و تعالی قلمرو','شکست سه نگهبان باستانی در آزمون تخصصی','تکمیل آزمون مهار هسته آرکین'],rewards:['قلمرو مطلق','عنوان ارباب آرکین بی‌نهایت','نسخه نهایی مهارت تعالی‌یافته']}
  },
  ascendedSkills: [
    {id:'asc_arcane_bolt',skillId:'arcane_bolt',name:'گلوله آرکین مطلق',en:'Absolute Arcane Bolt',target:'یک دشمن انتخابی و دشمنان دیگر با انفجار ثانویه',manaPct:12,chargeCost:2,cooldownTurns:4,damagePct:600,splashPct:200,defensePenetrationPct:30,stages:{mastery:{damagePct:650},ascension:{damagePct:700},absolute:{damagePct:800,echoPct:40}},description:'پرتابه عظیم آرکین به هدف اصلی ۶۰۰٪ قدرت جادویی آسیب می‌زند و به دیگر دشمنان ۲۰۰٪ آسیب انفجاری وارد می‌کند؛ ۳۰٪ دفاع جادویی هدف اصلی نادیده گرفته می‌شود.',absoluteDescription:'در قلمرو مطلق، آسیب اصلی ۸۰۰٪ می‌شود و یک پرتابه پژواکی با ۴۰٪ قدرت به هدف اصلی برخورد می‌کند.'},
    {id:'asc_arcane_shield',skillId:'arcane_shield',name:'سپر جهان آرکین',en:'Absolute Arcane Barrier',target:'خود بازیکن',manaPct:15,cooldownTurns:5,durationTurns:4,shieldPct:900,damageReductionPct:20,cleanseCount:2,stages:{mastery:{shieldPct:1000},ascension:{durationTurns:5},absolute:{shieldPct:1300,retaliationPct:150}},description:'سپر ۹۰۰٪ قدرت جادویی جذب می‌کند، چهار نوبت دشمن باقی می‌ماند، ۲۰٪ آسیب دریافتی را کاهش می‌دهد و دو اثر منفی قابل پاک‌سازی را حذف می‌کند.',absoluteDescription:'جذب به ۱۳۰۰٪ می‌رسد و هنگام پایان سپر، به همه دشمنان ۱۵۰٪ قدرت جادویی آسیب بازتابی وارد می‌شود.'},
    {id:'asc_arcane_explosion',skillId:'arcane_explosion',name:'انفجار کیهانی',en:'Cosmic Cataclysm',target:'تمام دشمنان زنده',manaPct:20,chargeCost:3,cooldownTurns:5,damagePct:750,secondWavePct:250,stunTurns:1,bossSlowPct:15,stages:{mastery:{damagePct:800},ascension:{secondWavePct:280},absolute:{damagePct:1000,thirdWavePct:300}},description:'به همه دشمنان ۷۵۰٪ آسیب می‌زند و موج دوم ۲۵۰٪ ایجاد می‌کند؛ دشمن عادی یک نوبت از اقدام بازمی‌ماند، باس فقط ۱۵٪ تضعیف می‌شود.',absoluteDescription:'موج اصلی ۱۰۰۰٪ و موج سوم ۳۰۰٪ قدرت جادویی آسیب وارد می‌کند.'},
    {id:'asc_arcane_blink',skillId:'arcane_blink',name:'شکاف بی‌نهایت',en:'Infinite Rift',target:'خود بازیکن و همه دشمنان',manaPct:15,cooldownTurns:5,evadeTurns:2,counterDamagePct:250,shieldPct:300,stages:{mastery:{evadeTurns:3},ascension:{counterDamagePct:300},absolute:{secondEvasion:true,secondEvasionDamagePct:50}},description:'دو حمله دشمن را خنثی می‌کند، به همه دشمنان ۲۵۰٪ قدرت جادویی آسیب بازگشتی می‌زند و سپر ۳۰۰٪ ایجاد می‌کند.',absoluteDescription:'در قلمرو مطلق، یک بار دیگر می‌توان اثر جاخالی را فعال کرد؛ موج دوم ۵۰٪ آسیب موج اول را دارد.'},
    {id:'asc_ancient_rune',skillId:'ancient_rune',name:'حکم باستانی',en:'Ancient Judgment',target:'تمام دشمنان زنده',manaPct:20,cooldownTurns:5,initialDamagePct:300,finalDamagePct:400,enemyAttackReductionPct:20,durationTurns:3,bossSlowPct:10,stages:{mastery:{finalDamagePct:500},ascension:{durationTurns:4},absolute:{finalDamagePct:700,defenseDownPct:15,defenseDownTurns:3}},description:'به همه دشمنان ۳۰۰٪ آسیب اولیه و پس از سه نوبت ۴۰۰٪ آسیب پایانی می‌زند؛ قدرت حمله دشمنان ۲۰٪ کاهش می‌یابد و باس‌ها کنترل کامل نمی‌شوند.',absoluteDescription:'آسیب پایانی ۷۰۰٪ می‌شود و دفاع جادویی دشمنان برای سه نوبت ۱۵٪ کاهش می‌یابد.'},
    {id:'asc_prismatic_lance',skillId:'prismatic_lance',name:'نیزه منشوری مطلق',en:'Absolute Prismatic Lance',target:'تا هشت دشمن زنده',manaPct:20,chargeCost:3,cooldownTurns:5,damagePct:800,falloffPct:85,defenseDownPct:20,stages:{mastery:{damagePct:850},ascension:{maxTargets:10},absolute:{damagePct:1100,returnWavePct:250}},description:'به حداکثر هشت دشمن آسیب می‌زند؛ هدف نخست ۸۰۰٪ و اهداف بعدی هرکدام ۸۵٪ از آسیب هدف قبلی را دریافت می‌کنند. دفاع جادویی اهداف ۲۰٪ کاهش می‌یابد.',absoluteDescription:'آسیب ۱۱۰۰٪ می‌شود و پس از هدف آخر، موج بازگشتی ۲۵۰٪ به همه دشمنان زنده آسیب می‌زند.'},
    {id:'asc_arcane_echo',skillId:'arcane_echo',name:'پژواک ابدی',en:'Eternal Echo',target:'تکرار آخرین مهارت تهاجمی مجاز',manaPct:20,cooldownTurns:6,repeats:[50,40,30],stages:{mastery:{repeats:[55,45,35]},ascension:{repeats:[60,50,40]},absolute:{repeats:[60,50,40,30]}},description:'آخرین مهارت تهاجمی مجاز را سه بار با ۵۰٪، ۴۰٪ و ۳۰٪ قدرت تکرار می‌کند. مهارت تعالی‌یافته و قلمرو قابل تکرار نیستند.',absoluteDescription:'در قلمرو مطلق، پژواک چهارم با ۳۰٪ قدرت اضافه می‌شود.'},
    {id:'asc_gravity_well',skillId:'gravity_well',name:'حفره گرانشی مطلق',en:'Absolute Gravity Well',target:'تمام دشمنان زنده',manaPct:25,chargeCost:3,cooldownTurns:6,dotPct:100,dotTurns:6,enemyAttackReductionPct:25,finalDamagePct:0,stages:{mastery:{dotTurns:7},ascension:{dotPct:120},absolute:{finalDamagePct:500}},description:'همه دشمنان برای شش نوبت، هر نوبت ۱۰۰٪ قدرت جادویی آسیب می‌گیرند و قدرت حمله‌شان ۲۵٪ کاهش می‌یابد؛ باس‌ها فقط تضعیف می‌شوند.',absoluteDescription:'در پایان، هسته منفجر می‌شود و ۵۰۰٪ قدرت جادویی آسیب نهایی وارد می‌کند.'},
    {id:'asc_arcane_overload',skillId:'arcane_overload',name:'اضافه‌بار خدایان',en:'Divine Arcane Overload',target:'خود بازیکن و پایان اثر علیه تمام دشمنان',manaPct:25,chargeCost:5,cooldownTurns:7,durationTurns:5,magicPowerPct:70,castEfficiencyPct:30,manaCostReductionPct:25,stages:{mastery:{magicPowerPct:80},ascension:{durationTurns:6},absolute:{magicPowerPct:100,finalDamagePct:500}},description:'برای پنج نوبت قدرت جادویی ۷۰٪، کارایی اجرای جادو ۳۰٪ و کاهش هزینه مانا ۲۵٪ افزایش می‌یابد.',absoluteDescription:'قدرت جادویی ۱۰۰٪ می‌شود و هنگام پایان، به همه دشمنان ۵۰۰٪ قدرت جادویی آسیب می‌زند.'},
    {id:'asc_arcane_singularity',skillId:'arcane_singularity',name:'تکینگی مطلق',en:'Absolute Singularity',target:'تمام دشمنان زنده',manaPct:35,chargeCost:'all',cooldownTurns:99,prepTurns:1,channelTurns:3,damagePerChannelPct:150,finalDamagePct:800,chargeBonusPct:5,stages:{mastery:{finalDamagePct:1100},ascension:{finalDamagePct:1250},absolute:{finalDamagePct:1500,secondaryWavePct:300}},description:'یک نوبت برای شکل‌گیری هسته و سه نوبت برای فشرده‌سازی لازم دارد؛ در هر نوبت ۱۵۰٪ آسیب و در پایان ۸۰۰٪ آسیب نهایی وارد می‌کند. هر شارژ مصرفی ۵٪ آسیب نهایی می‌افزاید.',absoluteDescription:'در قلمرو مطلق، انفجار نهایی ۱۵۰۰٪ می‌شود و موج ثانویه ۳۰۰٪ نیز ایجاد می‌کند.'}
  ],
  progression: {skillUnlocksEveryLevel:true,firstSkillLevel:1,lastSkillLevel:10,skillUpgradeCount:6,skillUpgradeCost:1,talentCount:32,talentUnlockCost:1,levelUpRewards:{attributePoints:5,skillPoints:2},unspentPointsPersist:true,domainUnlockLevel:25,domainMasteryLevel:40,domainAscensionLevel:50,absoluteDomainLevel:50,absoluteDomainRequiresQuest:true,ascendedSkillChoiceCount:1,ascendedSkillAvailableOnlyInDomain:true,ascendedSkillAvailability:'all_10_during_domain',ascendedSkillSelectionTiming:'after_domain_activation',ascendedSkillUsesPerDomain:1,ascendedSkillSelectionLimitPerDomain:1}
};

export function createArcaneMageProgress(){
  return {charges:0,chargeExpiresAt:null,skillRanks:{},unlockedTalents:[],domainStage:'locked',domainQuest:{started:false,guardianDefeats:0,coreFragments:0,trialComplete:false,complete:false},domainActive:false,domainUsesThisBattle:0,ascendedUsesThisDomain:0,ascendedSkillUsedThisDomain:false,ascendedSkillId:null,lastSpellId:null,skillCooldowns:{},buffs:{},statuses:{}};
}

export function normalizeArcaneMageProgress(progress){
  const p={...createArcaneMageProgress(),...(progress||{})};
  p.skillRanks={...(p.skillRanks||{})};p.unlockedTalents=Array.isArray(p.unlockedTalents)?[...new Set(p.unlockedTalents)]:[];
  p.skillCooldowns={...(p.skillCooldowns||{})};p.buffs={...(p.buffs||{})};p.statuses={...(p.statuses||{})};p.domainQuest={...createArcaneMageProgress().domainQuest,...(p.domainQuest||{})};
  const chargeCap=p.unlockedTalents.includes('ancient_reserve')?6:5;
  p.charges=Math.max(0,Math.min(chargeCap,Number(p.charges)||0));
  for(const s of ARCANE_MAGE.skills)p.skillRanks[s.id]=Math.max(0,Math.min(7,Number(p.skillRanks[s.id])||0));
  return p;
}


// Domain rule: activation exposes all ten renamed ascended skills; exactly one may be cast per activation.
export function activateArcaneMageDomain(progress, playerLevel){
  const p=normalizeArcaneMageProgress(progress);
  if(Number(playerLevel)<ARCANE_MAGE.domain.unlockLevel) return {ok:false,reason:'level_locked',progress:p};
  if(p.domainUsesThisBattle>=1) return {ok:false,reason:'already_used_this_battle',progress:p};
  p.domainActive=true; p.domainUsesThisBattle+=1; p.ascendedUsesThisDomain=0; p.ascendedSkillUsedThisDomain=false; p.ascendedSkillId=null;
  return {ok:true,progress:p,availableSkills:ARCANE_MAGE.ascendedSkills};
}
export function getAvailableArcaneMageAscendedSkills(progress){
  const p=normalizeArcaneMageProgress(progress);
  if(!p.domainActive||p.ascendedSkillUsedThisDomain||p.ascendedUsesThisDomain>=1) return [];
  if(p.ascendedSkillId) return ARCANE_MAGE.ascendedSkills.filter(x=>x.id===p.ascendedSkillId);
  return ARCANE_MAGE.ascendedSkills;
}
export function selectArcaneMageAscendedSkill(progress, ascendedSkillId){
  const p=normalizeArcaneMageProgress(progress);
  if(!p.domainActive) return {ok:false,reason:'domain_not_active',progress:p};
  if(p.ascendedSkillUsedThisDomain||p.ascendedUsesThisDomain>=1) return {ok:false,reason:'ascended_skill_already_used',progress:p};
  if(p.ascendedSkillId) return {ok:false,reason:'ascended_skill_already_selected',progress:p};
  const skill=ARCANE_MAGE.ascendedSkills.find(x=>x.id===ascendedSkillId);
  if(!skill) return {ok:false,reason:'invalid_ascended_skill',progress:p};
  p.ascendedSkillId=skill.id;
  return {ok:true,progress:p,skill};
}
export function consumeArcaneMageAscendedSkill(progress, ascendedSkillId){
  const p=normalizeArcaneMageProgress(progress);
  if(!p.domainActive) return {ok:false,reason:'domain_not_active',progress:p};
  if(p.ascendedSkillUsedThisDomain||p.ascendedUsesThisDomain>=1) return {ok:false,reason:'ascended_skill_already_used',progress:p};
  if(!p.ascendedSkillId) return {ok:false,reason:'ascended_skill_not_selected',progress:p};
  if(p.ascendedSkillId!==ascendedSkillId) return {ok:false,reason:'ascended_skill_selection_mismatch',progress:p};
  const skill=ARCANE_MAGE.ascendedSkills.find(x=>x.id===ascendedSkillId);
  if(!skill) return {ok:false,reason:'invalid_ascended_skill',progress:p};
  p.ascendedSkillUsedThisDomain=true; p.ascendedUsesThisDomain=1;
  return {ok:true,progress:p,skill};
}
export function endArcaneMageDomain(progress){
  const p=normalizeArcaneMageProgress(progress);
  p.domainActive=false; p.ascendedSkillId=null; p.ascendedSkillUsedThisDomain=false; p.ascendedUsesThisDomain=0;
  return p;
}
