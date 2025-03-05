import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab, useTheme } from '@mui/material';
import { LibraryBooks, EventNote, EventAvailable } from '@mui/icons-material';
import CheckoutList from '../components/checkouts/CheckoutList';

const AdminCheckoutsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const theme = useTheme();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          fontWeight="bold" 
          color="text.primary" 
          gutterBottom
        >
          Manage Library Checkouts
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
        >
          View active checkouts and process book returns
        </Typography>
      </Box>
      
      <Paper sx={{ mb: 3, bgcolor: 'background.paper' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="checkout status tabs"
          textColor="primary"
          indicatorColor="primary"
          sx={{ 
            '& .MuiTab-root': {
              color: 'text.secondary',
              '&.Mui-selected': {
                color: theme.palette.primary.main
              }
            }
          }}
        >
          <Tab 
            icon={<LibraryBooks />} 
            label="Active Checkouts" 
            id="tab-0"
            aria-controls="tabpanel-0"
          />
          <Tab 
            icon={<EventNote />} 
            label="Due Soon" 
            id="tab-1"
            aria-controls="tabpanel-1"
          />
          <Tab 
            icon={<EventAvailable />} 
            label="Overdue" 
            id="tab-2"
            aria-controls="tabpanel-2"
          />
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <CheckoutList admin={true} filter="all" />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <CheckoutList admin={true} filter="due-soon" />
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <CheckoutList admin={true} filter="overdue" />
      </TabPanel>
    </Box>
  );
};

// Helper TabPanel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default AdminCheckoutsPage;