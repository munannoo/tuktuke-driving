export class NeuralNetwork {
  levels: Level[];

  constructor(nuerons: number[]) {
    this.levels = [];
    for (let i = 0; i < nuerons.length - 1; i++) {
      this.levels.push(new Level(nuerons[i], nuerons[i + 1]));
    }
  }

  static feedForward(inputs: number[], network: NeuralNetwork) {
    let currentInputs = inputs;
    for (let i = 0; i < network.levels.length; i++) {
      currentInputs = Level.feedForward(currentInputs, network.levels[i]);
    }
    return currentInputs;
  }
}

class Level {
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

    // we need to find the weighted sums essentially input1 * wt1 + inputN * wtN
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
