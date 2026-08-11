import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = `${environment.apiUrl}/bookings`;
  private paymentUrl = `${environment.apiUrl}/payments`;
  private adminBookingUrl = `${environment.apiUrl}/bookings`;

  constructor(private http: HttpClient) {}

  createBooking(payload: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.apiUrl, payload);
  }

  getMyBookings(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  getBookingById(id: string | number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  cancelBooking(id: string | number): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.apiUrl}/${id}/cancel`, {});
  }

  initializePayment(bookingId: number): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.paymentUrl}/initialize`, { booking_id: bookingId });
  }

  verifyPayment(reference: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.paymentUrl}/verify/${reference}`);
  }

  // Admin Operations
  getAdminBookings(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.adminBookingUrl);
  }

  updateBookingStatus(bookingId: number, status: string): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.adminBookingUrl}/status`, {
      booking_id: bookingId,
      status,
    });
  }

  verifyPaystackAdmin(reference: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      `${environment.apiUrl}/payments/verify/${encodeURIComponent(reference)}`,
    );
  }
}
