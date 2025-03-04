import React from 'react';
import { Box, Container, Tabs, Tab, Typography, Paper } from '@mui/material';
import { LibraryBooks, MenuBook } from '@mui/icons-material';
import CheckoutList from '../components/checkouts/CheckoutList';
import PageTitle from '../components/common/PageTitle';
import { useAuth } from '../context/AuthContext';

export{};

const CheckoutsPage: React.FC = () => {
  const { isLibrarian } = useAuth();
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // For librarians, we offer both personal checkouts and all library checkouts
  if (isLibrarian) {
    return (
      <Box>
        <PageTitle 
          title="Book Checkouts" 
          subtitle="Manage your checkouts and view library circulation"
        />
        
        <Paper sx={{ mb: 3 }} elevation={0}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            aria-label="checkout tabs"
            sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          >
            <Tab 
              icon={<LibraryBooks sx={{ mr: 1 }} />} 
              label="Library Checkouts" 
              iconPosition="start"
              id="checkouts-tab-0"
              aria-controls="checkouts-tabpanel-0"
            />
            <Tab 
              icon={<MenuBook sx={{ mr: 1 }} />} 
              label="My Checkouts" 
              iconPosition="start"
              id="checkouts-tab-1"
              aria-controls="checkouts-tabpanel-1"
            />
          </Tabs>
        </Paper>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Library Checkouts
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              All books currently checked out from the library. Use this view to process returns.
            </Typography>
          </Box>
          <CheckoutList admin={true} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Personal Checkouts
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Books you've personally checked out from the library.
            </Typography>
          </Box>
          <CheckoutList admin={false} />
        </TabPanel>
      </Box>
    );
  }

  // For regular customers, just show their checkouts
  return (
    <Box>
      <PageTitle 
        title="My Checkouts" 
        subtitle="Track your borrowed books and due dates" 
      />
      <CheckoutList />
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
      id={`checkouts-tabpanel-${index}`}
      aria-labelledby={`checkouts-tab-${index}`}
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

export default CheckoutsPage;