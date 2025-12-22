import { Client } from '~backend/client';
import { API_URL } from '../config';

const backend = new Client(API_URL, {
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
