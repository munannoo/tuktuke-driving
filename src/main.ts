import { Car } from "./car";
import { Road } from "./road";
import { Visualizer } from "./neural-network/visualizer";
import { GeneticAlgorithm } from "./neural-network/geneticAlgorithm";

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
  new Car([road.getLaneCenter(1), 1], -200, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(0), 0], -500, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(2), 2], -500, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(2), 2], -600, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(0), 0], -800, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(1), 1], -800, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(2), 2], -900, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(0), 0], -1000, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(1), 1], -1000, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(0), 0], -1200, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(2), 2], -1200, 30, 50, true, false, 2),
];

const initaltrafficPos = traffic.map((tCar) => [tCar.x, tCar.y]);

let trafficPos: number[][] = [];
let cars: Car[] = [];
let timeInterval = 30000;
const N = 1000;

function getCars(N: number) {
  cars = [];
  for (let i = 0; i < N; i++) {
    cars.push(
      new Car(
        [road.getLaneCenter(1), 1],
        canvas.height * 0.8,
        30,
        50,
        false,
        true
      )
    );
  }
}

getCars(N);

setInterval(() => save(), timeInterval);

if (localStorage.getItem("bestBrain0")) {
  GeneticAlgorithm.mutateCars(cars);
}

const saveBtn = document.getElementById("save") as HTMLElement;
saveBtn.addEventListener("click", save);
const discardBtn = document.getElementById("discard") as HTMLElement;
discardBtn.addEventListener("click", discard);

function save() {
  console.log("saved!!");
  cars = GeneticAlgorithm.sortCars(cars)[0] as Car[];
  console.log("printing", GeneticAlgorithm.sortCars(cars)[1][0]);
  GeneticAlgorithm.findBestCar(
    cars,
    GeneticAlgorithm.sortCars(cars)[1][0] as number
  );
  reset();
  // window.location.reload();
}

function discard() {
  GeneticAlgorithm.discardBestBrains();
  reset();
  // window.location.reload();
}

function reset() {
  getCars(N);

  if (localStorage.getItem("bestBrain0")) {
    GeneticAlgorithm.mutateCars(cars);
  }

  for (let i = 0; i < traffic.length; i++) {
    traffic[i].y = initaltrafficPos[i][1];
    traffic[i].x = initaltrafficPos[i][0];
  }

  // Reset the time tracking
  lastTime = 0;
}

let lastTime = 0;

animate();

function animate(time = 0) {
  if (ctx && networkCtx) {
    const deltaTime = time - lastTime;
    lastTime = time;

    canvas.height = window.innerHeight;
    networkCanvas.width = window.innerWidth;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);

    // updating
    for (let i = 0; i < traffic.length; i++) {
      traffic[i].update(road);
      trafficPos = traffic.map((tCar) => [tCar.y, tCar.x]);
    }
    for (let i = 0; i < N; i++) {
      cars[i].update(road, traffic, trafficPos, deltaTime);
    }

    // getting the car that goes the furtherest
    const bestCar = cars.find(
      (c) => c.y == Math.min(...cars.map((c) => c.y))
    ) as Car;

    // drawing
    ctx.save();
    ctx.translate(0, -bestCar.y + canvas.height * 0.8);

    road.draw(ctx);
    for (let i = 0; i < traffic.length; i++) {
      traffic[i].draw(ctx);
    }
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < N; i++) {
      cars[i].draw(ctx);
    }
    ctx.globalAlpha = 1;
    bestCar.draw(ctx, true);

    ctx.restore();

    // visualization ( for neuralNetwork )
    Visualizer.drawNetwork(networkCtx, bestCar.brain);
    requestAnimationFrame(animate);
  }
}
