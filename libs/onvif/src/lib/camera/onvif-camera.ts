import { Cam } from 'onvif'
import { Observable } from 'rxjs'
import { take } from 'rxjs/operators'
import { ConnectRtspDto } from '../service/dto/connect.rtsp.dto'
import { RtspService } from '../service/rtsp.service'
import { GetDevice, RegisterCamera } from './type'

const DEFAULT_ONVIF_PORT = 2020

export class OnvifCamera {
  private camInstance: Cam
  private deviceInfo: GetDevice
  private rtspUrl: string

  constructor (
    private readonly config: RegisterCamera
  ) {}

  private parseRtspUri (uri: string) {
    if (!this.config.username || !this.config.password) {
      return uri
    }

    const credentials = `rtsp://${this.config.username}:${this.config.password}@`
    return uri.replace(/rtsp:\/\//gm, credentials)
  }

  getInstance () {
    return this.camInstance
  }

  async connect () {
    return new Promise<void>((resolve, reject) => {
      if (this.camInstance) {
        resolve()
        return
      }
      this.camInstance = new Cam({
        port: DEFAULT_ONVIF_PORT,
        ...this.config
      }, async (err) => {
        if (err) {
          reject(err)
          return
        }

        // Load info
        await this.getRtspUrl()
        await this.getDeviceInformation()

        resolve()
      })
    })
  }

  async getDeviceCustomName (): Promise<string> {
    const info = await this.getDeviceInformation()
    return `${info.manufacturer}-${info.model}#${info.serialNumber}`
  }

  async getDeviceInformation (): Promise<GetDevice> {
    return new Promise((resolve, reject) => {
      if (this.deviceInfo) {
        resolve(this.deviceInfo)
        return
      }
      this.camInstance.getDeviceInformation(async (err, data) => {
        if (err) {
          reject(err)
          return
        }
        const resolution = await new RtspService()
          .getVideoResolution(this.rtspUrl)
          .pipe(
            take(1)
          )
          .toPromise()
        this.deviceInfo = GetDevice.fromData(data, resolution)
        resolve(this.deviceInfo)
      })
    })
  }

  async getRtspUrl (): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.rtspUrl) {
        resolve(this.rtspUrl)
        return
      }
      this.camInstance.getStreamUri({ protocol: 'RTSP' }, (err, { uri }) => {
        if (err) {
          reject(err)
          return
        }
        const url = this.parseRtspUri(uri)
        this.rtspUrl = url
        resolve(url)
      })
    })
  }

  getVideoBuffer (config?: ConnectRtspDto): Observable<Buffer> {
    return new RtspService()
      .getVideoBuffer({
        ...config,
        input: this.rtspUrl
      })
  }

  subscribeToEvent (eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.camInstance.on(eventName, (event) => {
        subscriber.next(event)
      })
    })
  }
}
