//Direction and distance attenuation
export function calculateLighting(point, light) {
  const dx = light.x - point.x;
  const dy = light.y - point.y;
  const dz = light.z - point.z;
  const L = Math.hypot(dx, dy, dz);
  if (L === 0) {
    return;
  }
  if (light.range > L) {
    const lx = dx / L;
    const ly = dy / L;
    const lz = dz / L;
    const intensity = light.strength * Math.max(0, 1 - L / light.range);
    const color = light.color;
    return {
      lx,
      ly,
      lz,
      intensity,
      color,
    };
  }
  return;
}
function calculateDiffuse(normal, lighting) {
  const diffuse = Math.max(
    0,
    normal.x * lighting.lx + normal.y * lighting.ly + normal.z * lighting.lz,
  );
  return diffuse;
}

function calculateSurfaceLighting(surface, point, light) {
  const lightNormals = calculateLighting(point, light);

  if (!lightNormals) {
    return { r: 0, g: 0, b: 0 };
  }
  const diffuse = calculateDiffuse(surface.normal, lightNormals);
  const contribution = diffuse * lightNormals.intensity;
  let { r, g, b } = light.color;
  r = r * contribution;
  g = g * contribution;
  b = b * contribution;
  return { r, g, b };
}

function applyLighting(material, lighting) {
  const { r: mr, g: mg, b: mb } = material.color;
  const { r: lr, g: lg, b: lb } = lighting;
  return { r: mr * lr, g: mg * lg, b: mb * lb };
}
function combineLighting(ambient, direct) {
  return {
    r: ambient.r + direct.r,
    g: ambient.g + direct.g,
    b: ambient.b + direct.b,
  };
}

export function calculateSurfaceColor(surface, point, lights) {
  const ambient = { r: 0.15, g: 0.15, b: 0.15 };

  const lightValue = lights.reduce((accumulator, item) => {
    const surfaceLighting = calculateSurfaceLighting(surface, point, item);

    accumulator = combineLighting(surfaceLighting, accumulator);

    return accumulator;
  }, ambient);
  const surfaceColor = applyLighting(surface.material, lightValue);

  return surfaceColor;
}
