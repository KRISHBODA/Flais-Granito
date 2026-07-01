export const getRoomPolygon = (shape, dim, unit) => {
  const factor = unit === 'ft' ? 0.3048 : 1;
  const parse = (val) => (parseFloat(val) || 0) * factor;

  let pts = [];

  if (shape === 'rectangle') {
    const l = parse(dim.length), w = parse(dim.width);
    pts = [[0, 0], [w, 0], [w, l], [0, l]]; // x is width, y is length
  } else if (shape === 'l-shape') {
    const mainL = parse(dim.l1), mainW = parse(dim.w1);
    const extL = parse(dim.l2), extW = parse(dim.w2);
    // Vertical leg on left (w1 x l1), horizontal leg on bottom right (w2 x l2)
    // Wait, let's use:
    // 0,0 to mainW,0
    // down to mainW, mainL - extW
    // right to mainW + extL, mainL - extW
    // down to mainW + extL, mainL
    // left to 0, mainL
    // up to 0,0
    pts = [
      [0, 0],
      [mainW, 0],
      [mainW, Math.max(0, mainL - extW)],
      [mainW + extL, Math.max(0, mainL - extW)],
      [mainW + extL, mainL],
      [0, mainL]
    ];
  } else if (shape === 't-shape') {
    const mainL = parse(dim.mainL), mainW = parse(dim.mainW);
    const stemL = parse(dim.stemL), stemW = parse(dim.stemW);
    const offset = (mainW - stemW) / 2;
    // Top horizontal bar: width=mainW, height=mainL
    // Stem going down: width=stemW, height=stemL
    pts = [
      [0, 0],
      [mainW, 0],
      [mainW, mainL],
      [offset + stemW, mainL],
      [offset + stemW, mainL + stemL],
      [offset, mainL + stemL],
      [offset, mainL],
      [0, mainL]
    ];
  } else if (shape === 'u-shape') {
    const baseL = parse(dim.baseL), baseW = parse(dim.baseW);
    const leftArmL = parse(dim.leftArmL), leftArmW = parse(dim.leftArmW);
    const rightArmL = parse(dim.rightArmL), rightArmW = parse(dim.rightArmW);
    // Arms at the top, base at the bottom
    // We start top-left of left arm
    pts = [
      [0, 0],
      [leftArmW, 0],
      [leftArmW, leftArmL],
      [baseW - rightArmW, rightArmL], // inner corner right
      [baseW - rightArmW, 0], // top right arm left side
      [baseW, 0], // top right arm right side
      [baseW, Math.max(leftArmL, rightArmL) + baseL], // bottom right
      [0, Math.max(leftArmL, rightArmL) + baseL] // bottom left
    ];
  } else if (shape === 'cutout') {
    const l = parse(dim.roomL), w = parse(dim.roomW);
    const cl = parse(dim.cutoutL), cw = parse(dim.cutoutW);
    // Cutout at top right
    pts = [
      [0, 0],
      [Math.max(0, w - cw), 0],
      [Math.max(0, w - cw), cl],
      [w, cl],
      [w, l],
      [0, l]
    ];
  }

  // Fallback for invalid/empty shapes
  if (pts.length === 0 || pts.some(p => isNaN(p[0]) || isNaN(p[1]))) {
    return [[0, 0], [1, 0], [1, 1], [0, 1]];
  }
  return pts;
};

export const getPolygonArea = (pts) => {
  let area = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    area += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
  }
  return Math.abs(area / 2);
};

export const getPolygonPerimeter = (pts) => {
  let perimeter = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const dx = pts[i][0] - pts[j][0];
    const dy = pts[i][1] - pts[j][1];
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }
  return perimeter;
};

export const calculateRoomRequirements = (room) => {
  const factor = room.unit === 'ft' ? 0.09290304 : 1;
  const area = parseFloat(room.area) || 0;
  const totalCalculationAreaSqM = area * factor;

  // Convert custom tile sizes or use presets
  let tileW_m = 0;
  let tileH_m = 0;
  if (room.tileId === 'custom') {
    tileW_m = (parseFloat(room.customTileW) || 0) / 1000;
    tileH_m = (parseFloat(room.customTileH) || 0) / 1000;
  } else {
    const [w, h] = room.tileId.split('x').map(Number);
    tileW_m = (w || 0) / 1000;
    tileH_m = (h || 0) / 1000;
  }

  const tileAreaSqM = tileW_m * tileH_m;
  const netTiles = tileAreaSqM > 0 ? Math.ceil(totalCalculationAreaSqM / tileAreaSqM) : 0;
  const wastageCount = Math.ceil(netTiles * ((parseFloat(room.wastage) || 0) / 100));
  const totalTiles = netTiles + wastageCount;

  // Boxes and Costs
  const tilesPerBox = parseFloat(room.tilesPerBox) || 0;
  const pricePerBox = parseFloat(room.pricePerBox) || 0;
  let boxes = 0;
  let tilesCost = 0;
  if (tilesPerBox > 0) {
    boxes = Math.ceil(totalTiles / tilesPerBox);
    if (pricePerBox > 0) tilesCost = boxes * pricePerBox;
  }

  // Grout
  // Simple grout factor map
  let GROUT_FACTORS = { 2: 1, 3: 1.4, 5: 2.2 };
  try {
    const saved = localStorage.getItem('flais_tile_calculator_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.groutOptions && Array.isArray(parsed.groutOptions)) {
        GROUT_FACTORS = parsed.groutOptions.reduce((acc, opt) => {
          acc[opt.value] = opt.factor;
          return acc;
        }, {});
      }
    }
  } catch (e) {
      }
  const groutJoint = parseFloat(room.groutJoint) || 3;
  const groutFactor = GROUT_FACTORS[groutJoint] || 1.4;
  const groutKg = totalCalculationAreaSqM * groutFactor;
  
  const groutBagSize = parseFloat(room.groutBagSize) || 2;
  const groutPricePerBag = parseFloat(room.groutPricePerBag) || 0;
  const groutBags = groutBagSize > 0 ? Math.ceil(groutKg / groutBagSize) : 0;
  const groutCost = groutBags * groutPricePerBag;

  // Adhesive
  // standard: 4.5 kg/sqm
  const adhesiveKg = totalCalculationAreaSqM * 4.5;
  const adhesiveBagSize = parseFloat(room.adhesiveBagSize) || 20;
  const adhesivePricePerBag = parseFloat(room.adhesivePricePerBag) || 0;
  const adhesiveBags = adhesiveBagSize > 0 ? Math.ceil(adhesiveKg / adhesiveBagSize) : 0;
  const adhesiveCost = adhesiveBags * adhesivePricePerBag;

  const totalCost = tilesCost + groutCost + adhesiveCost;

  return {
    areaSqm: totalCalculationAreaSqM,
    netTiles,
    wastageCount,
    totalTiles,
    boxes,
    tilesCost,
    groutKg,
    groutBags,
    groutCost,
    adhesiveKg,
    adhesiveBags,
    adhesiveCost,
    totalCost
  };
};

export const encodeState = (state) => {
  try {
    return btoa(JSON.stringify(state));
  } catch {
    return '';
  }
};

export const decodeState = (hash) => {
  try {
    return JSON.parse(atob(hash));
  } catch {
    return null;
  }
};

export const getSmartTileRecommendation = (areaSqm) => {
  if (areaSqm < 6) return '600x600';
  if (areaSqm <= 20) return '600x1200';
  if (areaSqm <= 40) return '800x1600';
  return '800x2400';
};
