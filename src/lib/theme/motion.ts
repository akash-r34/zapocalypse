/**
 * Spring animation presets using CSS linear() timing function.
 * These approximate spring physics without any JS animation library.
 *
 * Use as: `style={{ animationTimingFunction: springs.snappy }}`
 * or via CSS custom properties.
 */

export const springs = {
  /** Fast, responsive — for UI feedback (buttons, toggles) */
  snappy: "linear(0, 0.009, 0.035 2.1%, 0.141 4.4%, 0.723 12.4%, 0.938 16%, 1.017 18.2%, 1.077, 1.121 22.3%, 1.149 24.4%, 1.159, 1.163 27.3%, 1.154, 1.129 32.8%, 1.051 39.6%, 1.017 43.5%, 1)",
  /** Gentle, smooth — for card reveals and modal enters */
  gentle: "linear(0, 0.006, 0.025 2.8%, 0.101 6.1%, 0.539 14.8%, 0.721 19.2%, 0.833 23.7%, 0.918 28.7%, 0.968 34.1%, 0.991 39.9%, 1.002 45.9%, 1.005 50.7%, 1)",
  /** Bouncy, expressive — for score badges and celebration moments */
  bouncy: "linear(0, 0.004, 0.016, 0.035, 0.063, 0.098, 0.141, 0.191, 0.248, 0.311, 0.38, 0.454, 0.533, 0.614, 0.698, 0.782, 0.864, 0.941, 1.013, 1.077, 1.132, 1.178, 1.213, 1.237, 1.249, 1.25, 1.24, 1.219, 1.188, 1.148, 1.101, 1.05, 0.996, 0.941, 0.887, 0.835, 0.787, 0.744, 0.706, 0.674, 0.649, 0.63, 0.618, 0.613, 0.614, 0.62, 0.631, 0.646, 0.664, 0.684, 0.706, 0.728, 0.75, 0.771, 0.791, 0.808, 0.824, 0.837, 0.848, 0.856, 0.862, 0.866, 0.868, 0.868, 0.867, 0.865, 0.863, 0.861, 0.859, 0.858, 0.858, 0.858, 0.859, 0.861, 0.864, 0.867, 0.87, 0.874, 0.878, 0.882, 0.885, 0.889, 0.892, 0.895, 0.898, 0.9, 0.902, 0.904, 0.906, 0.908, 0.909, 0.911, 0.912, 0.913, 0.914, 0.915, 0.916, 0.917, 0.918, 0.919, 0.919, 0.92, 0.921, 0.921, 1)",
} as const;

export type SpringName = keyof typeof springs;

/** CSS variable definitions for use in globals.css */
export const SPRING_CSS_VARS = `
  --spring-snappy: ${springs.snappy};
  --spring-gentle: ${springs.gentle};
  --spring-bouncy: ${springs.bouncy};
` as const;
