import { Controller, Get } from '@nestjs/common'
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CameraListDto } from '../dto/camera-list.dto'
import { CamerasService } from '../service/cameras.service'

@Controller('cameras')
@ApiTags('Camera')
export class CamerasController {
  constructor (
    private readonly service: CamerasService
  ) {}

  @Get('list')
  @ApiOperation({ summary: 'Get cameras list' })
  @ApiOkResponse({ type: CameraListDto, isArray: true })
  async list () {
    return this.service.list()
  }
}
