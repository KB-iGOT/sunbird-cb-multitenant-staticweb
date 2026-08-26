import { Pipe, PipeTransform } from '@angular/core'
import { InitService } from '../../services/init.service'
@Pipe({
  name: 'pipePublicURL',
  standalone: true,
})
export class PipePublicURL implements PipeTransform {
  constructor(private initSvc: InitService) {

  }
  transform(value: string): any {
    const mainUrl = value && value.split('/content').pop() || ''
    const { portalURL, contentBucket } = this.initSvc.appConfig
    const finalURL = `${portalURL}/${contentBucket}/content${mainUrl}`
    return value ? finalURL : ''
  }

}
