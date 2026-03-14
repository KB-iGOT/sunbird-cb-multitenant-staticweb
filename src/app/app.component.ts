import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TenantService } from './services/tenant.service';
import { TenantConfig } from './models/tenant.interface';
import { InitService } from './services/init.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  tenant: TenantConfig | null = null;
  layoutType: string = 'default';
  loading = true;

  constructor(
    private tenantService: TenantService,
    private initService: InitService
  ) {}

  ngOnInit(): void {
    // Load tenant configuration from init service
    this.tenant = this.initService.configDetails;
    console.log('AppComponent - Full tenant config:', this.tenant);
    console.log('AppComponent - Showcased Courses:', this.tenant?.content?.showcasedCourses);
    
    // Get layout type from tenant configuration or default to 'default'
    if (this.tenant?.content) {
      this.layoutType = (this.tenant.content as any).layoutType || 'default';
    }

    // Apply theme and metadata
    if (this.tenant) {
      this.tenantService.applyTheme(this.tenant.theme);
      this.tenantService.updateTitle(this.tenant.content.title);
      this.tenantService.updateFavicon(this.tenant.branding.favicon);
    }

    this.loading = false;
  }
}
