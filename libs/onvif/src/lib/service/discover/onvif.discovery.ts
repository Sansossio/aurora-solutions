import { Inject, Injectable } from '@nestjs/common'
import { Discovery } from 'onvif'
import { Observable, Subscriber } from 'rxjs'
import { OnvifCamera } from '../../camera/onvif-camera'
import { RegisterCamera } from '../../camera/type'
import { RegisterOnvifModule, REGISTER_ONVIF_PROVIDER_KEY } from '../../register-onvif-module'
import { InstancedCamera } from '../../type/instanced-camera'

const RELOAD_DEVICES_TIME = 30 * 1000 // 30s

@Injectable()
export class OnvifDiscovery {
  private readonly cameras: InstancedCamera[] = []

  constructor (
    @Inject(REGISTER_ONVIF_PROVIDER_KEY)
    private readonly config: RegisterOnvifModule
  ) {}

  private configAlreadyExists (config: RegisterCamera): boolean {
    return !!this.cameras.find(c => {
      const camConfig = c.player?.getConfig()
      return camConfig.hostname === config.hostname && camConfig.port === config.port
    })
  }

  async search (): Promise<OnvifCamera[]> {
    return new Promise((resolve, reject) => {
      Discovery.probe((err, cams) => {
        if (err) {
          reject(err)
          return
        }
        const camInstances = cams
          .map(
            (cam) => {
              const config: RegisterCamera = {
                hostname: cam.hostname,
                port: cam.port,
                username: this.config.credentials?.username,
                password: this.config.credentials?.password
              }

              if (this.configAlreadyExists(config)) {
                return null
              }

              return new OnvifCamera(config)
            }
          )
          .filter(c => !!c)
        resolve(camInstances)
      })
    })
  }

  async searchCameras (subscribe: Subscriber<InstancedCamera[]>): Promise<void> {
    const cams = await this.search()

    await Promise.all(
      cams.map(async (cam) => {
        await cam.connect()
        const name = await cam.getDeviceCustomName()

        if (this.cameras.find(c => c.name === name)) {
          return
        }

        const deviceInfo = await cam.getDeviceInformation()

        const camera = {
          name,
          rtsp: {
            url: await cam.getRtspUrl(),
            resolution: deviceInfo.resolution
          },
          player: cam
        }

        this.cameras.push(camera)
      })
    )
    subscribe.next(this.cameras)
    setTimeout(async () => this.searchCameras(subscribe), RELOAD_DEVICES_TIME)
  }

  discover (): Observable<InstancedCamera[]> {
    return new Observable((subscribe) => {
      void this.searchCameras(subscribe)
    })
  }
}
