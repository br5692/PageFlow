import React from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import { LibraryBooks, People, MenuBook, StarRate } from '@mui/icons-material';

const StatsDisplay: React.FC = () => {
  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" component="h2" gutterBottom fontWeight="medium">
        Our Library at a Glance
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: (theme) => theme.palette.primary.light,
              color: 'white',
            }}
          >
            <LibraryBooks sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              5,000+
            </Typography>
            <Typography variant="body1">Total Books</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: (theme) => theme.palette.secondary.light,
              color: 'white',
            }}
          >
            <People sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              1,200+
            </Typography>
            <Typography variant="body1">Active Members</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: (theme) => theme.palette.success.light,
              color: 'white',
            }}
          >
            <MenuBook sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              250+
            </Typography>
            <Typography variant="body1">Books Checked Out</Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={6} md={3}>
          <Paper
            elevation={2}
            sx={{
              p: 3,
              textAlign: 'center',
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: (theme) => theme.palette.warning.light,
              color: 'white',
            }}
          >
            <StarRate sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              4.7
            </Typography>
            <Typography variant="body1">Average Rating</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StatsDisplay;