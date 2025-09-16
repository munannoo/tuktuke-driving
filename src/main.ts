import { Car } from "./car";
import { Road } from "./road";

const canvas = document.getElementById("workingCanvas") as HTMLCanvasElement;
canvas.width = 200;
canvas.height = canvas.offsetHeight;

const ctx = canvas.getContext("2d");
const road = new Road(canvas.width / 2, canvas.width * 0.9, 3);
const car = new Car(
  road.getLaneCenter(1),
  100,
  30,
  50,
  canvas.height,
  canvas.width as number
);

if (ctx) {
  ctx.fillStyle = "blue";
  car.draw(ctx);
}

animate();

function animate() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    car.update(road.left, road.right);
    console.log(road.right, road.left);
    road.draw(ctx);
    car.draw(ctx);
    requestAnimationFrame(animate);
  }
}
