import { PLAYERJS_CONTEXT, PLAYERJS_VERSION } from "./constants.js";
import {
  EventType,
  EventData,
  MethodRequest,
  MethodType,
  MethodResponse,
} from "./data.js";
import { isString, parseOrigin } from "./utils.js";

export type Callback<T> = (data: T) => void;

export class Controller {
  private iframe: HTMLIFrameElement;
  private origin: string;
  private isReady = false;
  private queue: MethodRequest<unknown>[] = [];
  private callbacks: Map<string, Callback<unknown>> = new Map();
  private listeners: Map<Callback<unknown>, string> = new Map();

  constructor(iframe: HTMLIFrameElement | string) {
    if (isString(iframe)) {
      const element = document.getElementById(iframe);
      if (!element) {
        throw new Error(
          `The provided iframe element id does not exist: ${iframe}`,
        );
      }
      if (!(element instanceof HTMLIFrameElement)) {
        throw new Error(
          `The provided element id does not belong to an iframe: ${iframe}`,
        );
      }
      this.iframe = element;
    } else {
      this.iframe = iframe;
    }

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
   * @param event The event to listen on.
   * @param callback The callback to invoke when the event is triggered.
   */
  public on<T extends EventType>(event: T, callback: Callback<EventData[T]>) {
    this.send(MethodType.AddEventListener, event, callback);
  }

  /**
   * Add a listener callback for an event type.
   * @param event The event to stop listening on.
   * @param callback The callback to remove from the specified event.
   */
  public off<T extends EventType>(event: T, callback: Callback<EventData[T]>) {
    this.send(MethodType.RemoveEventListener, event, callback);
  }

  /**
   * Wait until an event has been triggered.
   * @param event The even to listen on.
   * @returns A promise that resolves when the event is triggered.
   */
  public once<T extends EventType>(event: T): Promise<EventData[T]> {
    return new Promise((resolve) => {
      const callback = (data: EventData[T]) => {
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
   * Set the timestamp from which the video should continue playback.
   * Also known as seeking.
   */
  public set currentTime(currentTime: number) {
    this.send(MethodType.SetCurrentTime, currentTime);
  }

  /**
   * The current timestamp the video is at in seconds.
   * Returns a promise that resolve with the actual value.
   */
  public get currentTime(): Promise<number> {
    return this.get(MethodType.GetCurrentTime);
  }

  /**
   * Set whether the video should restart playback when it finished.
   */
  public set loop(loop: boolean) {
    this.send(MethodType.SetLoop, loop);
  }

  /**
   * Whether the video will restart playback when it finished.
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
      if (method === MethodType.RemoveEventListener) {
        listener = this.removeListener(callback);
        if (!listener) {
          return false;
        }
      } else {
        listener = this.addListener(callback);
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

  private postMessage<T>(message: T) {
    this.iframe.contentWindow?.postMessage(message, this.origin);
  }

  private addListener<Ret>(callback: Callback<Ret>): string {
    const listener = "listener-" + window.crypto.randomUUID();
    this.callbacks.set(listener, callback as Callback<unknown>);
    this.listeners.set(callback as Callback<unknown>, listener);
    return listener;
  }

  private removeListener<Ret>(callback: Callback<Ret>): string | undefined {
    const listener = this.listeners.get(callback as Callback<unknown>);
    if (!listener) {
      return;
    }
    this.listeners.delete(callback as Callback<unknown>);
    this.callbacks.delete(listener);
    return listener;
  }

  private get<T>(method: MethodType): Promise<T> {
    return new Promise((resolve) => {
      const callback = (data: T) => {
        this.removeListener(callback);
        resolve(data);
      };
      this.send(method, undefined, callback);
    });
  }

  private onReady = () => {
    this.isReady = true;
    for (const request of this.queue) {
      this.postMessage(request);
    }
    this.queue = [];
  };

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

    if (!data.listener) {
      if (data.event === EventType.Ready) {
        this.onReady();
      }
      return;
    }

    const callback = this.callbacks.get(data.listener);
    if (callback) {
      callback(data.value);
    }
  };
}
