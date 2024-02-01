import { PLAYERJS_CONTEXT, PLAYERJS_VERSION } from "./constants.js";
import { EventType, MethodType, } from "./data.js";
import { isString, parseOrigin } from "./utils.js";
const supportedEvents = Object.values(EventType);
const supportedMethods = Object.values(MethodType);
const isSupportedEvent = (value) => supportedEvents.includes(value);
export { EventType, MethodType };
// Custom implementation of player.js provider
export class Receiver {
    constructor() {
        this.active = false;
        this.isReady = false;
        this.origin = "";
        this.reject = true;
        this.controllerSupportsStructuredData = false;
        this.methodHandlers = new Map();
        this.eventListeners = new Map();
        this.receive = (e) => {
            if (e.origin !== this.origin) {
                return false;
            }
            let data;
            if (isString(e.data)) {
                try {
                    data = JSON.parse(e.data);
                }
                catch (ex) {
                    return false;
                }
            }
            else {
                this.controllerSupportsStructuredData = true;
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
                this.addEventListener(data.value, data.listener);
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
    }
    // Requires a browser environment
    activate() {
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
    deactivate() {
        if (!this.active) {
            return;
        }
        this.active = false;
        this.origin = "";
        this.reject = true;
        window.removeEventListener("message", this.receive);
    }
    on(methodType, callback) {
        this.methodHandlers.set(methodType, callback);
    }
    emit(eventType, value) {
        const listeners = this.eventListeners.get(eventType);
        if (!listeners) {
            return false;
        }
        for (const listener of listeners) {
            this.send(eventType, value, listener);
        }
        return true;
    }
    ready() {
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
    addEventListener(eventType, listener) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.add(listener);
        }
        else {
            this.eventListeners.set(eventType, new Set([listener]));
        }
        if (eventType === EventType.Ready && this.isReady) {
            this.send(EventType.Ready, {
                events: supportedEvents,
                methods: supportedMethods,
                src: window.location.href,
            }, listener);
        }
    }
    removeEventListener(eventType, listener) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.delete(listener);
        }
    }
    invoke(methodType, value, listener) {
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
    send(responseType, value, listener) {
        if (this.reject) {
            return false;
        }
        const data = {
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
