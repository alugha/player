import { PLAYERJS_CONTEXT, PLAYERJS_VERSION } from "./constants";
import { EventType, EventData, MethodRequest, MethodType } from "./data";
import { isString, parseOrigin } from "./utils";

type Callback<T> = (data: T) => void;

export class Controller {
  private iframe: HTMLIFrameElement;
  private origin: string;
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

    const contentWindow = this.iframe.contentWindow;
    if (!contentWindow) {
      return false;
    }

    const request: MethodRequest<typeof value> = {
      context: PLAYERJS_CONTEXT,
      version: PLAYERJS_VERSION,
      method,
      value,
      listener,
    };
    contentWindow.postMessage(request, this.origin);
    return true;
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
}
