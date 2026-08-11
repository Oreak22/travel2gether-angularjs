import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/stats`);
  }

  getAnalytics(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/analytics`);
  }

  getSettings(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/settings`);
  }

  updateSettings(settingsData: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/settings`, settingsData);
  }
}
