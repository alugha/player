export enum EventType {
  Ready = "ready",
  Play = "play",
  Pause = "pause",
  Ended = "ended",
  Timeupdate = "timeupdate",
  Progress = "progress",
  Seeked = "seeked",
  Error = "error",
}

export interface EventData {
  [EventType.Ready]: void;
  [EventType.Play]: void;
  [EventType.Pause]: void;
  [EventType.Ended]: void;
  [EventType.Progress]: {
    percent: number;
  };
  [EventType.Timeupdate]: {
    seconds: number;
    duration: number;
  };
  [EventType.Seeked]: void;
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

export interface MethodRequest<T> {
  context: string;
  version: string;
  method: MethodType;
  value: T;
  listener?: string;
}

export interface MethodResponse<T> {
  context: string;
  version: string;
  event: ResponseType;
  value: T;
  listener?: string;
}
