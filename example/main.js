import { Player } from "@alugha/player";

const logs = document.getElementById("logs");
const player = new Player({
  videoId: "1d5f9126-5bf0-11ea-87de-a3b265323017",
  watchlistId: "c52f8e40-5ed3-11ea-b9e5-d73988e1ad51",
  mountPoint: "player",
  replaceMountPoint: true,
  autoPlay: true,
  userInterfaceLanguage: "ar",
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

function println(message) {
  logs.textContent = message + "\n" + logs.textContent;
}

player.on("ready", (ready) => {
  println("Event: ready " + JSON.stringify(ready, null, 2));
});

player.on("resetready", () => {
  println("Event: resetready");
  // This command will be enqueued and executed once the player is ready again
  player.currentTime = 42;
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

player.on("seeked", () => {
  println("Event: seeked");
});

player.on("error", (error) => {
  println("Event: error " + JSON.stringify(error, null, 2));
});

player.on("videoloading", (video) => {
  println("Event: videoloading " + JSON.stringify(video, null, 2));
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

// these can be a bit too chatty for a demo, so they are disabled
/*
player.on("timeupdate", ({ seconds, duration }) => {
  println(
    "Event: timeupdate " + JSON.stringify({ seconds, duration }, null, 2),
  );
});

player.on("progress", ({ percent }) => {
  println("Event: progress " + JSON.stringify({ percent }, null, 2));
});
*/
