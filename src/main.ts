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
  color: string | null;
  sticker: string | null;
  constructor(
    x: number,
    y: number,
    size: number,
    color: string | null,
    sticker: string | null
  ) {
    this.x = x;
    this.y = y;
    this.size = size * 4;
    this.color = color;
    this.sticker = sticker;
  }
  display(ctx: CanvasRenderingContext2D) {
    const originalFillStyle = ctx.fillStyle;
    ctx.font = `${Math.max(7, this.size)}px monospace`;
    if (this.sticker) {
      ctx.fillText(this.sticker, this.x, this.y);
    } else if (this.color) {
      ctx.fillStyle = this.color;
      if (this.size <= 4) {
        ctx.fillText("+", this.x - 2, this.y + 3);
      } else {
        ctx.fillText("+", this.x - 8, this.y + 3);
      }
    }
    ctx.fillStyle = originalFillStyle;
  }
}

class StickerCommand {
  sticker: string;
  x: number;
  y: number;
  size: number;
  length: number;
  constructor(sticker: string, x: number, y: number, size: number) {
    this.sticker = sticker;
    this.x = x;
    this.y = y;
    this.size = size * 20;
    this.length = 1;
  }
  display(ctx: CanvasRenderingContext2D) {
    ctx.font = `${Math.max(7, this.size)}px monospace`;
    ctx.fillText(this.sticker, this.x, this.y);
  }
  extend(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

function somethingChanged(thing: string) {
  canvas.dispatchEvent(new Event(thing));
  //canvas.dispatchEvent(drawingChangedEvent);
}

function redraw() {
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  actions.forEach((action) => {
    if (action.length) {
      action.display(ctx);
    }
  });
  // display sticker cursor if selected
  if (currentSticker && stickerCommand) {
    stickerCommand.display(ctx);
  }
  // display pen cursor if selected
  if (penColor && cursorComand) {
    cursorComand.display(ctx);
  }
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
let actions: (StickerCommand | drag)[] = [];
let redoStack: (StickerCommand | drag)[] = [];

const colors = ["black", "red", "blue", "green", "orange", "white", "yellow"];
let currentSticker: string | null = null;
let cursorComand: CursorComand | null = null;
let stickerCommand: StickerCommand | null = null;
let penColor: string | null = colors[0];

const stickers = [
  "🐱",
  "👍",
  "😆",
  "⬆️",
  "🦴",
  "☠️",
  "💢",
  "💫",
  "🙊",
  "🍎",
  "🎩",
];

const clearButton: HTMLButtonElement = document.createElement("button");
clearButton.innerText = "Clear";
clearButton.classList.add("button-container");

clearButton.addEventListener("click", () => {
  actions = [];
  redoStack = [];
  somethingChanged("drawing-changed");
});
//buttons.appendChild(clearButton);

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
//buttons.appendChild(undoButton);

const redoButton: HTMLButtonElement = document.createElement("button");
redoButton.innerText = "Redo";
redoButton.classList.add("button-container");
redoButton.addEventListener("click", () => {
  if (redoStack.length != null) return;
  actions.push(redoStack.pop()!);
  somethingChanged("drawing-changed");
});
buttons.append(clearButton, undoButton, redoButton);

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
  if (penColor) {
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
  } else {
    //disable stickers pen
    currentSticker = null;
    stickerButton.innerText = "stickers";
    // enable marker pen / pen colors button
    penColor = colors[0];
    colorButton.innerText = `${penColor}`;
  }
});

const stickerButton: HTMLButtonElement = document.createElement("button");
stickerButton.innerText = currentSticker ? currentSticker : "stickers";
stickerButton.addEventListener("click", () => {
  // switch to next sticker
  if (currentSticker) {
    for (let i = 0; i < stickers.length; i++) {
      if (currentSticker === stickers[i]) {
        currentSticker =
          i < stickers.length - 1 ? stickers[i + 1] : stickers[0];
        break;
      }
    }
  } else {
    // enable sticker pen
    currentSticker = stickers[0];
    //disable pen colors button
    penColor = null;
    colorButton.style.backgroundColor = colors[0];
    colorButton.style.color = "white";
    colorButton.innerText = `marker`;
  }

  stickerButton.innerText = currentSticker ? currentSticker : stickers[0];
  somethingChanged("tool-moved");
});

buttons.appendChild(colorButton);

markerTools.append(lineWidthButton, colorButton, stickerButton);

canvas.addEventListener("mousedown", (e) => {
  console.log("down");
  drawing = true;
  if (currentSticker) {
    actions.push(
      new StickerCommand(currentSticker, e.offsetX, e.offsetY, lineWidth)
    );
  } else {
    actions.push(new drag(e.offsetX, e.offsetY, lineWidth, penColor!));
  }
  redoStack = [];
});

canvas.addEventListener("mousemove", (e) => {
  if (drawing) {
    cursorComand = null;
    stickerCommand = null;
    console.log("draw");
    actions[actions.length - 1].extend(e.offsetX, e.offsetY);
    actions[actions.length - 1].display(ctx);
  }
  // use sticker as cursor
  if (currentSticker) {
    stickerCommand = new StickerCommand(
      currentSticker,
      e.offsetX,
      e.offsetY,
      lineWidth
    );
    // use pen as cursor
  } else if (penColor) {
    cursorComand = new CursorComand(
      e.offsetX,
      e.offsetY,
      lineWidth,
      penColor,
      currentSticker
    );
  }
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
  cursorComand = new CursorComand(
    e.offsetX,
    e.offsetY,
    lineWidth,
    penColor,
    currentSticker
  );
  somethingChanged("tool-moved");
});

canvas.addEventListener("tool-moved", () => {
  redraw();
});

canvas.addEventListener("drawing-changed", () => {
  redraw();
});

app.append(leftContainer, markerTools);
