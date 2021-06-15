import { Module } from '@nestjs/common'
import { OnvifModule } from '@aurora-solutions/onvif'
import { CamerasService } from './service/cameras.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CamerasController } from './controller/cameras.controller'

@Module({
  imports: [
    OnvifModule.forRootAsync({
      imports: [
        ConfigModule.forRoot()
      ],
      useFactory: (config: ConfigService) => ({
        credentials: {
          username: config.get('onvif.credentials.username'),
          password: config.get('onvif.credentials.password')
        }
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [
    CamerasController
  ],
  providers: [
    CamerasService
  ]
})
export class CamerasModule {}
