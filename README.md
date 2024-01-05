# @alugha/player SDK

This is the SDK for the alugha player. You can install it from npm:

```
# using npm
npm install --save @alugha/player
# using yarn
yarn add @alugha/player
```

## Example

You can find an interactive example in `example/`.
Execution of the example requires `yarn`.
First install the development dependencies with `yarn install`.
Then run `yarn example`

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

You can find all available event types in [`src/data.ts`](./src/data.ts);
Player methods, such as seeking, pausing, or getting the duration, can be found in [`src/player.ts`](./src/player.ts).
