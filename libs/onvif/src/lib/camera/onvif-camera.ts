import { Cam } from 'onvif'
import { Observable } from 'rxjs'
import { ConnectRtspDto } from '../service/dto/connect.rtsp.dto'
import { RtspSubscriber } from '../service/rtsp.service'
import { GetDevice, RegisterCamera } from './type'

const DEFAULT_ONVIF_PORT = 2020
const IS_MOTION_EVENT_NAME = 'IsMotion'

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
        await Promise.all([
          this.getDeviceInformation(),
          this.getRtspUrl()
        ])
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
      this.camInstance.getDeviceInformation((err, data) => {
        if (err) {
          reject(err)
          return
        }
        this.deviceInfo = GetDevice.fromData(data)
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

  motionSensor (): Observable<boolean> {
    return new Observable((subscriber) => {
      this.camInstance.on('event', (event) => {
        const {
          Name: name,
          Value: val
        } = event.message.message.data.simpleItem.$
        if (name !== IS_MOTION_EVENT_NAME) {
          return
        }
        subscriber.next(val)
      })
    })
  }

  getVideoBuffer (config?: ConnectRtspDto): Observable<Buffer> {
    return new RtspSubscriber()
      .getVideoBuffer({
        ...config,
        input: this.rtspUrl
      })
  }
}
