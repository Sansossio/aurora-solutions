import { plainToClass } from 'class-transformer'

export class GetDeviceResolution {
  width: number
  height: number
}
export class GetDevice {
  readonly fimwareVersion: string
  readonly hardwareId: number
  readonly manufacturer: string
  readonly model: string
  readonly serialNumber: string
  readonly resolution?: GetDeviceResolution

  static fromData (data, resolution): GetDevice {
    return plainToClass(GetDevice, {
      ...data,
      resolution
    })
  }
}
