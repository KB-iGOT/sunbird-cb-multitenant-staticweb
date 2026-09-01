import { Component, OnInit, ViewEncapsulation, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { TenantService } from '../services/tenant.service';
import {
  ResolvedGalleryDecoration,
  ResolvedTitleAccent,
  TenantConfig,
  TenantFooter,
  TenantGalleryDecoration,
  TenantLoginButton,
} from '../models/tenant.interface';
import { InitService } from '../services/init.service';
import { ActivatedRoute, Router } from '@angular/router';
import { WsEvents } from '../services/events';
import { EventService } from '../services/event.service';
import { LANGUAGES } from '../constant/app.constant';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Sections that render an accent image along with their title */
  private static readonly ACCENT_SECTIONS = [
    'photoGallery',
    'trainingPrograms',
    'internationalTraining',
    'partners',
    'showcasedCourses',
  ];
  /** Used when the form configuration does not provide an accent image */
  private static readonly DEFAULT_ACCENT_IMAGE = {
    vertical: '/assets/images/tricolor-border.svg',
    horizontal: '/assets/images/tricolor-border-horizontal.svg',
  };
  /** Used when the form configuration does not describe the gallery decoration */
  private static readonly DEFAULT_GALLERY_DECORATION = {
    patternImage: '/assets/images/gallery-dots.svg',
    circleColor: '#039349',
    circleOpacity: 0.0994,
  };
  private static readonly FOOTER_ALIGN: { [align: string]: string } = {
    left: 'left center',
    center: 'center center',
    right: 'right center',
  };
  private static readonly DEFAULT_ACCENT_LENGTH = 96;
  private static readonly DEFAULT_ACCENT_THICKNESS = 12;

  tenant: TenantConfig | null = null;
  /** Resolved accent (image + position + rotation) per section, driven by the form configuration */
  titleAccents: { [section: string]: ResolvedTitleAccent } = {};
  /** Footer image from the form configuration, null when disabled or not configured */
  footer: TenantFooter | null = null;
  /** Inline size for the footer image, empty when the config does not set a height */
  footerImageStyle: { [key: string]: string } = {};
  /** Dotted pattern and circle behind the photo gallery, driven by the form configuration */
  galleryDecoration!: ResolvedGalleryDecoration;
  /** Login button colours, empty when the form configuration leaves them to the theme */
  loginButtonStyle: { [key: string]: string } = {};
  loading = true;
  private carouselInterval: any;
  private currentIndex = 0;
  currentLanguage: string = 'en';
  languages = LANGUAGES;
  baseURl: string = ''
  id: string | null = null;

  @ViewChild('carouselTrack', { static: false }) carouselTrack!: ElementRef;

  constructor(
    private tenantService: TenantService,
    private initService: InitService,
    private router: Router,
    private route: ActivatedRoute,
    private eventSvc: EventService
  ) {
    const lang = localStorage.getItem('lang');
    if (lang) this.currentLanguage = lang;
    else this.currentLanguage = 'en';
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.tenant = this.initService.configDetails;
    this.baseURl = this.initService.appConfig.portalURL;
    if(this.tenant && this.tenant.content &&
      this.tenant.content.showcasedCourses &&
      this.tenant.content.showcasedCourses.stripWidgetData && this.tenant.content.showcasedCourses.stripWidgetData.strips &&
      this.tenant.content.showcasedCourses.stripWidgetData.strips.length > 0 &&
      this.tenant.content.showcasedCourses.stripWidgetData.strips[0] &&
      this.tenant.content.showcasedCourses.stripWidgetData.strips[0].stripConfig){
      this.tenant.content.showcasedCourses.stripWidgetData.strips[0].stripConfig = {
        ...this.tenant.content.showcasedCourses.stripWidgetData.strips[0].stripConfig,
        publicCard: {
          baseUrl: this.baseURl
        }
      };
    }
    this.resolveTitleAccents();
    this.resolveGalleryDecoration();
    this.resolveLoginButton();
    this.resolveFooter();
    this.loading = false;
    if (this.tenant) {
      this.tenantService.applyTheme(this.tenant.theme);
      this.tenantService.updateTitle(this.tenant.content.title);
      this.tenantService.updateFavicon(this.tenant.branding.favicon);
    }
  }

  /**
   * Builds the accent config for every section from the form configuration.
   * Precedence: section level `titleAccent` > content level `titleAccent` > defaults.
   */
  private resolveTitleAccents(): void {
    const content: any = (this.tenant && this.tenant.content) || {};
    LandingPageComponent.ACCENT_SECTIONS.forEach(section => {
      const sectionConfig = content[section];
      this.titleAccents[section] = this.buildTitleAccent(
        content.titleAccent,
        sectionConfig && sectionConfig.titleAccent
      );
    });
  }

  private buildTitleAccent(globalAccent: any, sectionAccent: any): ResolvedTitleAccent {
    const pick = (key: string): any => {
      const configs = [sectionAccent, globalAccent];
      for (const config of configs) {
        const value = config && config[key];
        if (value !== undefined && value !== null && value !== '') {
          return value;
        }
      }
      return undefined;
    };
    const size = (key: string, fallback: number): number => {
      const value = Number(pick(key));
      return value > 0 ? value : fallback;
    };

    const position: 'left' | 'top' = pick('position') === 'top' ? 'top' : 'left';
    const rotate = pick('rotate') === true || pick('rotate') === 'true';
    const length = size('length', LandingPageComponent.DEFAULT_ACCENT_LENGTH);
    const thickness = size('thickness', LandingPageComponent.DEFAULT_ACCENT_THICKNESS);

    // The box runs along the title: tall & thin for 'left', wide & thin for 'top'.
    const barWidth = position === 'top' ? length : thickness;
    const barHeight = position === 'top' ? thickness : length;
    // A rotated image is drawn with its axes swapped, then turned 90deg by css.
    const imageWidth = rotate ? barHeight : barWidth;
    const imageHeight = rotate ? barWidth : barHeight;
    // Rotation flips the orientation, so a top bar needs a vertical source and vice versa.
    const wantsHorizontalImage = (position === 'top') !== rotate;

    return {
      position,
      rotate,
      active: pick('active') !== false,
      image: pick('image') || (wantsHorizontalImage
        ? LandingPageComponent.DEFAULT_ACCENT_IMAGE.horizontal
        : LandingPageComponent.DEFAULT_ACCENT_IMAGE.vertical),
      barStyle: { width: `${barWidth}px`, height: `${barHeight}px` },
      imageStyle: { width: `${imageWidth}px`, height: `${imageHeight}px` },
    };
  }

  /**
   * Login button colours come from the form configuration. They are applied both
   * directly and as custom properties, because the theme paints the button with
   * `!important` declarations that read those properties.
   */
  private resolveLoginButton(): void {
    const content: any = (this.tenant && this.tenant.content) || {};
    const loginButton: TenantLoginButton = content.loginButton || {};
    const style: { [key: string]: string } = {};

    if (loginButton.backgroundColor) {
      style['--login-btn-bg'] = loginButton.backgroundColor;
      style['background-color'] = loginButton.backgroundColor;
    }
    if (loginButton.textColor) {
      style['--login-btn-color'] = loginButton.textColor;
      style.color = loginButton.textColor;
    }
    this.loginButtonStyle = style;
  }

  /** Dotted pattern image and circle colour of the photo gallery come from the form configuration. */
  private resolveGalleryDecoration(): void {
    const content: any = (this.tenant && this.tenant.content) || {};
    const photoGallery: any = content.photoGallery || {};
    const decoration: TenantGalleryDecoration = photoGallery.decoration || {};
    const defaults = LandingPageComponent.DEFAULT_GALLERY_DECORATION;
    const opacity = Number(decoration.circleOpacity);

    this.galleryDecoration = {
      active: decoration.active !== false,
      patternImage: decoration.patternImage !== undefined && decoration.patternImage !== null
        ? decoration.patternImage
        : defaults.patternImage,
      circleStyle: {
        'background-color': decoration.circleColor || defaults.circleColor,
        opacity: `${opacity >= 0 && opacity <= 1 ? opacity : defaults.circleOpacity}`,
      },
    };
  }

  /** Footer is rendered only when enabled in the form configuration and an image is set. */
  private resolveFooter(): void {
    const tenant: any = this.tenant || {};
    const content: any = tenant.content || {};
    // The form stores `footer` at the root of the page configuration; older
    // configurations keep it under `content`.
    const footer: TenantFooter = tenant.footer || content.footer || {};
    this.footer = footer.active !== false && footer.image ? footer : null;
    this.footerImageStyle = this.footer ? LandingPageComponent.buildFooterImageStyle(footer) : {};
  }

  /**
   * A footer without a configured height keeps the image aspect ratio, so a thin
   * strip ends up as tall as the page is wide. `height` caps it, and `fit`/`align`
   * decide how the image sits in that box.
   */
  private static buildFooterImageStyle(footer: TenantFooter): { [key: string]: string } {
    const height = Number(footer.height);
    if (!(height > 0)) {
      return {};
    }
    const align = LandingPageComponent.FOOTER_ALIGN[footer.align || 'center']
      || LandingPageComponent.FOOTER_ALIGN.center;
    return {
      height: `${height}px`,
      'object-fit': footer.fit || 'contain',
      'object-position': align,
    };
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
    const telemetryURL = this.initService.appConfig.telmetryUrl || ''
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
