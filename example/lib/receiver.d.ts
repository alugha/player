import { EventType, EventData, MethodHandler, MethodType } from "./data.js";
export { EventType, EventData, MethodType, MethodHandler };
export declare class Receiver {
    private active;
    private isReady;
    private origin;
    private reject;
    private controllerSupportsStructuredData;
    private methodHandlers;
    private eventListeners;
    activate(): void;
    deactivate(): void;
    on(methodType: MethodType, callback: MethodHandler<unknown, unknown>): void;
    emit<EventName extends EventType>(eventType: EventName, value?: EventData[EventName]): boolean;
    ready(): void;
    private receive;
    private addEventListener;
    private removeEventListener;
    private invoke;
    private send;
}
