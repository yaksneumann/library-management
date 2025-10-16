import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BooksService } from '../../services/books.service';
import { Subject, takeUntil } from 'rxjs';
import { throttleTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './book-list.component.html',
  styleUrl: './book-list.component.css',
})
export class BookListComponent implements OnInit, OnDestroy {
  private readonly booksService = inject(BooksService);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject = new Subject<string>();

  protected searchQuery = '';

  protected readonly books = this.booksService.books;
  protected readonly loading = this.booksService.isLoading;

  ngOnInit() {
    this.searchSubject
      .pipe(throttleTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.executeSearch(query);
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected onSearchInput(): void {
    this.searchSubject.next(this.searchQuery.trim());
  }

  protected performSearch(): void {
    this.executeSearch(this.searchQuery.trim());
  }

  private executeSearch(query: string): void {
    this.booksService.searchLocal(query);
  }

  protected clearSearch(): void {
    this.searchQuery = '';
    this.booksService.clearSearch();
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
}
