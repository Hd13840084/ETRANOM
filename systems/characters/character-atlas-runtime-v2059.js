/** ETRANOM V2059 — resilient atlas runtime helpers. */
import { CHARACTER_ATLAS_STATES_V2055, getCharacterAtlasFrameV2055, loadCharacterAtlasFrameV2055, normalizeCharacterAtlasDirectionV2055, resolveCharacterAtlasFrameIndexV2055 } from './character-atlas-v2055.js?build=2081';
import { getCharacterAtlasPlaybackProfileV2135, resolveCharacterAtlasProfileFrameV2135 } from './character-atlas-playback-v2135.js?v=2135';
const pending = new Map();
const authoredPoseImages = new Map();
const AUTHORED_POSE_ROOTS_V2136 = Object.freeze({
    warrior_apocalypse_harbinger: './assets/characters/v2060-authored/warrior_apocalypse_harbinger/',
    wizard_arcane_mage: './assets/characters/v2061-authored/wizard_arcane_mage/',
    wizard_elementalist: './assets/characters/v2061-authored/wizard_elementalist/',
    wizard_necromancer: './assets/characters/v2061-authored/wizard_necromancer/',
    wizard_warlock: './assets/characters/v2061-authored/wizard_warlock/'
});
function authoredPoseUrlV2136(specializationId, state, direction) {
    const root = AUTHORED_POSE_ROOTS_V2136[specializationId];
    return root ? `${root}${state}_${direction}.png` : null;
}
function loadAuthoredPoseV2136(url) {
    if (!url || typeof Image === 'undefined') return null;
    let image = authoredPoseImages.get(url);
    if (!image) {
        image = new Image();
        image.decoding = 'async';
        image.src = url;
        authoredPoseImages.set(url, image);
    }
    return image.complete && image.naturalWidth === 128 && image.naturalHeight === 160 ? image : null;
}
export function getAtlasDrawCommandV2059({ specializationId, state = 'idle', direction = 'south', elapsedMs = 0, phaseMs = 0 } = {}) {
    const safeState = Object.hasOwn(CHARACTER_ATLAS_STATES_V2055, state) ? state : 'idle';
    const safeDirection = normalizeCharacterAtlasDirectionV2055(direction);
    const clip = CHARACTER_ATLAS_STATES_V2055[safeState];
    const authoredUrl = authoredPoseUrlV2136(specializationId, safeState, safeDirection);
    if (authoredUrl) {
        const descriptor = Object.freeze({ url: authoredUrl, specializationId, state: safeState, direction: safeDirection, frameCount: 1, frameWidth: 128, frameHeight: 160, expectedWidth: 128, expectedHeight: 160, authoredPose: true });
        return Object.freeze({ descriptor, authoredPose: true, sourceX: 0, sourceY: 0, sourceWidth: 128, sourceHeight: 160, frameIndex: 0, sequenceIndex: 0, playbackFps: 0, normalizedTwoCycle: false, normalizedKeyframes: false, keyframeProfileKind: 'authored_single_pose', ready: false });
    }
    const profile = getCharacterAtlasPlaybackProfileV2135(specializationId, safeState, safeDirection);
    const elapsed = Math.max(0, Number(elapsedMs) || 0) + (Number(phaseMs) || 0);
    const frame = profile
        ? resolveCharacterAtlasProfileFrameV2135(profile, elapsed, clip.loop)
        : resolveCharacterAtlasFrameIndexV2055(safeState, elapsedMs, phaseMs);
    const frameCount = profile?.frames?.length || clip.frames;
    const sequenceIndex = profile ? Math.max(0, profile.frames.indexOf(frame)) : frame;
    const fps = profile ? Math.round(frameCount * 1000 / Math.max(1, profile.durationMs) * 1e6) / 1e6 : clip.fps;
    const descriptor = getCharacterAtlasFrameV2055(specializationId, safeState, safeDirection, frame);
    return Object.freeze({
        descriptor,
        sourceX: descriptor.frameCount === 1 ? 0 : frame * descriptor.frameWidth,
        sourceY: 0,
        sourceWidth: descriptor.frameWidth,
        sourceHeight: descriptor.frameHeight,
        frameIndex: descriptor.frameIndex,
        sequenceIndex,
        playbackFps: fps,
        normalizedTwoCycle: profile?.kind === 'periodic_cycle',
        normalizedKeyframes: !!profile,
        keyframeProfileKind: profile?.kind || 'source',
        ready: false
    });
}
export function loadAtlasForDrawV2059(command) {
    var _a;
    if (!((_a = command === null || command === void 0 ? void 0 : command.descriptor) === null || _a === void 0 ? void 0 : _a.url))
        return null;
    const image = command.authoredPose ? loadAuthoredPoseV2136(command.descriptor.url) : loadCharacterAtlasFrameV2055(command.descriptor);
    if (!(image === null || image === void 0 ? void 0 : image.complete) || !image.naturalWidth)
        return null;
    if (image.naturalWidth !== command.descriptor.expectedWidth || image.naturalHeight !== command.descriptor.expectedHeight)
        return null;
    return image;
}
export function preloadCharacterAtlasesV2059(specializationId, states = ['idle'], directions = ['south']) {
    const jobs = [];
    for (const state of states)
        for (const direction of directions) {
            const authoredUrl = authoredPoseUrlV2136(specializationId, state, normalizeCharacterAtlasDirectionV2055(direction));
            if (authoredUrl) {
                if (!pending.has(authoredUrl)) {
                    const promise = new Promise(resolve => {
                        if (typeof Image === 'undefined') return resolve(false);
                        const image = new Image(); image.decoding = 'async';
                        image.onload = () => resolve(image.naturalWidth === 128 && image.naturalHeight === 160);
                        image.onerror = () => resolve(false); image.src = authoredUrl;
                    }).finally(() => pending.delete(authoredUrl));
                    pending.set(authoredUrl, promise);
                }
                jobs.push(pending.get(authoredUrl));
                continue;
            }
            const descriptor = getCharacterAtlasFrameV2055(specializationId, state, direction, 0);
            if (!descriptor.url)
                continue;
            if (!pending.has(descriptor.url)) {
                const promise = new Promise(resolve => {
                    if (typeof Image === 'undefined')
                        return resolve(false);
                    const image = new Image();
                    image.decoding = 'async';
                    image.onload = () => resolve(image.naturalWidth === descriptor.expectedWidth && image.naturalHeight === descriptor.expectedHeight);
                    image.onerror = () => resolve(false);
                    image.src = descriptor.url;
                }).finally(() => pending.delete(descriptor.url));
                pending.set(descriptor.url, promise);
            }
            jobs.push(pending.get(descriptor.url));
        }
    return Promise.all(jobs);
}
export function getAtlasPreloadQueueSizeV2059() { return pending.size; }
