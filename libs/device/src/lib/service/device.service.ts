import { Injectable } from '@nestjs/common'
import { DeviceType } from '../device.type'
import { DeviceDiscovery } from '../discovery/device.discovery'
import { DeviceDiscoveryDto } from '../discovery/device.discovery.dto'

@Injectable()
export class DeviceService {
  private devices: DeviceDiscoveryDto[] = []

  constructor (
    private readonly discovery: DeviceDiscovery
  ) {
    this.discovery.discover()
      .subscribe((devices) => {
        this.devices = devices
      })
  }

  async sendTo (type: DeviceType, data: string | Object): Promise<void> {
    await Promise.all(
      this.devices.filter(d => d.type === type).map(async (device) => {
        await device.player.write(typeof data === 'string' ? data : JSON.stringify(data))
      })
    )
  }
}
