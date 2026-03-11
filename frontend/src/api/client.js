import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Attach JWT to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token so app shows login
client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      window.dispatchEvent(new Event('auth-expired'));
    }
    return Promise.reject(err);
  }
);

export default client;

export async function checkHealth() {
  try {
    const res = await client.get('/health');
    return res.data?.status === 'ok';
  } catch {
    return false;
  }
}

export async function login(username, password) {
  const res = await client.post('/auth/login', { username, password });
  const { token, userId, username: user } = res.data;
  localStorage.setItem('token', token);
  localStorage.setItem('userId', String(userId));
  localStorage.setItem('username', user);
  return res.data;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  localStorage.removeItem('username');
}

export function getAuth() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');
  if (!token) return null;
  return { token, userId, username };
}
