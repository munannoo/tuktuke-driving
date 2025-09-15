import { Car } from "./car";

const canvas = document.getElementById("workingCanvas") as HTMLCanvasElement;
canvas.width = 200;
canvas.height = canvas.offsetHeight;

const ctx = canvas.getContext("2d");
const car = new Car(100, 100, 30, 50);

if (ctx) {
  ctx.fillStyle = "blue";
  car.draw(ctx);
}

animate();

function animate() {
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    car.update();
    car.draw(ctx);
    requestAnimationFrame(animate);
  }
}
