/** ETRANOM V1979 — canonical level/XP/death progression rules. Pure and deterministic. */
export const CHARACTER_PROGRESSION_VERSION_V1979 = '1979.0.0';
export const LEVEL_CAP_V1979 = 100;
export const XP_TO_NEXT_LEVEL_V1979 = Object.freeze({
  1:100,
  2:2300,
  3:3800,
  4:5700,
  5:25000,
  6:28000,
  7:31360,
  8:35123,
  9:39337,
  10:44058,
  11:49345,
  12:55267,
  13:61899,
  14:69327,
  15:77646,
  16:86964,
  17:97399,
  18:109087,
  19:122177,
  20:136839,
  21:153260,
  22:171651,
  23:192248,
  24:215319,
  25:241157,
  26:270096,
  27:302508,
  28:338808,
  29:379465,
  30:425001,
  31:476001,
  32:533122,
  33:597096,
  34:668748,
  35:748998,
  36:838877,
  37:939543,
  38:1052288,
  39:1178563,
  40:1319990,
  41:1478389,
  42:1655796,
  43:1854491,
  44:2077030,
  45:2326274,
  46:2605427,
  47:2918078,
  48:3268248,
  49:3660437,
  50:4099690,
  51:4591653,
  52:5142652,
  53:5759771,
  54:6450944,
  55:7225058,
  56:8092065,
  57:9063113,
  58:10150687,
  59:11368770,
  60:12733023,
  61:14260986,
  62:15972305,
  63:17888982,
  64:20035660,
  65:22439940,
  66:25132733,
  67:28148661,
  68:31526501,
  69:35309682,
  70:39546844,
  71:44292466,
  72:49607562,
  73:55560470,
  74:62227727,
  75:69695055,
  76:78058462,
  77:87425478,
  78:97916536,
  79:109666521,
  80:122826504,
  81:137565685,
  82:154073568,
  83:172562397,
  84:193269885,
  85:216462272,
  86:242437745,
  87:271530275,
  88:304113908,
  89:340607577,
  90:381480487,
  91:427258146,
  92:478529124,
  93:535952619,
  94:600266934,
  95:672298967,
  96:752974844,
  97:843331826,
  98:944531646,
  99:1057875444
});
const num=(v,d=0)=>Number.isFinite(Number(v))?Number(v):d;
const int=(v,d=0)=>Math.max(0,Math.floor(num(v,d)));
const clone=v=>structuredClone(v);
// Owner progression policy is optional and defaults to the established game rules.
// It is read from the already-authenticated, published runtime catalog only; it is
// not an authorization boundary and must never replace server-side validation.
function ownerProgressionPolicyV2013(){
 const rows=globalThis.ETRANOM_OWNER_RUNTIME_CONFIG?.progression_rule;
 if(!Array.isArray(rows))return {};
 const row=rows.find(x=>x&&x.enabled!==false&&(x.id==='default'||x.is_default===true))||rows.find(x=>x&&x.enabled!==false);
 return row&&typeof row==='object'?row:{};
}
function boundedPolicyNumber(value,fallback,min,max){const n=Number(value);return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;}

