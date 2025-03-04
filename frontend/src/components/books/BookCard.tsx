import React from 'react';
import { Card, CardContent, CardMedia, Typography, Rating, CardActionArea, Box, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { BookDto } from '../../types/book.types';

interface BookCardProps {
  book: BookDto;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const navigate = useNavigate();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea onClick={() => navigate(`/books/${book.id}`)}>
        <CardMedia
          component="img"
          height="200"
          image={book.coverImage || 'https://via.placeholder.com/300x450?text=No+Cover'}
          alt={`Cover of ${book.title}`}
          sx={{ objectFit: 'contain', p: 1 }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {book.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            By {book.author}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating 
              value={book.averageRating} 
              precision={0.5} 
              readOnly 
              size="small"
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({book.averageRating.toFixed(1)})
            </Typography>
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              mb: 1,
              height: '4.5em',
            }}
          >
            {book.description || 'No description available.'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Chip
              label={book.isAvailable ? 'Available' : 'Checked Out'}
              color={book.isAvailable ? 'success' : 'error'}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
            {book.category && (
              <Chip
                label={book.category}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BookCard;