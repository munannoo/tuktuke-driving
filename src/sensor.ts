import type { Car } from "./car.js";
import type { BorderCoordinates } from "./road.js";
import { lerp, getInterSection } from "./utils.js";
import type { Point } from "./utils.js";

type Ray = [
  { x: number; y: number },
  { x: number; y: number },
  { x: number; y: number; offset: number } | null
];

type Intersection = Point & { offset: number };

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

  update(roadBorders: BorderCoordinates, traffic: Car[] | undefined) {
    this.#castRays(traffic, roadBorders);
  }

  #castRays(traffic: Car[] | undefined, roadBorders: BorderCoordinates) {
    // update rays according to the car's position

    this.rays = [];

    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.car.angle;

      const start: Point = { x: this.car.x, y: this.car.y };
      const end: Point = {
        x: -Math.sin(rayAngle) * this.rayLength + this.car.x,
        y: -Math.cos(rayAngle) * this.rayLength + this.car.y,
      };

      let intersection: Intersection | null = null;

      // for road border detection
      const leftHit = getInterSection(
        start,
        end,
        roadBorders.topLeft,
        roadBorders.bottomLeft
      );

      const rightHit = getInterSection(
        start,
        end,
        roadBorders.topRight,
        roadBorders.bottomRight
      );

      if (leftHit && rightHit) {
        if (leftHit.offset && rightHit.offset) {
          if (leftHit.offset < rightHit.offset) {
            intersection = leftHit;
          } else {
            intersection = rightHit;
          }
        }
      } else if (leftHit) {
        intersection = leftHit;
      } else if (rightHit) {
        intersection = rightHit;
      }

      // for traffic detection
      if (traffic) {
        for (let j = 0; j < traffic.length; j++) {
          // got the car arr here. now time to get car and its sides
          const carCoordinates = traffic[j].carBorders;
          const carSides: Point[] = [
            carCoordinates.topLeft,
            carCoordinates.topRight,
            carCoordinates.bottomRight,
            carCoordinates.bottomLeft,
          ];
          // got car and its points now to mke them sides and throw into the getintersection function.

          for (let k = 0; k < carSides.length; k++) {
            if (
              getInterSection(
                start,
                end,
                carSides[k],
                carSides[(k + 1) % carSides.length]
              )
            ) {
              intersection = getInterSection(
                start,
                end,
                carSides[k],
                carSides[(k + 1) % carSides.length]
              );
            }
          }
        }
      }

      this.rays.push([start, end, intersection]);
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

      if (ray[2]) {
        ctx.beginPath();
        ctx.strokeStyle = "red";
        ctx.moveTo(ray[2].x, ray[2].y);
        ctx.lineTo(ray[1].x, ray[1].y);
        ctx.stroke();
        continue;
      }
    }
  }
}
