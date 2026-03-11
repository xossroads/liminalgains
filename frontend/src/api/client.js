import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

export default client;

export async function checkHealth() {
  try {
    const res = await client.get('/health');
    return res.data?.status === 'ok';
  } catch {
    return false;
  }
}
