import { Routes } from '@angular/router';
import { BookListComponent } from './features/book-list/book-list.component';
import { BookDetailComponent } from './features/book-detail/book-detail.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/books',
    pathMatch: 'full'
  },
  {
    path: 'books',
    component: BookListComponent
  },
  {
    path: 'books/:id',
    component: BookDetailComponent
  },
  {
    path: '**',
    redirectTo: '/books'
  }
];
