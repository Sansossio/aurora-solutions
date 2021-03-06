import { Module } from '@nestjs/common'
import { OnvifModule } from '@aurora-solutions/onvif'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { CamerasController } from './controller/cameras.controller'
import { CamerasEvents } from './ws/cameras.events'
import { EventsModule } from '@aurora-solutions/events'
import { CamerasService } from './service/cameras.service'

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
    }),
    EventsModule
  ],
  controllers: [
    CamerasController
  ],
  providers: [
    CamerasService,
    CamerasEvents
  ]
})
export class CamerasModule {}
