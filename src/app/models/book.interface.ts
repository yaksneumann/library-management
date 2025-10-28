export interface Book {
  id: string;
  title: string;
  authors: string[];
  publishedYear: string;
  description: string;
  thumbnail: string;
  isbn?: string;
  pageCount?: number;
  publisher?: string;
}

export interface GoogleBooksResponse {
  totalItems: number;
  items: GoogleBookItem[];
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    publisher?: string;
  };
}