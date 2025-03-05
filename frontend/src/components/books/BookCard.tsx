import React from 'react';
import { Card, CardContent, CardMedia, Typography, Rating, Box, Chip, CardActionArea } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BookDto } from '../../types/book.types';

interface BookCardProps {
  book: BookDto;
  featured?: boolean;
  index?: number;
}

const BookCard: React.FC<BookCardProps> = ({ book, featured = false, index = 0 }) => {
  const navigate = useNavigate();

  return (
    <Card 
      elevation={0}
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: 'transparent',
        backdropFilter: 'blur(10px)',
        borderRadius: 0,
        overflow: 'visible',
        boxShadow: 'none',
        transition: 'transform 0.4s ease-out',
        '&:hover': {
          transform: 'translateY(-10px)'
        }
      }}
    >
      <CardActionArea 
        onClick={() => navigate(`/books/${book.id}`)}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          <CardMedia
            component="img"
            height={featured ? "380" : "320"}
            image={book.coverImage || 'https://via.placeholder.com/300x450?text=No+Cover'}
            alt={`Cover of ${book.title}`}
            loading="lazy"
            sx={{ 
              objectFit: 'cover',
              transition: 'transform 0.8s ease',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
          
          {/* Status badge overlay */}
          <Chip
            label={book.isAvailable ? 'AVAILABLE' : 'CHECKED OUT'}
            color={book.isAvailable ? 'primary' : 'error'}
            size="small"
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              borderRadius: 0,
            }}
          />
        </Box>
        
        <CardContent sx={{ 
          flexGrow: 1, 
          p: 3, 
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <Box sx={{ mb: 1 }}>
            {book.category && (
              <Typography 
                variant="caption" 
                color="primary"
                sx={{ 
                  letterSpacing: '0.1em', 
                  fontWeight: 600, 
                  textTransform: 'uppercase',
                  mb: 1,
                  display: 'block'
                }}
              >
                {book.category}
              </Typography>
            )}
          </Box>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 700, 
              mb: 1,
              lineHeight: 1.2,
              height: '2.4em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {book.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              mb: 2,
              fontWeight: 500
            }}
          >
            By {book.author}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            mt: 'auto'
          }}>
            <Rating 
              value={book.averageRating} 
              precision={0.5} 
              readOnly 
              size="small"
            />
            <Typography 
              variant="body2" 
              sx={{ 
                ml: 1, 
                fontWeight: 500,
                color: 'text.secondary'
              }}
            >
              ({book.averageRating.toFixed(1)})
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default React.memo(BookCard);
