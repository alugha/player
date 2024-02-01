# alugha player SDK

This is the SDK for the alugha player. You can install it from npm:

```
# using npm
npm install --save @alugha/player
# using yarn
yarn add @alugha/player
```

## Documentation

The documentation of the alugha player SDK can be access at <https://alugha.github.io/player/>.

## Example

You can find an interactive example on <https://alugha.github.io/player/example/>.
The code for the example is located at <https://github.com/alugha/player/tree/main/example>.

## Usage

A small usage example with TypeScript:

```ts
import { Player, EventType } from "@alugha/player";

// Create a new player with video id "b92c4508-faeb-11e9-bc4c-93211a9e934f"
// and mount it at the position of the element with id "player".
// Also enables autoplay.
const player = new Player({
  videoId: "b92c4508-faeb-11e9-bc4c-93211a9e934f",
  mountPoint: "player",
  replaceMountPoint: true,
  autoPlay: true,
});

player.on(EventType.Ready, () => {
  console.log("The player is ready");
});

player.on(EventType.Pause, () => {
  console.log("The video has paused");
});

// Seek to 42 seconds
player.currentTime = 42;

console.log("Video duration:", await player.duration);
```

You can find all available event types inside the documentation at <https://alugha.github.io/player/enums/EventType.html>.
Player methods, such as seeking, pausing, or getting the duration, can be found at <https://alugha.github.io/player/classes/Player.html>.
