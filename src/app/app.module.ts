import { APP_INITIALIZER, NgModule, InjectionToken } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core'
import {
  AnnouncementsModule,
  CardsModule,
  CommonStripModule,
  CommonMethodsService,
  ContentStripWithTabsLibModule,
  DataPointsModule,
  HttpLoaderFactory,
  SlidersLibModule,
} from '@sunbird-cb/consumption'
import { InitService } from './services/init.service';
import { environment } from '../environments/environment';

export const ENVIRONMENT = new InjectionToken<any>('environment');

const appInitializer = (initSvc: InitService) => async () => {
  try {
    await initSvc.init()
  } catch (error) {
    console.error('ERROR DURING APP INITIALIZATION >', error)
  }
}

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatIconModule,
    AppRoutingModule,
    AnnouncementsModule,
    CardsModule,
    CommonStripModule,
    ContentStripWithTabsLibModule,
    DataPointsModule,
    SlidersLibModule,
    TranslateModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    CommonMethodsService,
    {
      provide: ENVIRONMENT,
      useValue: environment
    },
    {
      provide: 'environment',
      useValue: environment
    },
    {
      deps: [InitService],
      multi: true,
      provide: APP_INITIALIZER,
      useFactory: appInitializer,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
