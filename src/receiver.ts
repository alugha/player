import { PLAYERJS_CONTEXT, PLAYERJS_VERSION } from "./constants.js";
import {
  EventType,
  EventData,
  MethodHandler,
  MethodType,
  ResponseType,
  MethodRequest,
  MethodResponse,
  ErrorCode,
} from "./data.js";
import { isString, parseOrigin } from "./utils.js";

const supportedEvents = Object.values(EventType);
const supportedMethods = Object.values(MethodType);

const isSupportedEvent = (value: unknown): value is EventType =>
  supportedEvents.includes(value as EventType);

export { EventType, EventData, MethodType, MethodHandler, ErrorCode };

// Custom implementation of player.js provider
export class Receiver {
  private active = false;
  private isReady = false;
  private origin = "";
  private reject = true;
  private controllerSupportsStructuredData = false;
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

  public emit<EventName extends EventType>(
    eventType: EventName,
    value?: EventData[EventName],
  ): boolean {
    const listeners = this.eventListeners.get(eventType);
    if (!listeners) {
      return false;
    }
    for (const listener of listeners) {
      this.send(eventType, value, listener);
    }
    return true;
  }

  public ready(): void {
    if (this.isReady) {
      return;
    }
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

  public resetReady(): void {
    this.isReady = false;
    if (!this.emit(EventType.ResetReady, undefined)) {
      this.send(EventType.ResetReady, undefined);
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
      } catch {
        return false;
      }
    } else {
      this.controllerSupportsStructuredData = true;
      data = e.data;
    }

    if (data.context !== PLAYERJS_CONTEXT) {
      return false;
    }

    if (!supportedMethods.includes(data.method)) {
      this.emit(EventType.Error, {
        code: ErrorCode.InvalidMethod,
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
      this.send(
        EventType.Ready,
        {
          events: supportedEvents,
          methods: supportedMethods,
          src: window.location.href,
        },
        listener,
      );
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
        code: ErrorCode.MethodNotSupported,
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
      version: PLAYERJS_VERSION,
      event: responseType,
      listener,
      value,
    };

    const msg = this.controllerSupportsStructuredData
      ? data
      : JSON.stringify(data);
    window.parent.postMessage(msg, this.origin || "*");
    return true;
  }
}
