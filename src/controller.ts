import { PLAYERJS_CONTEXT, PLAYERJS_VERSION } from "./constants.js";
import {
  EventType,
  EventData,
  MethodRequest,
  MethodType,
  MethodResponse,
} from "./data.js";
import { isString, parseOrigin } from "./utils.js";

type Callback<T> = (data: T) => void;

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

  public activate() {
    window.addEventListener("message", this.receive);
  }

  public destroy() {
    window.removeEventListener("message", this.receive);
  }

  public on<T extends EventType>(event: T, callback: Callback<EventData[T]>) {
    this.send(MethodType.AddEventListener, event, callback);
  }

  public off<T extends EventType>(event: T, callback: Callback<EventData[T]>) {
    this.send(MethodType.RemoveEventListener, event, callback);
  }

  public once<T extends EventType>(event: T): Promise<EventData[T]> {
    return new Promise((resolve) => {
      const callback = (data: EventData[T]) => {
        this.off(event, callback);
        resolve(data);
      };
      this.on(event, callback);
    });
  }

  public play() {
    this.send(MethodType.Play);
  }

  public pause() {
    this.send(MethodType.Pause);
  }

  public get paused(): Promise<boolean> {
    return this.get(MethodType.GetPaused);
  }

  public set muted(muted: boolean) {
    this.send(muted ? MethodType.Mute : MethodType.Unmute);
  }

  public get muted(): Promise<boolean> {
    return this.get(MethodType.GetMuted);
  }

  public set volume(volume: number) {
    this.send(MethodType.SetVolume, volume);
  }

  public get volume(): Promise<number> {
    return this.get(MethodType.GetVolume);
  }

  public get duration(): Promise<number> {
    return this.get(MethodType.GetDuration);
  }

  public set currentTime(currentTime: number) {
    this.send(MethodType.SetCurrentTime, currentTime);
  }

  public get currentTime(): Promise<number> {
    return this.get(MethodType.GetCurrentTime);
  }

  public set loop(loop: boolean) {
    this.send(MethodType.SetLoop, loop);
  }

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
