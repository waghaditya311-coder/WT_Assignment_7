/**
 * SVG arrow path helpers for relationship lines
 */

/**
 * Get the closest border point on a class box toward a target point
 */
export function getBorderPoint(box, target) {
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const tx = target.x;
  const ty = target.y;

  const dx = tx - cx;
  const dy = ty - cy;

  const hw = box.width / 2;
  const hh = box.height / 2;

  if (dx === 0 && dy === 0) return { x: cx, y: cy };

  // Scale factor to reach the border
  const scaleX = dx !== 0 ? Math.abs(hw / dx) : Infinity;
  const scaleY = dy !== 0 ? Math.abs(hh / dy) : Infinity;
  const scale = Math.min(scaleX, scaleY);

  return {
    x: cx + dx * scale,
    y: cy + dy * scale,
  };
}

/**
 * Compute center of a class box
 */
export function getCenter(box) {
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

/**
 * Get source and target connection points for a relationship
 */
export function getConnectionPoints(sourceBox, targetBox) {
  const sc = getCenter(sourceBox);
  const tc = getCenter(targetBox);
  return {
    source: getBorderPoint(sourceBox, tc),
    target: getBorderPoint(targetBox, sc),
  };
}

/**
 * Get midpoint of a line segment
 */
export function getMidpoint(p1, p2) {
  return { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
}

/**
 * Get a slightly offset point for label placement
 */
export function getLabelPoint(p1, p2, t = 0.15, offset = 12) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return {
    x: p1.x + dx * t + (-dy / len) * offset,
    y: p1.y + dy * t + (dx / len) * offset,
  };
}
