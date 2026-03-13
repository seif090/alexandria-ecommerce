import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * Global error handling for API calls
 */
@Injectable({ providedIn: 'root' })
export class GlobalErrorHandlerService {
  private errorSubject$ = new BehaviorSubject<string | null>(null);
  public error$ = this.errorSubject$.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Handle HTTP errors
   */
  handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Bad request. Please check your input.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'Forbidden. You do not have permission for this action.';
          break;
        case 404:
          errorMessage = 'Resource not found.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = error.error?.error || 'An error occurred';
      }
    }

    console.error('[ERROR]', errorMessage, error);
    this.errorSubject$.next(errorMessage);

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Clear error message
   */
  clearError(): void {
    this.errorSubject$.next(null);
  }
}

/**
 * HTTP interceptor for error handling
 */
export const errorHandlingInterceptor = (
  req: any,
  next: any
) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorHandler = new GlobalErrorHandlerService(new HttpClient(null as any));
      return errorHandler.handleError(error);
    })
  );
};
