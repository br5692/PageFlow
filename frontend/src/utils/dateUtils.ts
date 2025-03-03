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
  const today = new Date();
  const due = parseISO(dueDate);
  return differenceInDays(due, today);
};

export const getDueStatus = (dueDate: string): 'overdue' | 'due-soon' | 'ok' => {
  const daysLeft = getDaysUntilDue(dueDate);
  
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 2) return 'due-soon';
  return 'ok';
};

export const getCurrentDateISOString = (): string => {
  return new Date().toISOString().split('T')[0];
};