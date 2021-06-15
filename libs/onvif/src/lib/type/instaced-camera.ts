import { OnvifCamera } from '../camera/onvif-camera'

export class InstacedCamera {
  name: string
  player?: OnvifCamera
  rtsp?: string
}
