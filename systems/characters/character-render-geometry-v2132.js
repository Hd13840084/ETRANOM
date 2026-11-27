/** V2132: preserve the ground-contact point when scaling animated pixel sprites. */
export function getGroundAnchoredSpriteRectV2132(x, y, width, height, scaleX = 1, scaleY = 1, anchorX = 0.5, anchorY = 1) {
  const values = [x, y, width, height, scaleX, scaleY, anchorX, anchorY].map(Number);
  if (!values.every(Number.isFinite)) throw new TypeError('Sprite geometry must contain finite numbers.');
  const [left, top, w, h, sxRaw, syRaw, axRaw, ayRaw] = values;
  const sx = Math.max(0.1, Math.min(3, sxRaw));
  const sy = Math.max(0.1, Math.min(3, syRaw));
  const ax = Math.max(0, Math.min(1, axRaw));
  const ay = Math.max(0, Math.min(1, ayRaw));
  const drawWidth = w * sx;
  const drawHeight = h * sy;
  return Object.freeze({
    x: left + (w - drawWidth) * ax,
    y: top + (h - drawHeight) * ay,
    width: drawWidth,
    height: drawHeight,
    anchorX: left + w * ax,
    anchorY: top + h * ay
  });
}

