import { Provider } from '@nestjs/common'
import { OnvifCamera } from '../camera/onvif-camera'
import { RegisterOnvifModule, REGISTER_ONVIF_PROVIDER_KEY } from '../register-onvif-module'
import { OnvifDiscovery } from '../service/discover/onvif-discover.service'

export const GET_CAMERAS_PROVIDER_KEY = Symbol('GET_CAMERAS_PROVIDER_KEY')

export class InstacedCamera {
  name: string
  player?: OnvifCamera
  rtsp?: string
}

export const getCamerasProvider: Provider = {
  provide: GET_CAMERAS_PROVIDER_KEY,
  inject: [OnvifDiscovery, REGISTER_ONVIF_PROVIDER_KEY],
  useFactory: async (discovery: OnvifDiscovery, config: RegisterOnvifModule): Promise<InstacedCamera[]> => {
    const cams = await discovery.searchCameras(
      config.credentials?.username,
      config.credentials?.username
    )

    return Promise.all<InstacedCamera>(
      cams.map(async (cam) => {
        await cam.connect()
        return {
          name: await cam.getDeviceCustomName(),
          rtsp: await cam.getRtspUrl(),
          player: cam
        }
      })
    )
  }
}
