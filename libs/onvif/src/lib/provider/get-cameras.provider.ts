import { Provider } from '@nestjs/common'
import { OnvifDiscovery } from '../service/discover/onvif-discover.service'
import { InstacedCamera } from '../type/instaced-camera'

export const GET_CAMERAS_PROVIDER_KEY = Symbol('GET_CAMERAS_PROVIDER_KEY')

export const getCamerasProvider: Provider = {
  provide: GET_CAMERAS_PROVIDER_KEY,
  inject: [OnvifDiscovery],
  useFactory: async (discovery: OnvifDiscovery): Promise<InstacedCamera[]> => {
    return discovery.searchAndInstantiateCameras()
  }
}
