import "./style.css";

function draw(event: MouseEvent) {
  if (drawing) {
    ctx!.lineWidth = 1.5;
    ctx!.lineCap = "round";
    ctx!.strokeStyle = "black";

    ctx!.lineTo(
      event.clientX - canvas.offsetLeft,
      event.clientY - canvas.offsetTop
    );
    ctx!.stroke();

    ctx!.beginPath();
    ctx!.moveTo(
      event.clientX - canvas.offsetLeft,
      event.clientY - canvas.offsetTop
    );
  }
}

const app: HTMLDivElement = document.querySelector("#app")!;
const gameName = "Doodle Machine";
document.title = gameName;
const header = document.createElement("h1");
header.innerHTML = gameName;

//Canvas stats
const width = 256;
const height = 256;

const canvas = document.createElement("canvas");

canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext("2d");

ctx!.fillStyle = "lightpink";

ctx?.fillRect(0, 0, width, height);

//const cursor = { active: false, x: 0, y: 0 };

//const paths = [];

const clearButton: HTMLButtonElement = document.createElement("button");
clearButton.innerText = "Clear";

clearButton.addEventListener("click", () => {
  ctx!.fillStyle = "lightpink";
  ctx?.fillRect(0, 0, width, height);
});

let drawing = false;

document.addEventListener("mousedown", () => {
  console.log("down");
  drawing = true;
  ctx?.beginPath();
});
document.addEventListener("mouseup", () => {
  console.log("up");
  drawing = false;
});
canvas.addEventListener("mousemove", (e) => {
  console.log("draw");
  draw(e);
});
canvas.addEventListener("mouseenter", () => {
  console.log("enter canvas");
  ctx?.beginPath();
});

app.append(header, canvas, clearButton);

/* function draw(x, y, color) {}

addEventListener("mousedown", (event) => {
  cursor.active = true;
  cursor.x = event.offsetX;
  cursor.y = event.offsetY;
});

canvas.addEventListener("mousemove", (event) => {
  if (cursor.active) {
  }
}); */
