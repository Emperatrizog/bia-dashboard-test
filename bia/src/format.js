const dots = (n) => String(Math.abs(Math.round(n))).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
export const num = (n) => dots(n)
export const kwh = (n) => `${dots(n)} kWh`
export const cop = (n) => `$${dots(n)}`
export const hourLabel = (h) => {
  const t = h % 12 === 0 ? 12 : h % 12
  return `${t}:00 ${h < 12 ? 'a. m.' : 'p. m.'}`
}
export const shortHour = (h) => `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'a. m.' : 'p. m.'}`
