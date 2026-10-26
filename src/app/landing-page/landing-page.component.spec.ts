import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
});
