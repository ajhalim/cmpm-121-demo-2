import "./style.css";

class drag {
  points: { x: number; y: number }[];
  length: number;
  weight: number;
  color: string;

  constructor(x: number, y: number, weight: number, color: string) {
    this.points = [{ x, y }];
    this.length = 1;
    this.weight = weight;
    this.color = color;
  }

  // copy constructor
  copyFrom(original: drag) {
    this.points = [...original.points];
    this.length = original.length;
  }

  display(ctx: CanvasRenderingContext2D) {
    ctx.lineWidth = this.weight;
    ctx.lineCap = "round";
    ctx.strokeStyle = this.color;
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

class CursorComand {
  x: number;
  y: number;
  size: number;
  color: string;
  constructor(x: number, y: number, size: number, color: string) {
    this.x = x;
    this.y = y;
    this.size = size * 4;
    this.color = color;
  }
  display(ctx: CanvasRenderingContext2D) {
    const originalFillStyle = ctx.fillStyle;
    ctx.fillStyle = this.color;
    ctx.font = `${Math.max(10, this.size)}px monospace`;
    if (this.size <= 4) {
      ctx.fillText("a", this.x - 2, this.y + 3);
    } else {
      ctx.fillText("a", this.x - 8, this.y + 3);
    }
    ctx.fillStyle = originalFillStyle;
  }
}

function somethingChanged(thing: string) {
  canvas.dispatchEvent(new Event(thing));
  //canvas.dispatchEvent(drawingChangedEvent);
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
canvas.style.cursor = "none";
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "lightpink";
ctx.fillRect(0, 0, canvasWidth, canvasHeight);

const leftContainer = document.createElement("div");
leftContainer.id = "left-container";

const buttons = document.createElement("div");
buttons.id = "button-container";

leftContainer.append(header, canvas, buttons);

const markerTools = document.createElement("div");
markerTools.id = "marker-tools";

const subhead = document.createElement("h2");
subhead.innerText = "Marker Tools";
markerTools.appendChild(subhead);

let drawing = false;
let hasUndone = false;
let lineWidth = 1;
let actions: drag[] = [];
let redoStack: drag[] = [];
let penColor = "black";
const colors = ["black", "red", "blue", "green", "orange", "white", "yellow"];
let cursorComand: CursorComand | null = null;

const clearButton: HTMLButtonElement = document.createElement("button");
clearButton.innerText = "Clear";
clearButton.classList.add("button-container");

clearButton.addEventListener("click", () => {
  actions = [];
  redoStack = [];
  somethingChanged("drawing-changed");
});
buttons.appendChild(clearButton);

const undoButton: HTMLButtonElement = document.createElement("button");
undoButton.innerText = "Undo";
undoButton.classList.add("button-container");
undoButton.addEventListener("click", () => {
  if (actions.length != null) {
    redoStack.push(actions.pop()!);
    somethingChanged("drawing-changed");
    hasUndone = true;
  } else {
    return;
  }
});
buttons.appendChild(undoButton);

const redoButton: HTMLButtonElement = document.createElement("button");
redoButton.innerText = "Redo";
redoButton.classList.add("button-container");
redoButton.addEventListener("click", () => {
  if (actions.length != null && hasUndone == true) {
    actions.push(redoStack.pop()!);
    somethingChanged("drawing-undone");
  } else {
    return;
  }
});
buttons.appendChild(redoButton);

const lineWidthButton: HTMLButtonElement = document.createElement("button");
lineWidthButton.innerText = `${lineWidth}px`;
lineWidthButton.addEventListener("click", () => {
  lineWidth = lineWidth < 10 ? lineWidth + 1 : 1;
  ctx.lineWidth = lineWidth;
  lineWidthButton.innerText = `${lineWidth}px`;
  if (cursorComand) cursorComand.size = lineWidth;
  somethingChanged("tool-moved");
});
buttons.appendChild(lineWidthButton);

const colorButton: HTMLButtonElement = document.createElement("button");
colorButton.innerText = `${penColor}`;
colorButton.addEventListener("click", () => {
  for (let i = 0; i < colors.length; i++) {
    if (penColor === colors[i]) {
      penColor = i < colors.length - 1 ? colors[i + 1] : colors[0];
      break;
    }
  }
  colorButton.innerText = `${penColor}`;
  if (penColor === "white" || penColor === "yellow") {
    colorButton.style.color = "black";
  } else {
    colorButton.style.color = "white";
  }
  colorButton.style.backgroundColor = penColor;
});
buttons.appendChild(colorButton);

markerTools.append(lineWidthButton, colorButton);

canvas.addEventListener("mousedown", (e) => {
  console.log("down");
  drawing = true;
  //start new line with fist point
  actions.push(new drag(e.offsetX, e.offsetY, lineWidth, penColor));
  redoStack = [];
});

canvas.addEventListener("mousemove", (e) => {
  if (drawing) {
    cursorComand = null;
    console.log("draw");
    actions[actions.length - 1].extend(e.offsetX, e.offsetY);
    actions[actions.length - 1].display(ctx);
    cursorComand = new CursorComand(e.offsetX, e.offsetY, lineWidth, penColor);
  }
  cursorComand = new CursorComand(e.offsetX, e.offsetY, lineWidth, penColor);
  somethingChanged("tool-moved");
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  //currentStroke = [];
});

canvas.addEventListener("mouseleave", () => {
  drawing = false;
});

canvas.addEventListener("mouseenter", (e) => {
  cursorComand = new CursorComand(e.offsetX, e.offsetY, lineWidth, penColor);
  somethingChanged("tool-moved");
});

canvas.addEventListener("tool-moved", () => {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  actions.forEach((line) => {
    if (line.length != null) {
      line.display(ctx);
    }
  });
  if (cursorComand) cursorComand.display(ctx);
});

canvas.addEventListener("drawing-changed", () => {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  actions.forEach((line) => {
    if (line.length != null) {
      line.display(ctx);
    }
  });
  if (cursorComand) cursorComand.display(ctx);
});

app.append(leftContainer, markerTools);
