import { HttpClient } from '@angular/common/http';
import {
    Component,
    ElementRef,
    ViewChild,
    AfterViewInit,
    OnDestroy,
    HostListener,
    OnInit,
    Input,
    ViewEncapsulation,
    ChangeDetectorRef,
} from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApisService } from 'src/app/services/apis.service';

export interface BenefitCard {
    title: string;
    icon: string; // SVG path(s) or identifier
    description: string;
}
@Component({
    selector: 'app-custom-template1',
    templateUrl: './custom-template1.component.html',
    styleUrls: ['./custom-template1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CustomTemplate1Component implements OnInit, AfterViewInit, OnDestroy {
    @Input() tenant: any;
    @ViewChild('scrollTrack') scrollTrack!: ElementRef<HTMLElement>;
    canScrollLeft = false;
    canScrollRight = false;
    stats: any = {};
    baseURl: string = '';

    private resizeObserver!: ResizeObserver;

    constructor(
        private http: HttpClient,
        private apisService: ApisService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.baseURl = environment.portalURL;
        this.initializeStats();
        console.log('Custom Template 1 initialized for tenant:', this.tenant?.branding?.companyName);
    }


    ngAfterViewInit(): void {
        // Defer scroll state update to avoid ExpressionChangedAfterItHasBeenCheckedError
        setTimeout(() => {
            this.updateScrollState();
            this.cdr.detectChanges();
        }, 0);

        const el = this.scrollTrack.nativeElement;
        el.addEventListener('scroll', this.onScroll, { passive: true });

        this.resizeObserver = new ResizeObserver(() => {
            this.updateScrollState();
            this.cdr.detectChanges();
        });
        this.resizeObserver.observe(el);
    }

    ngOnDestroy(): void {
        const el = this.scrollTrack.nativeElement;
        el.removeEventListener('scroll', this.onScroll);
        this.resizeObserver?.disconnect();
    }

    private onScroll = (): void => {
        this.updateScrollState();
    };

    private updateScrollState(): void {
        const el = this.scrollTrack.nativeElement;
        this.canScrollLeft = el.scrollLeft > 4;
        this.canScrollRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
    }

    /** Scroll by exactly one card width */
    scroll(direction: 'left' | 'right'): void {
        const el = this.scrollTrack.nativeElement;
        const card = el.querySelector('.benefit-card') as HTMLElement | null;
        const cardWidth = card ? card.offsetWidth + 16 : 280; // 16 = gap
        const amount = direction === 'left' ? -cardWidth : cardWidth;
        el.scrollBy({ left: amount, behavior: 'smooth' });
    }

    @HostListener('window:resize')
    onWindowResize(): void {
        this.updateScrollState();
    }

    loadStatsFromJSON() {
        this.http.get(`/assets/jsonfiles/configurations.json`).pipe(
            map((configurations: any) => {
                // Handle different possible JSON structures
                return configurations.stats || configurations.data || configurations;
            }),
            catchError(error => {
                console.error('Error loading stats from JSON:', error);
                return of({});
            })
        ).subscribe((stats: any) => {
            this.stats = stats || {};
            console.log('Stats loaded from JSON (fallback):', this.stats);
        });
    }

    loadStatValueFromAPI(): void {
        this.apisService.getConsumtionStatus().subscribe(
            (stats: any) => {
                // Validate that we got a valid response with actual data
                if (stats && Object.keys(stats).length > 0) {
                    this.stats = stats;
                    console.log('Stats loaded from API (primary):', this.stats);
                } else {
                    // Empty response from API, fallback to JSON
                    console.warn('API returned empty response, falling back to JSON');
                    this.loadStatsFromJSON();
                }
            },
            (error) => {
                console.warn('API call failed, falling back to JSON:', error);
                this.loadStatsFromJSON();
            }
        );
    }

    private initializeStats(): void {
        // Try API first, fallback to JSON if API fails
        this.loadStatValueFromAPI();
    }

    getStatValue(statId: string): string {
        if (!this.stats || !statId) {
            return '';
        }
        const value = this.stats[statId];
        return value ? String(value) : '';
    }
}
