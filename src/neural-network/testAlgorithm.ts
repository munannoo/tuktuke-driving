import { Car } from "../car";
import { NeuralNetwork } from "./network";

export class GeneticAlgorithm {
  static generalAmt = 3;

  static findBestCar(cars: Car[], amount = this.generalAmt) {
    // save the brain to localstorage & return the best cars
    const bestCarsList = cars.slice(0, amount);
    for (let i = 0; i < bestCarsList.length; i++) {
      localStorage.setItem(
        `bestBrain${i}`,
        JSON.stringify(bestCarsList[i].brain)
      );
    }

    console.log("updates bestBrains!");
    return bestCarsList;
  }

  // mutate other cars with top cars
  static mutateCars(cars: Car[], amount = this.generalAmt) {
    // get brians from localstorage.
    const bestBrainsArr = [];
    for (let i = 0; i < amount; i++) {
      bestBrainsArr.push(
        JSON.parse(localStorage.getItem(`bestBrain${i}`) as string)
      );
    }

    // give brain to top cars. give mutated brain to other cars
    for (let i = 0; i < cars.length; i++) {
      if (i < amount) {
        cars[i].brain = bestBrainsArr[i];
      } else {
        const randomBrain =
          bestBrainsArr[Math.floor(Math.random() * bestBrainsArr.length)];

        cars[i].brain = JSON.parse(JSON.stringify(randomBrain));
        NeuralNetwork.mutate(cars[i].brain as NeuralNetwork, 0.08);
      }
    }
  }

  static sortCars(cars: Car[]) {
    const carsDistCoverage = cars.map((c) => {
      return { car: c, distance: c.y };
    });

    return carsDistCoverage
      .sort((a, b) => a.distance - b.distance)
      .map((c) => {
        return c.car;
      });
  }

  static discardBestBrains(amount = this.generalAmt) {
    if (localStorage.getItem("bestBrain0")) {
      for (let i = 0; i < this.generalAmt; i++) {
        localStorage.removeItem(`bestBrain${i}`);
      }
    }

    console.log("deleted bestBrains!");
  }
}
