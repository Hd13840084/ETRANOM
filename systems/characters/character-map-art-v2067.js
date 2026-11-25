/** ETRANOM V2067 high-resolution map character art lookup. */
import { resolveMapSpecializationV2066 } from './character-map-binding-v2066.js';
export function getMapCharacterArtV2067(player = {}) {
  const specializationId = resolveMapSpecializationV2066(player);
  return Object.freeze({ specializationId, src: `./assets/characters/v2067-map-art/${specializationId}.png`, width: 384, height: 512, anchor: 'feet_center', artTier: 'high_resolution_base' });
}
