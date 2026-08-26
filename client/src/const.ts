export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

const LIVE_APP_ORIGIN = "https://icynigma-xkxmkqhz.manus.space";

// Temporary preview hosts are not registered OAuth callback origins. Send their
// sign-in flow through the live domain, where the authenticated session is valid.
export const getOAuthOrigin = (location: Pick<Location, "hostname" | "origin"> = window.location) => {
  const host = location.hostname;
  const isTemporaryPreview = host.endsWith(".manus.computer") || host.endsWith(".manusvm.computer");
  return isTemporaryPreview ? LIVE_APP_ORIGIN : location.origin;
};

export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${getOAuthOrigin()}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
