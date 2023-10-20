import "./style.css";

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

app.append(header);
app.append(canvas);
