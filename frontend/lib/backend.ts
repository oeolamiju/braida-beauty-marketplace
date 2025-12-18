import { Client } from '~backend/client';

const backend = new Client(import.meta.env.VITE_CLIENT_TARGET, {
  requestInit: { credentials: "include" },
  auth: () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      return { authorization: `Bearer ${token}` };
    }
    return undefined;
  }
});

export default backend;
