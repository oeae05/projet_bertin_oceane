import { HttpErrorResponse, HttpRequest } from '@angular/common/http';

// Erreur renvoyée par le backend simulé, au même format que la vraie API : { message }
export function erreur(req: HttpRequest<unknown>, status: number, message: string): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: { message }, url: req.url });
}
