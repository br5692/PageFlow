import React from 'react';
import { Box, Typography, Paper, Grid, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface CategoryItem {
  name: string;
  image: string;
  description: string;
}

const categories: CategoryItem[] = [
  {
    name: 'Fiction',
    image: 'https://source.unsplash.com/featured/?fiction,novel',
    description: 'Explore worlds of imagination and storytelling.'
  },
  {
    name: 'Science',
    image: 'https://source.unsplash.com/featured/?science,astronomy',
    description: 'Discover the wonders of the natural world.'
  },
  {
    name: 'History',
    image: 'https://source.unsplash.com/featured/?history,vintage',
    description: 'Journey through time with historical accounts and perspectives.'
  },
  {
    name: 'Technology',
    image: 'https://source.unsplash.com/featured/?technology,computer',
    description: 'Stay current with the latest technological advancements.'
  }
];

const CategoryShowcase: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleCategoryClick = (category: string) => {
    navigate(`/books?category=${category}`);
  };

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" component="h2" gutterBottom fontWeight="medium">
        Browse by Category
      </Typography>
      
      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} sm={6} md={3} key={category.name}>
            <Paper 
              elevation={2}
              onClick={() => handleCategoryClick(category.name)}
              sx={{
                height: 180,
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: theme.shadows[8],
                },
                backgroundImage: `url(${category.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 70%, rgba(0,0,0,0) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  p: 2,
                }}
              >
                <Typography variant="h6" color="white" sx={{ fontWeight: 'bold', textShadow: '1px 1px 3px rgba(0,0,0,0.8)' }}>
                  {category.name}
                </Typography>
                <Typography variant="body2" color="white" sx={{ textShadow: '0px 0px 2px rgba(0,0,0,1)' }}>
                  {category.description}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CategoryShowcase;