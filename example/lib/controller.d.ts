import { EventType, EventData } from "./data.js";
/**
 * A function to be invoked in reaction to an event.
 * See {@link EventData} for the data types used by each event type.
 */
export type Callback<Data> = (data: Data) => void;
export declare class Controller {
    private iframe;
    private origin;
    private isReady;
    private queue;
    private callbacks;
    private listeners;
    constructor(iframe: HTMLIFrameElement);
    /**
     * Start listening to feedback from the alugha player
     * (called automatically on construction).
     */
    activate(): void;
    /**
     * Stop listening to feedback from the alugha player.
     */
    destroy(): void;
    /**
     * Add a listener callback for an event type.
     * See {@link EventType} for the available event types and
     * {@link EventData} for the data types used by each event type.
     *
     * @param event The event to listen on.
     * @param callback The callback to invoke when the event is triggered.
     */
    on<EventName extends EventType>(event: EventName, callback: Callback<EventData[EventName]>): void;
    /**
     * Remove a listener callback from an event type.
     *
     * @param event The event to stop listening on.
     * @param callback The callback to remove from the specified event.
     */
    off<EventName extends EventType>(event: EventName, callback: Callback<EventData[EventName]>): void;
    /**
     * Wait until an event has been triggered.
     * See {@link EventType} for the available event types and
     * {@link EventData} for the data types used by each event type.
     *
     * @param event The even to listen on.
     * @returns A promise that resolves when the event is triggered.
     */
    once<EventName extends EventType>(event: EventName): Promise<EventData[EventName]>;
    /**
     * Begin or resume playback of the video.
     */
    play(): void;
    /**
     * Interrupt playback of the video.
     */
    pause(): void;
    /**
     * Whether the video is currently paused.
     * Returns a promise that resolve with the actual value.
     */
    get paused(): Promise<boolean>;
    /**
     * Set whether the video should play without audio.
     */
    set muted(muted: boolean);
    /**
     * Whether the video is currently muted.
     * Returns a promise that resolve with the actual value.
     */
    get muted(): Promise<boolean>;
    /**
     * Set the audio volume the video should use for playback.
     */
    set volume(volume: number);
    /**
     * The audio volume the video is playing with.
     * Returns a promise that resolve with the actual value.
     */
    get volume(): Promise<number>;
    /**
     * The video duration in seconds.
     * Returns a promise that resolve with the actual value.
     */
    get duration(): Promise<number>;
    /**
     * Set the timestamp in seconds from which the video should continue playback.
     * Also known as seeking.
     */
    set currentTime(currentTime: number);
    /**
     * The current timestamp of the video in seconds.
     * Returns a promise that resolve with the actual value.
     */
    get currentTime(): Promise<number>;
    /**
     * Set whether the video should restart playback when it has ended.
     */
    set loop(loop: boolean);
    /**
     * Whether the video will restart playback when it has ended.
     * Returns a promise that resolve with the actual value.
     */
    get loop(): Promise<boolean>;
    private send;
    private postMessage;
    private addListener;
    private removeListener;
    private get;
    private onReady;
    private resetReady;
    private receive;
}
