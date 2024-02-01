import { PLAYERJS_CONTEXT, PLAYERJS_VERSION } from "./constants.js";
import {
  EventType,
  EventData,
  MethodRequest,
  MethodType,
  MethodResponse,
} from "./data.js";
import { isString, parseOrigin } from "./utils.js";

/**
 * A function to be invoked in reaction to an event.
 * See {@link EventData} for the data types used by each event type.
 */
export type Callback<Data> = (data: Data) => void;

export class Controller {
  private origin: string;
  private isReady = false;
  private queue: MethodRequest<unknown>[] = [];
  private callbacks: Map<string, Callback<unknown>> = new Map();
  private listeners: Map<Callback<unknown>, Record<string, string>> = new Map();

  constructor(private iframe: HTMLIFrameElement) {
    this.origin = parseOrigin(this.iframe.src);
    this.activate();
  }

  /**
   * Start listening to feedback from the alugha player
   * (called automatically on construction).
   */
  public activate() {
    window.addEventListener("message", this.receive);
  }

  /**
   * Stop listening to feedback from the alugha player.
   */
  public destroy() {
    window.removeEventListener("message", this.receive);
  }

  /**
   * Add a listener callback for an event type.
   * See {@link EventType} for the available event types and
   * {@link EventData} for the data types used by each event type.
   *
   * @param event The event to listen on.
   * @param callback The callback to invoke when the event is triggered.
   */
  public on<EventName extends EventType>(
    event: EventName,
    callback: Callback<EventData[EventName]>,
  ) {
    this.send(MethodType.AddEventListener, event, callback);
  }

  /**
   * Remove a listener callback from an event type.
   *
   * @param event The event to stop listening on.
   * @param callback The callback to remove from the specified event.
   */
  public off<EventName extends EventType>(
    event: EventName,
    callback: Callback<EventData[EventName]>,
  ) {
    this.send(MethodType.RemoveEventListener, event, callback);
  }

  /**
   * Wait until an event has been triggered.
   * See {@link EventType} for the available event types and
   * {@link EventData} for the data types used by each event type.
   *
   * @param event The even to listen on.
   * @returns A promise that resolves when the event is triggered.
   */
  public once<EventName extends EventType>(
    event: EventName,
  ): Promise<EventData[EventName]> {
    return new Promise((resolve) => {
      const callback = (data: EventData[EventName]) => {
        this.off(event, callback);
        resolve(data);
      };
      this.on(event, callback);
    });
  }

  /**
   * Begin or resume playback of the video.
   */
  public play() {
    this.send(MethodType.Play);
  }

  /**
   * Interrupt playback of the video.
   */
  public pause() {
    this.send(MethodType.Pause);
  }

  /**
   * Whether the video is currently paused.
   * Returns a promise that resolve with the actual value.
   */
  public get paused(): Promise<boolean> {
    return this.get(MethodType.GetPaused);
  }

  /**
   * Set whether the video should play without audio.
   */
  public set muted(muted: boolean) {
    this.send(muted ? MethodType.Mute : MethodType.Unmute);
  }

  /**
   * Whether the video is currently muted.
   * Returns a promise that resolve with the actual value.
   */
  public get muted(): Promise<boolean> {
    return this.get(MethodType.GetMuted);
  }

  /**
   * Set the audio volume the video should use for playback.
   */
  public set volume(volume: number) {
    this.send(MethodType.SetVolume, volume);
  }

  /**
   * The audio volume the video is playing with.
   * Returns a promise that resolve with the actual value.
   */
  public get volume(): Promise<number> {
    return this.get(MethodType.GetVolume);
  }

  /**
   * The video duration in seconds.
   * Returns a promise that resolve with the actual value.
   */
  public get duration(): Promise<number> {
    return this.get(MethodType.GetDuration);
  }

  /**
   * Set the timestamp in seconds from which the video should continue playback.
   * Also known as seeking.
   */
  public set currentTime(currentTime: number) {
    this.send(MethodType.SetCurrentTime, currentTime);
  }

  /**
   * The current timestamp of the video in seconds.
   * Returns a promise that resolve with the actual value.
   */
  public get currentTime(): Promise<number> {
    return this.get(MethodType.GetCurrentTime);
  }

  /**
   * Set whether the video should restart playback when it has ended.
   */
  public set loop(loop: boolean) {
    this.send(MethodType.SetLoop, loop);
  }

  /**
   * Whether the video will restart playback when it has ended.
   * Returns a promise that resolve with the actual value.
   */
  public get loop(): Promise<boolean> {
    return this.get(MethodType.GetLoop);
  }

  private send<Arg, Ret>(
    method: MethodType,
    value?: Arg,
    callback?: Callback<Ret>,
  ): boolean {
    let listener: string | undefined = undefined;
    if (callback) {
      const eventName = isString(value) ? value : "internal";
      if (method === MethodType.RemoveEventListener) {
        listener = this.removeListener(eventName, callback);
        if (!listener) {
          return false;
        }
      } else {
        listener = this.addListener(eventName, callback);
      }
    }

    const request: MethodRequest<typeof value> = {
      context: PLAYERJS_CONTEXT,
      version: PLAYERJS_VERSION,
      method,
      value,
      listener,
    };

    if (!this.isReady) {
      this.queue.push(request as MethodRequest<unknown>);
      return false;
    }

    this.postMessage(request);
    return true;
  }

  private postMessage<Message>(message: Message) {
    this.iframe.contentWindow?.postMessage(message, this.origin);
  }

  private addListener<Ret>(eventName: string, callback: Callback<Ret>): string {
    const listener = "listener-" + window.crypto.randomUUID();
    const cb = callback as Callback<unknown>;
    this.callbacks.set(listener, cb);
    const eventListenerIds = this.listeners.get(cb);
    if (eventListenerIds) {
      eventListenerIds[eventName] = listener;
    } else {
      this.listeners.set(cb, { [eventName]: listener });
    }
    return listener;
  }

  private removeListener<Ret>(
    eventName: string,
    callback: Callback<Ret>,
  ): string | undefined {
    const cb = callback as Callback<unknown>;
    const eventListenerIds = this.listeners.get(cb);
    if (!eventListenerIds) {
      return;
    }
    const listener = eventListenerIds[eventName];
    if (!listener) {
      return;
    }
    delete eventListenerIds[eventName];
    if (Object.keys(eventListenerIds).length === 0) {
      this.listeners.delete(cb);
    }
    this.callbacks.delete(listener);
    return listener;
  }

  private get<Data>(method: MethodType): Promise<Data> {
    return new Promise((resolve) => {
      const callback = (data: Data) => {
        this.removeListener("internal", callback);
        resolve(data);
      };
      this.send(method, undefined, callback);
    });
  }

  private onReady() {
    this.isReady = true;
    for (const request of this.queue) {
      this.postMessage(request);
    }
    this.queue = [];
  }

  private resetReady() {
    this.isReady = false;
  }

  private receive = (e: MessageEvent) => {
    if (e.origin !== this.origin) {
      return;
    }

    let data: MethodResponse<unknown>;
    if (isString(e.data)) {
      try {
        data = JSON.parse(e.data);
      } catch (ex) {
        return;
      }
    } else {
      data = e.data;
    }

    if (data.context !== PLAYERJS_CONTEXT) {
      return;
    }

    switch (data.event) {
      case EventType.Ready:
        this.onReady();
        break;
      case EventType.ResetReady:
        this.resetReady();
        break;
      default:
        break;
    }

    if (!data.listener) {
      return;
    }

    const callback = this.callbacks.get(data.listener);
    if (callback) {
      callback(data.value);
    }
  };
}
