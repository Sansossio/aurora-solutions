let current: any

export function delay (callback: Function, delay = 100) {
  clearTimeout(current)
  current = setTimeout(() => callback(), delay)
}

export async function delayPromise (ms = 100) {
  return new Promise((resolve) => {
    delay(resolve, ms)
  })
}
