export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function inverseLerp(a, b, value) {
  return (value - a) / (b - a);
}

export function lerpColor(colorA, colorB, t) {
  return {
    r: lerp(colorA.r, colorB.r, t),
    g: lerp(colorA.g, colorB.g, t),
    b: lerp(colorA.b, colorB.b, t),
  };
}

export function bilinearColor(
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  x,
  y,
) {
  const topEdge = lerpColor(topLeft, topRight, x);
  const bottomEdge = lerpColor(bottomLeft, bottomRight, x);
  const result = lerpColor(topEdge, bottomEdge, y);
  return result;
}

export function lerp3d(pointA, pointB, t) {
  const lerpedX = lerp(pointA.x, pointB.x, t);
  const lerpedY = lerp(pointA.y, pointB.y, t);
  const lerpedZ = lerp(pointA.z, pointB.z, t);
  return { x: lerpedX, y: lerpedY, z: lerpedZ };
}

export function bilinear3d(topLeft, topRight, bottomLeft, bottomRight, u, v) {
  const topEdge = lerp3d(topLeft, topRight, u);
  const bottomEdge = lerp3d(bottomLeft, bottomRight, u);
  const result = lerp3d(topEdge, bottomEdge, v);
  return result;
}

export function lerp2d(A, B, t) {
  const lerpedX = lerp(A.x, B.x, t);
  const lerpedY = lerp(A.y, B.y, t);
  const point = { x: lerpedX, y: lerpedY };
  return point;
}
export function bilinear2d(topLeft, topRight, bottomLeft, bottomRight, u, v) {
  const topEdge = lerp2d(topLeft, topRight, u);
  const bottomEdge = lerp2d(bottomLeft, bottomRight, u);
  const result = lerp2d(topEdge, bottomEdge, v);
  return result;
}
