/**
 * Run `callback` at most once per animation frame, however often the event fires.
 * perf Increase: used for window resize, which fires dozens of times a second while dragging.
 */
export function throttleToFrame(callback) {
  let frameId = null;
  const throttled = (...args) => {
    if (frameId !== null) return;
    frameId = window.requestAnimationFrame(() => {
      frameId = null;
      callback(...args);
    });
  };
  throttled.cancel = () => {
    if (frameId !== null) window.cancelAnimationFrame(frameId);
    frameId = null;
  };
  return throttled;
}
