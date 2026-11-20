const ROOT = './content/packs/region_one_master_v2/';
const FILES = {
  manifest: 'manifest.json', regions: 'regions/regions.json', monsters: 'monsters/monsters.json',
  materials: 'materials/materials.json', skills: 'skills/monster_skills.json', items: 'items/items.json',
  recipes: 'recipes/recipes.json', quests: 'quests/quests.json', npcs: 'npcs/npcs.json',
  dungeons: 'dungeons/dungeons.json', ruins: 'ruins/ruins.json', tower: 'tower/tower.json',
  towerEncounters: 'tower/tower_encounters.json'
};
async function readJson(path) {
  const response = await fetch(ROOT + path, { cache: 'no-store' });
  if (!response.ok) throw new Error(`محتوای منطقه اول بارگذاری نشد: ${path} (${response.status})`);
  return response.json();
}
function regionCombatMultiplier(_regionId) {
  // v139: encounter stats are balanced directly in the content pack.
  // Applying hidden x2/x3 multipliers here caused severe cross-zone imbalance.
  return 1;
}
function scaleCombatStats(stats, multiplier) {
  const scaled = { ...(stats || {}) };
  if (multiplier !== 1) for (const [key, value] of Object.entries(scaled)) {
    if (typeof value === 'number' && Number.isFinite(value)) scaled[key] = Math.round(value * multiplier);
  }
  return scaled;
}
function assertUnique(list, label) {
  const ids = list.map(x => x.id);
  if (ids.some(x => !x) || new Set(ids).size !== ids.length) throw new Error(`شناسه تکراری یا خالی در ${label}`);
}
export async function loadRegionOneRuntime() {
  const entries = await Promise.all(Object.entries(FILES).map(async ([key, path]) => [key, await readJson(path)]));
  const pack = Object.fromEntries(entries);
  const listKeys = ['regions','monsters','materials','skills','items','recipes','quests','npcs','dungeons','towerEncounters'];
  for (const key of listKeys) {
    if (!Array.isArray(pack[key])) throw new Error(`ساختار ${key} در بسته محتوایی معتبر نیست.`);
    assertUnique(pack[key], key);
  }
  if (!pack.manifest?.source_of_truth || pack.manifest.pack_id !== 'region_one_master_v2') throw new Error('نسخه یا مرجع بسته محتوایی منطقه اول معتبر نیست.');
  const materialById = new Map(pack.materials.map(x => [x.id, x]));
  const monsterById = new Map(pack.monsters.map(x => [x.id, x]));
  const regionOneIds = new Set(pack.regions.filter(region => Number(region.region_number) === 1).map(region => region.id));
  const itemById = new Map(pack.items.map(x => [x.id, x]));
  const dungeonById = new Map(pack.dungeons.map(x => [x.id, x]));
  const towerBossIds = new Set((pack.tower.floors || []).filter(f => f.type === 'boss').flatMap(f => f.encounter_ids || []));
  for (const monster of pack.monsters) {
    for (const drop of monster.drops || []) if (!materialById.has(drop.material_id)) throw new Error(`ماده نامعتبر برای هیولا ${monster.id}: ${drop.material_id}`);
  }
  for (const recipe of pack.recipes) {
    if (!itemById.has(recipe.result_item_id)) throw new Error(`آیتم خروجی دستور ${recipe.id} پیدا نشد.`);
    for (const ingredient of recipe.ingredients || []) if (!materialById.has(ingredient.material_id)) throw new Error(`ماده دستور ${recipe.id} پیدا نشد: ${ingredient.material_id}`);
    for (const source of recipe.source_encounter_ids || []) if (!monsterById.has(source)) throw new Error(`منبع دستور ${recipe.id} پیدا نشد: ${source}`);
    for (const source of recipe.material_source_encounter_ids || []) if (!monsterById.has(source)) throw new Error(`منبع مواد دستور ${recipe.id} پیدا نشد: ${source}`);
    const sourceType = recipe.drop_source_type, sourceId = recipe.drop_source_id;
    if (sourceType === 'monster' && !monsterById.has(sourceId)) throw new Error(`منبع هیولایی دستور ${recipe.id} معتبر نیست: ${sourceId}`);
    if (sourceType === 'dungeon_treasure' && !dungeonById.has(sourceId)) throw new Error(`منبع گنجینه دستور ${recipe.id} معتبر نیست: ${sourceId}`);
    if (sourceType === 'dungeon_boss' && !dungeonById.has(String(sourceId || '').replace(/^dungeon_boss_/, ''))) throw new Error(`منبع باس دانجن دستور ${recipe.id} معتبر نیست: ${sourceId}`);
    if (sourceType === 'tower_boss' && !towerBossIds.has(sourceId)) throw new Error(`منبع باس برج دستور ${recipe.id} معتبر نیست: ${sourceId}`);
    if (!['monster','dungeon_treasure','dungeon_boss','tower_boss'].includes(sourceType)) throw new Error(`نوع منبع دستور ${recipe.id} نامعتبر است: ${sourceType}`);
  }
  const regions = pack.regions.map(region => ({
    id: region.id, name: region.name, level: Number(region.recommended_level || region.level_min || 1),
    regionNumber: region.region_number, recipeLevel: region.recipe_level, itemLevel: region.item_level,
    material: region.material_theme, mats: [...region.material_ids], dungeon: region.dungeon_id || null,
    ruins: !!region.ruins_enabled, subarea: region.subarea, entryPoint: region.subarea?.entry_point || null,
    encounterRules: region.encounter_rules, leaderEncounterId: region.leader_encounter_id || null
  }));
  const materialNames = regions.map(region => region.mats.map(id => materialById.get(id)?.name || id));
  const encounters = pack.monsters.map(monster => {
    const drops = monster.drops || [];
    const materialIds = drops.map(x => x.material_id);
    const materialNames = materialIds.map(id => materialById.get(id)?.name || id);
    const multiplier = regionCombatMultiplier(monster.region_id);
    const stats = scaleCombatStats(monster.stats, multiplier);
    // Combat instantiation applies the v140 25% reduction relative to v139 effective values. Do not pre-scale this data here.
    return {
      id: monster.id, name: monster.name, icon: '👹', kind: monster.kind === 'mini_boss' ? 'miniboss' : monster.kind === 'area_boss' ? 'boss' : monster.kind,
      regionId: monster.region_id, regionName: regions.find(x => x.id === monster.region_id)?.name || '', level: monster.level,
      hp: Number(stats.hp || 1), maxHp: Number(stats.hp || 1), mp: Number(stats.mp || 0), maxMp: Number(stats.mp || 0),
      attack: Number(stats.attack || stats.power || 1), defense: Number(stats.defense || stats.endurance || 0),
      accuracy: Number(stats.accuracy || 80), speed: Number(stats.speed || 1), combatMultiplier: multiplier, quality: monster.quality,
      role: monster.role || '', description: monster.description_fa || '', stats,
      materialId: materialIds[0] || null, materialName: materialNames[0] || '', materialIds, materialNames,
      xp: Number(monster.xp || 0), gold: Number(monster.gold || 0), skills: [...(monster.skills || [])],
      portrait: monster.portrait || null, respawnSeconds: monster.respawn_seconds || 90, sourceVersion: monster.version
    };
  });
  const recipes = pack.recipes.map(recipe => {
    const item = itemById.get(recipe.result_item_id);
    return {
      id: recipe.id, name: recipe.name, className: recipe.class_name, slot: recipe.slot,
      regionId: recipe.region_id, regionName: recipe.region_name, recipeLevel: recipe.recipe_level,
      maxRecipeLevel: recipe.max_recipe_level, itemLevel: recipe.item_level, rarity: recipe.rarity,
      materials: (recipe.ingredients || []).map(x => ({ id: x.material_id, name: materialById.get(x.material_id)?.name || x.material_id, qty: x.quantity })),
      sourceEncounterIds: [...(recipe.source_encounter_ids || [])], dropChance: recipe.drop_chance_percent, dropSourceType: recipe.drop_source_type || 'monster', dropSourceId: recipe.drop_source_id || (recipe.source_encounter_ids || [])[0] || null, dropSource: recipe.drop_source_label_fa || '', materialSourceEncounterIds: [...(recipe.material_source_encounter_ids || [])],
      stats: { ...(item?.stats || {}) }, effects: [...(recipe.effects || [])], resultItemId: recipe.result_item_id
    };
  });
  const dungeons = pack.dungeons.map(d => {
    const multiplier = regionCombatMultiplier(d.region_id);
    const boss = d.boss || {};
    return ({
    id: d.id, name: d.name, regionId: d.region_id, poolRegions: [...d.pool_region_ids], waves: d.wave_count,
    normalWaves: d.normal_waves, bossWave: d.boss_wave,
    levelWeights: (d.level_weights || []).map(x => ({ level: x.level, weight: x.weight })),
    treasureChances: (d.events_after_wave?.treasure_chance_percent || []).map(x => x / 100),
    trapChances: (d.events_after_wave?.trap_chance_percent || []).map(x => x / 100),
    trapWeights: d.events_after_wave?.trap_type_weights || [],
    boss: boss.name, bossId: boss.id, bossLevel: boss.level,
    bossHp: Math.round(Number(boss.hp || 0) * multiplier),
    bossMp: Math.round(Number(boss.mp || 0) * multiplier),
    bossAttack: Math.round(Number(boss.attack || 0) * multiplier),
    bossDefense: Math.round(Number(boss.defense || 0) * multiplier), combatMultiplier: multiplier,
    bossPortrait: d.boss?.portrait, bossMaterialIds: d.boss?.material_ids || [], skills: d.boss?.skills || [],
    description: d.boss?.description_fa || d.name, events: d.events_after_wave, source: d
  }); });
  const tower = pack.tower;
  const towerFloors = (tower.floors || []).map(f => ({ ...f, gold: f.reward?.gold || 0, xp: f.reward?.xp || 0 }));
  const towerEncounters = pack.towerEncounters.map(e => {
    const multiplier = regionCombatMultiplier(tower.region_id);
    const hp = Math.round(Number(e.hp || 0) * multiplier), mp = Math.round(Number(e.mp || 0) * multiplier);
    const attack = Math.round(Number(e.attack || 0) * multiplier), defense = Math.round(Number(e.defense || 0) * multiplier);
    return ({
    id: e.id, name: e.name, icon: e.kind === 'boss' ? '👑' : e.kind === 'mini_boss' ? '☠️' : '🛡️',
    kind: e.kind === 'mini_boss' ? 'miniboss' : e.kind, regionId: tower.region_id, level: e.level,
    hp, maxHp: hp, mp, maxMp: mp, attack, defense, combatMultiplier: multiplier,
    accuracy: e.accuracy || 90, speed: e.speed || 10, skills: e.skills || [], quality: 'دشمن اختصاصی برج',
    materialIds: [], materialNames: [], xp: 0, gold: 0, towerOnly: true,
    towerMini: e.kind === 'mini_boss', towerBoss: ['boss','area_boss'].includes(e.kind), towerFloor: Number((e.id.match(/floor(\d+)/)||[])[1]) || null,
    portrait: e.portrait, stats: { power: e.attack, speed: e.speed || 10, endurance: e.defense, vitality: Math.max(1, Math.round(e.hp / 12)),
      intellect: Math.max(0, Math.round((e.mp || 0) / 8)), perception: e.accuracy || 90, luck: 0, faith: Math.max(0, Math.round((e.mp || 0) / 10)),
      hp, mp, attack, defense, accuracy: Math.round((e.accuracy || 90) * multiplier) }
  }); });
  const ruins = pack.ruins[0] || null;
  const npcById = new Map(pack.npcs.map(x => [x.id, x]));
  const mainQuests = pack.quests.filter(q => q.kind === 'main_chain').sort((a,b) => a.sequence-b.sequence);
  const sideQuests = pack.quests.filter(q => q.kind === 'side');
  const mainQuestChains = mainQuests.map(q => ({
    id:q.id, title:q.name, regionId:q.region_id, giver:npcById.get(q.giver_npc_id)?.name || q.giver_npc_id,
    description:q.description_fa || '', rewardGold:Number(q.rewards?.gold||0), rewardXp:Number(q.rewards?.xp||0)
  }));
  const mainQuestSteps = mainQuests.map(q => {
    const defeat=q.objectives.find(x=>x.type==='defeat'), collect=q.objectives.find(x=>x.type==='collect');
    const target=monsterById.get(defeat?.target_id);
    return {regionId:q.region_id,name:regions.find(x=>x.id===q.region_id)?.name||q.region_id,
      eliteId:defeat?.target_id,eliteName:target?.name||defeat?.target_id,
      materials:(collect?.items||[]).map(x=>({id:x.material_id,name:materialById.get(x.material_id)?.name||x.material_id,qty:x.quantity}))};
  });
  const npcQuests = sideQuests.map(q => {
    const kill=q.objectives.find(x=>x.type==='kill'), collect=q.objectives.find(x=>x.type==='collect'), item=collect?.items?.[0];
    const target=monsterById.get(kill?.target_id), material=materialById.get(item?.material_id), region=regions.find(x=>x.id===q.region_id);
    return {id:q.id,npcId:q.giver_npc_id,npcName:npcById.get(q.giver_npc_id)?.name||q.giver_npc_id,title:q.name,
      regionId:q.region_id,regionName:region?.name||q.region_id,monsterId:kill?.target_id,monsterName:target?.name||kill?.target_id,
      killQty:Number(kill?.quantity||1),materialId:item?.material_id,materialName:material?.name||item?.material_id,
      materialQty:Number(item?.quantity||1),rewardGold:Number(q.rewards?.gold||0),rewardXp:Number(q.rewards?.xp||0)};
  });
  window.ETRANOM_RUNTIME_CONTENT = {
    packId: pack.manifest.pack_id, version: pack.manifest.content_version, manifest: pack.manifest,
    regions, materialNames, materials: pack.materials, monsters: encounters, skills: pack.skills,
    items: pack.items, recipes, quests: pack.quests, mainQuestChains, mainQuestSteps, npcQuests,
    npcs: pack.npcs, dungeons, ruins, tower, towerFloors, towerEncounters,
    monsterSkillMap: Object.fromEntries(pack.skills.map(x => [x.id, x])),
    monsterPortraits: Object.fromEntries(pack.monsters.filter(x => x.portrait).map(x => [x.id, x.portrait]))
  };
  console.info('[ETRANOM] Region One runtime content loaded', {
    regions: regions.length, monsters: encounters.length, materials: pack.materials.length,
    recipes: recipes.length, dungeons: dungeons.length, towerFloors: towerFloors.length,
    towerEncounters: towerEncounters.length
  });
  return window.ETRANOM_RUNTIME_CONTENT;
}
