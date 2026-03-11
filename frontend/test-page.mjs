import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 启动浏览器...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  console.log('🌐 访问页面...');
  const page = await browser.newPage();
  
  // 捕获控制台消息
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.error('❌ Console Error:', text);
    } else {
      console.log(`[${type}]`, text);
    }
  });

  // 捕获页面错误
  page.on('pageerror', error => {
    console.error('❌ Page Error:', error.message);
  });

  // 访问页面
  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  console.log('📸 截取屏幕...');
  await page.screenshot({
    path: '/tmp/screenshot.png',
    fullPage: true
  });

  console.log('📊 获取页面标题...');
  const title = await page.title();
  console.log('页面标题:', title);

  console.log('📊 获取页面内容...');
  const html = await page.content();
  console.log('页面 HTML 长度:', html.length);

  // 检查 root 元素
  try {
    const rootContent = await page.$eval('#root', el => el.innerHTML);
    console.log('Root 元素内容长度:', rootContent.length);
    console.log('Root 内容预览:', rootContent.substring(0, 500));
  } catch (e) {
    console.error('❌ Root 元素为空或不存在');
  }

  console.log('✅ 测试完成！');
  console.log('📸 截图保存：/tmp/screenshot.png');

  await browser.close();
})();
