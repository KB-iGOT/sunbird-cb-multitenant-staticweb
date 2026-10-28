import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { readFileSync } from 'fs';
import { EventService } from '../services/event.service';
import { InitService } from '../services/init.service';
import { TenantService } from '../services/tenant.service';
import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent statistics', () => {
  let fixture: ComponentFixture<LandingPageComponent>;
  let initService: { configDetails: any; appConfig: { portalURL: string; telmetryUrl: string } };

  const tenant = (statisticsStyle: Record<string, any> = {}) => ({
    id: 'test-tenant',
    name: 'Test tenant',
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#000000',
      backgroundColor: '#ffffff',
      textColor: '#000000',
    },
    branding: {
      logo: '/logo.svg',
      favicon: '/favicon.ico',
      companyName: 'Test tenant',
    },
    navigation: [],
    content: {
      title: 'Test title',
      subtitle: 'Test subtitle',
      heroImage: '',
      description: '',
      ctaButton: '',
      features: [],
      statistics: [{ value: '100+', label: 'Learners' }],
      ...statisticsStyle,
    },
    contact: { phone: '', email: '', address: '' },
  });

  beforeEach(async () => {
    initService = {
      configDetails: tenant(),
      appConfig: { portalURL: 'https://example.com', telmetryUrl: 'https://example.com' },
    };

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule],
      declarations: [LandingPageComponent],
      providers: [
        { provide: InitService, useValue: initService },
        {
          provide: TenantService,
          useValue: {
            applyTheme: jest.fn(),
            updateTitle: jest.fn(),
            updateFavicon: jest.fn(),
          },
        },
        { provide: Router, useValue: { url: '/' } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: jest.fn() } } } },
        { provide: EventService, useValue: { dispatchChatbotEvent: jest.fn() } },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  const render = (statisticsStyle: Record<string, any> = {}): HTMLElement => {
    initService.configDetails = tenant(statisticsStyle);
    fixture = TestBed.createComponent(LandingPageComponent);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  };

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  it('keeps the original statistic styles when API styling is absent', () => {
    const element = render();
    const strip = element.querySelector('.flex.mt-12') as HTMLElement;
    const counter = element.querySelector('.stat-counter') as HTMLElement;
    const value = counter.children[0] as HTMLElement;
    const label = counter.children[1] as HTMLElement;

    expect(strip.style.justifyContent).toBe('center');
    expect(counter.classList).toContain('text-left');
    expect(value.classList).toContain('text-3xl');
    expect(label.classList).toContain('text-blue-200');
    expect(label.classList).toContain('text-sm');
    expect(value.getAttribute('style')).toBeNull();
    expect(label.getAttribute('style')).toBeNull();
  });

  it('applies statistic styles supplied by the API', () => {
    const element = render({
      volunteer_strip_alignment: 'right',
      volunteeer_strip_title: {
        fontSize: '40px',
        textColor: 'rgb(18, 52, 86)',
        alignment: 'center',
      },
      volunteer_strip_text: {
        fontSize: '16px',
        textColor: 'rgb(101, 67, 33)',
        alignment: 'right',
      },
    });
    const strip = element.querySelector('.flex.mt-12') as HTMLElement;
    const counter = element.querySelector('.stat-counter') as HTMLElement;
    const value = counter.children[0] as HTMLElement;
    const label = counter.children[1] as HTMLElement;

    expect(strip.style.justifyContent).toBe('right');
    expect(value.style.fontSize).toBe('40px');
    expect(value.style.color).toBe('rgb(18, 52, 86)');
    expect(value.style.textAlign).toBe('center');
    expect(label.style.fontSize).toBe('16px');
    expect(label.style.color).toBe('rgb(101, 67, 33)');
    expect(label.style.textAlign).toBe('right');
  });

  it('wraps extra statistics within the responsive strip', () => {
    const statistics = Array.from({ length: 8 }, (_, index) => ({
      value: `${index + 1}+`,
      label: `Statistic ${index + 1}`,
    }));
    const element = render({ statistics });
    const strip = element.querySelector('.statistics-strip') as HTMLElement;
    const counters = element.querySelectorAll('.stat-counter');

    expect(strip.classList).toContain('lg:flex');
    expect(strip.classList).toContain('lg:flex-wrap');
    expect(strip.classList).toContain('w-full');
    expect(counters).toHaveLength(8);
    expect(counters[0].classList).toContain('lg:flex-none');
    expect(counters[0].classList).toContain('lg:w-36');
  });

  it('renders the hooks used by the responsive photo gallery styles', () => {
    const images = Array.from({ length: 5 }, (_, index) => ({
      url: `/gallery-${index + 1}.jpg`,
      alt: `Gallery image ${index + 1}`,
      caption: `Gallery caption ${index + 1}`,
    }));
    const element = render({
      photoGallery: {
        title: 'Learn. Build.\nEnhance capabilities.',
        description: 'Responsive gallery description',
        images,
      },
    });

    expect(element.querySelector('.photo-gallery-grid')).not.toBeNull();
    expect(element.querySelector('.photo-gallery-copy')).not.toBeNull();
    expect(element.querySelector('.photo-gallery-title-accent > .photo-gallery-heading')).not.toBeNull();
    expect(element.querySelector('.photo-gallery-grid > .gallery-resonsive')).not.toBeNull();
  });

  it('keeps the photo gallery centered across the complete mobile breakpoint', () => {
    const stylesheet = readFileSync(`${__dirname}/landing-page.component.scss`, 'utf8');
    const mobileStart = stylesheet.indexOf('@media (max-width: 767.98px)');
    const mobileEnd = stylesheet.indexOf('/**', mobileStart);
    const mobileStyles = stylesheet.slice(mobileStart, mobileEnd);

    expect(mobileStart).toBeGreaterThan(-1);
    expect(mobileStyles).toMatch(
      /\.photo-gallery-grid\s*{\s*row-gap:\s*1rem;\s*column-gap:\s*0;\s*}/
    );
    expect(mobileStyles).toMatch(
      /\.gallery-resonsive\s*{[\s\S]*?grid-column:\s*1\s*\/\s*-1;[\s\S]*?width:\s*calc\(100%\s*-\s*2rem\);[\s\S]*?margin-right:\s*auto;[\s\S]*?margin-left:\s*auto;/
    );
  });
});
