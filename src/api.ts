import axios from 'axios';

const API_URL = 'https://api.permit.io/v2';
const API_KEY = 'permit_key_9syBk0Jzds8f77X2BnjErr58wBweMimjBqe4EYY637C9NLnKpoZP9unsENJlpk5g4MWScKc45toolxb5s5sudG';

export const fetchPolicyData = async () => {
  const headers = { Authorization: `Bearer ${API_KEY}` };
  const response = await axios.get(`${API_URL}/policies`, { headers, withCredentials: true });
  return response.data;
};
