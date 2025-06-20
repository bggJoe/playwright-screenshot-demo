import { test, expect } from '@playwright/test';

// --- 設定 ---
// 選擇一個內容很長的頁面，維基百科是個好例子
const TARGET_URL = 'https://docs.google.com/presentation/d/e/2PACX-1vSMe6-2hgQxLKVz9oQjBei1EPOBeu4F6YMyVSnuU5s1NaB6LT8smKmpR7Z9Og38aqZBfxFWNlRLsAbN/pub?start=false&loop=false&delayms=3000&slide=id.g35873030392_0_167'; 
const SCROLL_REPEATS = 74; // 設定要重複滾動和截圖的次數

/**
 * 一個輔助函式，用來拍攝帶有編號的截圖
 * @param {import('@playwright/test').Page} page - Playwright 的 page 物件
 * @param {number} step - 目前的步驟編號
 */
async function takeNumberedScreenshot(page, step) {
  // 將數字格式化為 00, 01, 02, ... 這樣的兩位數
  const stepStr = String(step).padStart(2, '0');
  const screenshotPath = `screenshots/scroll-step-${stepStr}.png`;

  // ⚠️ 重要：這裡 fullPage 設為 false，只截取當前可視範圍
  // 如果設為 true，每張圖都會是從頭到尾的完整頁面，就失去滾動的意義了
  await page.screenshot({ path: screenshotPath, fullPage: false });

  console.log(`📸 成功截圖 (${stepStr}): ${screenshotPath}`);
}

test('連續滾動頁面並截圖 66 次', async ({ page }) => {
  // 1. 前往目標網頁，並等待網路活動結束，確保頁面載入完全
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

  // 2. 拍攝初始畫面的截圖 (第 0 張)
  await takeNumberedScreenshot(page, 0);

  // 3. 使用 for 迴圈，從 1 開始重複 74 次
  for (let i = 1; i <= SCROLL_REPEATS; i++) {
    // 動作：模擬使用者按一次鍵盤的「向下」方向鍵
    await page.keyboard.press('ArrowDown');

    // 短暫等待，確保滾動的畫面渲染完成
    await page.waitForTimeout(100); // 等待 100 毫秒

    // 截圖：拍攝按下方向鍵之後的畫面
    await takeNumberedScreenshot(page, i);
  }

  // 最終斷言，可以簡單檢查頁面標題依然存在
  await expect(page).toHaveTitle(/地球/);
});