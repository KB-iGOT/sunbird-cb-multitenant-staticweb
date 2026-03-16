import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const API_END_POINTS = {
  CONSUMTION_STATUS: `/apis/public/v8/igot/consumption/status`,
}

@Injectable({
  providedIn: 'root'
})
export class ApisService {
  baseUrl!: string

  constructor(
    private http: HttpClient,
  ) { }

  getConsumtionStatus(): Observable<any> {
    return this.http.get<any>(API_END_POINTS.CONSUMTION_STATUS).pipe(
      map((response: any) => {
        return response?.result?.response || response?.result?.response || {};
      }),
      catchError(error => {
        console.error('Error loading stats from API:', error);
        return of({});
      })
    )
  }
}