export function xpRequiredForNextLevelV1979(level){const l=Math.max(1,Math.min(LEVEL_CAP_V1979,Math.floor(num(level,1))));return l>=LEVEL_CAP_V1979?0:(XP_TO_NEXT_LEVEL_V1979[l]??0);}
export function normalizeProgressionStateV1979(input={}){
 const s=clone(input||{});s.level=Math.max(1,Math.min(LEVEL_CAP_V1979,Math.floor(num(s.level,1))));
 s.xp=int(s.xp??s.experience);s.skillPoints=int(s.skillPoints);s.attributePoints=int(s.attributePoints);
 s.unspentSkillPoints=int(s.unspentSkillPoints,s.skillPoints);s.unspentAttributePoints=int(s.unspentAttributePoints,s.attributePoints);
 s.maxHp=Math.max(1,num(s.maxHp??s.max_hp,100));s.maxMp=Math.max(0,num(s.maxMp??s.max_mp,50));s.maxStamina=Math.max(0,num(s.maxStamina??s.max_stamina,100));
 s.hp=Math.max(0,Math.min(s.maxHp,num(s.hp,s.maxHp)));s.mp=Math.max(0,Math.min(s.maxMp,num(s.mp,s.maxMp)));s.stamina=Math.max(0,Math.min(s.maxStamina,num(s.stamina,s.maxStamina)));
 s.gold=int(s.gold);return s;
}
/** XP is stored as total lifetime XP; unspent XP carries across level thresholds. */
export function grantCharacterXpV1979(input={},amount=0,options={}){
 const s=normalizeProgressionStateV1979(input);
 const policy=options?.policy&&typeof options.policy==='object'?options.policy:ownerProgressionPolicyV2013();
 const xpMultiplier=boundedPolicyNumber(policy.xp_multiplier??policy.xpMultiplier,1,0,5);
 const grant=int(Math.floor(int(amount)*xpMultiplier));s.xp+=grant;let levelsGained=0,levelRewards=[];
 while(s.level<LEVEL_CAP_V1979){const threshold=xpRequiredForNextLevelV1979(s.level);const totalAtCurrentLevel=Object.entries(XP_TO_NEXT_LEVEL_V1979).filter(([l])=>Number(l)<s.level).reduce((a,[,v])=>a+v,0);const currentLevelXp=s.xp-totalAtCurrentLevel;if(currentLevelXp<threshold)break;
  s.level++;levelsGained++;s.skillPoints+=2;s.attributePoints+=5;s.unspentSkillPoints+=2;s.unspentAttributePoints+=5;s.maxHp+=12;s.maxMp+=5;s.maxStamina+=4;s.hp=s.maxHp;s.mp=s.maxMp;s.stamina=s.maxStamina;levelRewards.push({level:s.level,skillPoints:2,attributePoints:5,maxHp:12,maxMp:5,maxStamina:4});
 }
 return {state:s,grantedXp:grant,levelsGained,levelRewards,xpToNext:xpRequiredForNextLevelV1979(s.level),atLevelCap:s.level>=LEVEL_CAP_V1979};
}
/** Death removes 3% of XP accumulated toward the current level and 1% of carried gold; never de-levels. */
export function applyDeathPenaltyV1979(input={},options={}){
 const policy=options?.policy&&typeof options.policy==='object'?options.policy:ownerProgressionPolicyV2013();
 const xpLossPct=boundedPolicyNumber(policy.death_xp_loss_pct??policy.deathXpLossPct,3,0,50);
 const goldLossPct=boundedPolicyNumber(policy.death_gold_loss_pct??policy.deathGoldLossPct,1,0,50);
 const s=normalizeProgressionStateV1979(input),thresholdTotal=Object.entries(XP_TO_NEXT_LEVEL_V1979).filter(([l])=>Number(l)<s.level).reduce((a,[,v])=>a+v,0);
 const currentLevelXp=Math.max(0,s.xp-thresholdTotal),xpLoss=Math.floor(currentLevelXp*xpLossPct/100),goldLoss=Math.floor(s.gold*goldLossPct/100);
 s.xp=Math.max(thresholdTotal,s.xp-xpLoss);s.gold=Math.max(0,s.gold-goldLoss);
 return {state:s,xpLost:xpLoss,goldLost:goldLoss,levelPreserved:true};
}
export function spendProgressionPointsV1979(input={},kind,amount=1){const s=normalizeProgressionStateV1979(input),n=int(amount);if(!['skill','attribute'].includes(kind))throw new Error('unsupported_progression_point_kind');const key=kind==='skill'?'unspentSkillPoints':'unspentAttributePoints';if(n<1)throw new Error('invalid_point_amount');if(s[key]<n)throw new Error('insufficient_progression_points');s[key]-=n;return s;}
