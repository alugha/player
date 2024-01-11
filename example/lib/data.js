export var EventType;
(function (EventType) {
    /**
     * Triggered when the player has finished initialization and can respond
     * to commands.
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
     * Triggered when a different video has been loaded. This may happen if a
     * watchlist is specified.
     */
    EventType["VideoChange"] = "videochange";
    /**
     * Triggered when the audio track has been changed. This may happen if the user
     * has selected a different audio language from the settings menu.
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
