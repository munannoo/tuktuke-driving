import type { NeuralNetwork, Level } from "./network";
import { lerp } from "../utils";

export class Visualizer {
  static drawNetwork(
    ctx: CanvasRenderingContext2D,
    network: NeuralNetwork | undefined
  ) {
    if (network) {
      const margin = 80;
      const left = margin;
      const top = margin;
      const frameWidth = ctx.canvas.width - margin * 2;
      const frameHeight = ctx.canvas.height - margin * 2;

      const levelWidth = frameWidth / network.levels.length;

      for (let i = 0; i < network.levels.length; i++) {
        const levelLeft = left + i * levelWidth;

        Visualizer.drawLevel(ctx, network.levels[i], [
          levelLeft,
          top,
          levelWidth,
          frameHeight,
        ]);
      }
    }
  }

  static drawLevel(
    ctx: CanvasRenderingContext2D,
    level: Level,
    dimensions: number[]
  ) {
    const [left, top, width, height] = dimensions;

    // visualizing the frame
    // ctx.beginPath();
    // ctx.rect(left, top, width, height);
    // ctx.fillStyle = "green";
    // ctx.fill();

    const right = left + width;
    const bottom = top + height;

    const inputNodeX = left;
    const outputNodeX = right;

    const circleRadius = 40;
    const padding = 50;

    // drawing connections
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        ctx.beginPath();
        ctx.moveTo(
          inputNodeX,
          Visualizer.#getNode(level.inputs, i, top + padding, bottom - padding)
        );
        ctx.lineTo(
          outputNodeX,
          Visualizer.#getNode(level.outputs, j, top + padding, bottom - padding)
        );
        ctx.lineWidth = 3;
        ctx.strokeStyle = getRGBA(level.weights[i][j]);
        ctx.stroke();
      }
    }

    // drawing inputNodes
    for (let i = 0; i < level.inputs.length; i++) {
      const y = Visualizer.#getNode(
        level.inputs,
        i,
        top + padding,
        bottom - padding
      );

      ctx.beginPath();
      ctx.arc(inputNodeX, y, circleRadius, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(inputNodeX, y, circleRadius * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = getRGBA(level.inputs[i]);
      ctx.fill();
    }

    // drawing outputNodes
    for (let i = 0; i < level.outputs.length; i++) {
      const y = Visualizer.#getNode(
        level.outputs,
        i,
        top + padding,
        bottom - padding
      );

      ctx.beginPath();
      ctx.arc(outputNodeX, y, circleRadius, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(outputNodeX, y, circleRadius * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = getRGBA(level.outputs[i]);
      ctx.fill();

      // visualizing biases
      ctx.beginPath();
      ctx.arc(outputNodeX, y, circleRadius, 0, Math.PI * 2);
      ctx.strokeStyle = getRGBA(level.biases[i]);
      ctx.lineWidth = 5;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      if (level.outputs.length === 4) {
        this.#drawControlIndicators(ctx, i, outputNodeX, y);
      }
    }
  }

  static #drawControlIndicators(
    ctx: CanvasRenderingContext2D,
    index: number,
    x: number,
    y: number
  ) {
    //
    const controlNames = ["🡅", "🡄", "🡆", "🡇"];

    ctx.beginPath();
    // ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "red";
    ctx.strokeStyle = "black";
    ctx.font = "70px Arial";
    ctx.fillText(controlNames[index], x - 32, y + 6);
    ctx.lineWidth = 3;
    ctx.strokeText(controlNames[index], x - 32, y + 6);
  }

  static #getNode(
    node: number[],
    index: number,
    initial: number,
    final: number
  ) {
    return lerp(
      initial,
      final,
      node.length == 1 ? 0.5 : index / (node.length - 1)
    );
  }
}

function getRGBA(value: number) {
  const alpha = Math.abs(value);
  const r = value > 0 ? 0 : 255;
  const g = value < 0 ? 0 : 255;
  const b = 0;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
