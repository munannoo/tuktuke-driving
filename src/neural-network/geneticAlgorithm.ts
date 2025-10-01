import { Car } from "../car";
import { NeuralNetwork } from "./network";

export class GeneticAlgorithm {
  static generalAmt = 1;

  static findBestCar(
    cars: Car[],
    fitnessScore: number,
    amount = this.generalAmt
  ) {
    // save the brain to localstorage & return the best cars
    const bestCarsList = cars.slice(0, amount);
    for (let i = 0; i < bestCarsList.length; i++) {
      localStorage.setItem(
        `bestBrain${i}`,
        JSON.stringify(bestCarsList[i].brain)
      );
    }

    console.log("updates bestBrains!", fitnessScore, bestCarsList[0].damage);
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

    for (let i = 0; i < cars.length; i++) {
      if (i < amount) {
        cars[i].brain = JSON.parse(JSON.stringify(bestBrainsArr[i]));
      } else {
        cars[i].brain = JSON.parse(JSON.stringify(bestBrainsArr[0]));

        let mutationRate = 0.08; // Base rate - reduced for better convergence

        if (i < cars.length * 0.3) {
          // First 30% after elite - low mutation
          mutationRate = 0.08;
        } else if (i < cars.length * 0.7) {
          // Next 40% - medium mutation
          mutationRate = 0.18;
        } else {
          // Last 30% - high mutation for exploration
          mutationRate = 0.32;
        }

        NeuralNetwork.mutate(cars[i].brain as NeuralNetwork, mutationRate);
      }
    }
  }

  static sortCars(cars: Car[]) {
    const carsFitnessScore = cars.map((c) => {
      return { car: c, fitness: this.#calculateFitness(c) };
    });

    const sortedCars = carsFitnessScore
      .sort((a, b) => b.fitness - a.fitness)
      .map((c) => c.car);
    const sortedFitnessScore = carsFitnessScore
      .sort((a, b) => b.fitness - a.fitness)
      .map((c) => c.fitness);
    return [sortedCars, sortedFitnessScore];
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

    let fitness = distCovered * 3;

    const progressRate = carLifeSpan > 0 ? distCovered / carLifeSpan : 0;
    fitness += progressRate * 10; // checks how fast it progresses

    fitness -= isCarDamaged * 100; // check if car is damaged.
    fitness -= car.doubleInputs * 10; // penalty for conflicting inputs
    fitness += car.turn * 10; // motivate cars to take risk instead of trailing behind traffic
    fitness += car.overTake * 50; // for overtaking (reduced from 1000 to prevent inflation)
    fitness += car.laneChange * 30; // motivating cars to change initial lanes to avoid trailing.
    fitness -= car.carSlowed * 20;
    fitness -= car.trailing * 5; // reduced penalty to not overwhelm other factors

    return fitness;
  }

  static getFitnessScore(givenCar: Car) {
    return this.#calculateFitness(givenCar);
  }
}
