/**
 * Assigns lane numbers to a list of horses based on registration order (registerAt).
 * First registered = lane 1, second = lane 2, etc.
 * If laneNumber is already set by the backend, it is preserved.
 */
export function assignLanes(horses) {
  return [...horses]
    .sort((a, b) => new Date(a.registerAt) - new Date(b.registerAt))
    .map((h, i) => ({ ...h, laneNumber: h.laneNumber ?? i + 1 }));
}
