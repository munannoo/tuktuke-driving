import { Controls } from "./controls";
import { Sensor } from "./sensor";
import { type BorderCoordinates } from "./road.js";
import { getInterSection, polyIntersect } from "./utils.js";

export class Car {
  x: number;
  y: number;
  width: number;
  height: number;
  controls: Controls;
  speed: number;
  acceleration: number;
  maxSpeed: number;
  friction: number;
  angle: number;
  canvasHeight: number;
  canvasWidth: number;
  sensor: Sensor;
  carBorders: BorderCoordinates;
  damage: boolean;

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    canvasHeight: number,
    canvasWidth: number
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.canvasHeight = canvasHeight;
    this.canvasWidth = canvasWidth * 0.9;
    this.angle = 0;
    this.damage = false;

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = 4;
    this.friction = 0.1;

    this.controls = new Controls();
    this.sensor = new Sensor(this);

    this.carBorders = {
      topLeft: { x: this.x - this.width / 2, y: this.y - this.height / 2 },
      bottomLeft: { x: this.x - this.width / 2, y: this.y + this.height / 2 },
      topRight: { x: this.x + this.width / 2, y: this.y - this.height / 2 },
      bottomRight: { x: this.x + this.width / 2, y: this.y + this.height / 2 },
    };
  }

  update(roadLeft: number, roadRight: number, borders: BorderCoordinates) {
    this.#move(roadLeft, roadRight);
    this.sensor.update(borders);
    this.carBorders = this.#getCurrentBorders();
    this.damage = this.#assessDamage(this.carBorders, borders);
  }

  #assessDamage(
    carBorders: BorderCoordinates,
    roadBorders: BorderCoordinates
  ): boolean {
    if (polyIntersect(carBorders, roadBorders)) {
      return true;
    }
    return false;
  }

  #getCurrentBorders(): BorderCoordinates {
    const cosAngle = Math.cos(-this.angle); // Matching my draw() rotation sign
    const sinAngle = Math.sin(-this.angle);

    const rotate = (lx: number, ly: number) => {
      return {
        x: this.x + (lx * cosAngle - ly * sinAngle),
        y: this.y + (lx * sinAngle + ly * cosAngle),
      };
    };

    return {
      topLeft: rotate(-this.width / 2, -this.height / 2),
      topRight: rotate(this.width / 2, -this.height / 2),
      bottomLeft: rotate(-this.width / 2, this.height / 2),
      bottomRight: rotate(this.width / 2, this.height / 2),
    };
  }

  #move(roadLeft: number, roadRight: number) {
    this.speed > 0
      ? (this.speed -= this.friction)
      : this.speed < 0
      ? (this.speed += this.friction)
      : null;

    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    // movement of the car based on the controls
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }
    if (this.controls.left && Math.abs(this.speed) > 0) {
      this.angle += 0.03 * (Math.abs(this.speed) / this.maxSpeed);
    }
    if (this.controls.right && Math.abs(this.speed) > 0) {
      this.angle -= 0.03 * (Math.abs(this.speed) / this.maxSpeed);
    }

    // center coordinates of the car.

    // this.y -= Math.cos(this.angle) * this.speed * 0.05;
    // this.y = Math.max(
    //   0 + this.height / 2,
    //   Math.min(this.y, this.canvasHeight - this.height / 2)
    // );

    this.x -= Math.sin(this.angle) * this.speed;
    this.x = Math.max(
      roadLeft + 0.1 * this.canvasWidth,
      Math.min(this.x, roadRight - this.width / 2)
    );

    // managing car physics
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed) {
      this.speed = -this.maxSpeed;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.angle);

    ctx.beginPath();
    ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);

    if (this.damage) {
      ctx.fillStyle = "orange";
    } else {
      ctx.fillStyle = "black";
    }
    ctx.fill();
    ctx.restore();

    this.sensor.draw(ctx);
  }
}
