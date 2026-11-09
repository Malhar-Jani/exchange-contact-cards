import {defineConfig} from '@playwright/test';
export default defineConfig({use:{channel:'chrome',viewport:{width:1440,height:1100}},testDir:'./tests',testMatch:'**/browser.spec.mjs',webServer:{command:'npm run dev -- --port 5174 --strictPort',url:'http://127.0.0.1:5174',reuseExistingServer:!process.env.CI}});
