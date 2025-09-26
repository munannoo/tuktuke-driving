import { Controls } from "./controls";
import { Sensor } from "./sensor";
import { NeuralNetwork } from "./neural-network/network.js";
import { type BorderCoordinates } from "./road.js";
import { polyIntersect } from "./utils.js";

export class Car {
  x: number;
  y: number;
  width: number;
  height: number;
  controls?: Controls;
  speed: number;
  acceleration: number;
  maxSpeed: number;
  friction: number;
  angle: number;
  sensor?: Sensor;
  carBorders: BorderCoordinates;
  damage: boolean;
  dummyCar: boolean;
  brain?: NeuralNetwork;
  aiCar: boolean;
  color: string; // Add color property

  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    dummyCar: boolean = false,
    aiCar: boolean = false,
    maxSpeed: number = 4
  ) {
    this.dummyCar = dummyCar;
    this.aiCar = aiCar;

    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.angle = 0;
    this.damage = false;

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.1;

    this.color = !this.dummyCar ? "red" : "blue"; // Initialize color

    if (!this.dummyCar) {
      this.controls = new Controls();
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    }

    this.carBorders = {
      topLeft: { x: this.x - this.width / 2, y: this.y - this.height / 2 },
      bottomLeft: { x: this.x - this.width / 2, y: this.y + this.height / 2 },
      topRight: { x: this.x + this.width / 2, y: this.y - this.height / 2 },
      bottomRight: { x: this.x + this.width / 2, y: this.y + this.height / 2 },
    };
  }

  update(borders: BorderCoordinates, traffic?: Car[]) {
    if (!this.damage) {
      if (!this.dummyCar && this.sensor) {
        this.sensor.update(borders, traffic);

        if (this.brain && this.controls) {
          const inputs = this.sensor.offsets.map((offset) => {
            return offset ? 1 - offset : 0;
          });

          const outputs = NeuralNetwork.feedForward(inputs, this.brain);

          if (this.aiCar) {
            this.controls.forward = outputs[0] > 0;
            this.controls.left = outputs[1] > 0;
            this.controls.right = outputs[2] > 0;
            this.controls.reverse = outputs[3] > 0;
          }
        }
      }
      this.#move();
      this.carBorders = this.#getCurrentBorders();
      this.damage = this.#assessDamage(this.carBorders, borders, traffic);
    } else {
      this.speed = 0;
    }
  }

  #assessDamage(
    carBorders: BorderCoordinates,
    roadBorders: BorderCoordinates,
    trafficCars: Car[] | undefined
  ): boolean {
    // for road collision
    if (polyIntersect(carBorders, roadBorders)) {
      return true;
    }

    // for traffic collision
    if (trafficCars) {
      for (let i = 0; i < trafficCars.length; i++) {
        if (polyIntersect(carBorders, trafficCars[i].carBorders)) {
          return true;
        }
      }
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

  #move() {
    this.speed > 0
      ? (this.speed -= this.friction)
      : this.speed < 0
      ? (this.speed += this.friction)
      : null;

    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    // movement of the car based on the controls
    if (this.controls) {
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
    } else {
      this.speed += this.acceleration;
    }

    // center coordinates of the car.

    this.y -= Math.cos(this.angle) * this.speed;

    this.x -= Math.sin(this.angle) * this.speed;

    // managing car physics
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed) {
      this.speed = -this.maxSpeed;
    }
  }

  draw(ctx: CanvasRenderingContext2D, drawSensor: boolean = false) {
    if (this.damage) {
      ctx.fillStyle = "gray";
    } else {
      ctx.fillStyle = this.color;
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.angle);

    // Car body (rounded rectangle)
    ctx.beginPath();
    ctx.roundRect(
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
      5
    );
    ctx.fill();

    // Windows (darker blue rectangles)
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";

    // Front windshield
    ctx.fillRect(
      -this.width / 2 + 5,
      -this.height / 2 + 6,
      this.width - 10,
      12
    );

    // Rear window
    ctx.fillRect(-this.width / 2 + 5, this.height / 2 - 10, this.width - 10, 6);

    //Side windows
    ctx.fillRect(-this.width + 18, this.height / 2 - 30, 2, 18);
    ctx.fillRect(this.width - 20, this.height / 2 - 30, 2, 18);

    // Side mirrors
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.width + 12, this.height / 2 - 40, this.width - 25, 2);
    ctx.fillRect(this.width - 17, this.height / 2 - 40, this.width - 25, 2);

    // Headlights (white circles)
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(-this.width / 2 + 5, -this.height / 2 + 2, 3, 0, Math.PI * 2);
    ctx.arc(this.width / 2 - 5, -this.height / 2 + 2, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    if (!this.dummyCar && drawSensor) {
      this.sensor?.draw(ctx);
    }
  }
}
