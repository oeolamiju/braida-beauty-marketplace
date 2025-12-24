import { Client } from '../client';
import { API_URL } from '../config';

console.log("[BACKEND CLIENT] Initializing with API_URL:", API_URL);

const backend = new Client(API_URL, {
  requestInit: { credentials: "include" },
  auth: () => {
    const token = localStorage.getItem("authToken");
    console.log("[BACKEND CLIENT] Auth function called");
    console.log("[BACKEND CLIENT] Token exists:", !!token);
    console.log("[BACKEND CLIENT] Token length:", token?.length);
    console.log("[BACKEND CLIENT] Token preview:", token ? `${token.substring(0, 20)}...` : "null");
    if (token) {
      return { authorization: `Bearer ${token}` };
    }
    return undefined;
  }
});

export default backend;
