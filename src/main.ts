import { Car } from "./car";
import { Road } from "./road";
import { Visualizer } from "./neural-network/visualizer";

const canvas = document.getElementById("workingCanvas") as HTMLCanvasElement;
const networkCanvas = document.getElementById(
  "networkCanvas"
) as HTMLCanvasElement;

canvas.width = 200;
networkCanvas.width = 500;
networkCanvas.height = 700;

const ctx = canvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(canvas.width / 2, canvas.width * 0.9, 3);
const car = new Car(
  road.getLaneCenter(1),
  canvas.height * 0.8,
  30,
  50,
  canvas.height,
  canvas.width,
  false,
  true
);
const traffic = [
  new Car(
    road.getLaneCenter(0),
    canvas.height * 0.3,
    30,
    50,
    canvas.height,
    canvas.width,
    true,
    false,
    2
  ),
];

animate();

function animate() {
  if (ctx && networkCtx) {
    canvas.height = window.innerHeight;
    networkCanvas.width = window.innerWidth;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);

    // updating
    for (let i = 0; i < traffic.length; i++) {
      traffic[i].update(road.borders);
    }
    car.update(road.borders, traffic);

    // drawing
    ctx.save();
    ctx.translate(0, -car.y + canvas.height * 0.8);

    road.draw(ctx);
    for (let i = 0; i < traffic.length; i++) {
      traffic[i].draw(ctx);
    }
    car.draw(ctx);

    ctx.restore();

    // visualization ( for neuralNetwork )
    Visualizer.drawNetwork(networkCtx, car.brain);
    requestAnimationFrame(animate);
  }
}
