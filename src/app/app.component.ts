import { Component, OnInit, ViewEncapsulation, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { TenantService } from './services/tenant.service';
import { TenantConfig } from './models/tenant.interface';
import { InitService } from './services/init.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  tenant: TenantConfig | null = null;
  loading = true;
  private carouselInterval: any;
  private currentIndex = 0;
  
  @ViewChild('carouselTrack', { static: false }) carouselTrack!: ElementRef;

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

  ngAfterViewInit() {
    this.startCarouselAnimation();
  }
  
  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }
  
  private startCarouselAnimation() {
    if (!this.tenant?.content?.partners?.logos) return;
    
    const imageWidth = 140; // 100px image + 40px padding
    const originalImages = this.tenant.content.partners.logos.length;
    
    this.carouselInterval = setInterval(() => {
      this.currentIndex++;
      const translateX = -(this.currentIndex * imageWidth);
      
      if (this.carouselTrack?.nativeElement) {
        this.carouselTrack.nativeElement.style.transform = `translateX(${translateX}px)`;
        
        // Reset when we've moved through the original set (but cloned images are now visible)
        if (this.currentIndex >= originalImages) {
          setTimeout(() => {
            if (this.carouselTrack?.nativeElement) {
              this.carouselTrack.nativeElement.style.transition = 'none';
              this.carouselTrack.nativeElement.style.transform = 'translateX(0px)';
              this.currentIndex = 0;
              
              // Re-enable transition after reset
              setTimeout(() => {
                if (this.carouselTrack?.nativeElement) {
                  this.carouselTrack.nativeElement.style.transition = 'transform 0.8s ease-in-out';
                }
              }, 50);
            }
          }, 800); // Wait for transition to complete
        }
      }
    }, 5000); // Move every 5 seconds
  }
}
