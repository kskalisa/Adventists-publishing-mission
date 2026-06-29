export function required(value: string, label: string) {
  return value.trim() ? '' : `${label} is required.`
}

export function validEmail(value: string, label = 'Email') {
  if (!value.trim()) return ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : `${label} must be a valid email address.`
}

export function minLength(value: string, min: number, label: string) {
  return value.length >= min ? '' : `${label} must be at least ${min} characters.`
}

export function positiveNumber(value: string, label: string, allowZero = false) {
  const number = Number(value)
  if (!Number.isFinite(number)) return `${label} must be a valid number.`
  if (allowZero ? number < 0 : number <= 0) return `${label} must be ${allowZero ? 'zero or greater' : 'greater than zero'}.`
  return ''
}

export function wholeNumber(value: string, label: string, allowZero = true) {
  const number = Number(value)
  if (!Number.isInteger(number)) return `${label} must be a whole number.`
  if (allowZero ? number < 0 : number <= 0) return `${label} must be ${allowZero ? 'zero or greater' : 'greater than zero'}.`
  return ''
}

export function firstError(errors: string[]) {
  return errors.find(Boolean) ?? ''
}

export function todayDateString() {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}

export function notPastDate(value: string, label: string) {
  if (!value) return ''
  return value >= todayDateString() ? '' : `${label} cannot be in the past.`
}

export function validDateRange(fromDate: string, toDate: string) {
  if (!fromDate || !toDate) return ''
  return fromDate <= toDate ? '' : 'From date cannot be after To date.'
}
