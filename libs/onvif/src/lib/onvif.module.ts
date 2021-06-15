import { DynamicModule } from '@nestjs/common'
import { getCamerasProvider, GET_CAMERAS_PROVIDER_KEY } from './provider/get-cameras.provider'
import { RegisterOnvifModuleConfig, REGISTER_ONVIF_PROVIDER_KEY } from './register-onvif-module'
import { OnvifDiscovery } from './service/discover/onvif-discover.service'

export class OnvifModule {
  static forRootAsync (config: RegisterOnvifModuleConfig): DynamicModule {
    return {
      module: OnvifModule,
      imports: [
        ...config.imports ?? []
      ],
      providers: [
        OnvifDiscovery,
        getCamerasProvider,
        {
          provide: REGISTER_ONVIF_PROVIDER_KEY,
          useFactory: config.useFactory,
          inject: config.inject
        }
      ],
      exports: [
        OnvifDiscovery,
        GET_CAMERAS_PROVIDER_KEY
      ]
    }
  }
}
