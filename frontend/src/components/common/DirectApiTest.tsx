import React, { useState } from 'react';
import { Button, Box, Typography, Paper, CircularProgress } from '@mui/material';
import { API_BASE_URL } from '../../services/api';

const DirectApiTest: React.FC = () => {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string>('');

  const testApi = async () => {
    setLoading(true);
    setStatus('Testing API connection...');
    try {
      const url = `${API_BASE_URL}/Books/featured?count=1`;
      setStatus(`Connecting to ${url}...`);
      
      const fetchResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      const status = fetchResponse.status;
      
      if (status === 401) {
        setStatus(`Connection successful! Received 401 Unauthorized (expected - this means your API is working!)`);
        setResponse("The 401 Unauthorized response is normal and expected at this stage. It means your API is correctly configured with authentication and you'll need to implement login to access this endpoint.");
        setLoading(false);
        return;
      }
      
      setStatus(`Received status: ${fetchResponse.status}`);
      
      // Clone the response and use that for text to avoid the "already read" error
      const clonedResponse = fetchResponse.clone();
      
      try {
        const data = await fetchResponse.json();
        setResponse(JSON.stringify(data, null, 2));
      } catch (e) {
        const text = await clonedResponse.text();
        setResponse(text || 'No response body');
      }
      
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setResponse('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, my: 3 }}>
      <Typography variant="h6" gutterBottom>Direct API Test (No Redirects)</Typography>
      <Button 
        variant="contained" 
        onClick={testApi} 
        disabled={loading}
      >
        Test API Connection
      </Button>
      
      {loading && (
        <Box sx={{ display: 'flex', my: 2 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>{status}</Typography>
        </Box>
      )}
      
      {!loading && status && (
        <Box sx={{ mt: 2 }}>
          <Typography fontWeight="bold" color={status.includes("successful") ? "success.main" : "inherit"}>
            {status}
          </Typography>
        </Box>
      )}
      
      {response && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'auto' }}>
          <pre style={{ margin: 0 }}>{response}</pre>
        </Box>
      )}
    </Paper>
  );
};

export default DirectApiTest;