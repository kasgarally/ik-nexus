/**
 * Author: Karmil Asgarally - INTELLEKTRA © 2026
 * Files gallery: upload, thumbnail, lightbox image has a real size
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { expect, test } from '@playwright/test'

const fixturePath = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'fixtures',
  'lightbox-probe.png',
)

test.describe('files gallery lightbox', () => {
  test('uploads an image, shows a thumbnail, and opens a sized lightbox image', async ({
    page,
  }) => {
    await page.goto('/files-test')

    const imagesCard = page.locator('.v-card').filter({
      hasText: 'Add several images',
    })
    await expect(imagesCard).toBeVisible()

    const fileInput = imagesCard.locator('input[type="file"]')
    await fileInput.setInputFiles(fixturePath)

    const thumbnail = imagesCard.locator('.file-upload-thumb').first()
    await expect(thumbnail).toBeVisible()
    await thumbnail.click()

    const lightboxImage = page.locator('img.file-lightbox-image')
    await expect(lightboxImage).toBeVisible()
    await expect(lightboxImage).toHaveAttribute('src', /\/nexus-files\//)
    await lightboxImage.evaluate((image) => image.decode())

    const box = await lightboxImage.boundingBox()
    expect(box, 'lightbox image must have a layout box').toBeTruthy()
    expect(box.width, 'lightbox image width must be greater than zero').toBeGreaterThan(0)
    expect(box.height, 'lightbox image height must be greater than zero').toBeGreaterThan(0)
  })
})
