import puppeteer from 'puppeteer-core'
const OUT = process.env.SHOT_DIR
const browser = await puppeteer.launch({
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  headless: 'shell',
})
const page = await browser.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
await page.setViewport({ width: 1440, height: 900 })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle0' })
await page.evaluate(() => document.getElementById('route').scrollIntoView({ block: 'start', behavior: 'auto' }))
await new Promise((r) => setTimeout(r, 1200))

const openItin = async (chip) => {
  if (chip) {
    await page.evaluate((t) => {
      ;[...document.querySelectorAll('#route button')].find((b) => b.textContent.trim().startsWith(t))?.click()
    }, chip)
    await new Promise((r) => setTimeout(r, 400))
  }
  await page.evaluate(() => {
    ;[...document.querySelectorAll('#route button')]
      .filter((b) => b.textContent.includes('Программа по дням') && b.closest('[hidden]') === null)
      .forEach((b) => b.click())
  })
  await page.waitForSelector('dialog[open] canvas', { timeout: 20000 }).catch(() => console.log('no canvas!'))
  await new Promise((r) => setTimeout(r, 3500))
}

await openItin(null)
await page.screenshot({ path: `${OUT}/itin-map-t1.png` })
await page.keyboard.press('Escape')
await new Promise((r) => setTimeout(r, 300))

await openItin('Мармарис')
await page.screenshot({ path: `${OUT}/itin-map-t2.png` })
await page.keyboard.press('Escape')
await new Promise((r) => setTimeout(r, 300))

await page.setViewport({ width: 390, height: 780 })
await new Promise((r) => setTimeout(r, 400))
await openItin('Кубок')
await page.screenshot({ path: `${OUT}/itin-map-mobile.png` })
console.log('errors:', errors.length ? errors : 'none')
await browser.close()
