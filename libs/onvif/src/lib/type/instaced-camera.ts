import { OnvifCamera } from '../camera/onvif-camera'
import { GetDeviceResolution } from '../camera/type'

export class InstancedCamera {
  name: string
  player?: OnvifCamera
  rtsp?: {
    url: string
    resolution?: GetDeviceResolution
  }
}
