import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { TenantConfig } from '../models/tenant.interface';

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private currentTenant$ = new BehaviorSubject<TenantConfig | null>(null);
  private tenantCache = new Map<string, TenantConfig>();

  constructor(private http: HttpClient) {}

  getCurrentTenant(): Observable<TenantConfig | null> {
    return this.currentTenant$.asObservable();
  }

  loadTenant(tenantId: string): Observable<TenantConfig | null> {
    if (this.tenantCache.has(tenantId)) {
      const cachedTenant = this.tenantCache.get(tenantId)!;
      this.currentTenant$.next(cachedTenant);
      return of(cachedTenant);
    }

    return this.http.get<TenantConfig>(`assets/tenants/${tenantId}.json`).pipe(
      map(tenant => {
        this.tenantCache.set(tenantId, tenant);
        this.currentTenant$.next(tenant);
        return tenant;
      }),
      catchError(error => {
        console.error(`Failed to load tenant configuration for ${tenantId}:`, error);
        this.currentTenant$.next(null);
        return of(null);
      })
    );
  }

  getTenantFromUrl(): string {
    const hostname = window.location.hostname;
    const subdomain = hostname.split('.')[0];
    
    // For development, check query params or use default
    const urlParams = new URLSearchParams(window.location.search);
    const tenantParam = urlParams.get('tenant');
    
    if (tenantParam) {
      return tenantParam;
    }

    // In production, you might determine tenant from subdomain
    if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
      return subdomain;
    }

    // Default tenant for development
    return 'tenant1';
  }

  applyTheme(theme: any): void {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--background-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
  }

  updateFavicon(faviconUrl: string): void {
    const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    if (favicon) {
      favicon.href = faviconUrl;
    }
  }

  updateTitle(title: string): void {
    document.title = title;
  }
}