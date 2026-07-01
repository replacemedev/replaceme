import {
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_VALUE,
  UX_THEME_COOKIE,
} from "@/lib/cookies/constants";
import { COOKIE_CONSENT_STORAGE_KEY } from "@/lib/cookie-consent/types";
import { COOKIE_POLICY_VERSION } from "@/lib/content/page-fallbacks";

/** Inline blocking script — runs before paint to avoid consent/theme flash. */
export function buildUxBlockingScript(): string {
  return `(function(){try{
var lsKey=${JSON.stringify(COOKIE_CONSENT_STORAGE_KEY)};
var policyVersion=${JSON.stringify(COOKIE_POLICY_VERSION)};
var consentName=${JSON.stringify(COOKIE_CONSENT_NAME)};
var consentValue=${JSON.stringify(COOKIE_CONSENT_VALUE)};
var themeName=${JSON.stringify(UX_THEME_COOKIE)};
function readCookie(n){var p=encodeURIComponent(n)+"=";var c=document.cookie.split("; ").find(function(x){return x.indexOf(p)===0});return c?decodeURIComponent(c.slice(p.length)):null}
var raw=localStorage.getItem(lsKey);
if(raw){var p=JSON.parse(raw);if(p&&p.policyVersion===policyVersion){document.documentElement.setAttribute("data-cookie-consent","granted");if(readCookie(consentName)!==consentValue){document.cookie=consentName+"="+consentValue+"; Path=/; SameSite=Lax; Max-Age=31536000"+(location.protocol==="https:"?"; Secure":"")}}}
var hasConsent=readCookie(consentName)===consentValue;
if(hasConsent){
var theme=readCookie(themeName)||"system";
var dark=theme==="dark"||(theme==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);
document.documentElement.classList.toggle("dark",dark);
document.documentElement.style.colorScheme=dark?"dark":"light";
}
}catch(e){}})();`;
}
