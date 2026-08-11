import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

export type PackageStatus = 'active' | 'inactive' | 'draft' | 'archived';

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  private apiUrl = `${environment.apiUrl}/packages`;
  private adminUrl = `${environment.apiUrl}/admin/packages`;

  constructor(private http: HttpClient) {}

  /**
   * Fetch paginated list of active tour packages
   */
  getPackages(filters?: {
    destination_id?: number;
    search?: string;
    min_price?: number;
    max_price?: number;
    page?: number;
    limit?: number;
  }): Observable<ApiResponse> {
    let params = new HttpParams();
    if (filters) {
      Object.entries(filters).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          params = params.set(key, val.toString());
        }
      });
    }
    return this.http.get<ApiResponse>(this.apiUrl, { params });
  }

  /**
   * Fetch package details by ID
   */
  getPackageById(id: string | number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  /**
   * Step 1: Create a new Master Tour Package
   */
  createPackage(payload: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(this.adminUrl, payload);
  }

  /**
   * Step 2: Add departure date schedules
   */
  addSchedule(packageId: number | string, scheduleData: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.adminUrl}/${packageId}/schedules`, scheduleData);
  }

  /**
   * Step 3: Add day-by-day itineraries
   */
  addItinerary(packageId: number | string, itineraryData: any): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.adminUrl}/${packageId}/itineraries`, itineraryData);
  }

  /**
   * Step 4a: Attach cover or gallery photo to package
   * Accepts FormData (direct binary upload) or raw JSON payload
   */
  addPhoto(
    packageId: number | string,
    photoData: FormData | { photo_url: string; photo_type?: string; caption?: string },
  ): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.adminUrl}/${packageId}/photos`, photoData);
  }
  /**
   * Step 4b: Publish draft package
   */
  publishPackage(packageId: number | string): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.adminUrl}/${packageId}/publish`, {});
  }

  /**
   * Update full package details (PUT /api/admin/packages/:id)
   */
  updatePackage(packageId: number | string, payload: any): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.adminUrl}/${packageId}`, payload);
  }

  /**
   * Update package status directly (PATCH /api/admin/packages/:id/status)
   */
  updateStatus(packageId: number | string, status: PackageStatus): Observable<ApiResponse> {
    return this.http.patch<ApiResponse>(`${this.adminUrl}/${packageId}/status`, { status });
  }

  /**
   * Delete or archive a package (DELETE /api/admin/packages/:id)
   */
  deletePackage(packageId: number | string): Observable<ApiResponse> {
    return this.http.delete<ApiResponse>(`${this.adminUrl}/${packageId}`);
  }
}
