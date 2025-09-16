import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, of} from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { TenantService } from './tenant.service'

const API_END_POINTS = {
  FORM_READ: `/apis/v1/form/read`,
}

@Injectable({
  providedIn: 'root',
})
export class InitService {

  baseUrl!: string
  configDetails: any

  constructor(
    private http: HttpClient,
    private tenantService: TenantService
  ) {

  }

  formReadData(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.FORM_READ, request)
  }

  async init() {
    await this.setConfiDetails()
  }

  private async setConfiDetails(configDetails: any = null): Promise<any> {
    if (configDetails) {
      this.configDetails = configDetails
      this.baseUrl = configDetails.portalURL
    } else {
      try {
        const requestData: any = {
          'request': {
              'type': 'page',
              'subType': 'iiidem',
              'action': 'page-configuration',
              'component': 'multitenant-portal',
              'rootOrgId': '*',
          },
        }
        
        const result = await this.formReadData(requestData).pipe(
          map((rData: any) => {
            const finalData = rData && rData.result.form.data
            this.configDetails = finalData || {}
            this.baseUrl = finalData.portalURL
            return finalData
          }),
          catchError((_error: any) => {
            const tenantId = this.tenantService.getTenantFromUrl();
            return this.tenantService.loadTenant(tenantId).pipe(
              map(tenant => {
                this.configDetails = tenant;
                this.baseUrl = tenant?.portalURL || '';
                return tenant;
              }),
              catchError((err: any) => {
                console.error('ERROR LOADING TENANT CONFIGURATION >', err)
                return of(null);
              })
            );
          }),
        ).toPromise()
        
        return result;
      } 
      catch(e) {
        throw new Error('could not fetch configurations')
      }
    }
  }
}
