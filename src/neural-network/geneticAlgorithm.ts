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
    return bestCarsList[0];
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
        // Create a deep copy for elite cars too, to prevent reference sharing
        cars[i].brain = JSON.parse(JSON.stringify(bestBrainsArr[i]));
      } else {
        const randomBrain =
          bestBrainsArr[Math.floor(Math.random() * bestBrainsArr.length)];

        cars[i].brain = JSON.parse(JSON.stringify(randomBrain));

        // Adaptive mutation rates for better diversity
        let mutationRate = 0.08; // Base rate - reduced for better convergence

        if (i < cars.length * 0.3) {
          // First 30% after elite - low mutation
          mutationRate = 0.03;
        } else if (i < cars.length * 0.7) {
          // Next 40% - medium mutation
          mutationRate = 0.18;
        } else {
          // Last 30% - high mutation for exploration
          mutationRate = 0.4;
        }

        NeuralNetwork.mutate(cars[i].brain as NeuralNetwork, mutationRate);
      }
    }
  }

  static sortCars(cars: Car[]) {
    const carsFitnessScore = cars.map((c) => {
      return { car: c, fitness: this.#calculateFitness(c) };
    });

    carsFitnessScore.forEach((c) =>
      console.log("check", c.fitness, c.car.y, c.car.timeAlive / 1000)
    );

    return carsFitnessScore
      .sort((a, b) => b.fitness - a.fitness)
      .map((c) => {
        return c.car;
      });
  }

  static discardBestBrains(amount = this.generalAmt) {
    if (localStorage.getItem("bestBrain0")) {
      for (let i = 0; i < amount; i++) {
        localStorage.removeItem(`bestBrain${i}`);
      }
    }

    console.log("deleted bestBrains!");
  }

  static #calculateFitness(car: Car) {
    const distCovered = -car.y;
    const isCarDamaged = car.damage ? 1 : 0;
    const carLifeSpan = car.timeAlive / 1000;

    let fitness = distCovered; // distance covered

    // Progress rate reward - penalize stalling
    const progressRate = carLifeSpan > 0 ? distCovered / carLifeSpan : 0;
    fitness += progressRate * 10; // Reward cars that cover distance efficiently

    fitness -= isCarDamaged * 30; // Increased crash penalty to prevent road collisions
    fitness -= car.doubleInputs * 10; // Penalty for conflicting inputs
    fitness += car.turn * 5; // Minimal turn reward to discourage unnecessary turning
    fitness += car.overTake * 20; // Higher reward for overtaking
    fitness += car.laneChange * 10;

    return fitness;
  }
}
