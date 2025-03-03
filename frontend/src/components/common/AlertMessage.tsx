import React from 'react';
import { Alert, Snackbar } from '@mui/material';
import { useAlert } from '../../context/AlertContext';

const AlertMessage: React.FC = () => {
  const { alert, hideAlert } = useAlert();

  if (!alert) return null;

  return (
    <Snackbar
      open={!!alert}
      autoHideDuration={5000}
      onClose={hideAlert}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={hideAlert} severity={alert.type} sx={{ width: '100%' }}>
        {alert.message}
      </Alert>
    </Snackbar>
  );
};

export default AlertMessage;