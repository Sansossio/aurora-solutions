const { hostname } = window.location

export const environment = {
  production: false,
  backend: {
    api: `http://${hostname}:3333/api`,
    proxy: `ws://${hostname}:3001`
  },
  ws: {
    cameraEvents: `http://${hostname}:3333/cameras`
  }
}
