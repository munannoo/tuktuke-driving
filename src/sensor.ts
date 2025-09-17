import type { Car } from "./car.js";
import { lerp } from "./utils.js";

type Ray = [{ x: number; y: number }, { x: number; y: number }];

export class Sensor {
  rayCount: number;
  rayLength: number;
  raySpread: number;
  rays: Ray[];
  car: Car;

  constructor(car: Car) {
    this.car = car;
    this.rayCount = 4;
    this.rayLength = 100;
    this.raySpread = Math.PI / 2;

    this.rays = [];
  }

  update() {
    this.#castRays();
  }

  #castRays() {
    // update rays according to the car's position

    this.rays = [];

    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.car.angle;

      const start: { x: number; y: number } = { x: this.car.x, y: this.car.y };
      const end: { x: number; y: number } = {
        x: -Math.sin(rayAngle) * this.rayLength + this.car.x,
        y: -Math.cos(rayAngle) * this.rayLength + this.car.y,
      };

      this.rays.push([start, end]);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i < this.rayCount; i++) {
      const ray = this.rays[i];

      ctx.beginPath();
      ctx.strokeStyle = "yellow";
      ctx.moveTo(ray[0].x, ray[0].y);
      ctx.lineTo(ray[1].x, ray[1].y);
      ctx.stroke();
    }
  }
}
