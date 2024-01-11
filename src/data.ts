export enum EventType {
  /**
   * Triggered when the player has finished initialization and can respond
   * to commands.
   */
  Ready = "ready",
  /**
   * Triggered when the player has begun or resumed playback of the video.
   */
  Play = "play",
  /**
   * Triggered when playback of the video has been paused.
   */
  Pause = "pause",
  /**
   * Triggered when playback of the video has reached the end.
   */
  Ended = "ended",
  /**
   * Triggered continuously while the video is playing, at least four times per
   * second.
   */
  Timeupdate = "timeupdate",
  /**
   * Triggered whenever another range of the video has been buffered.
   */
  Progress = "progress",
  /**
   * Triggered when the user has jumped to a different timestamp in the video
   * and resumed playback from there.
   */
  Seeked = "seeked",
  /**
   * Triggered when an error occured inside the player.
   */
  Error = "error",
}

export interface EventData {
  /**
   * The ready event has no data.
   */
  [EventType.Ready]: void;
  /**
   * The play event has no data.
   */
  [EventType.Play]: void;
  /**
   * The pause event has no data.
   */
  [EventType.Pause]: void;
  /**
   * The ended event has no data.
   */
  [EventType.Ended]: void;
  /**
   * `seconds` is the current timestamp of the video playback.
   * `duration` is the total duration of the video in seconds.
   */
  [EventType.Timeupdate]: {
    seconds: number;
    duration: number;
  };
  /**
   * `percent` represents the buffering progress between 0 and 1.
   * A value of 0.5, for example, means the video has been loaded until the
   * 50% mark.
   */
  [EventType.Progress]: {
    percent: number;
  };
  /**
   * The seeked event has no data.
   */
  [EventType.Seeked]: void;
  /**
   * The error event has no data.
   */
  [EventType.Error]: void;
}

export enum MethodType {
  Play = "play",
  Pause = "pause",
  GetPaused = "getPaused",
  Mute = "mute",
  Unmute = "unmute",
  GetMuted = "getMuted",
  SetVolume = "setVolume",
  GetVolume = "getVolume",
  GetDuration = "getDuration",
  SetCurrentTime = "setCurrentTime",
  GetCurrentTime = "getCurrentTime",
  SetLoop = "setLoop",
  GetLoop = "getLoop",
  RemoveEventListener = "removeEventListener",
  AddEventListener = "addEventListener",
}

export type ResponseType = EventType | MethodType;

export type MethodHandler<Arg, Ret> = (value: Arg) => Ret;

export interface MethodRequest<Value> {
  context: string;
  version: string;
  method: MethodType;
  value: Value;
  listener?: string;
}

export interface MethodResponse<Value> {
  context: string;
  version: string;
  event: ResponseType;
  value: Value;
  listener?: string;
}
