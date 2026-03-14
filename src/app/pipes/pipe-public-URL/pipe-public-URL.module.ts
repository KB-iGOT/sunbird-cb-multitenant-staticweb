import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { PipePublicURL } from './pipe-public-URL.pipe'

@NgModule({
  imports: [
    CommonModule,
    PipePublicURL,
  ],
  exports: [PipePublicURL],
})
export class PipePublicURLModule { }
