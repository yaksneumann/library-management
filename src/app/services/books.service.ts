import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Book, GoogleBooksResponse } from '../models/book.interface';

@Injectable({
  providedIn: 'root',
})
export class BooksService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://www.googleapis.com/books/v1/volumes';

  private readonly allBooks = signal<Book[]>([]);
  private readonly filteredBooks = signal<Book[]>([]);
  private readonly loading = signal<boolean>(false);

  readonly books = this.filteredBooks.asReadonly();
  readonly isLoading = this.loading.asReadonly();

  constructor() {
    this.initializeBooks();
  }

  private initializeBooks(): void {
    this.loading.set(true);
    const params = new HttpParams()
      .set('q', 'title:motivation+OR+javascript+OR+angular')
      .set('maxResults', '40')
      .set('printType', 'books');

    this.http
      .get<GoogleBooksResponse>(`${this.apiUrl}`, { params })
      .pipe(
        map((response) => this.convertApiBooks(response)),
        catchError(() => of([]))
      )
      .subscribe((books) => {
        this.allBooks.set(books);
        this.filteredBooks.set(books);
        this.loading.set(false);
      });
  }

  searchLocal(query: string): void {
    const allBooksList = this.allBooks();
    if (!query.trim()) {
      this.filteredBooks.set(allBooksList);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = allBooksList.filter(
      (book) =>
        book.title.toLowerCase().includes(searchTerm) ||
        book.authors.some(author =>
          author.toLowerCase().includes(searchTerm)
        ) ||
        book.description.toLowerCase().includes(searchTerm) ||
        book.publisher?.toLowerCase().includes(searchTerm)
    );
    this.filteredBooks.set(filtered);
  }

  searchGoogleBooks(query: string): Observable<Book[]> {
    if (!query.trim()) {
      return of([]);
    }

    const params = new HttpParams()
      .set('q', query)
      .set('maxResults', '10')
      .set('printType', 'books');

    return this.http
      .get<GoogleBooksResponse>(`${this.apiUrl}`, { params })
      .pipe(
        map((response) => this.convertApiBooks(response)),
        catchError(() => of([]))
      );
  }

  getBookById(id: string): Book | null {
    return this.allBooks().find(book => book.id === id) || null;
  }

  addBook(book: Omit<Book, 'id'>): string {
    const newBook: Book = {
      ...book,
      id: this.generateId(),
    };

    const currentBooks = this.allBooks();
    const updatedBooks = [...currentBooks, newBook];
    this.allBooks.set(updatedBooks);
    this.filteredBooks.set(updatedBooks);

    return newBook.id;
  }

  updateBook(bookId: string, updatedBook: Partial<Omit<Book, 'id'>>): boolean {
    const currentBooks = this.allBooks();
    const bookIndex = currentBooks.findIndex(book => book.id === bookId);

    if (bookIndex === -1) {
      return false;
    }
    const updatedBooks = [...currentBooks];
    updatedBooks[bookIndex] = { ...updatedBooks[bookIndex], ...updatedBook };
    this.allBooks.set(updatedBooks);

    const currentFiltered = this.filteredBooks();
    const filteredIndex = currentFiltered.findIndex(book => book.id === bookId);
    if (filteredIndex !== -1) {
      const updatedFiltered = [...currentFiltered];
      updatedFiltered[filteredIndex] = updatedBooks[bookIndex];
      this.filteredBooks.set(updatedFiltered);
    }

    return true;
  }

  deleteBook(bookId: string): boolean {
    const currentBooks = this.allBooks();
    const filteredBooksAfterDelete = currentBooks.filter(book => book.id !== bookId);

    if (filteredBooksAfterDelete.length === currentBooks.length) {
      return false;
    }

    this.allBooks.set(filteredBooksAfterDelete);
    const currentFiltered = this.filteredBooks();
    const filteredAfterDelete = currentFiltered.filter(book => book.id !== bookId);
    this.filteredBooks.set(filteredAfterDelete);
    return true;
  }

  clearSearch(): void {
    this.filteredBooks.set(this.allBooks());
  }

  private generateId(): string {
    return (
      'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    );
  }

  private convertApiBooks(response: GoogleBooksResponse): Book[] {
    if (!response.items) return [];

    return response.items
      .filter(item => item.volumeInfo?.title)
      .map(item => ({
        id: item.id,
        title: item.volumeInfo.title,
        authors: item.volumeInfo.authors || ['Unknown Author'],
        publishedYear: item.volumeInfo.publishedDate?.split('-')[0] || '',
        description: item.volumeInfo.description || '',
        thumbnail:
          item.volumeInfo.imageLinks?.thumbnail ||
          item.volumeInfo.imageLinks?.smallThumbnail ||
          '/assets/fallback-book-img.jpg',
        isbn: item.volumeInfo.industryIdentifiers?.[0]?.identifier || '',
        pageCount: item.volumeInfo.pageCount,
        publisher: item.volumeInfo.publisher || '',
      }));
  }
}
