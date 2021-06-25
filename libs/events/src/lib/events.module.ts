import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { OnvifModule } from '@aurora-solutions/onvif'
import { MotionSensorEvents } from './motion-sensor/motion-sensor.events'
import { CamerasSource } from './sources/cameras.source'
import { ConfigModule, ConfigService } from '@nestjs/config'

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
    ScheduleModule.forRoot()
  ],
  providers: [
    CamerasSource,
    MotionSensorEvents
  ],
  exports: [
    MotionSensorEvents
  ]
})
export class EventsModule {}
