/** ETRANOM V2059 — resilient atlas runtime helpers. */
import { CHARACTER_ATLAS_STATES_V2055, getCharacterAtlasFrameV2055, loadCharacterAtlasFrameV2055, resolveCharacterAtlasFrameIndexV2055 } from './character-atlas-v2055.js?build=2081';
const pending = new Map();
export function getAtlasDrawCommandV2059({ specializationId, state = 'idle', direction = 'south', elapsedMs = 0, phaseMs = 0 } = {}) {
    const safeState = Object.hasOwn(CHARACTER_ATLAS_STATES_V2055, state) ? state : 'idle';
    const frame = resolveCharacterAtlasFrameIndexV2055(safeState, elapsedMs, phaseMs);
    const descriptor = getCharacterAtlasFrameV2055(specializationId, safeState, direction, frame);
    return Object.freeze({ descriptor, sourceX: descriptor.frameCount === 1 ? 0 : frame * descriptor.frameWidth, sourceY: 0,
        sourceWidth: descriptor.frameWidth, sourceHeight: descriptor.frameHeight,
        frameIndex: descriptor.frameIndex, ready: false });
}
export function loadAtlasForDrawV2059(command) {
    var _a;
    if (!((_a = command === null || command === void 0 ? void 0 : command.descriptor) === null || _a === void 0 ? void 0 : _a.url))
        return null;
    const image = loadCharacterAtlasFrameV2055(command.descriptor);
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
