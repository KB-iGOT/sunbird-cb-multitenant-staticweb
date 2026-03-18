import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

const API_END_POINTS = {
  CONSUMTION_STATUS: `/apis/public/v8/igot/consumption/status`,
}

@Injectable({
  providedIn: 'root'
})
export class ApisService {
  igotUrl!: string

  constructor(
    private http: HttpClient,
  ) { }

  getConsumtionStatus(): Observable<any> {
    this.igotUrl = environment.igotUrl
    return this.http.get<any>(this.igotUrl +API_END_POINTS.CONSUMTION_STATUS).pipe(
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
