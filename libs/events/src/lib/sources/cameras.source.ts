import { Inject, Injectable } from '@nestjs/common'
import { GET_CAMERAS_PROVIDER_KEY, InstancedCamera, OnvifDiscovery } from '@aurora-solutions/onvif'
import { Interval } from '@nestjs/schedule'

const UPDATE_INTERVAL = 60 * 60 * 1000 // 1h

@Injectable()
export class CamerasSource {
  constructor (
    @Inject(GET_CAMERAS_PROVIDER_KEY)
    private cameras: InstancedCamera[],
    private readonly onvifDiscovery: OnvifDiscovery
  ) {}

  @Interval(UPDATE_INTERVAL)
  async updateCameras () {
    this.cameras = await this.onvifDiscovery.searchCameras(this.cameras)
  }

  list (): InstancedCamera[] {
    return this.cameras
  }
}
