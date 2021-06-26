import { Injectable, Logger } from '@nestjs/common'
import { Observable } from 'rxjs'
import { DeviceService } from '@aurora-solutions/device'
import { CamerasSource } from '../sources/cameras.source'

const LOGGER_CONTEXT = 'Events'

@Injectable()
export abstract class BaseEvents <T> {
  protected observable: Observable<T>
  protected readonly logger = new Logger(LOGGER_CONTEXT)
  protected readonly cameras = this.camerasSource.list()
  protected readonly arduinos: unknown[] = []

  constructor (
    protected readonly camerasSource: CamerasSource,
    protected readonly deviceService: DeviceService
  ) {
    this.init()
  }

  protected abstract init ()

  listen (): Observable<T> {
    return this.observable
  }
}
