import { Module } from '@nestjs/common'
import { DeviceDiscovery } from './discovery/device.discovery'
import { DeviceService } from './service/device.service'

@Module({
  providers: [
    DeviceDiscovery,
    DeviceService
  ],
  exports: [
    DeviceService
  ]
})
export class DeviceModule {}
