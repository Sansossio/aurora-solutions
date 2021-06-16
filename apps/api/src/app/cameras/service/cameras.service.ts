import { Inject, Injectable } from '@nestjs/common'
import { GET_CAMERAS_PROVIDER_KEY, InstancedCamera, OnvifDiscovery } from '@aurora-solutions/onvif'
import { CameraListDto } from '../dto/camera-list.dto'

@Injectable()
export class CamerasService {
  constructor (
    @Inject(GET_CAMERAS_PROVIDER_KEY)
    private cameras: InstancedCamera[],
    private readonly onvifDiscovery: OnvifDiscovery
  ) {}

  async list (): Promise<CameraListDto[]> {
    return CameraListDto.fromInstancedCameras(this.cameras)
  }

  async reloadCameras () {
    this.cameras = await this.onvifDiscovery.searchAndInstantiateCameras()
    return this.list()
  }
}
