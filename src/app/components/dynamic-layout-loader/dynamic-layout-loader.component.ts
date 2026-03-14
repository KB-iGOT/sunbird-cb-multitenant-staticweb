import {
  Component,
  Input,
  ViewContainerRef,
  ComponentFactoryResolver,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { LayoutRegistryService } from '../../services/layout-registry.service';

@Component({
  selector: 'app-dynamic-layout-loader',
  template: `<ng-container #layoutContainer></ng-container>`,
  styleUrls: []
})
export class DynamicLayoutLoaderComponent implements OnInit, OnDestroy {
  @Input() tenant: any;
  @Input() layoutType: string = 'default';

  constructor(
    private viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private layoutRegistryService: LayoutRegistryService
  ) {}

  ngOnInit(): void {
    this.loadLayout();
  }

  private loadLayout(): void {
    const layoutComponent = this.layoutRegistryService.getLayoutComponent(
      this.layoutType || 'default'
    );

    if (!layoutComponent) {
      console.warn(
        `Layout '${this.layoutType}' not found. Using default layout.`
      );
      return;
    }

    this.viewContainerRef.clear();
    
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(
      layoutComponent
    );
    const componentRef = this.viewContainerRef.createComponent(componentFactory);
    
    // Pass tenant data to the dynamically loaded component
    (componentRef.instance as any).tenant = this.tenant;
  }

  ngOnDestroy(): void {
    this.viewContainerRef.clear();
  }
}
