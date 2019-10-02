export const validateYear = (n) => {
  if (typeof n === 'number' && n > 0) return n
  else throw new Error(`The year: "${n}" - must be an integer and > 0 (C.E.)`)
}

export const validateMonth = (n) => {
  if (typeof n === 'number' && n >= 1 && n <= 12) return n
  else throw new Error(`The month: "${n}" - must be an integer and between 1 - 12. (1 = January, 12 = December)`)
}

export const validateDate = (n) => {
  if (typeof n === 'number' && n >= 1 && n <= 31) return n
  else throw new Error(`The day: "${n} must be between 1 - 31`)
}

export const validateHour = (n) => {
  if (typeof n === 'number' && n >= 0 && n <= 23) return n
  else throw new Error(`The hour: "${n}" - must be an integer and between 0 - 23. (0 = midnight 00:00, 23 = 11pm (23:00))`)
}

export const validateMinute = (n) => {
  if (typeof n === 'number' && n >= 0 && n <= 59) return n
  else throw new Error(`The minute: "${n}" - must be an integer and between 0 - 59`)
}

export const validateSecond = (n) => {
  if (typeof n === 'number' && n >= 0 && n <= 59) return n
  else throw new Error(`The second: "${n}" - must be an integer and between 0 - 59`)
}

export const validateLatitude = (n) => {
  if (typeof n === 'number' && n >= -90 && n <= 90) return n
  else throw new Error(`The latitude: "${n}" - must be an float and between -90.00 to 90.00`)
}

export const validateLongitude = (n) => {
  if (typeof n === 'number' && n >= -180 && n <= 180) return n
  else throw new Error(`The longitude: "${n}" - must be an float and between -180.00 to 180.00`)
}

export const validateNumber = n => {
  if (typeof n === 'number') return n
  else throw new Error(`Parameter value of: "${n}" - must be a number (int or float type).`)
}
