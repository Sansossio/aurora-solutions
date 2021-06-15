import { Injectable } from '@nestjs/common'
import { Discovery } from 'onvif'
import { OnvifCamera } from '../../camera/onvif-camera'

@Injectable()
export class OnvifDiscovery {
  async searchCameras (username?: string, password?: string): Promise<OnvifCamera[]> {
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
            username,
            password
          })
        )
        resolve(camInstances)
      })
    })
  }
}
