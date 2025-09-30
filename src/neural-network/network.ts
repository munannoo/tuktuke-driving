import { lerp } from "../utils";

export class NeuralNetwork {
  levels: Level[];

  constructor(neurons: number[]) {
    this.levels = [];
    for (let i = 0; i < neurons.length - 1; i++) {
      this.levels.push(new Level(neurons[i], neurons[i + 1]));
    }
  }

  static feedForward(inputs: number[], network: NeuralNetwork) {
    let currentInputs = inputs;
    for (let i = 0; i < network.levels.length; i++) {
      currentInputs = Level.feedForward(currentInputs, network.levels[i]);
    }
    return currentInputs;
  }

  static mutate(network: NeuralNetwork, amount = 1) {
    network.levels.forEach((element) => {
      for (let i = 0; i < element.biases.length; i++) {
        element.biases[i] = lerp(
          element.biases[i],
          Math.random() * 2 - 1,
          amount
        );
      }

      for (let i = 0; i < element.weights.length; i++) {
        for (let j = 0; j < element.weights[i].length; j++) {
          element.weights[i][j] = lerp(
            element.weights[i][j],
            Math.random() * 2 - 1,
            amount
          );
        }
      }
    });
  }
}

export class Level {
  inputs: number[];
  outputs: number[];
  biases: number[];
  weights: number[][];
  constructor(inputCount: number, outputCount: number) {
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputCount);
    this.biases = new Array(outputCount);

    this.weights = [];
    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount);
    }

    Level.#randomize(this);
  }

  static #randomize(level: Level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = Math.random() * 2 - 1;
      }
    }

    for (let i = 0; i < level.outputs.length; i++) {
      level.biases[i] = Math.random() * 2 - 1;
    }
  }

  static feedForward(givenInputs: number[], level: Level): number[] {
    for (let i = 0; i < level.inputs.length; i++) {
      level.inputs[i] = givenInputs[i];
    }

    for (let i = 0; i < level.outputs.length; i++) {
      let sum = level.biases[i];
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }
      level.outputs[i] = Math.tanh(sum);
    }

    return level.outputs;
  }
}
