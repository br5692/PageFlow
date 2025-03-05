import React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';
import HomeHero from '../components/home/HomeHero';
import BookList from '../components/books/BookList';
import CategoryShowcase from '../components/home/CategoryShowcase';
import StatsDisplay from '../components/home/StatsDisplay';
import { useAuth } from '../context/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated, isLibrarian } = useAuth();

  return (
    <Box>
      {/* Hero Section */}
      <HomeHero />
      
      <Container maxWidth="lg">
        {/* Featured Books Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight="medium">
            Featured Books
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Explore our curated selection of must-read books this season.
          </Typography>
          <BookList featured featuredCount={8} />
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        {/* Category Showcase */}
        <CategoryShowcase />
        
        <Divider sx={{ my: 4 }} />
        
        {/* Library Stats */}
        <StatsDisplay />
        
        {isAuthenticated && !isLibrarian && (
          <>
            <Divider sx={{ my: 4 }} />
            
            {/* Recently Added Books - Shows only to authenticated customers */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="medium">
                New Arrivals
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Check out the latest additions to our collection.
              </Typography>
              <BookList featuredCount={4} />
            </Box>
          </>
        )}
        
        {isLibrarian && (
          <>
            <Divider sx={{ my: 4 }} />
            
            {/* Quick Access for Librarians */}
            <Box sx={{ mb: 6 }}>
              <Typography variant="h5" component="h2" gutterBottom fontWeight="medium">
                Librarian Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Quick access to your librarian tools and management features.
              </Typography>
              <Box sx={{ mt: 2 }}>
                {/* This would be a good place to add some quick statistics or links */}
                {/* We could implement a LibrarianDashboard component in the future */}
              </Box>
            </Box>
          </>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;