import { arena } from "./config.js";
export const room = {
  depth: 120,
  worldDepth: 240,
};
const baseRoomColor = { r: 0.72, g: 0.71, b: 0.68 };
export const roomMaterials = {
  floor: {
    color: { ...baseRoomColor },
    texture: null,
  },
  wall: {
    color: { ...baseRoomColor },
    texture: null,
  },
  ceiling: {
    color: { ...baseRoomColor },
    texture: null,
  },
};

export const roomSurfaces = {
  floor: {
    material: roomMaterials.floor,
    normal: { x: 0, y: -1, z: 0 },
    y: arena.height,
  },
  ceiling: {
    material: roomMaterials.ceiling,
    normal: { x: 0, y: 1, z: 0 },
    y: 0,
  },
  rightWall: {
    material: roomMaterials.wall,
    normal: { x: -1, y: 0, z: 0 },
    x: arena.width,
  },
  leftWall: {
    material: roomMaterials.wall,
    normal: { x: 1, y: 0, z: 0 },
    x: 0,
  },
  backWall: {
    material: roomMaterials.wall,
    normal: { x: 0, y: 0, z: 1 },
    z: -room.worldDepth,
  },
};
export const ceilingPoint = {
  x: arena.width / 2,
  y: 0,
  z: -room.worldDepth / 2,
};
export const centerBackLeftWall = {
  x: 0,
  y: arena.height / 2,
  z: -room.worldDepth / 2,
};
export const backWallPoint = {
  x: arena.width / 2,
  y: arena.height / 2,
  z: -room.worldDepth,
};

export const centerBackRightWall = {
  x: arena.width,
  y: arena.height / 2,
  z: -room.worldDepth / 2,
};
export const frontFloorPoint = {
  x: arena.width / 2,
  y: arena.height,
  z: 0,
};
export const frontOuterFloorPoint = {
  x: arena.width / 2,
  y: arena.height,
  z: 120,
};
export const backFloorPoint = {
  x: arena.width / 2,
  y: arena.height,
  z: -room.worldDepth,
};
