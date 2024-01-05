import { PLAYERJS_CONTEXT, PLAYERJS_VERSION } from "./constants";
import { isString, parseOrigin } from "./utils";

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

const supportedEvents = Object.values(EventType);

const isSupportedEvent = (value: unknown): value is EventType =>
  supportedEvents.includes(value as EventType);

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
const supportedMethods = Object.values(MethodType);

export type ResponseType = EventType | MethodType;

type MethodHandler<Arg, Ret> = (value: Arg) => Ret;

interface MethodRequest<T> {
  context: string;
  version: string;
  method: MethodType;
  value: T;
  listener?: string;
}

interface MethodResponse<T> {
  context: string;
  version: string;
  event: ResponseType;
  value: T;
  listener?: string;
}

// Custom implementation of player.js provider
export class Receiver {
  private active = false;
  private isReady = false;
  private origin = "";
  private reject = true;
  private methodHandlers: Map<MethodType, MethodHandler<unknown, unknown>> =
    new Map();
  private eventListeners: Map<EventType, Set<string>> = new Map();

  // Requires a browser environment
  public activate(): void {
    if (this.active) {
      return;
    }
    this.active = true;
    this.origin = parseOrigin(document.referrer);
    this.reject = window.self === window.top || !window.postMessage;
    if (!this.reject) {
      window.addEventListener("message", this.receive);
    }
  }

  public deactivate(): void {
    if (!this.active) {
      return;
    }
    this.active = false;
    this.origin = "";
    this.reject = true;
    window.removeEventListener("message", this.receive);
  }

  public on(
    methodType: MethodType,
    callback: MethodHandler<unknown, unknown>,
  ): void {
    this.methodHandlers.set(methodType, callback);
  }

  public emit<T>(eventType: EventType, value?: T): boolean {
    const listeners = this.eventListeners.get(eventType);
    if (!listeners) {
      return false;
    }
    listeners.forEach((listener) => this.send(eventType, value, listener));
    return true;
  }

  public ready(): void {
    this.isReady = true;
    const data = {
      events: supportedEvents,
      methods: supportedMethods,
      src: window.location.href,
    };
    if (!this.emit(EventType.Ready, data)) {
      this.send(EventType.Ready, data);
    }
  }

  private receive = (e: MessageEvent) => {
    if (e.origin !== this.origin) {
      return false;
    }

    let data: MethodRequest<unknown>;
    if (isString(e.data)) {
      try {
        data = JSON.parse(e.data);
      } catch (ex) {
        return false;
      }
    } else {
      data = e.data;
    }

    if (data.context !== PLAYERJS_CONTEXT) {
      return false;
    }

    if (!supportedMethods.includes(data.method)) {
      this.emit(EventType.Error, {
        code: 2,
        msg: `Invalid method "${data.method}"`,
      });
      return false;
    }

    if (data.method === MethodType.AddEventListener) {
      if (!data.listener || !isSupportedEvent(data.value)) {
        return false;
      }
      this.addEventListener(data.value as EventType, data.listener);
      return true;
    }
    if (data.method === MethodType.RemoveEventListener) {
      if (!data.listener || !isSupportedEvent(data.value)) {
        return false;
      }
      this.removeEventListener(data.value, data.listener);
      return true;
    }
    return this.invoke(data.method, data.value, data.listener);
  };

  private addEventListener(eventType: EventType, listener: string): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.add(listener);
    } else {
      this.eventListeners.set(eventType, new Set([listener]));
    }

    if (eventType === EventType.Ready && this.isReady) {
      this.ready();
    }
  }

  private removeEventListener(eventType: EventType, listener: string): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private invoke(
    methodType: MethodType,
    value: unknown,
    listener?: string,
  ): boolean {
    const handler = this.methodHandlers.get(methodType);
    if (!handler) {
      this.emit(EventType.Error, {
        code: 3,
        msg: `Method not supported: "${methodType}"`,
      });
      return false;
    }

    const returnValue = handler(value);
    if (listener) {
      this.send(methodType, returnValue, listener);
    }
    return true;
  }

  private send(
    responseType: ResponseType,
    value: unknown,
    listener?: string,
  ): boolean {
    if (this.reject) {
      return false;
    }

    const data: MethodResponse<unknown> = {
      context: PLAYERJS_CONTEXT,
      event: responseType,
      listener,
      value,
      version: PLAYERJS_VERSION,
    };

    const msg = JSON.stringify(data);
    window.parent.postMessage(msg, this.origin || "*");
    return true;
  }
}
