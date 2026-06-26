// lib/apiClient.ts
// Compatibility shim: older components may import getApiBase from "lib/apiClient".
// Canonical implementation lives in ./api.ts
export { getApiBase, apiFetch, apiGet, apiPost, apiPut, apiDel, getStoredToken, setStoredToken } from "./api";