import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BooksService } from '../../services/books.service';
import { Book } from '../../models/book.interface';
import { Subject, takeUntil } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.css'
})
export class BookDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly booksService = inject(BooksService);
  private readonly fb = inject(FormBuilder);
  private readonly destroy$ = new Subject<void>();
  private readonly googleBooksSearchSubject = new Subject<string>();

  protected readonly currentBook = signal<Book | null>(null);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEditingMode = signal<boolean>(false);
  protected readonly isSaving = signal<boolean>(false);
  protected readonly isAddingNewBook = signal<boolean>(false);
  protected readonly isDeleteModalVisible = signal<boolean>(false);
  protected readonly isFormValid = signal<boolean>(false);
  protected readonly googleBooksResults = signal<Book[]>([]);
  protected readonly isGoogleSearchLoading = signal<boolean>(false);
  protected googleBooksQuery = '';
  protected readonly isGoogleSearchVisible = signal<boolean>(false);

  protected editForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1)]],
    authors: ['', [Validators.required]],
    publishedYear: [''],
    description: [''],
    publisher: [''],
    pageCount: [null, [Validators.min(1)]],
    isbn: [''],
    thumbnail: ['']
  });

  ngOnInit() {
    const bookId = this.route.snapshot.paramMap.get('id');
    
    this.editForm.statusChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.isFormValid.set(this.editForm.valid);
    });
    
    this.googleBooksSearchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe((query: string) => {
      this.searchGoogleBooksApi(query);
    });
    
    if (bookId === 'add') {
      this.isAddingNewBook.set(true);
      this.isEditingMode.set(true);
      this.currentBook.set(null);
      this.isFormValid.set(this.editForm.valid);
      return;
    }
    
    if (!bookId) {
      this.router.navigate(['/books']);
      return;
    }

    this.loadBookData(bookId);
  }

  ngOnDestroy() {
    this.destroy$.next();
  }

  private loadBookData(id: string): void {
    const book = this.booksService.getBookById(id);
    
    if (book) {
      this.currentBook.set(book);
      this.populateForm(book);
    } else {
      this.errorMessage.set('Book not found');
    }
  }

  private populateForm(book: Book): void {
    this.editForm.patchValue({
      title: book.title,
      authors: book.authors.join(', '),
      publishedYear: book.publishedYear,
      description: book.description,
      publisher: book.publisher,
      pageCount: book.pageCount,
      isbn: book.isbn,
      thumbnail: book.thumbnail
    });
    this.isFormValid.set(this.editForm.valid);
  }

  protected getAuthorsDisplay(authors: string[]): string {
    if (!authors || authors.length === 0) return 'Unknown Author';
    if (authors.length === 1) return authors[0];
    if (authors.length === 2) return authors.join(' & ');
    return `${authors[0]} & ${authors.length - 1} others`;
  }

  protected onImageError(event: any): void {
    event.target.src = '/assets/fallback-book-img.jpg';
  }

  protected enterEditMode(): void {
    this.isEditingMode.set(true);
    this.errorMessage.set(null);
  }

  protected cancelEditing(): void {
    if (this.isAddingNewBook()) {
      this.router.navigate(['/books']);
    } else {
      this.isEditingMode.set(false);
      const currentBook = this.currentBook();
      if (currentBook) {
        this.populateForm(currentBook);
      }
      this.errorMessage.set(null);
    }
  }

  protected saveBookData(): void {
    if (this.editForm.invalid) {
      this.markAllFieldsAsTouched();
      this.errorMessage.set('Please fix the errors in the form');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const formValue = this.editForm.value;
    const bookData = {
      title: formValue.title.trim(),
      authors: formValue.authors.split(',').map((author: string) => author.trim()).filter((author: string) => author),
      publishedYear: formValue.publishedYear?.toString() || '',
      description: formValue.description?.trim() || '',
      publisher: formValue.publisher?.trim() || '',
      pageCount: formValue.pageCount || undefined,
      isbn: formValue.isbn?.trim() || '',
      thumbnail: formValue.thumbnail?.trim() || '/assets/fallback-book-img.jpg'
    };

    if (this.isAddingNewBook()) {
      try {
        this.booksService.addBook(bookData);
        this.isSaving.set(false);
        this.router.navigate(['/books']);
      } catch (error: any) {
        this.errorMessage.set(error.message || 'Failed to add book');
        this.isSaving.set(false);
      }
    } else {
      const currentBook = this.currentBook();
      if (!currentBook) return;

      const success = this.booksService.updateBook(currentBook.id, bookData);
      
      if (success) {
        this.currentBook.set({ ...currentBook, ...bookData });
        this.isEditingMode.set(false);
        this.isSaving.set(false);
      } else {
        this.errorMessage.set('Failed to update book');
        this.isSaving.set(false);
      }
    }
  }

  protected requestBookDeletion(): void {
    const currentBook = this.currentBook();
    if (!currentBook) return;

    this.isDeleteModalVisible.set(true);
  }

  protected confirmBookDeletion(): void {
    const currentBook = this.currentBook();
    if (!currentBook) return;

    const success = this.booksService.deleteBook(currentBook.id);
    if (success) {
      this.isDeleteModalVisible.set(false);
      this.router.navigate(['/books']);
    } else {
      this.errorMessage.set('Failed to delete book');
      this.isDeleteModalVisible.set(false);
    }
  }

  protected cancelBookDeletion(): void {
    this.isDeleteModalVisible.set(false);
  }

  protected goBack(): void {
    this.router.navigate(['/books']);
  }

  protected toggleGoogleBooksSearch(): void {
    this.isGoogleSearchVisible.set(!this.isGoogleSearchVisible());
    if (!this.isGoogleSearchVisible()) {
      this.googleBooksResults.set([]);
      this.googleBooksQuery = '';
    }
  }

  protected handleSearchQueryInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.googleBooksQuery = value;
    this.googleBooksSearchSubject.next(value.trim());
  }

  protected executeGoogleBooksSearch(): void {
    const query = this.googleBooksQuery.trim();
    if (!query) return;
    this.searchGoogleBooksApi(query);
  }

  private searchGoogleBooksApi(query: string): void {
    if (!query) return;

    this.isGoogleSearchLoading.set(true);
    this.errorMessage.set(null);

    this.booksService.searchGoogleBooks(query).subscribe({
      next: (books) => {
        this.googleBooksResults.set(books);
        this.isGoogleSearchLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to search Google Books. Please try again.');
        this.isGoogleSearchLoading.set(false);
      }
    });
  }

  protected selectBookFromGoogleResults(book: Book): void {
    this.editForm.patchValue({
      title: book.title,
      authors: book.authors.join(', '),
      publishedYear: book.publishedYear,
      publisher: book.publisher,
      isbn: book.isbn,
      pageCount: book.pageCount,
      description: book.description,
      thumbnail: book.thumbnail
    });
    
    this.isFormValid.set(this.editForm.valid);
    this.googleBooksResults.set([]);
    this.googleBooksQuery = '';
    this.isGoogleSearchVisible.set(false);
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.editForm.controls).forEach(key => {
      this.editForm.get(key)?.markAsTouched();
    });
  }
}