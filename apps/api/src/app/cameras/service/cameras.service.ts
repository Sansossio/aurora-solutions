import { Inject, Injectable } from '@nestjs/common'
import { GET_CAMERAS_PROVIDER_KEY, InstacedCamera } from '@aurora-solutions/onvif'
import { CameraListDto } from '../dto/camera-list.dto'

@Injectable()
export class CamerasService {
  constructor (
    @Inject(GET_CAMERAS_PROVIDER_KEY)
    private readonly cameras: InstacedCamera[]
  ) {}

  async list (): Promise<CameraListDto[]> {
    return CameraListDto.fromInstancedCameras(this.cameras)
  }
}
