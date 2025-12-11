const height = f(distanceFromSide);

const delta = 0.001; // Small value to approximate derivative
const y1 = f(distanceFromSide - delta);
const y2 = f(distanceFromSide + delta);
const derivative = (y2 - y1) / (2 * delta);
const normal = { x: -derivative, y: 1 }; // Derivative, rotated by -90 degrees

const maximumDisplacement = Math.max(...displacementMagnitudes);

displacementVector_normalized = {
  angle: normalAtBorder,
  magnitude: magnitude / maximumDisplacement,
};