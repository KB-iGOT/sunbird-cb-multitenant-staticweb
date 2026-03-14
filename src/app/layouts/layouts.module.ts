import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

import { DefaultLayoutComponent } from './default-layout/default-layout.component';
import { CustomTemplate1Component } from './custom-template1/custom-template1.component';
import { DynamicLayoutLoaderComponent } from '../components/dynamic-layout-loader/dynamic-layout-loader.component';
import { LayoutRegistryService } from '../services/layout-registry.service';

// Import any pipes or shared modules needed
import { PipePublicURL } from '../pipes/pipe-public-URL/pipe-public-URL.pipe';
import { ContentStripWithTabsLibModule, DataPointsModule, SlidersLibModule, WIDGET_REGISTRATION_LIB_CONFIG } from '@sunbird-cb/consumption';
import { TranslateModule } from '@ngx-translate/core';
import { SbUiResolverModule } from '@sunbird-cb/resolver-v2';
import { HorizontalScrollComponent } from '../components/horizontal-scroll/horizontal-scroll.component';

@NgModule({
  declarations: [
    DefaultLayoutComponent,
    CustomTemplate1Component,
    DynamicLayoutLoaderComponent,
    HorizontalScrollComponent
  ],
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    PipePublicURL,
    ContentStripWithTabsLibModule,
    DataPointsModule,
    SlidersLibModule,
    TranslateModule,
    PipePublicURL,
    SbUiResolverModule.forRoot([...WIDGET_REGISTRATION_LIB_CONFIG]),
  ],
  providers: [LayoutRegistryService],
  exports: [DynamicLayoutLoaderComponent],
})
export class LayoutsModule {
  constructor(private layoutRegistry: LayoutRegistryService) {
    // Register all available layouts
    this.layoutRegistry.registerLayout('default', DefaultLayoutComponent);
    this.layoutRegistry.registerLayout('custom-template1', CustomTemplate1Component);
  }
}
