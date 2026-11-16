import { arena, margin, scene } from "./config.js";
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

// export const roomGeometry = {
//   floor: {
//     background: {
//       worldCorners: {
//         topLeft: "",
//         topRight: "",
//         bottomLeft: "",
//         bottomRight: "",
//       },
//       screenCorners: {
//         topLeft: "",
//         topRight: "",
//         bottomLeft: "",
//         bottomRight: "",
//       },
//     },
//     foreground: {},
//   },
//   ceiling: {},
//   leftWall: {},
//   rightWall: {},
//   backWall: {},
// };

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

export const roomGeometry = {
  floor: {
    background: {
      screenCorners: {
        topLeft: {
          x: margin + room.depth,
          y: margin + arena.height - room.depth,
        },
        topRight: {
          x: margin + arena.width - room.depth,
          y: margin + arena.height - room.depth,
        },
        bottomLeft: {
          x: margin,
          y: margin + arena.height,
        },
        bottomRight: {
          x: margin + arena.width,
          y: margin + arena.height,
        },
      },
      worldCorners: {
        topLeft: { x: 0, y: arena.height, z: -room.worldDepth },
        topRight: { x: arena.width, y: arena.height, z: -room.worldDepth },
        bottomLeft: { x: 0, y: arena.height, z: 0 },
        bottomRight: { x: arena.width, y: arena.height, z: 0 },
      },
    },

    foreground: {
      screenCorners: {
        topLeft: {
          x: margin,
          y: margin + arena.height,
        },
        topRight: {
          x: margin + arena.width,
          y: margin + arena.height,
        },
        bottomLeft: {
          x: 0,
          y: scene.height,
        },
        bottomRight: {
          x: scene.width,
          y: scene.height,
        },
      },
      worldCorners: {
        topLeft: { x: 0, y: arena.height, z: 0 },
        topRight: { x: arena.width, y: arena.height, z: 0 },
        bottomLeft: { x: 0, y: arena.height, z: room.worldDepth },
        bottomRight: { x: arena.width, y: arena.height, z: room.worldDepth },
      },
    },
  },

  ceiling: {
    background: {
      screenCorners: {
        topLeft: { x: margin, y: margin },
        topRight: { x: margin + arena.width, y: margin },
        bottomLeft: {
          x: margin + room.depth,
          y: margin + room.depth,
        },
        bottomRight: {
          x: margin + arena.width - room.depth,
          y: margin + room.depth,
        },
      },
      worldCorners: {
        topLeft: { x: 0, y: 0, z: 0 },
        topRight: { x: arena.width, y: 0, z: 0 },
        bottomLeft: { x: 0, y: 0, z: -room.worldDepth },
        bottomRight: { x: arena.width, y: 0, z: -room.worldDepth },
      },
    },

    foreground: {
      screenCorners: {
        topLeft: { x: 0, y: 0 },
        topRight: { x: scene.width, y: 0 },
        bottomLeft: { x: margin, y: margin },
        bottomRight: { x: margin + arena.width, y: margin },
      },
      worldCorners: {
        topLeft: { x: 0, y: 0, z: room.worldDepth },
        topRight: { x: arena.width, y: 0, z: room.worldDepth },
        bottomLeft: { x: 0, y: 0, z: 0 },
        bottomRight: { x: arena.width, y: 0, z: 0 },
      },
    },
  },

  leftWall: {
    background: {
      screenCorners: {
        topLeft: { x: margin, y: margin },
        topRight: {
          x: margin + room.depth,
          y: margin + room.depth,
        },
        bottomLeft: {
          x: margin,
          y: margin + arena.height,
        },
        bottomRight: {
          x: margin + room.depth,
          y: margin + arena.height - room.depth,
        },
      },
      worldCorners: {
        topLeft: { x: 0, y: 0, z: 0 },
        topRight: { x: 0, y: 0, z: -room.worldDepth },
        bottomLeft: { x: 0, y: arena.height, z: 0 },
        bottomRight: { x: 0, y: arena.height, z: -room.worldDepth },
      },
    },

    foreground: {
      screenCorners: {
        topLeft: { x: 0, y: 0 },
        topRight: { x: margin, y: margin },
        bottomLeft: { x: 0, y: scene.height },
        bottomRight: {
          x: margin,
          y: margin + arena.height,
        },
      },
      worldCorners: {
        topLeft: { x: 0, y: 0, z: room.worldDepth },
        topRight: { x: 0, y: 0, z: 0 },
        bottomLeft: { x: 0, y: arena.height, z: room.worldDepth },
        bottomRight: { x: 0, y: arena.height, z: 0 },
      },
    },
  },

  rightWall: {
    background: {
      screenCorners: {
        topLeft: {
          x: margin + arena.width - room.depth,
          y: margin + room.depth,
        },
        topRight: {
          x: margin + arena.width,
          y: margin,
        },
        bottomLeft: {
          x: margin + arena.width - room.depth,
          y: margin + arena.height - room.depth,
        },
        bottomRight: {
          x: margin + arena.width,
          y: margin + arena.height,
        },
      },
      worldCorners: {
        topLeft: { x: arena.width, y: 0, z: -room.worldDepth },
        topRight: { x: arena.width, y: 0, z: 0 },
        bottomLeft: { x: arena.width, y: arena.height, z: -room.worldDepth },
        bottomRight: { x: arena.width, y: arena.height, z: 0 },
      },
    },

    foreground: {
      screenCorners: {
        topLeft: {
          x: margin + arena.width,
          y: margin,
        },
        topRight: {
          x: scene.width,
          y: 0,
        },
        bottomLeft: {
          x: margin + arena.width,
          y: margin + arena.height,
        },
        bottomRight: {
          x: scene.width,
          y: scene.height,
        },
      },
      worldCorners: {
        topLeft: { x: arena.width, y: 0, z: 0 },
        topRight: { x: arena.width, y: 0, z: room.worldDepth },
        bottomLeft: { x: arena.width, y: arena.height, z: 0 },
        bottomRight: { x: arena.width, y: arena.height, z: room.worldDepth },
      },
    },
  },

  backWall: {
    screenCorners: {
      topLeft: {
        x: margin + room.depth,
        y: margin + room.depth,
      },
      topRight: {
        x: margin + arena.width - room.depth,
        y: margin + room.depth,
      },
      bottomLeft: {
        x: margin + room.depth,
        y: margin + arena.height - room.depth,
      },
      bottomRight: {
        x: margin + arena.width - room.depth,
        y: margin + arena.height - room.depth,
      },
    },
    worldCorners: {
      topLeft: { x: 0, y: 0, z: -room.worldDepth },
      topRight: { x: arena.width, y: 0, z: -room.worldDepth },
      bottomLeft: { x: 0, y: arena.height, z: -room.worldDepth },
      bottomRight: { x: arena.width, y: arena.height, z: -room.worldDepth },
    },
  },
};
