import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TenantService } from './services/tenant.service';
import { TenantConfig } from './models/tenant.interface';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit {
  tenant: TenantConfig | null = null;
  loading = true;

  constructor(private tenantService: TenantService) {}

  ngOnInit(): void {
    const tenantId = this.tenantService.getTenantFromUrl();
    
    this.tenantService.loadTenant(tenantId).subscribe(tenant => {
      this.tenant = tenant;
      this.loading = false;
      
      if (tenant) {
        this.tenantService.applyTheme(tenant.theme);
        this.tenantService.updateTitle(tenant.content.title);
        this.tenantService.updateFavicon(tenant.branding.favicon);
      }
    });
  }

  getCountryPercentage(count: string): number {
    // Convert count to number and calculate percentage (assuming max is around 60)
    const numCount = parseInt(count);
    const maxCount = 60; // Based on the highest value in the data
    return Math.min((numCount / maxCount) * 100, 100);
  }
}
