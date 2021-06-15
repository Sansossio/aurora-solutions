import { registerAs } from '@nestjs/config'

export const onvifConfig = registerAs('onvif', () => ({
  credentials: {
    username: process.env.ONVIF_DEFAULT_USERNAME,
    password: process.env.ONVIF_DEFAULT_PASSWORD
  }
}))
