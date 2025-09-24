import { Pipe, PipeTransform } from '@angular/core'
import { environment } from 'src/environments/environment'
@Pipe({
  name: 'pipePublicURL',
  standalone: true,
})
export class PipePublicURL implements PipeTransform {
  constructor( ) {

  }
  transform(value: string): any {
    const mainUrl = value && value.split('/content').pop() || ''
    const finalURL = `${environment.portalURL}/${environment.contentBucket}/content${mainUrl}`
    return value ? finalURL : ''
  }

}
