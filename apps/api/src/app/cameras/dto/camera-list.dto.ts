import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { InstancedCamera } from '@aurora-solutions/onvif'
import { plainToClass } from 'class-transformer'
import { CameraList } from '@aurora-solutions/api-interface'

export class ResolutionRtspCameraListDto {
  @ApiProperty()
  width: number

  @ApiProperty()
  height: number
}

export class RtspCameraListDto {
  @ApiProperty({
    example: 'rtsp://{user}}:{password}@{host}:{port}/{path}'
  })
  url: string

  @ApiPropertyOptional({ type: ResolutionRtspCameraListDto })
  resolution?: ResolutionRtspCameraListDto
}

export class CameraListDto implements CameraList {
  @ApiProperty({
    example: 'CameraModel#Serial'
  })
  name: string

  @ApiProperty({ type: RtspCameraListDto })
  rtsp: RtspCameraListDto

  static fromIntacedCamera (val: InstancedCamera): CameraListDto {
    const value: CameraListDto = {
      name: val.name,
      rtsp: val.rtsp
    }
    return plainToClass(CameraListDto, value)
  }

  static fromInstancedCameras (data: InstancedCamera[]): CameraListDto[] {
    return data.map(CameraListDto.fromIntacedCamera)
  }
}
