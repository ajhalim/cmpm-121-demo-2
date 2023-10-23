import "./style.css";

function somethingChanged() {
  const drawingChangedEvent = new Event("drawing-changed");
  canvas.dispatchEvent(drawingChangedEvent);
}

function draw(event: MouseEvent) {
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  currentStroke.push({
    xPos: event.offsetX,
    yPos: event.offsetY,
  });
  somethingChanged();
}

function redraw() {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  penStrokes.forEach((stroke) => {
    if (stroke.length > 1) {
      ctx.beginPath();
      stroke.forEach((point) => {
        ctx.lineTo(point.xPos, point.yPos);
        ctx.stroke();
      });
    }
  });
}

function undo() {
  if (penStrokes.length < 1) return;
  redoStack.push(penStrokes.pop()!);
  somethingChanged();
}

function redo() {
  if (redoStack.length < 1) return;
  penStrokes.push(redoStack.pop()!);
  somethingChanged();
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
  penStrokes.length = 0;
  currentStroke = [];
  redoStack.length = 0;
  somethingChanged();
});

const undoButton: HTMLButtonElement = document.createElement("button");
undoButton.innerText = "Undo";
undoButton.classList.add("button-container");
undoButton.addEventListener("click", () => {
  undo();
});

const redoButton: HTMLButtonElement = document.createElement("button");
redoButton.innerText = "Redo";
redoButton.classList.add("button-container");
redoButton.addEventListener("click", () => {
  redo();
});

let drawing = false;
const penStrokes: { xPos: number; yPos: number }[][] = [];
let currentStroke: { xPos: number; yPos: number }[] = [];
const redoStack: { xPos: number; yPos: number }[][] = [];

canvas.addEventListener("mousedown", (event) => {
  drawing = true;
  currentStroke = [];
  penStrokes.push(currentStroke);
  redoStack.splice(0, redoStack.length);
  currentStroke.push({ xPos: event.offsetX, yPos: event.offsetY });
  somethingChanged();
});
canvas.addEventListener("mousemove", (event) => {
  if (drawing) draw(event);
});
canvas.addEventListener("mouseup", () => {
  drawing = false;
  currentStroke = [];
});

canvas.addEventListener("mouseleave", () => {
  if (currentStroke.length > 0) penStrokes.push(currentStroke.slice());
  currentStroke = [];
});

canvas.addEventListener("drawing-changed", () => {
  redraw();
});

app.append(header, canvas, clearButton, undoButton, redoButton);
