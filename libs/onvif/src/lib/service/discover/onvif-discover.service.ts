import { Inject, Injectable } from '@nestjs/common'
import { Discovery } from 'onvif'
import { OnvifCamera } from '../../camera/onvif-camera'
import { RegisterOnvifModule, REGISTER_ONVIF_PROVIDER_KEY } from '../../register-onvif-module'
import { InstancedCamera } from '../../type/instanced-camera'

@Injectable()
export class OnvifDiscovery {
  constructor (
    @Inject(REGISTER_ONVIF_PROVIDER_KEY)
    private readonly config: RegisterOnvifModule
  ) {}

  async search (): Promise<OnvifCamera[]> {
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

  async searchCameras (currentCameras: InstancedCamera[] = []): Promise<InstancedCamera[]> {
    const cams = await this.search()

    return Promise.all<InstancedCamera>(
      cams.map(async (cam) => {
        await cam.connect()
        const name = await cam.getDeviceCustomName()

        // Cache existing cameras
        const exists = currentCameras.find(c => c.name === name)
        if (exists) {
          return exists
        }

        const deviceInfo = await cam.getDeviceInformation()

        return {
          name,
          rtsp: {
            url: await cam.getRtspUrl(),
            resolution: deviceInfo.resolution
          },
          player: cam
        }
      })
    )
  }
}
