import { Car } from "./car";
import { Road } from "./road";
import { Visualizer } from "./neural-network/visualizer";
import { NeuralNetwork } from "./neural-network/network";

const canvas = document.getElementById("workingCanvas") as HTMLCanvasElement;
const networkCanvas = document.getElementById(
  "networkCanvas"
) as HTMLCanvasElement;

canvas.width = 200;
canvas.height = 700;
networkCanvas.width = 500;
networkCanvas.height = 700;

const ctx = canvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(canvas.width / 2, canvas.width * 0.9, 3);
const traffic = [
  new Car(road.getLaneCenter(1), -200, 30, 50, true, false, 2),
  new Car(road.getLaneCenter(0), -500, 30, 50, true, false, 2),
  new Car(road.getLaneCenter(2), -200, 30, 50, true, false, 2),
  new Car(road.getLaneCenter(0), -800, 30, 50, true, false, 2),
  new Car(road.getLaneCenter(2), -600, 30, 50, true, false, 2),
  new Car(road.getLaneCenter(1), -800, 30, 50, true, false, 2),
  new Car(road.getLaneCenter(0), -1000, 30, 50, true, false, 2),
  new Car(road.getLaneCenter(1), -1000, 30, 50, true, false, 2),
  new Car(road.getLaneCenter(2), -1200, 30, 50, true, false, 2),
  new Car(road.getLaneCenter(2), -900, 30, 50, true, false, 2),
  new Car(road.getLaneCenter(0), -1200, 30, 50, true, false, 2),
];

let cars: Car[] = [];
const N = 1;

function getCars(N: number) {
  cars = [];
  for (let i = 0; i < N; i++) {
    cars.push(
      new Car(road.getLaneCenter(1), canvas.height * 0.8, 30, 50, false, true)
    );
  }
}

getCars(N);

let bestCar: Car = cars[0];

if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    const brain = JSON.parse(localStorage.getItem("bestBrain") as string);
    cars[i].brain = brain;

    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain as NeuralNetwork, 0.08);
    }
  }
}

const saveBtn = document.getElementById("save") as HTMLElement;
saveBtn.addEventListener("click", save);
const discardBtn = document.getElementById("discard") as HTMLElement;
discardBtn.addEventListener("click", discard);

function save() {
  console.log("saved!!");
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

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
    for (let i = 0; i < N; i++) {
      cars[i].update(road.borders, traffic);
    }

    // getting the car that goes the furtherest
    bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y))) as Car;

    // drawing
    ctx.save();
    const ty = bestCar ? bestCar : cars[0];
    ctx.translate(0, -ty.y + canvas.height * 0.8);

    road.draw(ctx);
    for (let i = 0; i < traffic.length; i++) {
      traffic[i].draw(ctx);
    }
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < N; i++) {
      cars[i].draw(ctx);
    }
    ctx.globalAlpha = 1;
    bestCar?.draw(ctx, true);

    ctx.restore();

    // visualization ( for neuralNetwork )
    Visualizer.drawNetwork(networkCtx, ty.brain);
    requestAnimationFrame(animate);
  }
}
