import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { EventService } from '../../services/event.service';
import { environment } from 'src/environments/environment';
import { LANGUAGES } from '../../constant/app.constant';
import { WsEvents } from 'src/app/services/events';
import { Router } from '@angular/router';

@Component({
  selector: 'app-default-layout',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DefaultLayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() tenant: any;

  currentLanguage: string = 'en';
  languages = LANGUAGES;
  baseURl: string = '';
  private carouselInterval: any;
  private currentIndex = 0;

  @ViewChild('carouselTrack', { static: false }) carouselTrack!: ElementRef;

  constructor(
    private eventSvc: EventService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {
    const lang = localStorage.getItem('lang');
    if (lang) this.currentLanguage = lang;
    else this.currentLanguage = 'en';
  }

  ngOnInit(): void {
    this.baseURl = environment.portalURL;
    this.configureWidgets();
  }

  private configureWidgets(): void {
    // Configure showcased courses widget with base URL
    if (!this.tenant?.content?.showcasedCourses) {
      console.warn('DefaultLayout - showcasedCourses not found in tenant content');
      return;
    }

    try {
      const showcasedCourses = this.tenant.content.showcasedCourses;
      console.log('DefaultLayout - showcasedCourses object:', showcasedCourses);
      
      // Check if stripWidgetData exists
      if (!showcasedCourses.stripWidgetData) {
        console.warn('DefaultLayout - stripWidgetData not found');
        return;
      }

      if (!showcasedCourses.stripWidgetData.strips) {
        console.warn('DefaultLayout - strips array not found in stripWidgetData');
        return;
      }

      const strips = showcasedCourses.stripWidgetData.strips;
      console.log('DefaultLayout - Number of strips:', strips.length);
      
      // Configure each strip if needed
      for (let i = 0; i < strips.length; i++) {
        console.log(`DefaultLayout - Configuring strip ${i}:`, strips[i]);
        
        if (strips[i] && strips[i].stripConfig) {
          strips[i].stripConfig = {
            ...strips[i].stripConfig,
            publicCard: {
              baseUrl: this.baseURl
            }
          };
          console.log(`DefaultLayout - Strip ${i} configured successfully`);
        }
      }
      
      // Trigger change detection to ensure widget updates
      this.cdr.markForCheck();
      console.log('DefaultLayout - Widget configuration completed successfully');
    } catch (error) {
      console.error('DefaultLayout - Error configuring widgets:', error);
    }
  }

  ngAfterViewInit(): void {
    this.initializeCarousel();
  }

  private initializeCarousel(): void {
    if (
      this.tenant &&
      this.tenant.content &&
      this.tenant.content.partners &&
      this.tenant.content.partners.logos &&
      this.carouselTrack
    ) {
      const logos = this.tenant.content.partners.logos;
      const itemWidth = 150;

      this.carouselInterval = setInterval(() => {
        this.currentIndex += 1;
        const track = this.carouselTrack.nativeElement;
        track.style.transform = `translateX(-${this.currentIndex * itemWidth}px)`;

        if (this.currentIndex >= logos.length) {
          this.currentIndex = 0;
          setTimeout(() => {
            track.style.transition = 'none';
            track.style.transform = 'translateX(0)';
            setTimeout(() => {
              track.style.transition = 'transform 0.5s ease-in-out';
            }, 50);
          }, 500);
        }
      }, 3000);
    }
  }

  getCountryPercentage(count: string): number {
    const numCount = parseInt(count);
    const maxCount = 60;
    return Math.min((numCount / maxCount) * 100, 100);
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

  ngOnDestroy(): void {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }
}
