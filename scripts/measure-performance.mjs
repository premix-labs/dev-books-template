import { chromium } from '@playwright/test';

const base = new URL(process.argv[2] || 'http://127.0.0.1:4324/');
if (!['http:','https:'].includes(base.protocol) || !base.pathname.endsWith('/')) throw new Error('Provide an HTTP(S) book URL with a trailing slash.');
const response = await fetch(new URL('book-index.json',base));
if (!response.ok) throw new Error(`Book manifest returned ${response.status}. Start preview or provide the deployed URL.`);
const { chapters } = await response.json();
const routes = [base.href,new URL(chapters[Math.min(1,chapters.length-1)].href,base).href];
const browser = await chromium.launch();
try {
  for (const url of routes) {
    const samples = [];
    for (let run=0;run<3;run++) {
      const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);
      await cdp.send('Network.enable');
      await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
      await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:200000,uploadThroughput:93750});
      await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
      await page.addInitScript(() => {
        window.__bookVitals = {lcp:0,initialLayoutShift:0};
        new PerformanceObserver(list => { for (const entry of list.getEntries()) window.__bookVitals.lcp=entry.startTime; }).observe({type:'largest-contentful-paint',buffered:true});
        new PerformanceObserver(list => { for (const entry of list.getEntries()) if (!entry.hadRecentInput) window.__bookVitals.initialLayoutShift+=entry.value; }).observe({type:'layout-shift',buffered:true});
      });
      const loaded = await page.goto(url,{waitUntil:'load'});
      if (!loaded?.ok()) throw new Error(`Page failed to load: ${url}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForFunction(() => window.__bookVitals.lcp>0);
      // Observe the first viewport settling, not an entire user session.
      await page.waitForTimeout(1000);
      samples.push(await page.evaluate(() => ({
        ...window.__bookVitals,
        fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
        transferredBytes:performance.getEntriesByType('resource').reduce((total,entry)=>total+entry.transferSize,0)+performance.getEntriesByType('navigation')[0].transferSize,
      })));
      await context.close();
    }
    const median = key => samples.map(sample=>sample[key]).sort((a,b)=>a-b)[1];
    console.log(JSON.stringify({url,profile:'Chromium mobile 390x844, cold cache, 4x CPU, 1.6 Mbps, 150ms latency',runs:3,medianFcpMs:Math.round(median('fcp')),medianLcpMs:Math.round(median('lcp')),medianInitialLayoutShift:median('initialLayoutShift'),medianTransferredKiB:Math.round(median('transferredBytes')/1024)}));
  }
} finally {
  await browser.close();
}
