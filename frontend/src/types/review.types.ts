export interface ReviewDto {
    id: number;
    bookId: number;
    userId: string;
    userName: string;
    rating: number; // 1-5
    comment: string | null;
    createdAt: string; // ISO date
  }
  
  export interface ReviewCreateDto {
    bookId: number;
    rating: number; // 1-5
    comment: string | null;
  }