import { Controller } from "./controller";
import { isString } from "./utils";

export interface ResponsiveSize {
  /**
   * The player aspect ratio, e.g., 16 / 9.
   */
  aspectRatio: number;
}

export interface StaticSize {
  /**
   * The logical width of the player, e.g., 1280.
   */
  width: number;
  /**
   * The logical height of the player, e.g., 720.
   */
  height: number;
}

export interface PlayerOptions {
  /**
   * Must be a valid UUID.
   */
  videoId: string;
  /**
   * The id of or a reference to a DOM node where the player
   * should be inserted.
   */
  mountPoint: string | Node;
  /**
   * Defaults to the alugha brand colors.
   * Must be a valid six-character hex color with the leading "#".
   * Also overrides your brand's color if `brandId` is set.
   */
  accentColor?: string;
  /**
   * Disabled by default.
   * Must be a valid UUID or the special string "1" to embed
   * the video owner's avatar into the player.
   * The brand's color is ignored if `accentColor` is also set.
   */
  brandId?: string;
  /**
   * Disabled by default.
   * Must be a valid UUID.
   */
  watchlistId?: string;
  /**
   * Disabled by default.
   * Must be an array of valid UUIDs, which reference tracks
   * that have the visibility state "unlisted" on alugha.
   */
  showUnlistedTracks?: string[];
  /**
   * Defaults to automatic language selection.
   * Must be an ISO-639-3 language code.
   */
  audioLanguage?: string;
  /**
   * Disabled by default.
   * Must be an ISO-639-3 language code or one of the special strings
   * "auto" for automatic language selection and "force" for forced
   * automatic language selection.
   */
  textLanguage?: string;
  /**
   * Defaults to zero.
   */
  startAt?: number;
  /**
   * Defaults to false
   */
  autoPlay?: boolean;
  /**
   * Defaults to false
   */
  loop?: boolean;
  /**
   * Defaults to false
   */
  muted?: boolean;
  /**
   * Defaults to true
   */
  allowFullscreen?: boolean;
  /**
   * Defaults to true
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
   * Defaults to false
   */
  hideAlughaLogo?: boolean;
  /**
   * Defaults to a responsive aspect ratio of 16:9
   */
  size?: ResponsiveSize | StaticSize;
  /**
   * Defaults to https://alugha.com
   */
  base?: string;
}

export class Player extends Controller {
  constructor({
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
    targetScreenResolution,
    allowFullscreen = true,
    allowPictureInPicture = true,
    hideAlughaLogo,
    size = { aspectRatio: 16 / 9 },
    base = "https://alugha.com",
  }: PlayerOptions) {
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

    if (isString(mountPoint)) {
      const parent = document.getElementById(mountPoint);
      if (!parent) {
        throw new Error(
          `The element id provided for the player mount point does not exist: ${mountPoint}`,
        );
      }
      parent.appendChild(container);
    } else {
      mountPoint.appendChild(container);
    }

    super(iframe);
  }
}
