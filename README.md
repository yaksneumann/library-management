# Library Management System

A modern library management application built with Angular 17+ that helps librarians organize and manage their book collections. The application integrates with the Google Books API to provide comprehensive book information and allows for easy book management operations.

## 🌐 Live Demo

**[View Live Application](https://library-management-pink-chi.vercel.app/)**

## 📋 About the Application

This Library Management System is designed specifically for librarians to efficiently manage their book collections. The application provides:

### Key Features
- **Book Collection Display**: View a comprehensive list of books fetched from the Google Books API
- **Search Functionality**: Search through books by title, author, description, or publisher
- **Book Management**: Add new books to your collection with detailed information
- **Edit & Update**: Modify existing book details including title, authors, description, and more
- **Delete Books**: Remove books from your collection when needed
- **Google Books Integration**: Search and import books directly from Google Books API
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark Mode Support**: Automatic dark/light theme based on system preferences

### Target Users
This application is designed for **librarians and library staff** who need to:
- Maintain an organized digital catalog of their book collection
- Quickly search and locate specific books
- Add new acquisitions to their collection
- Update book information as needed
- Manage their library inventory efficiently

### Data Storage
**Important Note**: This application currently uses in-memory storage for demonstration purposes. Book data is not persisted to a database or external storage. All changes will be lost when the application is refreshed or restarted.

## 🚀 Technologies Used

- **Framework**: Angular 17+ with Standalone Components
- **State Management**: Angular Signals
- **Styling**: Modern CSS with CSS Custom Properties
- **HTTP Client**: Angular HttpClient for API integration
- **Forms**: Reactive Forms with validation
- **API**: Google Books API integration
- **Build Tool**: Angular CLI
- **Deployment**: Vercel

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
