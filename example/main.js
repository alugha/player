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

player.on("ready", (ready) => {
  println("Event: ready " + JSON.stringify(ready, null, 2));
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

// this can be a bit chatty for a demo, so it's disabled
/*
player.on("timeupdate", ({ seconds, duration }) => {
  println(
    "Event: timeupdate " + JSON.stringify({ seconds, duration }, null, 2),
  );
});
*/

// this can be a bit chatty for a demo, so it's disabled
/*
player.on("progress", ({ percent }) => {
  println("Event: progress " + JSON.stringify({ percent }, null, 2));
});
*/

player.on("seeked", () => {
  println("Event: seeked");
});

player.on("error", (error) => {
  println("Event: error " + JSON.stringify(error, null, 2));
});

player.on("videochange", (video) => {
  println("Event: videochange " + JSON.stringify(video, null, 2));
});

player.on("audiotrackchange", (track) => {
  println("Event: audiotrackchange " + JSON.stringify(track, null, 2));
});

player.on("texttrackchange", (track) => {
  println("Event: texttrackchange " + JSON.stringify(track, null, 2));
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
