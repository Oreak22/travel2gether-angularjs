import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class DestinationService {
  private apiUrl = `${environment.apiUrl}/destinations`;
  private mediaUrl = `${environment.apiUrl}/admin/media`;

  constructor(private http: HttpClient) {}

  getPublicDestinations(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/public`);
  }

  getAllDestinations(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  createDestination(data: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${environment.apiUrl}/admin/destinations`, data);
  }

  // Media Library
  getMediaAssets(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.mediaUrl);
  }

  uploadMedia(formData: FormData): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.mediaUrl}/upload`, formData);
  }

  deleteMedia(assetId: number): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.mediaUrl}/delete`, { body: { id: assetId } });
  }
}
