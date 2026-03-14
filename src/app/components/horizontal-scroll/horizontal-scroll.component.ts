import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
 
export interface BenefitCard {
  title: string;
  icon: string; // SVG path(s) or identifier
  description: string;
}
@Component({
  selector: 'app-horizontal-scroll',
  templateUrl: './horizontal-scroll.component.html',
  styleUrls: ['./horizontal-scroll.component.scss']
})
export class HorizontalScrollComponent implements AfterViewInit, OnDestroy {
  @ViewChild('scrollTrack') scrollTrack!: ElementRef<HTMLElement>;
 
  benefitcards: BenefitCard[] = [
    {
      title: 'Economy and Public Finance',
      icon: 'economy',
      description:
        'Understanding economic systems, public finance, and financial decision-making to support sustainable growth and effective public resource management.',
    },
    {
      title: 'Environment and Climate',
      icon: 'environment',
      description:
        'Addressing climate change, sustainability, and environmental challenges through policy, innovation, and resilient development strategies.',
    },
    {
      title: 'Technology and Data Governance',
      icon: 'technology',
      description:
        'Using digital technologies, data, and AI to improve governance, enable evidence-based decisions, and strengthen public service systems.',
    },
    {
      title: 'Governance and Public Policy',
      icon: 'governance',
      description:
        'Designing, implementing, and evaluating policies and governance frameworks to strengthen institutions and improve public outcomes.',
    },
    {
      title: 'Health and Social Welfare',
      icon: 'health',
      description:
        'Building capacity in public health systems, social protection schemes, and welfare delivery to ensure inclusive citizen well-being.',
    },
    {
      title: 'Infrastructure and Urban Development',
      icon: 'infrastructure',
      description:
        'Planning and managing public infrastructure, smart cities, and urban services to drive equitable and sustainable development.',
    },
    {
      title: 'Leadership and Ethics',
      icon: 'leadership',
      description:
        'Cultivating integrity, ethical decision-making, and transformational leadership qualities in civil servants across all levels.',
    },
  ];
 
  canScrollLeft = false;
  canScrollRight = false;
 
  private resizeObserver!: ResizeObserver;
 
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
}