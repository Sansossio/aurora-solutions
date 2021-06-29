import { Injectable, Logger } from '@nestjs/common'
import { Observable, Subscriber, Subscription } from 'rxjs'
import { DeviceService } from '@aurora-solutions/device'
import { InstancedCamera, OnvifDiscovery } from '@aurora-solutions/onvif'

const LOGGER_CONTEXT = 'Events'

@Injectable()
export abstract class BaseEvents <T> {
  protected observable: Observable<T>
  protected cameras: InstancedCamera[] = []
  protected subscribe: Subscriber<T>
  protected readonly currentSubscriptions = new Map<string, Subscription>()
  protected readonly logger = new Logger(LOGGER_CONTEXT)
  protected readonly arduinos: unknown[] = []

  constructor (
    protected readonly deviceService: DeviceService,
    private readonly onvifDiscovery: OnvifDiscovery
  ) {
    this.getCamerasFromObservable()
  }

  private getCamerasFromObservable () {
    this.onvifDiscovery.discover()
      .subscribe((cameras) => {
        this.cameras = cameras
        this.init()
      })
  }

  protected removeSubscription (id: string) {
    this.currentSubscriptions.get(id)?.unsubscribe()
  }

  protected abstract init ()

  listen (): Observable<T> {
    return new Observable<T>((subscribe) => {
      this.subscribe = subscribe
    })
  }
}
