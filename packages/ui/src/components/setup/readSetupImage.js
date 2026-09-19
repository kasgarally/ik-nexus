/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Read a local image File as a data URL
 */

export function firstFile(files) {
  if (!files) {
    return null
  }
  if (Array.isArray(files)) {
    return files[0] || null
  }
  return files
}

export function readImageDataUrl(file, maxBytes, messages) {
  return new Promise((resolve, reject) => {
    if (!file.type || !file.type.startsWith('image/')) {
      reject(new Error(messages.imageType))
      return
    }
    if (file.size > maxBytes) {
      reject(new Error(messages.tooLarge))
      return
    }

    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error(messages.imageType))
    reader.readAsDataURL(file)
  })
}
