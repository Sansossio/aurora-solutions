import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import configuration from '../configuration'

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: './apps/api/.env',
      load: configuration
    })
  ]
})
export class InternalModule {}
