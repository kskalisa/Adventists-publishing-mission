export function readImageAsDataUrl(file: File, maxBytes = 2 * 1024 * 1024): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return Promise.reject(new Error('Please choose an image file.'))
  }
  if (file.size > maxBytes) {
    return Promise.reject(new Error('Image must be 2MB or smaller.'))
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Unable to read image file.'))
    reader.readAsDataURL(file)
  })
}
