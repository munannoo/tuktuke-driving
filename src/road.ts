import { lerp } from "./utils.js";
import type { Point } from "./utils.js";

export type BorderCoordinates = {
  topLeft: Point;
  bottomLeft: Point;
  topRight: Point;
  bottomRight: Point;
};

export class Road {
  x: number;
  width: number;
  laneCount: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  offset: number = 0;
  borders: BorderCoordinates;

  constructor(x: number, width: number, laneCount: number = 3) {
    // x is the center here.

    this.x = x;
    this.width = width;
    this.laneCount = laneCount;

    this.left = x - width / 2;
    this.right = x + width / 2;

    const infinity = 1000000;
    this.top = -infinity;
    this.bottom = infinity;
    this.borders = {
      topLeft: { x: this.left, y: this.top },
      bottomLeft: { x: this.left, y: this.bottom },
      topRight: { x: this.right, y: this.top },
      bottomRight: { x: this.right, y: this.bottom },
    };
  }

  getLaneCenter(laneIndex: number) {
    const laneWidth = this.width / this.laneCount;
    return (
      this.left +
      laneWidth / 2 +
      Math.min(laneIndex, this.laneCount - 1) * laneWidth
    );
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = "whitesmoke";

    for (let i = 0; i <= this.laneCount; i++) {
      const x = lerp(this.left, this.right, i / this.laneCount);

      if (i > 0 && i < this.laneCount) {
        ctx.setLineDash([20, 20]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      ctx.moveTo(x, this.top + this.offset);
      ctx.lineTo(x, this.bottom + this.offset);
      ctx.stroke();
    }
  }
}
