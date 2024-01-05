import { Player } from "@alugha/player";

const logs = document.getElementById("logs");
const player = new Player({
  videoId: "b92c4508-faeb-11e9-bc4c-93211a9e934f",
  mountPoint: "player",
  replaceMountPoint: true,
  autoPlay: true,
});

function println(message) {
  logs.textContent = message + "\n" + logs.textContent;
}

player.on("ready", () => {
  println("Event: ready");
});

player.on("play", () => {
  println("Event: play");
});

player.on("pause", () => {
  println("Event: pause");
});

player.on("ended", () => {
  println("Event: ended");
});

player.on("timeupdate", ({ seconds, duration }) => {
  println("Event: timeupdate " + JSON.stringify({ seconds, duration }));
});

player.on("progress", ({ percent }) => {
  println("Event: progress " + JSON.stringify({ percent }));
});

player.on("seeked", () => {
  println("Event: seeked");
});

player.on("error", () => {
  println("Event: erorr");
});

document.getElementById("btn-seek").addEventListener("click", () => {
  player.currentTime = 42;
});

document.getElementById("btn-mute").addEventListener("click", async () => {
  player.muted = !(await player.muted);
});

document.getElementById("btn-play").addEventListener("click", () => {
  player.play();
});

document.getElementById("btn-pause").addEventListener("click", () => {
  player.pause();
});
