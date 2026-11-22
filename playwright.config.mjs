import {defineConfig,devices} from '@playwright/test';
import {randomBytes} from 'node:crypto';

const external=process.env.E2E_BASE_URL;
const demo=process.env.DEMO_TEST==='1';
export default defineConfig({
 testMatch:demo?'**/demo.spec.mjs':'**/*.spec.mjs',testIgnore:demo?[]:['**/demo.spec.mjs'],
 testDir:'./tests_browser',fullyParallel:false,workers:1,retries:0,
 reporter:[['list'],['json',{outputFile:'test-results/results.json'}],['html',{outputFolder:'playwright-report',open:'never'}]],
 use:{baseURL:external||'http://127.0.0.1:3100',trace:'retain-on-failure',screenshot:'only-on-failure'},
 projects:[
  {name:'desktop-chromium',use:{...devices['Desktop Chrome']}},
  {name:'mobile-chromium',use:{...devices['Pixel 7']}},
  {name:'desktop-firefox',use:{...devices['Desktop Firefox']}},
  {name:'mobile-webkit',use:{...devices['iPhone 13']}},
 ],
 webServer:external?undefined:{
  command:'node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100',
  url:'http://127.0.0.1:3100',reuseExistingServer:false,
  env:{NEON_AUTH_BASE_URL:'https://example.invalid',NEON_AUTH_COOKIE_SECRET:randomBytes(32).toString('hex')},
 },
});
