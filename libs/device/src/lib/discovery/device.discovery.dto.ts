import { Arduino } from '../arduino/arduino'
import { DeviceType } from '../device.type'

export class DeviceDiscoveryDto {
  com: string
  type: DeviceType
  player: Arduino
}
