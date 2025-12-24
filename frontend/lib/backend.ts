import { Client } from '../client';
import { API_URL } from '../config';

console.log("[BACKEND CLIENT] Initializing with API_URL:", API_URL);

const backend = new Client(API_URL, {
  requestInit: { 
    credentials: "include",
    headers: {
      'Content-Type': 'application/json',
    }
  },
  fetcher: async (url, init) => {
    const token = localStorage.getItem("authToken");
    console.log("[BACKEND CLIENT] Fetcher called for:", url);
    console.log("[BACKEND CLIENT] Token exists:", !!token);
    
    const headers = {
      ...init?.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const finalInit = {
      ...init,
      headers,
    };

    console.log("[BACKEND CLIENT] Request headers:", headers);
    return fetch(url, finalInit);
  }
});

export default backend;
