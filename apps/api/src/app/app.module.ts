import { Module } from '@nestjs/common'
import { CamerasModule } from './cameras/cameras.module'
import { InternalModule } from './internal.module'

@Module({
  imports: [
    InternalModule,
    CamerasModule
  ]
})
export class AppModule {}
