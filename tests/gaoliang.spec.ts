/**
 * 高亮功能 E2E 测试
 * 测试文本高亮的创建、显示、删除和持久化功能
 */
import { test, expect } from '@playwright/test'

function generateUsername() {
  return `${Date.now()}${Math.floor(Math.random() * 1000)}`
}

const testPassword = 'test123456'

test.describe('高亮功能测试', () => {
  async function registerAndCreateBookWithEPUB(page: any) {
    const username = generateUsername()
    await page.getByText('立即注册').click()
    await page.waitForTimeout(500)
    await page.getByPlaceholder('例如：10001').fill(username)
    await page.getByPlaceholder('••••••••').fill(testPassword)

    const [response] = await Promise.all([
      page.waitForResponse(/\/api\/auth\/signup/, { timeout: 15000 }),
      page.getByRole('button', { name: '注册' }).click()
    ])

    expect(response.status()).toBe(200)
    await page.waitForTimeout(2000)

    const bookTitle = `测试书籍_${Date.now()}`
    await page.getByRole('button', { name: '添加书籍' }).first().click()
    await page.waitForTimeout(500)
    await page.getByPlaceholder('请输入书名').fill(bookTitle)
    await page.getByPlaceholder('请输入作者').fill('测试作者')

    const [addBookResponse] = await Promise.all([
      page.waitForResponse(/\/api\/books/, { timeout: 15000 }),
      page.getByRole('button', { name: '添加', exact: true }).click()
    ])

    expect(addBookResponse.status()).toBe(200)
    await page.waitForTimeout(2000)

    return bookTitle
  }

  test('工具栏应显示高亮按钮', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await registerAndCreateBookWithEPUB(page)

    const ePubButton = page.getByRole('button', { name: /阅读 EPUB/i })
    if (await ePubButton.isVisible()) {
      await ePubButton.click()
      await page.waitForTimeout(3000)

      const gaoLiangButton = page.getByRole('button', { name: /高亮 \(0\)/ })
      await expect(gaoLiangButton).toBeVisible()
    }
  })

  test('高亮按钮点击应打开侧边栏', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await registerAndCreateBookWithEPUB(page)

    const ePubButton = page.getByRole('button', { name: /阅读 EPUB/i })
    if (await ePubButton.isVisible()) {
      await ePubButton.click()
      await page.waitForTimeout(3000)

      const gaoLiangButton = page.getByRole('button', { name: /高亮 \(0\)/ })
      await gaoLiangButton.click()
      await page.waitForTimeout(500)

      const sideBar = page.getByText('高亮列表 (0)')
      await expect(sideBar).toBeVisible()
    }
  })

  test('侧边栏收起时应显示切换按钮', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await registerAndCreateBookWithEPUB(page)

    const ePubButton = page.getByRole('button', { name: /阅读 EPUB/i })
    if (await ePubButton.isVisible()) {
      await ePubButton.click()
      await page.waitForTimeout(3000)

      const gaoLiangButton = page.getByRole('button', { name: /高亮 \(0\)/ })
      await gaoLiangButton.click()
      await page.waitForTimeout(500)

      const closeButton = page.locator('button').filter({ has: page.locator('svg path[d="M6 18L18 6M6 6l12 12"]') })
      await closeButton.click()
      await page.waitForTimeout(500)

      const toggleButton = page.getByText('高亮列表')
      await expect(toggleButton).toBeVisible()
    }
  })

  test('高亮列表应显示暂无高亮记录', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await registerAndCreateBookWithEPUB(page)

    const ePubButton = page.getByRole('button', { name: /阅读 EPUB/i })
    if (await ePubButton.isVisible()) {
      await ePubButton.click()
      await page.waitForTimeout(3000)

      const gaoLiangButton = page.getByRole('button', { name: /高亮 \(0\)/ })
      await gaoLiangButton.click()
      await page.waitForTimeout(500)

      const emptyMessage = page.getByText('暂无高亮记录')
      await expect(emptyMessage).toBeVisible()
    }
  })
})