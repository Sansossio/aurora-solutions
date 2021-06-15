import { Inject, Injectable } from '@nestjs/common'
import { Discovery } from 'onvif'
import { OnvifCamera } from '../../camera/onvif-camera'
import { RegisterOnvifModule, REGISTER_ONVIF_PROVIDER_KEY } from '../../register-onvif-module'
import { InstacedCamera } from '../../type/instaced-camera'

@Injectable()
export class OnvifDiscovery {
  constructor (
    @Inject(REGISTER_ONVIF_PROVIDER_KEY)
    private readonly config: RegisterOnvifModule
  ) {}

  async searchCameras (): Promise<OnvifCamera[]> {
    return new Promise((resolve, reject) => {
      Discovery.probe((err, cams) => {
        if (err) {
          reject(err)
          return
        }
        const camInstances = cams.map(
          (cam) => new OnvifCamera({
            hostname: cam.hostname,
            port: cam.port,
            username: this.config.credentials?.username,
            password: this.config.credentials?.password
          })
        )
        resolve(camInstances)
      })
    })
  }

  async searchAndInstantiateCameras (): Promise<InstacedCamera[]> {
    const cams = await this.searchCameras()

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
