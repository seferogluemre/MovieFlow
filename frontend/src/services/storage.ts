
const ACCESS_TOKEN_STORAGE_KEY = "access_token";
const REFRESH_TOKEN_STORAGE_KEY = "refresh_token";

function setAccessToken(access_token: string) {
  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, access_token);
}

function setRefreshToken(refresh_token: string) {
  localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refresh_token);
}

export function setTokenAndAuthUser(
  access_token: string,
  refresh_token: string
) {
  setAccessToken(access_token);
  setRefreshToken(refresh_token);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
}

function removeAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
}
function removeRefreshToken() {
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
}

export function removeTokenAndAuthUser() {
  removeAccessToken();
  removeRefreshToken();
}