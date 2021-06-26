import { Injectable } from '@nestjs/common'
import { Observable, Subscriber } from 'rxjs'
import { DeviceType } from '../../../../../device/src'
import { BaseEvents } from '../base.events'

const IS_MOTION_EVENT_NAME = 'IsMotion'
const EVENT_NAME = 'event'

interface MotionSensor {
  camera: string
  isMotion: boolean
}

@Injectable()
export class MotionSensorEvents extends BaseEvents<MotionSensor> {
  private async sendToScreens (val: boolean) {
    const messageToPrint = val ? 'Motion detected' : ''
    void this.deviceService.sendTo(DeviceType.SCREEN, messageToPrint)
  }

  private cameraMotionEvents (subscriber: Subscriber<MotionSensor>) {
    for (const camera of this.cameras) {
      if (!camera.player) {
        this.logger.warn(`Camera "${camera.name} does not have a valid player to subscribe"`)
        continue
      }
      camera.player.subscribeToEvent(EVENT_NAME)
        .subscribe((event) => {
          const {
            Name: name,
            Value: val
          } = event.message.message.data.simpleItem.$

          if (name !== IS_MOTION_EVENT_NAME) {
            return
          }

          void this.sendToScreens(!!val)

          subscriber.next({
            camera: camera.name,
            isMotion: !!val
          })
        })
    }
  }

  private arduinoMotionEvents (subscriber: Subscriber<MotionSensor>) {}

  init () {
    this.observable = new Observable<{ camera: string, isMotion: boolean }>((subscriber) => {
      this.cameraMotionEvents(subscriber)
      this.arduinoMotionEvents(subscriber)
    })
  }
}
