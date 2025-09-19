import { HttpClient } from '@angular/common/http'
import { Injectable, Injector } from '@angular/core'
import { Observable, of} from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { TenantService } from './tenant.service'
import { SbUiResolverService } from '@sunbird-cb/resolver-v2'
import { environment } from 'src/environments/environment'

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
    private tenantService: TenantService,
    private injector: Injector
  ) {

  }

  formReadData(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.FORM_READ, request)
  }

  async init() {
    await this.setConfiDetails()
    this.initializeWidgetResolver()
  }

  private initializeWidgetResolver() {
    try {
      // Get the resolver service from the injector to avoid injection context issues
      const sbUiResolverService = this.injector.get(SbUiResolverService);
      
      // Initialize the widget resolver service
      sbUiResolverService.initialize(
        null, // restrictedWidgetKeys - no widgets are restricted
        null, // roles - no role-based restrictions
        null, // groups - no group-based restrictions  
        null  // restrictedFeatures - no feature restrictions
      )
      
      console.log('Widget Resolver Service initialized successfully')
    } catch (error) {
      console.warn('Widget Resolver Service not available or already initialized:', error)
      // Don't treat this as a critical error during development
    }
  }

  private async setConfiDetails(configDetails: any = null): Promise<any> {
    if (configDetails) {
      this.configDetails = configDetails
      this.baseUrl = environment.baseUrl
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
            this.baseUrl = environment.baseUrl || '';
            return finalData
          }),
          catchError((_error: any) => {
            const tenantId = this.tenantService.getTenantFromUrl();
            return this.tenantService.loadTenant(tenantId).pipe(
              map(tenant => {
                this.configDetails = tenant;
                this.baseUrl = environment.baseUrl || '';
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
