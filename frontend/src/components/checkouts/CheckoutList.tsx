import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Skeleton,
  Avatar,
  Stack,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Badge,
  Tooltip,
} from '@mui/material';
import { 
  Event, 
  LibraryBooks, 
  AccessTime, 
  CheckCircle, 
  InfoOutlined, 
  Person,
  Warning
} from '@mui/icons-material';
import { checkoutService } from '../../services/checkoutService';
import { CheckoutDto } from '../../types/checkout.types';
import { formatDate, getDueStatus, getDaysUntilDue } from '../../utils/dateUtils';
import { useAlert } from '../../context/AlertContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CheckoutListProps {
  admin?: boolean;
  filter?: 'all' | 'due-soon' | 'overdue';
}

const CheckoutList: React.FC<CheckoutListProps> = ({ admin = false, filter = 'all'}) => {
  const [checkouts, setCheckouts] = useState<CheckoutDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [processingReturn, setProcessingReturn] = useState<number | null>(null);
  const { showAlert } = useAlert();
  const { isLibrarian } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchCheckouts = async () => {
      setLoading(true);
      try {
        let fetchedCheckouts: CheckoutDto[];
        
        if (admin && isLibrarian) {
          fetchedCheckouts = await checkoutService.getAllActiveCheckouts();
        } else {
          fetchedCheckouts = await checkoutService.getUserCheckouts();
        }
        
        setCheckouts(fetchedCheckouts);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to load checkouts';
        showAlert('error', errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCheckouts();
  }, [admin, isLibrarian, showAlert, filter]);

  const handleReturn = async (checkoutId: number) => {
    setProcessingReturn(checkoutId);
    try {
      await checkoutService.returnBook(checkoutId);
      showAlert('success', 'Book returned successfully');
      
      // Update local state to reflect the return
      setCheckouts(checkouts.filter(checkout => checkout.id !== checkoutId));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to return book';
      showAlert('error', errorMessage);
    } finally {
      setProcessingReturn(null);
    }
  };

  const handleViewBook = (bookId: number) => {
    navigate(`/books/${bookId}`);
  };

  const renderDueStatus = (dueDate: string) => {
    const daysLeft = getDaysUntilDue(dueDate);
    const status = getDueStatus(dueDate);
    
    let text = '';
    let color: 'success' | 'warning' | 'error' = 'success';
    let icon = <InfoOutlined />;
    
    if (status === 'overdue') {
      text = `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''}`;
      color = 'error';
      icon = <Warning />;
    } else if (status === 'due-soon') {
      text = daysLeft === 0 ? 'Due today' : `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
      color = 'warning';
      icon = <AccessTime />;
    } else {
      text = `Due in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
      color = 'success';
      icon = <Event />;
    }

    return (
      <Tooltip title={formatDate(dueDate)}>
        <Chip
          icon={icon}
          label={text}
          color={color}
          size="small"
          variant="outlined"
        />
      </Tooltip>
    );
  };

  if (loading) {
    return (
      <Box>
        {[1, 2, 3].map((i) => (
          <Skeleton 
            key={i}
            variant="rectangular" 
            height={80} 
            sx={{ mb: 2, borderRadius: 1 }} 
          />
        ))}
      </Box>
    );
  }

  if (checkouts.length === 0) {
    return (
      <Card sx={{ p: 3, textAlign: 'center', bgcolor: 'background.default' }}>
        <CardContent>
          <LibraryBooks sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6">
            {admin ? 'No active checkouts found' : 'You have no checked out books'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {admin 
              ? 'All books have been returned to the library.' 
              : 'Visit our collection to discover books you might enjoy.'}
          </Typography>
          {!admin && (
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 3 }}
              onClick={() => navigate('/books')}
            >
              Browse Books
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // For mobile and tablet: Card-based layout
  if (isMobile) {
    return (
      <Stack spacing={2}>
        {checkouts.map((checkout) => (
          <Card key={checkout.id} sx={{ position: 'relative' }}>
            <CardContent>
              <Typography variant="h6" component="div" gutterBottom>
                {checkout.bookTitle}
              </Typography>

              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {admin && (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Person sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2">{checkout.userName}</Typography>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Event sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Checked out on {formatDate(checkout.checkoutDate)}
                  </Typography>
                </Box>
                
                <Box>
                  {renderDueStatus(checkout.dueDate)}
                </Box>
              </Stack>

              <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => handleViewBook(checkout.bookId)}
                >
                  View Book
                </Button>
                
                {isLibrarian && !checkout.isReturned && (
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleReturn(checkout.id)}
                    disabled={processingReturn === checkout.id}
                    color="primary"
                  >
                    {processingReturn === checkout.id ? 'Processing...' : 'Return'}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  // For desktop: Table-based layout
  return (
    <TableContainer component={Paper} elevation={0} variant="outlined">
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: 'background.default' }}>
          <TableRow>
            <TableCell>Book Title</TableCell>
            {admin && <TableCell>User</TableCell>}
            <TableCell>Checkout Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {checkouts.map((checkout) => (
            <TableRow key={checkout.id} hover>
              <TableCell component="th" scope="row">
                <Typography fontWeight="medium">{checkout.bookTitle}</Typography>
              </TableCell>
              
              {admin && (
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                      <Person fontSize="small" />
                    </Avatar>
                    {checkout.userName}
                  </Box>
                </TableCell>
              )}
              
              <TableCell>{formatDate(checkout.checkoutDate)}</TableCell>
              
              <TableCell>
                {renderDueStatus(checkout.dueDate)}
              </TableCell>
              
              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={() => handleViewBook(checkout.bookId)}
                  >
                    View Book
                  </Button>
                  
                  {isLibrarian && !checkout.isReturned && (
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleReturn(checkout.id)}
                      disabled={processingReturn === checkout.id}
                      color="primary"
                      startIcon={<CheckCircle />}
                    >
                      {processingReturn === checkout.id ? 'Processing...' : 'Return'}
                    </Button>
                  )}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CheckoutList;