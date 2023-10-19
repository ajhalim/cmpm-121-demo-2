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

app.append(header);
app.append(canvas);
