# Aurora Solutions

Using RTSP Protocol with websockets and socketio.
Features:
- Wifi cameras streaming
- Motion sensor
  - Detect and send event to frontend and print on a arduino screen

### Backend

[NestJS](https://nestjs.com/)

## NX workflow

### Generate an React application

`nx generate @nrwl/react:app my-app`

### Generate a nestJS application

`nx generate @nrwl/nest:application my-app`

### Generate an express application

`nx generate @nrwl/express:application my-app`

### Generate simple library

Module **not** needed to use this library.

`nx generate @nrwl/workspace:library mylib`

**Important**: delete `projects` config added in general `jest.config.ts` file or tests will not run properly after running this command

Import from `@aurora-solutions/mylib`.

### Generate an Angular library

`nx generate @nrwl/angular:lib my-lib`

Use prefix `@aurora-solutions`.

Import from `@aurora-solutions/mylib`.

### Generate a Nest library

This should be preferred option to create Nest libraries since this command add the library to the NX _chain_ of testing, etc...

`nx generate @nrwl/nest:library my-lib`

Use prefix `@aurora-solutions`.

Import from `@aurora-solutions/mylib`.

### Delete lib, app

`nx generate rm my-lib`
`nx generate rm my-app`

## Development

### Install dependencies

First run `yarn`

### Env variables

See `README.md` in all apps and libs (in this file as well) to set environment variables (`.env` file in each one)

### Code editor

#### VSCode

Workspace settings defined in `.vscode/settings.json` for _end of line_, linter, auto format on save...

##### End of line

It may happen that VSCode ignore end of line defined in workspace settings. Check `LF` is set instead of `CLRF` in your code editor

Otherwise, when editing repository bash scripts, for example, database bash scripts, execution in linux based containers may not work if saved with CLRF end of line

## Environment variables

In project root directory

`.env` file

```env

```

**Important**: Make sure to read libs `README.md` file to know what environment variables are needed in each library

### Autogenerate environment files

This command generates all ".env files" needed, if already exists any .env it will be replaced by the environment variables describes in README.md.

```sh
yarn tools:env:create
```
