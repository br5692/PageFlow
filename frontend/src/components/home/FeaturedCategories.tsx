import React from 'react';
import { Box, Typography, Grid, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface CategoryItem {
  name: string;
  image: string;
  count: number;
}

// Mock data - in real app, this would come from API
const categories: CategoryItem[] = [
  {
    name: 'Games',
    image: 'https://source.unsplash.com/featured/?fiction,novel,dark',
    count: 432
  },
  {
    name: 'Science',
    image: 'https://source.unsplash.com/featured/?science,astronomy,dark',
    count: 217
  },
  {
    name: 'History',
    image: 'https://source.unsplash.com/featured/?history,vintage,dark',
    count: 185
  },
  {
    name: 'Biography',
    image: 'https://source.unsplash.com/featured/?biography,person,dark',
    count: 94
  },
];

const FeaturedCategories: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleCategoryClick = (category: string) => {
    navigate(`/books?category=${category}`);
  };

  return (
    <Box sx={{ mb: 8, mt: 2 }}>
      <Box sx={{ mb: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography 
          variant="h6" 
          component="div" 
          color="primary"
          fontWeight="500"
          sx={{ mb: 1 }}
        >
          EXPLORE OUR COLLECTION
        </Typography>
        <Typography 
          variant="h3" 
          component="h2" 
          fontWeight="bold"
          align="center"
          sx={{ mb: 1, letterSpacing: '-0.02em' }}
        >
          PREMIUM CATEGORIES
        </Typography>
        <Box 
          sx={{ 
            width: 60, 
            height: 4, 
            backgroundColor: theme.palette.primary.main,
            mt: 2, 
            mb: 2 
          }} 
        />
      </Box>
      
      <Grid container spacing={3}>
        {categories.map((category, index) => (
          <Grid item xs={12} md={6} key={category.name}>
            <Box
              onClick={() => handleCategoryClick(category.name)}
              sx={{
                height: 280,
                borderRadius: 0,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                boxShadow: '0 15px 30px rgba(0,0,0,0.3)',
                backgroundImage: `url(${category.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 0.4s ease',
                '&:hover': {
                  transform: 'scale(0.98)',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '70%',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
                }
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 4,
                  zIndex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                <Typography 
                  variant="h4" 
                  component="div" 
                  color="white" 
                  fontWeight="bold"
                  sx={{ 
                    mb: 1, 
                    letterSpacing: '-0.02em',
                    textTransform: 'uppercase'
                  }}
                >
                  {category.name}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  color="white" 
                  sx={{ opacity: 0.8 }}
                >
                  {category.count} books
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default FeaturedCategories;