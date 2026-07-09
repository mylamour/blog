/* 须在 zenscroll 求值前设置，见 zenscroll 的 noZensmooth 检查 */
window.noZensmooth = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
