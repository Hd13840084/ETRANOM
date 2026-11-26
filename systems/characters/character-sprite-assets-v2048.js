/** ETRANOM V2048 — sprite asset bindings for the 40 specialization identities. */
import { CHARACTER_IDENTITY_ROSTER_V2047 } from './character-identity-roster-v2047.js';

export const CHARACTER_SPRITE_ASSET_VERSION_V2048 = '2048.0.0';
export const CHARACTER_SPRITE_ASSETS_V2048 = Object.freeze(CHARACTER_IDENTITY_ROSTER_V2047.map(item => Object.freeze({
  specializationId: item.specializationId,
  classId: item.classId,
  specializationNameFa: item.specializationNameFa,
  spriteUrl: `./assets/characters/v2048/${item.specializationId}.svg`,
  width: 96, height: 128, format: 'image/svg+xml',
  assetStatus: 'prototype_sprite',
  gameplayMutation: false
})));

export function getCharacterSpriteAssetV2048(specializationId) {
  const id = String(specializationId || '').trim();
  return CHARACTER_SPRITE_ASSETS_V2048.find(item => item.specializationId === id) || null;
}

export function auditCharacterSpriteAssetsV2048(assets = CHARACTER_SPRITE_ASSETS_V2048) {
  const ids = assets.map(item => item.specializationId);
  const errors = [];
  if (assets.length !== 40) errors.push(`asset_count:${assets.length}/40`);
  if (new Set(ids).size !== ids.length) errors.push('duplicate_specialization_sprite');
  if (assets.some(item => !item.spriteUrl || item.width !== 96 || item.height !== 128 || item.gameplayMutation !== false)) errors.push('invalid_sprite_metadata');
  return Object.freeze({ complete: errors.length === 0, count: assets.length, errors: Object.freeze(errors) });
}
