import { registerAs } from '@nestjs/config'

export const swaggerConfig = registerAs('swagger', () => ({
  enable: process.env.SWAGGER_ENABLE === 'true',
  path: process.env.SWAGGER_PATH,
  title: process.env.SWAGGER_TITLE,
  description: process.env.SWAGGER_DESCRIPTION
}))
