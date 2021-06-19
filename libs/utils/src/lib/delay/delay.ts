let current: number

export function delay (callback: Function, delay = 100) {
  clearTimeout(current)
  current = setTimeout(() => callback(), delay)
}
