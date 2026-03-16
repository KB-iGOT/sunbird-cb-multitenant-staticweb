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
        private apisService: ApisService
    ) { }

    ngOnInit(): void {
        this.baseURl = environment.portalURL;
        this.loadStatsFromJSON();
        this.loadStatValueFromAPI();
        console.log('Custom Template 1 initialized for tenant:', this.tenant?.branding?.companyName);
    }


    ngAfterViewInit(): void {
        this.updateScrollState();

        const el = this.scrollTrack.nativeElement;
        el.addEventListener('scroll', this.onScroll, { passive: true });

        this.resizeObserver = new ResizeObserver(() => this.updateScrollState());
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
        });
    }

    loadStatValueFromAPI(): void {
        this.apisService.getConsumtionStatus().subscribe((stats: any) => {
            this.stats = stats || {};
        });
    }

    getStatValue(statId: string): string {
        if (!this.stats || !statId) {
            return '';
        }
        const value = this.stats[statId];
        return value ? String(value) : '';
    }
}
