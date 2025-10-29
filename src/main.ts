import { Car } from "./car";
import { Road } from "./road";
import { Visualizer } from "./neural-network/visualizer";
import { GeneticAlgorithm } from "./neural-network/geneticAlgorithm";

// html elements
const radioChoices = document.getElementById("radio") as HTMLElement;
const trained = document.getElementById("trained") as HTMLInputElement;
const train = document.getElementById("train") as HTMLInputElement;
const startButton = document.getElementById("start");

const changeVisibility = (bool: boolean) => {
  bool
    ? (radioChoices.style.display = "block")
    : (radioChoices.style.display = "none");
};

train.addEventListener("change", () => {
  let trainCheck = train.checked;

  if (trainCheck) {
    changeVisibility(true);
  }
});

trained.addEventListener("change", () => {
  let trainedCheck = trained.checked;
  if (trainedCheck) {
    changeVisibility(false);
  }
});

// canvas elements
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

// game elements
let trafficPos: number[][] = [];
let cars: Car[] = [];
const road = new Road(canvas.width / 2, canvas.width * 0.9, 3);

const traffic = [
  new Car([road.getLaneCenter(1), 1], -200, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(0), 0], -500, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(2), 2], -500, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(0), 0], -800, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(2), 2], -900, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(0), 0], -1000, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(1), 1], -1000, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(0), 0], -1200, 30, 50, true, false, 2),
  new Car([road.getLaneCenter(2), 2], -1200, 30, 50, true, false, 2),
];

const initaltrafficPos = traffic.map((tCar) => [tCar.x, tCar.y]);

// functions
function startDriving() {
  let timeInterval = 30000;
  let N = 1;

  // Hide the user prompt container
  const userPrompt = document.getElementById("userPrompt") as HTMLElement;
  userPrompt.style.display = "none";

  if (train.checked) {
    // Get the selected radio button value
    const selectedRadio = document.querySelector(
      'input[name="N"]:checked'
    ) as HTMLInputElement;

    if (selectedRadio) {
      N = parseInt(selectedRadio.value);
    } else {
      N = 1000; // default if nothing selected
    }

    getCars(N);

    setInterval(() => save(), timeInterval);

    if (localStorage.getItem("bestBrain0")) {
      GeneticAlgorithm.mutateCars(cars);
    }

    animate();
  } else if (trained.checked) {
    getCars(1);

    fetch("/pre-trainedData.json")
      .then((response) => response.json())
      .then((data) => {
        cars[0].brain = data;
        animate();
      })
      .catch((error) => {
        console.error("Error loading pre-trained data:", error);
      });
  }
}

startButton?.addEventListener("click", startDriving);

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

const saveBtn = document.getElementById("save") as HTMLElement;
saveBtn.addEventListener("click", saveManual);
const discardBtn = document.getElementById("discard") as HTMLElement;
discardBtn.addEventListener("click", discard);

function saveManual() {
  // Save the currently viewed car (bestCar)
  if (bestCar && bestCar.brain) {
    localStorage.setItem("bestBrain0", JSON.stringify(bestCar.brain));
    console.log("Saved brain from best car");
  }

  reset();
}

function save() {
  console.log("saved!!");
  cars = GeneticAlgorithm.sortCars(cars)[0] as Car[];
  console.log("printing", GeneticAlgorithm.sortCars(cars)[1][0]);
  GeneticAlgorithm.findBestCar(
    cars,
    GeneticAlgorithm.sortCars(cars)[1][0] as number
  );
  reset();
}

function discard() {
  GeneticAlgorithm.discardBestBrains();
  reset();
  // window.location.reload();
}

function reset() {
  let N = train.checked ? 1000 : 1;
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
let bestCar: Car;

// animate();

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
    for (let i = 0; i < cars.length; i++) {
      cars[i].update(road, traffic, trafficPos, deltaTime);
    }

    // getting the car that goes the furtherest
    bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y))) as Car;

    // drawing
    ctx.save();
    ctx.translate(0, -bestCar.y + canvas.height * 0.8);

    road.draw(ctx);
    for (let i = 0; i < traffic.length; i++) {
      traffic[i].draw(ctx);
    }
    ctx.globalAlpha = 0.2;
    for (let i = 0; i < cars.length; i++) {
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
