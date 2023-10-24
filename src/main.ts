import "./style.css";

class drag {
  points: { x: number; y: number }[];
  length: number;

  constructor(x?: number, y?: number) {
    this.points = x && y ? [{ x, y }] : [];
    this.length = x && y ? 1 : 0;
  }
  // copy constructor
  copyFrom(original: drag) {
    this.points = [...original.points];
    this.length = original.length;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";
    const { x, y } = this.points[0];
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (const { x, y } of this.points) {
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  extend(x: number, y: number) {
    this.points.push({ x, y });
    this.length++;
  }
}

function somethingChanged() {
  const drawingChangedEvent = new Event("drawing-changed");
  canvas.dispatchEvent(drawingChangedEvent);
}

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Doodle Machine";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;

const canvasWidth = 256;
const canvasHeight = 256;
const canvas = document.createElement("canvas");
canvas.id = "myCanvas";
canvas.width = canvasWidth;
canvas.height = canvasHeight;
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "lightpink";
ctx.fillRect(0, 0, canvasWidth, canvasHeight);

const clearButton: HTMLButtonElement = document.createElement("button");
clearButton.innerText = "Clear";
clearButton.classList.add("button-container");

clearButton.addEventListener("click", () => {
  actions = [];
  redoStack = [];
  somethingChanged();
});

const undoButton: HTMLButtonElement = document.createElement("button");
undoButton.innerText = "Undo";
undoButton.classList.add("button-container");
undoButton.addEventListener("click", () => {
  if (actions.length != null) {
    redoStack.push(actions.pop()!);
    somethingChanged();
  } else {
    return;
  }
});

const redoButton: HTMLButtonElement = document.createElement("button");
redoButton.innerText = "Redo";
redoButton.classList.add("button-container");
redoButton.addEventListener("click", () => {
  if (actions.length != null) {
    actions.push(redoStack.pop()!);
    somethingChanged();
  } else {
    return;
  }
});

let drawing = false;
/* const penStrokes: { xPos: number; yPos: number }[][] = [];
let currentStroke: { xPos: number; yPos: number }[] = [];
const redoStack: { xPos: number; yPos: number }[][] = []; */

let actions: drag[] = [];
let redoStack: drag[] = [];

canvas.addEventListener("mousedown", (event) => {
  drawing = true;

  redoStack.splice(0, redoStack.length);
  actions.push(new drag(event.offsetX, event.offsetY));
  somethingChanged();
});
canvas.addEventListener("mousemove", (event) => {
  if (drawing) {
    actions[actions.length - 1].extend(event.offsetX, event.offsetY);
    actions[actions.length - 1].display(ctx);
    redoStack = [];
  }
});
canvas.addEventListener("mouseup", () => {
  drawing = false;
  //currentStroke = [];
});

canvas.addEventListener("mouseleave", () => {
  drawing = false;
});

canvas.addEventListener("drawing-changed", () => {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  actions.forEach((line) => {
    if (line.length != null) {
      line.display(ctx);
    }
  });
});

app.append(header, canvas, clearButton, undoButton, redoButton);
