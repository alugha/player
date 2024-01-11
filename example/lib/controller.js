import { PLAYERJS_CONTEXT, PLAYERJS_VERSION } from "./constants.js";
import { EventType, MethodType, } from "./data.js";
import { isString, parseOrigin } from "./utils.js";
export class Controller {
    constructor(iframe) {
        this.iframe = iframe;
        this.isReady = false;
        this.queue = [];
        this.callbacks = new Map();
        this.listeners = new Map();
        this.onReady = () => {
            this.isReady = true;
            for (const request of this.queue) {
                this.postMessage(request);
            }
            this.queue = [];
        };
        this.receive = (e) => {
            if (e.origin !== this.origin) {
                return;
            }
            let data;
            if (isString(e.data)) {
                try {
                    data = JSON.parse(e.data);
                }
                catch (ex) {
                    return;
                }
            }
            else {
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
        this.origin = parseOrigin(this.iframe.src);
        this.activate();
    }
    /**
     * Start listening to feedback from the alugha player
     * (called automatically on construction).
     */
    activate() {
        window.addEventListener("message", this.receive);
    }
    /**
     * Stop listening to feedback from the alugha player.
     */
    destroy() {
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
    on(event, callback) {
        this.send(MethodType.AddEventListener, event, callback);
    }
    /**
     * Add a listener callback for an event type.
     *
     * @param event The event to stop listening on.
     * @param callback The callback to remove from the specified event.
     */
    off(event, callback) {
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
    once(event) {
        return new Promise((resolve) => {
            const callback = (data) => {
                this.off(event, callback);
                resolve(data);
            };
            this.on(event, callback);
        });
    }
    /**
     * Begin or resume playback of the video.
     */
    play() {
        this.send(MethodType.Play);
    }
    /**
     * Interrupt playback of the video.
     */
    pause() {
        this.send(MethodType.Pause);
    }
    /**
     * Whether the video is currently paused.
     * Returns a promise that resolve with the actual value.
     */
    get paused() {
        return this.get(MethodType.GetPaused);
    }
    /**
     * Set whether the video should play without audio.
     */
    set muted(muted) {
        this.send(muted ? MethodType.Mute : MethodType.Unmute);
    }
    /**
     * Whether the video is currently muted.
     * Returns a promise that resolve with the actual value.
     */
    get muted() {
        return this.get(MethodType.GetMuted);
    }
    /**
     * Set the audio volume the video should use for playback.
     */
    set volume(volume) {
        this.send(MethodType.SetVolume, volume);
    }
    /**
     * The audio volume the video is playing with.
     * Returns a promise that resolve with the actual value.
     */
    get volume() {
        return this.get(MethodType.GetVolume);
    }
    /**
     * The video duration in seconds.
     * Returns a promise that resolve with the actual value.
     */
    get duration() {
        return this.get(MethodType.GetDuration);
    }
    /**
     * Set the timestamp in seconds from which the video should continue playback.
     * Also known as seeking.
     */
    set currentTime(currentTime) {
        this.send(MethodType.SetCurrentTime, currentTime);
    }
    /**
     * The current timestamp of the video in seconds.
     * Returns a promise that resolve with the actual value.
     */
    get currentTime() {
        return this.get(MethodType.GetCurrentTime);
    }
    /**
     * Set whether the video should restart playback when it has ended.
     */
    set loop(loop) {
        this.send(MethodType.SetLoop, loop);
    }
    /**
     * Whether the video will restart playback when it has ended.
     * Returns a promise that resolve with the actual value.
     */
    get loop() {
        return this.get(MethodType.GetLoop);
    }
    send(method, value, callback) {
        let listener = undefined;
        if (callback) {
            if (method === MethodType.RemoveEventListener) {
                listener = this.removeListener(callback);
                if (!listener) {
                    return false;
                }
            }
            else {
                listener = this.addListener(callback);
            }
        }
        const request = {
            context: PLAYERJS_CONTEXT,
            version: PLAYERJS_VERSION,
            method,
            value,
            listener,
        };
        if (!this.isReady) {
            this.queue.push(request);
            return false;
        }
        this.postMessage(request);
        return true;
    }
    postMessage(message) {
        var _a;
        (_a = this.iframe.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage(message, this.origin);
    }
    addListener(callback) {
        const listener = "listener-" + window.crypto.randomUUID();
        this.callbacks.set(listener, callback);
        this.listeners.set(callback, listener);
        return listener;
    }
    removeListener(callback) {
        const listener = this.listeners.get(callback);
        if (!listener) {
            return;
        }
        this.listeners.delete(callback);
        this.callbacks.delete(listener);
        return listener;
    }
    get(method) {
        return new Promise((resolve) => {
            const callback = (data) => {
                this.removeListener(callback);
                resolve(data);
            };
            this.send(method, undefined, callback);
        });
    }
}
