export interface CheckoutDto {
    id: number;
    bookId: number;
    bookTitle: string;
    userId: string;
    userName: string;
    checkoutDate: string; // ISO date
    dueDate: string; // ISO date
    returnDate: string | null; // ISO date
    isReturned: boolean;
  }