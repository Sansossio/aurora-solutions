export interface RegisterOnvifModuleConfig {
  imports?: any[]
  inject?: any[]
  useFactory: (...args) => RegisterOnvifModule | Promise<RegisterOnvifModule>
}

export class RegisterOnvifModule {
  credentials?: {
    username?: string
    password?: string
  }
}

export const REGISTER_ONVIF_PROVIDER_KEY = Symbol('REGISTER_ONVIF_PROVIDER_KEY')
