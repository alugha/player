export var EventType;
(function (EventType) {
    /**
     * Triggered when the player has finished initialization and can respond
     * to commands.
     * This may happen more than once if a watchlist is specified.
     * Unless {@link PlayerOptions.autoPlay} is enabled, this will only be
     * triggered after the user has interacted with the player.
     */
    EventType["Ready"] = "ready";
    /**
     * Triggered when the player has begun or resumed playback of the video.
     */
    EventType["Play"] = "play";
    /**
     * Triggered when playback of the video has been paused.
     */
    EventType["Pause"] = "pause";
    /**
     * Triggered when playback of the video has reached the end.
     */
    EventType["Ended"] = "ended";
    /**
     * Triggered continuously while the video is playing, at least four times per
     * second.
     */
    EventType["Timeupdate"] = "timeupdate";
    /**
     * Triggered whenever another range of the video has been buffered.
     */
    EventType["Progress"] = "progress";
    /**
     * Triggered when the user has jumped to a different timestamp in the video
     * and resumed playback from there.
     */
    EventType["Seeked"] = "seeked";
    /**
     * Triggered when an error occured inside the player.
     */
    EventType["Error"] = "error";
    // The following events are not part of the original player.js protocol
    // and only supported by our implementation.
    /**
     * The ready state is invalidated by this event and commands will be queued
     * internally until another {@link EventType.Ready} event is emitted.
     */
    EventType["ResetReady"] = "resetready";
    /**
     * Triggered when the video has started to load.
     * This may happen more than once if a watchlist is specified.
     */
    EventType["VideoLoading"] = "videoloading";
    /**
     * Triggered when the video has been loaded.
     * This may happen more than once if a watchlist is specified.
     * If {@link PlayerOptions.autoPlay} is not enabled, this will not be
     * triggered until the user has interacted with the player.
     */
    EventType["VideoChange"] = "videochange";
    /**
     * Triggered when the audio track has been changed. This may happen if the user
     * has selected a different audio language from the settings menu, but is also
     * triggered on the initial start of a video.
     */
    EventType["AudioTrackChange"] = "audiotrackchange";
    /**
     * Triggered when the text track (closed captions or subtitles) has been changed.
     * This may happen if the user has selected a different text language from the settings menu.
     */
    EventType["TextTrackChange"] = "texttrackchange";
})(EventType || (EventType = {}));
export var MethodType;
(function (MethodType) {
    MethodType["Play"] = "play";
    MethodType["Pause"] = "pause";
    MethodType["GetPaused"] = "getPaused";
    MethodType["Mute"] = "mute";
    MethodType["Unmute"] = "unmute";
    MethodType["GetMuted"] = "getMuted";
    MethodType["SetVolume"] = "setVolume";
    MethodType["GetVolume"] = "getVolume";
    MethodType["GetDuration"] = "getDuration";
    MethodType["SetCurrentTime"] = "setCurrentTime";
    MethodType["GetCurrentTime"] = "getCurrentTime";
    MethodType["SetLoop"] = "setLoop";
    MethodType["GetLoop"] = "getLoop";
    MethodType["RemoveEventListener"] = "removeEventListener";
    MethodType["AddEventListener"] = "addEventListener";
})(MethodType || (MethodType = {}));
export var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["Unknown"] = -1] = "Unknown";
    ErrorCode[ErrorCode["UnsupportedDeviceOrBrowser"] = 1] = "UnsupportedDeviceOrBrowser";
    ErrorCode[ErrorCode["InvalidMethod"] = 2] = "InvalidMethod";
    ErrorCode[ErrorCode["MethodNotSupported"] = 3] = "MethodNotSupported";
    ErrorCode[ErrorCode["VideoNotFound"] = 4] = "VideoNotFound";
    ErrorCode[ErrorCode["EmbedNotAllowed"] = 5] = "EmbedNotAllowed";
})(ErrorCode || (ErrorCode = {}));
