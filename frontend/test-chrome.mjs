import puppeteer from 'puppeteer';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  console.log('🚀 启动 Google Chrome...');
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: CHROME_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  console.log('🌐 访问页面...');
  const page = await browser.newPage();
  
  // 设置视口大小
  await page.setViewport({ width: 1920, height: 1080 });
  
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

  // 捕获请求失败
  page.on('requestfailed', request => {
    console.error('❌ Request Failed:', request.url());
  });

  console.log('📄 导航到 http://localhost:3000...');
  await page.goto('http://localhost:3000', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  console.log('📊 获取页面标题...');
  const title = await page.title();
  console.log('页面标题:', title);

  console.log('📸 截取屏幕...');
  await page.screenshot({
    path: '/tmp/screenshot-full.png',
    fullPage: true
  });
  console.log('✅ 全屏截图保存：/tmp/screenshot-full.png');

  console.log('📊 检查页面内容...');
  const html = await page.content();
  console.log('页面 HTML 长度:', html.length);

  // 检查 root 元素
  try {
    const rootContent = await page.$eval('#root', el => el.innerHTML);
    console.log('Root 元素内容长度:', rootContent.length);
    
    if (rootContent.length > 0) {
      console.log('✅ Root 元素有内容！');
      console.log('Root 内容预览:', rootContent.substring(0, 500));
      
      // 检查是否有 Ant Design 组件
      if (rootContent.includes('ant-layout')) {
        console.log('✅ Ant Design 布局已渲染');
      }
      if (rootContent.includes('ant-menu')) {
        console.log('✅ Ant Design 菜单已渲染');
      }
      if (rootContent.includes('OpenClaw Monitor')) {
        console.log('✅ 页面标题已显示');
      }
    } else {
      console.error('❌ Root 元素为空！');
    }
  } catch (e) {
    console.error('❌ 无法获取 root 元素:', e.message);
  }

  // 检查是否有错误
  console.log('\n📋 检查页面元素...');
  const hasDashboard = await page.$('h1');
  if (hasDashboard) {
    const h1Text = await page.$eval('h1', el => el.textContent);
    console.log('H1 标题:', h1Text);
  }

  const hasMenu = await page.$('.ant-menu');
  console.log('菜单存在:', hasMenu ? '✅' : '❌');

  const hasLayout = await page.$('.ant-layout');
  console.log('布局存在:', hasLayout ? '✅' : '❌');

  console.log('\n✅ 测试完成！');
  console.log('📸 截图：/tmp/screenshot-full.png');

  await browser.close();
})();
