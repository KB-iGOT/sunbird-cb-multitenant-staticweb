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
  loading = true;

  constructor(
    private tenantService: TenantService,
    private initService: InitService
  ) {}

  ngOnInit(): void {
    this.tenant = this.initService.configDetails;
    this.loading = false;
    if (this.tenant) {
      this.tenantService.applyTheme(this.tenant.theme);
      this.tenantService.updateTitle(this.tenant.content.title);
      this.tenantService.updateFavicon(this.tenant.branding.favicon);
    }
  }

  getCountryPercentage(count: string): number {
    // Convert count to number and calculate percentage (assuming max is around 60)
    const numCount = parseInt(count);
    const maxCount = 60; // Based on the highest value in the data
    return Math.min((numCount / maxCount) * 100, 100);
  }
}
