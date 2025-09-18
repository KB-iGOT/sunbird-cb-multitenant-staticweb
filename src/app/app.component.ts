import { Component, OnInit, ViewEncapsulation, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { TenantService } from './services/tenant.service';
import { TenantConfig } from './models/tenant.interface';
import { InitService } from './services/init.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { WsEvents } from './services/events';
import { EventService } from './services/event.service';
import { LANGUAGES } from './constant/app.constant';

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
  currentLanguage: string = 'en';
  languages = LANGUAGES;
  baseURl: string = ''
  
  @ViewChild('carouselTrack', { static: false }) carouselTrack!: ElementRef;

  constructor(
    private tenantService: TenantService,
    private initService: InitService,
    private router: Router,
    private eventSvc: EventService
  ) {
    const lang = localStorage.getItem('lang');
    if (lang) this.currentLanguage = lang;
    else this.currentLanguage = 'en';
  }

  ngOnInit(): void {
    this.tenant = this.initService.configDetails;
    this.baseURl = environment.portalURL
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

  languageChange(event: any) {
    const telemetryURL = environment.telmetryUrl || ''
    this.currentLanguage = event.target.value;
    let currentURL = window.location.href; 
    console.log('currentURL', currentURL)
    this.raiseTemeletyInterat(event.target.value)
   // this.translate.use(this.currentLanguage);
    localStorage.setItem('lang', this.currentLanguage);
   // this.miltilingualService.setlanguageChange(this.currentLanguage);
    let hostName = telemetryURL
    const parsedUrl = new URL(hostName);
    const domain = parsedUrl.hostname;
    let protocol = window.location.protocol  
    let url = ''
    url = `${protocol}://${hostName}`
    let path = this.router.url
    console.log(path); 
    // console.log(hostName)
    // console.log(protocol)
    if(event.target.value === 'en') {
      url = `${telemetryURL}/#${path}`
     window.location.href = url
    } else if(event.target.value === 'hi') {
      let subdomain = this.addSubdomain('hi', domain)
      console.log('subdomain', subdomain)
      url =  `${protocol}//hi.${domain}/#${path}`
      window.location.href = url
    } else if(event.target.value === 'ta') {
      let subdomain = this.addSubdomain('ta', domain)
      console.log('subdomain', subdomain)
      url = `${protocol}//ta.${domain}/#${path}`
      window.location.href = url
    } else if(event.target.value === 'be') {
      let subdomain = this.addSubdomain('be', domain)
      console.log('subdomain', subdomain)
      url = `${protocol}//be.${domain}/#${path}`
      window.location.href = url
    } else if(event.target.value === 'ka') {
      let subdomain = this.addSubdomain('ka', domain)
      console.log('subdomain', subdomain)
      url = `${protocol}//ka.${domain}/#${path}`
      window.location.href = url
    } else if(event.target.value === 'mr') {
      let subdomain = this.addSubdomain('mr', domain)
      console.log('subdomain', subdomain)
      url = `${protocol}//mr.${domain}/#${path}`
      window.location.href = url
    }
    console.log(url)
  }

  addSubdomain(subdomain: any, domain: any) {
    // Ensure no leading/trailing dots
    subdomain = subdomain.replace(/\.+$/, '');
    domain = domain.replace(/^\.+/, '');
    
    return `${subdomain}.${domain}`;
  }

  raiseTemeletyInterat(id: string) {
    console.log("id ", id)
    const event: any = {
      eventType: WsEvents.WsEventType.Telemetry,
      eventLogLevel: WsEvents.WsEventLogLevel.Info,
      data: {
        edata: { type: 'click', id: id, subType: 'language-toggle' },
        state: WsEvents.EnumTelemetrySubType.Interact,
        eventSubType: WsEvents.EnumTelemetrySubType.cardContent,
        mode: 'view'
      },
      pageContext: { pageId: '/', module: 'Landing Page' },
      from: '',
      to: 'Telemetry',
    }
    this.eventSvc.dispatchChatbotEvent<WsEvents.IWsEventTelemetryInteract>(event)
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
