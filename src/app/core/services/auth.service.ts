import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'customer' | 'admin';
  is_email_verified: boolean | number;
}

export interface AuthResponse {
  status: string;
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Signals for reactive state
  currentUser = signal<User | null>(this.getStoredUser());
  token = signal<string | null>(this.getStoredToken());

  isAuthenticated = computed(() => !!this.token());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap((response) => {
        if (response.data) {
          this.setSession(response.data.token, response.data.user);
        }
      }),
    );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.data) {
          this.setSession(response.data.token, response.data.user);
        }
      }),
    );
  }

  /**
   * Authenticate with Google ID token
   */
  googleLogin(idToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/google`, { id_token: idToken }).pipe(
      tap((response) => {
        if (response.data) {
          this.setSession(response.data.token, response.data.user);
        }
      }),
    );
  }

  /**
   * Authenticate with Apple Identity token
   * @param payload.identityToken - JWT token from Apple Sign In SDK
   * @param payload.fullName - Optional full name (Apple only passes this on the user's FIRST sign in)
   */
  appleLogin(payload: { identityToken: string; fullName?: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/apple`, {
        identity_token: payload.identityToken,
        full_name: payload.fullName,
      })
      .pipe(
        tap((response) => {
          if (response.data) {
            this.setSession(response.data.token, response.data.user);
          }
        }),
      );
  }

  verifyOtp(payload: { email: string; otp: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify-email`, payload);
  }

  resendMail(payload: { email: string }): Observable<AuthResponse> {
    const params = new HttpParams().set('email', payload.email);
    return this.http.get<AuthResponse>(`${this.apiUrl}/resend-verification`, { params });
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('j2g_auth_token');
      localStorage.removeItem('j2g_user_data');
    }
    this.token.set(null);
    this.currentUser.set(null);
  }

  private setSession(token: string, user: User): void {
    if (this.isBrowser) {
      localStorage.setItem('j2g_auth_token', token);
      localStorage.setItem('j2g_user_data', JSON.stringify(user));
    }
    this.token.set(token);
    this.currentUser.set(user);
  }

  private getStoredToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('j2g_auth_token');
    }
    return null;
  }

  private getStoredUser(): User | null {
    if (this.isBrowser) {
      const data = localStorage.getItem('j2g_user_data');
      return data ? JSON.parse(data) : null;
    }
    return null;
  }
}
