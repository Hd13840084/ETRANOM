/**
 * ETRANOM V1978 — release/readiness audit for the engine foundation.
 * This is intentionally an audit/guard layer, not a pretend live backend.
 * It records which modules exist and which production paths are still bound
 * to legacy/local/RPC implementations. Content gates remain fail-closed.
 */
import * as combatGateway from './central-combat-runtime-v1972.js?build=2081';
import * as skillRuntime from './shared-skill-runtime.js?build=2081';
import * as monsterEngine from './monster-combat-engine-v1970.js?build=2081';
import * as rewardEngine from './monster-reward-engine-v1971.js?build=2081';
import * as monsterAI from './monster-ai-engine-v1974.js?build=2081';
import * as rewardSettlement from './combat-reward-settlement-v1975.js?build=2081';
import * as mitigation from './unified-combat-mitigation-v1976.js?build=2081';
import * as progression from '../progression/character-progression-v1979.js?v=2013&build=2081';
import * as economy from '../economy/economy-ledger-v1977.js?build=2081';
import * as safeZone from '../safe-zone/safe-zone-platform.js?build=2081';
export const ENGINE_READINESS_VERSION_V1978 = '1978.0.0';
const MODULES = Object.freeze([
    ['centralCombat', combatGateway, ['dispatchSoloCombatActionV1972', 'dispatchRemoteCombatActionV1972']],
    ['skills', skillRuntime, ['resolveCombatSkill', 'listAvailableSharedSkills']],
    ['monster', monsterEngine, ['createMonsterCombatEngineV1970']],
    ['monsterRewards', rewardEngine, ['createMonsterRewardEngineV1971']],
    ['monsterAI', monsterAI, ['createMonsterAIEngineV1974']],
    ['rewardSettlement', rewardSettlement, ['createCombatRewardSettlementServiceV1975']],
    ['mitigation', mitigation, ['mitigateDamageV1976', 'applyStatusEffectV1976']],
    ['progression', progression, ['grantCharacterXpV1979', 'applyDeathPenaltyV1979']],
    ['economy', economy, ['createEconomyLedgerServiceV1977']],
    ['safeZone', safeZone, ['createSafeZoneContentGate']]
]);
const PRODUCTION_BINDINGS = Object.freeze([
    Object.freeze({ id: 'solo_combat', status: 'legacy_executor_behind_gateway', authority: 'browser_save', blocker: 'Solo still mutates legacy local combat/save state; no server-backed Solo transaction endpoint.' }),
    Object.freeze({ id: 'party_combat', status: 'gateway_to_existing_rpc', authority: 'Supabase RPC', blocker: 'V1968 central turn lifecycle and V1975 reward settlement are not installed as PostgreSQL transaction adapters.' }),
    Object.freeze({ id: 'pvp_combat', status: 'legacy_ui_to_existing_rpc', authority: 'Supabase RPC', blocker: 'PvP UI still calls its existing action RPC directly; V1972 shared remote gateway is not bound in the live PvP UI.' }),
    Object.freeze({ id: 'monster_ai', status: 'module_only', authority: 'none_live', blocker: 'V1974 AI is tested as a module but not called by the live Solo/Party/PvP enemy-turn executors.' }),
    Object.freeze({ id: 'reward_settlement', status: 'module_only', authority: 'none_live', blocker: 'V1975 settlement service requires a trusted resolver and serializable store; live reward paths still use existing executors/RPCs.' }),
    Object.freeze({ id: 'combat_mitigation', status: 'adapter_partial', authority: 'legacy_plus_adapters', blocker: 'V1976 mitigation/status functions are not yet the single damage/control path for every mode.' }),
    Object.freeze({ id: 'progression', status: 'module_only', authority: 'legacy_save', blocker: 'V1979 progression functions are not yet the sole XP/level/death implementation in game.js and server RPCs.' }),
    Object.freeze({ id: 'economy', status: 'module_only', authority: 'legacy_save_and_rpc', blocker: 'V1977 ledger requires a production transactional store and is not wired to the live wallet/marketplace RPCs.' })
]);
const REQUIRED_MODULE_NAMES = MODULES.map(([name]) => name);
export function buildEngineReadinessReportV1978({ classCatalog = null, regionManifest = null, backendAdapters = {} } = {}) {
    const modules = MODULES.map(([name, namespace, required]) => {
        const missing = required.filter(key => typeof namespace[key] !== 'function');
        return Object.freeze({ name, available: missing.length === 0, missingExports: Object.freeze(missing) });
    });
    const bindings = PRODUCTION_BINDINGS.map(item => {
        const adapter = backendAdapters[item.id];
        const claimedLive = (adapter === null || adapter === void 0 ? void 0 : adapter.productionVerified) === true && (adapter === null || adapter === void 0 ? void 0 : adapter.transactional) === true && typeof (adapter === null || adapter === void 0 ? void 0 : adapter.execute) === 'function';
        return Object.freeze({ ...item, productionVerified: claimedLive });
    });
    const classReady = (classCatalog === null || classCatalog === void 0 ? void 0 : classCatalog.approved) === true && Number(classCatalog === null || classCatalog === void 0 ? void 0 : classCatalog.approvedSpecializations) === 40;
    const regionsReady = (regionManifest === null || regionManifest === void 0 ? void 0 : regionManifest.approved) === true && Number(regionManifest === null || regionManifest === void 0 ? void 0 : regionManifest.approvedRegions) === 10 && Number(regionManifest === null || regionManifest === void 0 ? void 0 : regionManifest.zonesPerRegion) === 6;
    const missingModules = modules.filter(x => !x.available).map(x => x.name);
    const liveBlockers = bindings.filter(x => !x.productionVerified).map(x => x.id);
    const contentGateOpen = classReady && regionsReady;
    return Object.freeze({
        version: ENGINE_READINESS_VERSION_V1978,
        generatedAt: null,
        moduleInventory: Object.freeze(modules),
        productionBindings: Object.freeze(bindings),
        counts: Object.freeze({ requiredModules: REQUIRED_MODULE_NAMES.length, availableModules: modules.filter(x => x.available).length, productionBindings: bindings.length, unverifiedProductionBindings: liveBlockers.length }),
        gates: Object.freeze({ classes: { required: 40, approved: classReady }, regions: { required: 10, approved: regionsReady, zonesPerRegion: 6 }, contentGateOpen }),
        readiness: Object.freeze({ engineModulesPresent: missingModules.length === 0, fullyLiveIntegrated: liveBlockers.length === 0, readyToBeginAuthoredContent: contentGateOpen && missingModules.length === 0 }),
        blockers: Object.freeze({ missingModules: Object.freeze(missingModules), unverifiedProductionBindings: Object.freeze(liveBlockers), contentGate: contentGateOpen ? [] : ['تأیید نهایی ۴۰ تخصص و ۱۰ منطقه هنوز ثبت نشده است.'] }),
        safety: Object.freeze({ noLiveMutationPerformed: true, noSqlExecuted: true, noDeploymentPerformed: true })
    });
}
export function getProductionBindingManifestV1978() { return PRODUCTION_BINDINGS; }
export const EngineReadinessV1978 = Object.freeze({ version: ENGINE_READINESS_VERSION_V1978, build: buildEngineReadinessReportV1978, bindings: getProductionBindingManifestV1978 });
