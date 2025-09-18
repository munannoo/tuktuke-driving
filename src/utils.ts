export function lerp(A: number, B: number, t: number): number {
  return A + (B - A) * t;
}

export type Point = { x: number; y: number };

export function getInterSection(A: Point, B: Point, C: Point, D: Point) {
  const ttop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const utop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  if (bottom !== 0) {
    const t = ttop / bottom;
    const u = utop / bottom;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t,
      };
    }
    return null;
  } else {
    return null;
  }
}
