import { Injectable } from '@nestjs/common'
import { Subscriber } from 'rxjs'
import { DeviceType } from '@aurora-solutions/device'
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

  private cameraMotionEvents (subscribe: Subscriber<MotionSensor>) {
    for (const camera of this.cameras) {
      if (!camera.player) {
        this.logger.warn(`Camera "${camera.name} does not have a valid player to subscribe"`)
        continue
      }
      const obsId = `camera-${camera.name}`

      this.removeSubscription(obsId)

      const obs = camera.player.subscribeToEvent(EVENT_NAME)
        .subscribe((event) => {
          const {
            Name: name,
            Value: val
          } = event.message.message.data.simpleItem.$

          if (name !== IS_MOTION_EVENT_NAME) {
            return
          }

          void this.sendToScreens(!!val)

          subscribe.next({
            camera: camera.name,
            isMotion: !!val
          })
        })
      this.currentSubscriptions.set(obsId, obs)
    }
  }

  private arduinoMotionEvents (subscribe: Subscriber<MotionSensor>) {}

  init () {
    this.cameraMotionEvents(this.subscribe)
    this.arduinoMotionEvents(this.subscribe)
  }
}
