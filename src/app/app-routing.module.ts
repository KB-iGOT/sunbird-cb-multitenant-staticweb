import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';

// ':id' is a greedy single-segment match — any future literal route
// (e.g. 'login') must be listed above it or it will be captured as an id instead.
const routes: Routes = [
  { path: ':id', component: LandingPageComponent },
  { path: '', component: LandingPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
