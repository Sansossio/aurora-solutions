import { Injectable } from '@nestjs/common'
import { InstancedCamera, OnvifDiscovery } from '@aurora-solutions/onvif'
import { CameraListDto } from '../dto/camera-list.dto'

@Injectable()
export class CamerasService {
  private cameras: InstancedCamera[] = []
  constructor (
    private readonly onvifDiscovery: OnvifDiscovery
  ) {
    this.onvifDiscovery.discover()
      .subscribe((cameras) => {
        this.cameras = cameras
      })
  }

  async list (): Promise<CameraListDto[]> {
    return CameraListDto.fromInstancedCameras(this.cameras)
  }
}
