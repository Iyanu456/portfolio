import { useState } from 'react';
import axios from 'axios';

const useAxios = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to trigger the Axios request on demand
  const sendRequest = async (config) => {
    const { url, method = 'GET', body = null, headers = {} } = config;
    setLoading(true);
    setError(null);  // Reset error before a new request
    try {
      const response = await axios({
        url,
        method,
        data: body,
        headers,
      });
      setData(response.data);
      return response.data;  // Return the response data directly
    } catch (err) {
      setError(err?.response?.data?.message || "An error occurred");  // Provide a structured error message
      return null;  // Return null in case of error
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, sendRequest };
};

export default useAxios;