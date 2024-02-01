import { Controller } from "./controller.js";
import { isString } from "./utils.js";
export var UserInterfaceLanguage;
(function (UserInterfaceLanguage) {
    UserInterfaceLanguage["Arabic"] = "ar";
    UserInterfaceLanguage["Catalan"] = "ca";
    UserInterfaceLanguage["German"] = "de";
    UserInterfaceLanguage["Greek"] = "el";
    UserInterfaceLanguage["English"] = "en";
    UserInterfaceLanguage["Spanish"] = "es";
    UserInterfaceLanguage["French"] = "fr";
    UserInterfaceLanguage["Hindi"] = "hi";
    UserInterfaceLanguage["Italian"] = "it";
    UserInterfaceLanguage["Japanese"] = "ja";
    UserInterfaceLanguage["Dutch"] = "nl";
    UserInterfaceLanguage["Polish"] = "pl";
    UserInterfaceLanguage["Russian"] = "ru";
    UserInterfaceLanguage["Serbian"] = "sr";
    UserInterfaceLanguage["Chinese"] = "zh";
})(UserInterfaceLanguage || (UserInterfaceLanguage = {}));
export class Player extends Controller {
    constructor(options) {
        var _a;
        const { videoId, mountPoint, accentColor, brandId, watchlistId, showUnlistedTracks, audioLanguage, textLanguage, userInterfaceLanguage, startAt, autoPlay = false, loop = false, muted = false, targetScreenResolution = false, allowFullscreen = true, allowPictureInPicture = true, hideAlughaLogo = false, hideControls = false, size = { aspectRatio: 16 / 9 }, replaceMountPoint = false, base = "https://alugha.com", } = options;
        const params = new URLSearchParams({ v: videoId });
        const iframeAllow = [];
        const iframe = document.createElement("iframe");
        let container = iframe;
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
        if (userInterfaceLanguage) {
            params.set("locale", userInterfaceLanguage);
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
        if (hideControls) {
            params.set("controls", "0");
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
        }
        else {
            // Static
            iframe.style.border = "0";
            iframe.width = size.width.toString();
            iframe.height = size.height.toString();
        }
        let mountPointElement;
        if (isString(mountPoint)) {
            const element = document.getElementById(mountPoint);
            if (!element) {
                throw new Error(`The element id provided for the player mount point does not exist: ${mountPoint}`);
            }
            mountPointElement = element;
        }
        else {
            mountPointElement = mountPoint;
        }
        if (replaceMountPoint) {
            (_a = mountPointElement.parentElement) === null || _a === void 0 ? void 0 : _a.replaceChild(container, mountPointElement);
        }
        else {
            mountPointElement.appendChild(container);
        }
        super(iframe);
    }
}
