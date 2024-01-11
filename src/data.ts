export enum EventType {
  /**
   * Triggered when the player has finished initialization and can respond
   * to commands.
   */
  Ready = "ready",
  /**
   * Triggered when the player has begun or resumed playback of the video.
   */
  Play = "play",
  /**
   * Triggered when playback of the video has been paused.
   */
  Pause = "pause",
  /**
   * Triggered when playback of the video has reached the end.
   */
  Ended = "ended",
  /**
   * Triggered continuously while the video is playing, at least four times per
   * second.
   */
  Timeupdate = "timeupdate",
  /**
   * Triggered whenever another range of the video has been buffered.
   */
  Progress = "progress",
  /**
   * Triggered when the user has jumped to a different timestamp in the video
   * and resumed playback from there.
   */
  Seeked = "seeked",
  /**
   * Triggered when an error occured inside the player.
   */
  Error = "error",

  // The following events are not part of the original player.js protocol
  // and only supported by our implementation.
  /**
   * Triggered when a different video has been loaded. This may happen if a
   * watchlist is specified.
   */
  VideoChange = "videochange",
  /**
   * Triggered when the audio track has been changed. This may happen if the user
   * has selected a different audio language from the settings menu.
   */
  AudioTrackChange = "audiotrackchange",
  /**
   * Triggered when the text track (closed captions or subtitles) has been changed.
   * This may happen if the user has selected a different text language from the settings menu.
   */
  TextTrackChange = "texttrackchange",
}

export interface EventData {
  /**
   * Information about the receiver.
   */
  [EventType.Ready]: {
    /**
     * The event types supported by the player.
     */
    events: string[];
    /**
     * The method types supported by the player.
     */
    methods: string[];
    /**
     * The URL of the embedded player.
     */
    src: string;
  };
  /**
   * The play event has no data.
   */
  [EventType.Play]: void;
  /**
   * The pause event has no data.
   */
  [EventType.Pause]: void;
  /**
   * The ended event has no data.
   */
  [EventType.Ended]: void;
  [EventType.Timeupdate]: {
    /**
     * The current timestamp of the video playback in seconds.
     */
    seconds: number;
    /**
     * The total duration of the video in seconds.
     */
    duration: number;
  };
  [EventType.Progress]: {
    /**
     * The buffering progress between 0 and 1.
     * A value of 0.5, for example, means the video has been loaded until the
     * 50% mark.
     */
    percent: number;
  };
  /**
   * The seeked event has no data.
   */
  [EventType.Seeked]: void;
  /**
   * The error that occured.
   */
  [EventType.Error]: {
    code: number;
    msg: string;
  };

  // The following events are not part of the original player.js protocol
  // and only supported by our implementation.
  /**
   * Information about the video that will be played.
   */
  [EventType.VideoChange]: {
    /**
     * The UUID of the video.
     */
    videoId: string;
    /**
     * The ISO 639-3 language codes of the audio tracks belonging to this video.
     */
    audioLanguages: string[];
    /**
     * The ISO 639-3 language codes of the text tracks belonging to this video.
     */
    textLanguages: string[];
  };
  /**
   * Information about the audio track that will be played.
   */
  [EventType.AudioTrackChange]: {
    /**
     * The UUID of the track.
     */
    trackId: string;
    /**
     * The ISO 639-3 language code of the track.
     */
    langCode: string;
    /**
     * The name of the language of the track. In its native version if available,
     * otherwise in English (e.g., English, Deutsch, Italiano).
     */
    name: string;
    /**
     * The translated title of the video.
     */
    title: string;
    /**
     * The translated description of the video.
     */
    description: string | null;
  };
  /**
   * Information about the text track (closed captions or subtitles) that will be played.
   * Can be null if the user disabled the text track.
   */
  [EventType.TextTrackChange]: {
    /**
     * The UUID of the track.
     */
    trackId: string;
    /**
     * The ISO 639-3 language code of the track.
     */
    langCode: string;
    /**
     * The name of the language of the track. In its native version if available,
     * otherwise in English (e.g., English, Deutsch, Italiano).
     */
    name: string;
    /**
     * The translated title of the video.
     */
    title: string;
    /**
     * The translated description of the video.
     */
    description: string | null;
  } | null;
}

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

export type ResponseType = EventType | MethodType;

export type MethodHandler<Arg, Ret> = (value: Arg) => Ret;

export interface MethodRequest<Value> {
  context: string;
  version: string;
  method: MethodType;
  value: Value;
  listener?: string;
}

export interface MethodResponse<Value> {
  context: string;
  version: string;
  event: ResponseType;
  value: Value;
  listener?: string;
}
