import { HttpClient } from '@angular/common/http'
import { Injectable, Injector } from '@angular/core'
import { Observable, of} from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { TenantService } from './tenant.service'
import { SbUiResolverService } from '@sunbird-cb/resolver-v2'
import { environment } from 'src/environments/environment'
import { TranslateService } from '@ngx-translate/core'
import { TenantAppConfig } from '../models/tenant.interface'

const API_END_POINTS = {
  FORM_READ: `/apis/v1/form/read`,
}

@Injectable({
  providedIn: 'root',
})
export class InitService {

  baseUrl!: string
  configDetails: any
  private appConfigDetails: TenantAppConfig = InitService.resolveAppConfig(null)

  /**
   * App level urls/buckets for the current tenant.
   * Values come from the `appConfig` block of the form configuration,
   * falling back to the environment (assets/env.json) when not configured.
   */
  get appConfig(): TenantAppConfig {
    return this.appConfigDetails
  }

  constructor(
    private http: HttpClient,
    private tenantService: TenantService,
    private injector: Injector,
    private translate: TranslateService,
  ) {

  }

  formReadData(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.FORM_READ, request)
  }

  private static resolveAppConfig(configDetails: any): TenantAppConfig {
    const appConfig = (configDetails && configDetails.appConfig) || {}
    return {
      contentBucket: appConfig.contentBucket || environment.contentBucket || '',
      contentHost: appConfig.contentHost || environment.contentHost || '',
      baseUrl: appConfig.baseUrl || environment.baseUrl || '',
      portalURL: appConfig.portalURL || environment.portalURL || '',
      learnerPortalURL: appConfig.learnerPortalURL || appConfig.portalURL || environment.learnerPortalURL || '',
      telmetryUrl: appConfig.telmetryUrl || environment.telmetryUrl || '',
    }
  }

  private applyConfigDetails(configDetails: any) {
    this.configDetails = configDetails || {}
    this.appConfigDetails = InitService.resolveAppConfig(configDetails)
    this.baseUrl = this.appConfigDetails.baseUrl
  }

  async init() {
    if (localStorage.getItem('websiteLanguage')) {
      let lang = JSON.stringify(localStorage.getItem('websiteLanguage'))
      lang = lang.replace(/\"/g, '')
      this.translate.use(lang)
    } else {
      this.translate.setDefaultLang('en')
      localStorage.setItem('websiteLanguage', 'en')
    }
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

  private getSubTypeFromUrl(): string {
    const id = window.location.pathname.split('/').filter(Boolean)[0]
    if (id) {
      return id
    }

    const hostname = window.location.hostname
    const subdomain = hostname.split('.')[0]
    if (subdomain && subdomain !== 'localhost' && subdomain !== 'www') {
      return subdomain
    }

    // Fallback when there is neither a tenant id path segment nor a subdomain
    return 'adikarmayogi'
  }

  private async setConfiDetails(configDetails: any = null): Promise<any> {
    if (configDetails) {
      this.applyConfigDetails(configDetails)
    } else {
      try {
        const requestData: any = {
          'request': {
              'type': 'page',
              'subType': this.getSubTypeFromUrl(),
              'action': 'page-configuration',
              'component': 'multitenant-portal',
              'rootOrgId': '*',
          },
        }
        
        const result = await this.formReadData(requestData).pipe(
          map((rData: any) => {
            const finalData = rData && rData.result.form.data
            this.applyConfigDetails(finalData)
            return finalData
          }),
          catchError((_error: any) => {
            const tenantId = this.tenantService.getTenantFromUrl();
            return this.tenantService.loadTenant(tenantId).pipe(
              map(tenant => {
                this.applyConfigDetails(tenant)
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
