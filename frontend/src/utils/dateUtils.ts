import { format, parseISO, isValid, differenceInDays } from 'date-fns';

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDateTime = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return 'Invalid date';
    return format(date, 'MMM d, yyyy h:mm a');
  } catch (error) {
    return 'Invalid date';
  }
};

export const getDaysUntilDue = (dueDate: string): number => {
  // Get today's date in local time zone
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse the date string from the database
  // Handle the case where it might include time information
  let due: Date;
  if (dueDate.includes('T')) {
    // Full ISO string with time
    due = new Date(dueDate);
  } else {
    // Just the date part
    due = new Date(`${dueDate}T00:00:00`);
  }
  
  // Force due date to midnight for comparison
  due.setHours(0, 0, 0, 0);
  
  // Calculate difference in days
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Add debugging
  console.log(`getDaysUntilDue: Input=${dueDate}, Parsed=${due.toISOString()}, Today=${today.toISOString()}, DiffDays=${diffDays}`);
  
  return diffDays;
};

export const getDueStatus = (dueDate: string): 'overdue' | 'due-soon' | 'ok' => {
  const daysLeft = getDaysUntilDue(dueDate);
  
  if (daysLeft <= 0) return 'overdue';
  if (daysLeft <= 2) return 'due-soon';
  if (daysLeft <= 5) return 'ok';
  
  return 'ok';
};

export const getCurrentDateISOString = (): string => {
  return new Date().toISOString().split('T')[0];
};