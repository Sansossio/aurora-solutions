import { ApiProperty } from '@nestjs/swagger'
import { InstacedCamera } from '@aurora-solutions/onvif'
import { plainToClass } from 'class-transformer'

export class CameraListDto {
  @ApiProperty({
    example: 'CameraModel#Serial'
  })
  name: string

  @ApiProperty({
    example: 'rtsp://{user}}:{password}@{host}:{port}/{path}'
  })
  rtspUrl: string

  static fromIntacedCamera (val: InstacedCamera): CameraListDto {
    return plainToClass(CameraListDto, {
      name: val.name,
      rtspUrl: val.rtsp
    })
  }

  static fromInstancedCameras (data: InstacedCamera[]): CameraListDto[] {
    return data.map(CameraListDto.fromIntacedCamera)
  }
}
