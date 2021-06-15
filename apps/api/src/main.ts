import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

import { AppModule } from './app/app.module'

async function bootstrap () {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  const configuration = app.get(ConfigService)

  const globalPrefix = configuration.get('app.globalPrefix')
  const port = configuration.get<number>('app.port')

  app.setGlobalPrefix(globalPrefix)

  const swaggerConf = configuration.get<{ enable: boolean, path: string, title, description }>('swagger')

  if (swaggerConf.enable) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle(swaggerConf.title)
      .setDescription(swaggerConf.description)
      .setVersion(process.env.npm_package_version)
      .build()

    const document = SwaggerModule.createDocument(app, swaggerConfig)
    SwaggerModule.setup(`${globalPrefix}/${swaggerConf.path}`, app, document)
  }

  await app.listen(port, () => {
    Logger.log(`Listening at http://localhost:${port}/${globalPrefix}`, 'APP')
    if (swaggerConf.enable) {
      Logger.log(`Swagger listening at at http://localhost:${port}/${globalPrefix}/${swaggerConf.path}`, 'APP')
    }
  })
}

void bootstrap()
