import { Controller } from "./controller.js";
import { isString } from "./utils.js";

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

export class Player extends Controller {
  constructor(options: PlayerOptions) {
    const {
      videoId,
      mountPoint,
      accentColor,
      brandId,
      watchlistId,
      showUnlistedTracks,
      audioLanguage,
      textLanguage,
      startAt,
      autoPlay = false,
      loop = false,
      muted = false,
      targetScreenResolution = false,
      allowFullscreen = true,
      allowPictureInPicture = true,
      hideAlughaLogo = false,
      size = { aspectRatio: 16 / 9 },
      replaceMountPoint = false,
      base = "https://alugha.com",
    } = options;

    const params = new URLSearchParams({ v: videoId });
    const iframeAllow: string[] = [];
    const iframe = document.createElement("iframe");
    let container: HTMLElement = iframe;

    if (accentColor) {
      params.set("color", accentColor);
    }

    if (brandId) {
      params.set("brand", brandId);
    }

    if (watchlistId) {
      params.set("watchlist", watchlistId);
    }

    if (showUnlistedTracks) {
      for (const trackId of showUnlistedTracks) {
        params.append("t", trackId);
      }
    }

    if (audioLanguage) {
      params.set("lang", audioLanguage);
    }

    if (textLanguage) {
      params.set("sub", textLanguage);
    }

    if (startAt) {
      params.set("time", startAt.toString());
    }

    if (autoPlay) {
      iframeAllow.push("autoplay");
      params.set("autoplay", "1");
    }

    if (loop) {
      params.set("loop", "1");
    }

    if (muted) {
      params.set("muted", "1");
    }

    if (allowFullscreen) {
      iframeAllow.push("fullscreen");
      iframe.allowFullscreen = true;
    }

    if (allowPictureInPicture) {
      iframeAllow.push("picture-in-picture");
    }

    if (targetScreenResolution) {
      params.set("maxres", "1");
    }

    if (hideAlughaLogo) {
      params.set("alugha", "0");
    }

    const url = new URL("/embed/web-player", base);
    url.search = params.toString();

    iframe.src = url.toString();
    iframe.allow = iframeAllow.join("; ");

    if ("aspectRatio" in size) {
      // Responsive
      container = document.createElement("div");
      container.appendChild(iframe);
      container.style.position = "relative";
      container.style.height = "0";
      container.style.paddingBottom = (100 / size.aspectRatio).toString() + "%";
      iframe.style.position = "absolute";
      iframe.style.top = "0";
      iframe.style.left = "0";
      iframe.style.width = "100%";
      iframe.style.height = "100%";
      iframe.style.border = "0";
    } else {
      // Static
      iframe.style.border = "0";
      iframe.width = size.width.toString();
      iframe.height = size.height.toString();
    }

    let mountPointElement: Node;
    if (isString(mountPoint)) {
      const element = document.getElementById(mountPoint);
      if (!element) {
        throw new Error(
          `The element id provided for the player mount point does not exist: ${mountPoint}`,
        );
      }
      mountPointElement = element;
    } else {
      mountPointElement = mountPoint;
    }

    if (replaceMountPoint) {
      mountPointElement.parentElement?.replaceChild(
        container,
        mountPointElement,
      );
    } else {
      mountPointElement.appendChild(container);
    }

    super(iframe);
  }
}
