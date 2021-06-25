import { Injectable } from '@nestjs/common'
import { Observable } from 'rxjs'
import { CamerasSource } from '../sources/cameras.source'

const IS_MOTION_EVENT_NAME = 'IsMotion'
const EVENT_NAME = 'event'

@Injectable()
export class MotionSensorEvents {
  constructor (
    private readonly camerasSource: CamerasSource
  ) {}

  listen () {
    return new Observable<{ camera: string, isMotion: boolean }>((subscriber) => {
      const cameras = this.camerasSource.list()
      for (const camera of cameras) {
        if (!camera.player) {
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
            subscriber.next({
              camera: camera.name,
              isMotion: !!val
            })
          })
      }
    })
  }
}
