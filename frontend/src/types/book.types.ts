export interface BookDto {
    id: number;
    title: string;
    author: string;
    isbn: string | null;
    publishedDate: string; // ISO date
    description: string | null;
    coverImage: string | null;
    publisher: string | null;
    category: string | null;
    pageCount: number;
    isAvailable: boolean;
    averageRating: number; // 0-5 scale
  }
  
  export interface BookCreateDto {
    title: string;
    author: string;
    isbn: string | null;
    publishedDate: string; // ISO date
    description: string | null;
    coverImage: string | null;
    publisher: string | null;
    category: string | null;
    pageCount: number;
  }
  
  export interface BookUpdateDto {
    id: number;
    title: string;
    author: string;
    isbn: string | null;
    publishedDate: string; // ISO date
    description: string | null;
    coverImage: string | null;
    publisher: string | null;
    category: string | null;
    pageCount: number;
  }
  
  export interface BookFilterParams {
    query?: string;
    category?: string;
    author?: string;
    isAvailable?: boolean;
    sortBy?: string;
    ascending?: boolean;
  }