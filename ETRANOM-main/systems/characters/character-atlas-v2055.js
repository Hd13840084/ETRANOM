/**
 * ETRANOM V2055 — authored sprite-atlas contract and browser cache.
 * One horizontal PNG strip per specialization/state/direction. Frames are never
 * mirrored or synthesized: each of the eight directions has its own asset path.
 */
import { CHARACTER_IDENTITY_ROSTER_V2047 } from './character-identity-roster-v2047.js?build=2081';
export const CHARACTER_ATLAS_VERSION_V2055 = '2056.0.0';
export const CHARACTER_ATLAS_DIRECTIONS_V2055 = Object.freeze([
    'south', 'south-east', 'east', 'north-east', 'north', 'north-west', 'west', 'south-west'
]);
export const CHARACTER_ATLAS_STATES_V2055 = Object.freeze({
    idle: Object.freeze({ frames: 6, fps: 6, loop: true }),
    walk: Object.freeze({ frames: 8, fps: 12, loop: true }),
    run: Object.freeze({ frames: 8, fps: 20, loop: true }),
    interact: Object.freeze({ frames: 8, fps: 12, loop: false })
});
export const CHARACTER_ATLAS_FRAME_SIZE_V2055 = Object.freeze({ width: 128, height: 160 });
export const CHARACTER_ATLAS_EXPECTED_ASSET_COUNT_V2055 = CHARACTER_IDENTITY_ROSTER_V2047.length * CHARACTER_ATLAS_DIRECTIONS_V2055.length * Object.keys(CHARACTER_ATLAS_STATES_V2055).length;
const imageCache = new Map();
const failedImages = new Set();
const validIds = new Set(CHARACTER_IDENTITY_ROSTER_V2047.map(item => item.specializationId));
export function normalizeCharacterAtlasDirectionV2055(direction = 'south') {
    const value = String(direction || 'south').toLowerCase().replaceAll('_', '-');
    return CHARACTER_ATLAS_DIRECTIONS_V2055.includes(value) ? value : 'south';
}
export function resolveCharacterAtlasFrameIndexV2055(state = 'idle', timeMs = 0, phaseMs = 0) {
    const animation = Object.hasOwn(CHARACTER_ATLAS_STATES_V2055, state) ? state : 'idle';
    const clip = CHARACTER_ATLAS_STATES_V2055[animation];
    const elapsed = Math.max(0, Number(timeMs) || 0) + (Number(phaseMs) || 0);
    const raw = Math.floor(elapsed * clip.fps / 1000);
    return clip.loop ? raw % clip.frames : Math.min(clip.frames - 1, raw);
}
export function getCharacterAtlasFrameV2055(specializationId, state = 'idle', direction = 'south', frame = 0) {
    const id = String(specializationId || '').trim();
    const animation = Object.hasOwn(CHARACTER_ATLAS_STATES_V2055, state) ? state : 'idle';
    const dir = normalizeCharacterAtlasDirectionV2055(direction);
    const clip = CHARACTER_ATLAS_STATES_V2055[animation];
    const frameCount = clip.frames;
    const frameIndex = Math.max(0, Math.min(clip.frames - 1, Math.floor(Number(frame) || 0)));
    const { width: frameWidth, height: frameHeight } = CHARACTER_ATLAS_FRAME_SIZE_V2055;
    return Object.freeze({
        specializationId: id,
        state: animation,
        direction: dir,
        frameIndex,
        frameCount,
        fps: clip.fps,
        loop: clip.loop,
        frameWidth,
        frameHeight,
        url: !validIds.has(id) ? null : `./assets/characters/v2055/${id}/${animation}_${dir}.png`,
        expectedWidth: frameWidth * frameCount,
        expectedHeight: frameHeight,
        authoredAssetRequired: false,
        generatedPrototype: true,
        artQuality: 'multi_frame_directional_prototype'
    });
}
export function loadCharacterAtlasFrameV2055(descriptor) {
    if (!(descriptor === null || descriptor === void 0 ? void 0 : descriptor.url) || typeof Image === 'undefined' || failedImages.has(descriptor.url))
        return null;
    if (!imageCache.has(descriptor.url)) {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => {
            if (image.naturalWidth !== descriptor.expectedWidth || image.naturalHeight !== descriptor.expectedHeight) {
                failedImages.add(descriptor.url);
                imageCache.delete(descriptor.url);
            }
        };
        image.onerror = () => { failedImages.add(descriptor.url); imageCache.delete(descriptor.url); };
        image.src = descriptor.url;
        imageCache.set(descriptor.url, image);
    }
    const image = imageCache.get(descriptor.url);
    if (image.complete && (!image.naturalWidth || image.naturalWidth !== descriptor.expectedWidth || image.naturalHeight !== descriptor.expectedHeight)) {
        failedImages.add(descriptor.url);
        imageCache.delete(descriptor.url);
        return null;
    }
    return image;
}
export function getCharacterAtlasLoadStatusV2055(url) {
    if (failedImages.has(url))
        return 'failed';
    const image = imageCache.get(url);
    if (!image)
        return 'not_requested';
    if (!image.complete)
        return 'loading';
    return image.naturalWidth ? 'ready' : 'failed';
}
export function clearCharacterAtlasImageCacheV2055() {
    imageCache.clear();
    failedImages.clear();
}
export function auditCharacterAtlasContractV2055() {
    const errors = [];
    if (CHARACTER_IDENTITY_ROSTER_V2047.length !== 40)
        errors.push(`specialization_count:${CHARACTER_IDENTITY_ROSTER_V2047.length}/40`);
    if (new Set(CHARACTER_IDENTITY_ROSTER_V2047.map(item => item.specializationId)).size !== 40)
        errors.push('duplicate_specialization_id');
    if (CHARACTER_ATLAS_DIRECTIONS_V2055.length !== 8)
        errors.push('direction_count_not_8');
    if (Object.keys(CHARACTER_ATLAS_STATES_V2055).join(',') !== 'idle,walk,run,interact')
        errors.push('animation_state_contract_mismatch');
    const ids = CHARACTER_IDENTITY_ROSTER_V2047.map(item => item.specializationId);
    const paths = new Set();
    for (const id of ids)
        for (const state of Object.keys(CHARACTER_ATLAS_STATES_V2055))
            for (const direction of CHARACTER_ATLAS_DIRECTIONS_V2055) {
                const descriptor = getCharacterAtlasFrameV2055(id, state, direction, 0);
                if (!descriptor.url)
                    errors.push(`missing_path:${id}/${state}/${direction}`);
                if (paths.has(descriptor.url))
                    errors.push(`duplicate_path:${descriptor.url}`);
                paths.add(descriptor.url);
            }
    return Object.freeze({ complete: errors.length === 0, specializationCount: ids.length, directionCount: 8, stateCount: 4, expectedAssetCount: paths.size, errors: Object.freeze(errors) });
}
