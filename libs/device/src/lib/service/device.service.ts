import { Injectable, Logger } from '@nestjs/common'
import { DeviceType } from '../device.type'
import { DeviceDiscovery } from '../discovery/device.discovery'
import { DeviceDiscoveryDto } from '../discovery/device.discovery.dto'
import { filter } from 'rxjs/operators'

const LOGGER_CONTEXT = 'DeviceService'

@Injectable()
export class DeviceService {
  private readonly devices: DeviceDiscoveryDto[] = []
  private readonly logger = new Logger(LOGGER_CONTEXT)

  constructor (
    private readonly discovery: DeviceDiscovery
  ) {
    this.discovery.discover()
      .pipe(
        filter(data => !this.devices.find(d => d.com === data.com))
      )
      .subscribe((data) => {
        this.logger.log(`New device "${data.type}" registered (COM: ${data.com})`)
        this.devices.push(data)
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
