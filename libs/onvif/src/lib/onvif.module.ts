import { DynamicModule } from '@nestjs/common'
import { RegisterOnvifModuleConfig, REGISTER_ONVIF_PROVIDER_KEY } from './register-onvif-module'
import { OnvifDiscovery } from './service/discover/onvif.discovery'

export class OnvifModule {
  static forRootAsync (config: RegisterOnvifModuleConfig): DynamicModule {
    return {
      module: OnvifModule,
      imports: [
        ...config.imports ?? []
      ],
      providers: [
        OnvifDiscovery,
        {
          provide: REGISTER_ONVIF_PROVIDER_KEY,
          useFactory: config.useFactory,
          inject: config.inject
        }
      ],
      exports: [
        OnvifDiscovery
      ]
    }
  }
}
