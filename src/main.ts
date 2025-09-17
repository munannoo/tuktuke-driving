import { Car } from "./car";
import { Road } from "./road";

const canvas = document.getElementById("workingCanvas") as HTMLCanvasElement;
canvas.width = 200;
canvas.height = canvas.offsetHeight;

const ctx = canvas.getContext("2d");
const road = new Road(canvas.width / 2, canvas.width * 0.9, 3);
const car = new Car(
  road.getLaneCenter(1),
  canvas.height * 0.8,
  30,
  50,
  canvas.height,
  canvas.width
);

animate();

function animate() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    road.offset += car.speed;

    car.update(road.left, road.right);

    road.draw(ctx);
    car.draw(ctx);

    requestAnimationFrame(animate);
  }
}
