// ETRANOM V2117 — real PNG sprite dressing for all 27 building yards.
// Visual-only: no collision, interaction, NPC, economy, quest or network changes.
const ROOT = new URL('../../assets/safe-zone/yard-sprites-v2117/', import.meta.url);
const SPRITE_FOR_KIND = {
  market:'market_stall', arena:'weapon_rack', inn:'barrels', smith:'anvil', guild:'guild_banner',
  alchemy:'alchemy_shelf', arcane:'alchemy_shelf', clinic:'herb_planter', guard:'weapon_rack',
  temple:'brazier', stable:'hay_trough', granary:'grain_cart', mill:'grain_cart', bakery:'bakery_oven',
  farm:'crop_bed', herbs:'herb_planter', livestock:'gate_fence', sawmill:'crates_sacks',
  carpenter:'bench', forestherbs:'herb_planter', hunter:'weapon_rack', apiary:'crop_bed',
  mine:'crates_sacks', smelter:'forge', stonecut:'anvil', miners:'barrels', cartwright:'grain_cart'
};
const SPRITES = new Map();
function sprite(name) {
  if (!SPRITES.has(name)) {
    const img = new Image(); img.decoding = 'async'; img.src = new URL(`${name}.png`, ROOT).href;
    SPRITES.set(name, img);
  }
  return SPRITES.get(name);
}
const YARDS = [
 ['online_player_market',1450,820,190,'market'],['pvp_hall',1690,820,190,'arena'],['inn',1120,1080,190,'inn'],['smith',1880,1080,180,'smith'],
 ['guild',1690,1390,190,'guild'],['alchemy',1330,1390,165,'alchemy'],['enchanter_shop',930,820,150,'arcane'],['clinic',2070,1390,165,'clinic'],
 ['guardhouse',1690,560,160,'guard'],['fire_temple',930,1390,170,'temple'],['stable',2240,820,178,'stable'],['granary',1120,1390,170,'granary'],
 ['grain_mill',430,610,175,'mill'],['grain_bakery',565,760,155,'bakery'],['grain_farmstead',330,850,165,'farm'],['grain_herbgarden',690,570,170,'herbs'],['grain_livestock',590,980,180,'livestock'],
 ['rootwood_sawmill',2360,760,190,'sawmill'],['rootwood_carpenter',2580,900,175,'carpenter'],['rootwood_herbalist',2730,1120,155,'forestherbs'],['rootwood_hunters',2240,1110,175,'hunter'],['rootwood_apiary',2660,650,165,'apiary'],
 ['iron_mine',1680,2070,190,'mine'],['iron_smelter',1920,2070,180,'smelter'],['iron_stonecutter',2110,2220,175,'stonecut'],['iron_hall',1580,2260,180,'miners'],['iron_cartwright',2250,2020,170,'cartwright']
];
function drawYardSprite(ctx,row){
 const [,x,y,w,kind]=row, img=sprite(SPRITE_FOR_KIND[kind]);
 if(!img.complete || !img.naturalWidth) return;
 const maxW=Math.min(94,w*.58), maxH=82, scale=Math.min(maxW/img.naturalWidth,maxH/img.naturalHeight);
 const dw=img.naturalWidth*scale, dh=img.naturalHeight*scale;
 const side=(YARDS.indexOf(row)%2?1:-1), px=x+side*(w*.62), py=y+45;
 ctx.drawImage(img,px-dw/2,py-dh,dw,dh);
}
export function drawBuildingYardsV2117(ctx,camX=0,camY=0){
 if(!ctx||!ctx.drawImage)return;
 const l=camX-120,r=camX+980,top=camY-100,b=camY+850;
 ctx.save(); YARDS.filter(p=>p[1]>l&&p[1]<r&&p[2]>top&&p[2]<b).sort((a,b)=>a[2]-b[2]).forEach(p=>drawYardSprite(ctx,p)); ctx.restore();
}
export const BUILDING_YARDS_V2117=Object.freeze({count:YARDS.length,spriteCount:16,buildingIds:Object.freeze(YARDS.map(x=>x[0])),visualOnly:true,collisionChanges:0});
