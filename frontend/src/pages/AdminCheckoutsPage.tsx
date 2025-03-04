import React, { useState } from 'react';
import { Box, Typography, Paper, Tabs, Tab } from '@mui/material';
import { LibraryBooks, EventNote, EventAvailable } from '@mui/icons-material';
import CheckoutList from '../components/checkouts/CheckoutList';
import PageTitle from '../components/common/PageTitle';

const AdminCheckoutsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <PageTitle 
        title="Manage Library Checkouts" 
        subtitle="View active checkouts and process book returns" 
      />
      
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          aria-label="checkout status tabs"
          textColor="primary"
          indicatorColor="primary"
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