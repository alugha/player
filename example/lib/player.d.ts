import { Controller } from "./controller.js";
export interface ResponsiveSize {
    /**
     * The player aspect ratio, e.g., 16 / 9.
     */
    aspectRatio: number;
}
export interface StaticSize {
    /**
     * The logical pixel width of the player, e.g., 1280.
     */
    width: number;
    /**
     * The logical pixel height of the player, e.g., 720.
     */
    height: number;
}
export interface PlayerOptions {
    /**
     * The id of the video to embed.
     * Must be a valid UUID.
     */
    videoId: string;
    /**
     * The id of or a reference to a DOM node where the player
     * should be inserted.
     */
    mountPoint: string | Node;
    /**
     * The accent color to use for styling the controls of the embedded player.
     * Must be a valid six-character hex color with the leading "#".
     * Also overrides your brand's color if `brandId` is set.
     *
     * Defaults to the alugha brand colors.
     */
    accentColor?: string;
    /**
     * The id of the brand to retrieve accent color and logo from.
     * Must be a valid UUID or the special string "1" to embed
     * the video owner's avatar into the player.
     * The brand's color is ignored if `accentColor` is also set.
     *
     * Disabled by default.
     */
    brandId?: string;
    /**
     * The id of the watchlist to embed.
     * Must be a valid UUID.
     *
     * Disabled by default.
     */
    watchlistId?: string;
    /**
     * The ids of unlisted tracks that should be exposed to the user.
     * Must be an array of valid UUIDs, which reference tracks
     * that have the visibility state "unlisted" on alugha.
     *
     * Disabled by default.
     */
    showUnlistedTracks?: string[];
    /**
     * The language code of the audio track to begin playback with.
     * Must be an ISO-639-3 language code.
     *
     * Defaults to automatic language selection.
     */
    audioLanguage?: string;
    /**
     * The language code of the text track to begin playback with.
     * Must be an ISO-639-3 language code or one of the special strings
     * "auto" for automatic language selection and "force" for forced
     * automatic language selection.
     *
     * Disabled by default.
     */
    textLanguage?: string;
    /**
     * Timestamp in seconds from which playback will start.
     *
     * Defaults to zero.
     */
    startAt?: number;
    /**
     * Whether to automatically begin playback of the video without user
     * interaction.
     * In most browsers, automatic playback is blocked nowadays. In this case
     * this option will skip the poster with the large playback button and jump
     * directly to the video in a paused state.
     *
     * Defaults to false.
     */
    autoPlay?: boolean;
    /**
     * Whether to resume playback when the video has reached the end.
     *
     * Defaults to false.
     */
    loop?: boolean;
    /**
     * Whether to start playback without any audio. This may help to circumvent
     * browsers blocking automatic playback.
     *
     * Defaults to false.
     */
    muted?: boolean;
    /**
     * Whether the user should be allowed to switch the video into fullscreen
     * mode.
     * In fullscreen mode, the player control elements are scaled up for easier access.
     *
     * Defaults to true.
     */
    allowFullscreen?: boolean;
    /**
     * Whether the user should be allowed to switch the video into picture in
     * picture playback mode, a small browser-controlled video player at the
     * corner of the screen.
     * This does not have any effects in Firefox which shows its own button
     * for starting picture in picture mode.
     *
     * Defaults to true.
     */
    allowPictureInPicture?: boolean;
    /**
     * By default, the player limits the resolution to the
     * smallest one that covers the physical size of the player
     * element, honoring the device pixel ratio.
     * With this optional setting, the player instead uses
     * the whole screen size instead of the player size
     * as reference.
     * You may want to activate this if your users primarily
     * consume your content in fullscreen mode.
     */
    targetScreenResolution?: boolean;
    /**
     * Whether the alugha logo should be removed from the control bar of the player.
     * This does not have any effect if your alugha subscription does not support
     * this feature.
     *
     * Defaults to false.
     */
    hideAlughaLogo?: boolean;
    /**
     * Whether the player controls should be hidden.
     * This does not have any effect if your alugha subscription does not support
     * this feature.
     *
     * Defaults to false.
     */
    hideControls?: boolean;
    /**
     * The size of the embedded player. This can be an aspect ratio for responsive
     * scaling of the player, or a static width and height in logical pixels.
     * Logical pixels do not always equal physical pixels. For example, if the
     * screen has a high pixel density, a single logical pixel might equal 2x2
     * physical pixels.
     *
     * Defaults to a responsive aspect ratio of 16:9.
     */
    size?: ResponsiveSize | StaticSize;
    /**
     * If enabled, the player will replace the provided `mountPoint`
     * instead of appending itself as a child.
     */
    replaceMountPoint?: boolean;
    /**
     * The base URL to use for the embed of the alugha player.
     *
     * Defaults to https://alugha.com.
     */
    base?: string;
}
export declare class Player extends Controller {
    constructor(options: PlayerOptions);
}
