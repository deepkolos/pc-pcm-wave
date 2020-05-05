export const restrictRange = (curr, min, max) => {
  if (curr + '' === 'NaN') return min
  return curr < min ? min : curr > max ? max : curr
}

export const isInRange = (curr, min, max) => {
  return curr >= min && curr <= max
}

export const diffToRange = (curr, min, max) => {
  if (isInRange(curr, min, max)) return 0
  if (curr < min) return curr - min
  if (curr > max) return curr - max
}
