const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.BASE_URL||'http://127.0.0.1:8674';
const out=path.join(__dirname,'../test-results');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.locator('#familiarity h3').waitFor();
 assert.equal(await page.locator('#analogy-work').isVisible(),false,'Unknown example is checked before the analogy');
 await page.locator('[data-familiar-choice="1"]').click();
 assert.equal(await page.locator('#start-analogy').isDisabled(),true);
 assert.match(await page.locator('#familiar-feedback').innerText(),/warmte/);
 await page.locator('[data-familiar-choice="0"]').click();await page.locator('#start-analogy').click();
 await page.locator('[data-part="1"]').click();assert.match(await page.locator('#mapping-explanation').innerText(),/Kookplaat ↔ zonlicht/);
 await page.locator('#boundary-note summary').click();assert.match(await page.locator('#boundary-note').innerText(),/lichtenergie, geen hete kookplaat/);
 await page.screenshot({path:path.join(out,'learner-desktop.png'),fullPage:true});
 // A first wrong prediction receives a specific explanation; both conditions can be investigated.
 await page.locator('[data-scenario="missing"]').click();await page.locator('[data-scene-predict="yes"]').click();await page.locator('#play-scene').click();
 assert.match(await page.locator('#scene-response').innerText(),/Zonder energie/);
 await page.locator('[data-scene-predict="no"]').click();await page.locator('#play-scene').click();assert.match(await page.locator('#scene-response').innerText(),/klopt/);
 for(const [step,answer] of [1,2,0].entries()){await page.locator(`[data-lesson-choice="${answer}"]`).click();if(step<2)await page.locator('#lesson-next').click();}
 await page.locator('#comparison-model').click();assert.equal(await page.locator('#comparison-model-box').isVisible(),false);
 await page.locator('#comparison-reflection').fill('Beide gebruiken energie om iets te maken. De plant gebruikt licht en bakt niet met warmte.');
 await page.locator('#comparison-model').click();await page.locator('#comparison-reviewed').check();assert.match(await page.locator('#discovery-progress').innerText(),/1 vergelijking uitgewerkt/);
 await page.reload();assert.equal(await page.locator('#comparison-reviewed').isChecked(),true);assert.match(await page.locator('#comparison-reflection').inputValue(),/licht/);
 await page.locator('#comparison-reflection').fill('Ik herzie mijn vergelijking: licht en warmte verschillen.');assert.equal(await page.locator('#comparison-reviewed').isChecked(),false);
 await page.locator('#comparison-reviewed').check();
 // No learner progress is changed by demonstration routes, resets, or leaving presenter mode.
 const stored=await page.evaluate(()=>localStorage.getItem('aivd-fotosynthese-v1'));
 await page.locator('#presenter-toggle').click();assert.equal(await page.locator('#presenter-panel').isVisible(),true);
 for(let i=0;i<6;i++){
  await page.locator(`[data-principle="${i}"]`).click();await page.locator('#principle-dialog').waitFor();
  assert.match(await page.locator('.dialog-top').innerText(),/Presentator/i);
  if(i===2)await page.screenshot({path:path.join(out,'presenter-principle.png')});
  await page.locator('#principle-show').click();assert.equal(await page.locator('.principle-highlight').count(),1);
 }
 await page.locator('#presenter-restart').click();assert.equal(await page.evaluate(()=>localStorage.getItem('aivd-fotosynthese-v1')),stored);
 await page.locator('#presenter-toggle').click();assert.equal(await page.locator('#comparison-reviewed').isChecked(),true);
 assert.equal(await page.evaluate(()=>localStorage.getItem('aivd-fotosynthese-v1')),stored);
 // All other contexts have a known-example check, explicit mappings and their own boundary.
 for(const [id,correct] of [['game',1],['build',2],['music',0],['football',1]]){
  await page.locator(`[data-hobby="${id}"]`).click();await page.locator(`[data-familiar-choice="${correct}"]`).click();await page.locator('#start-analogy').click();
  await page.locator('[data-part="0"]').click();assert.ok((await page.locator('#mapping-explanation').innerText()).includes('↔'));
  await page.locator('#boundary-note summary').click();assert.ok((await page.locator('#boundary-note p').innerText()).length>50);
  for(const [scenario,predict] of [['normal','yes'],['missing','no']]){await page.locator(`[data-scenario="${scenario}"]`).click();await page.locator(`[data-scene-predict="${predict}"]`).click();await page.locator('#play-scene').click();assert.match(await page.locator('#scene-response').innerText(),/klopt/);}
 }
 // Return to biology and independent explanation are still available.
 await page.locator('nav [data-view="lab"]').click();await page.locator('#light').uncheck();await page.locator('[data-predict="no"]').click();await page.locator('#run-lab').click();assert.match(await page.locator('#lab-feedback').innerText(),/licht als energiebron/);
 await page.locator('nav [data-view="check"]').click();await page.locator('#show-model').click();assert.equal(await page.locator('#model-box').isVisible(),false);
 await page.locator('#explanation').fill('Water en CO₂ zijn de grondstoffen. Licht levert energie. De plant maakt glucose en zuurstof.');await page.locator('#show-model').click();await page.locator('#self-reviewed').check();
 const downloadEvent=page.waitForEvent('download');await page.locator('#download').click();const download=await downloadEvent;await download.saveAs(path.join(out,'answers.txt'));assert.match(fs.readFileSync(path.join(out,'answers.txt'),'utf8'),/Water en CO₂/);
 const mobile=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});mobile.on('pageerror',e=>errors.push(e.message));await mobile.goto(base+'/?presentator=1');
 assert.equal(await mobile.locator('#presenter-panel').isVisible(),true);await mobile.locator('[data-principle="2"]').click();await mobile.screenshot({path:path.join(out,'presenter-mobile.png')});await mobile.keyboard.press('Escape');assert.equal(await mobile.locator('#principle-dialog').isVisible(),false);
 await mobile.locator('#presenter-toggle').click();await mobile.locator('[data-familiar-choice="0"]').click();await mobile.locator('#start-analogy').click();
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'No horizontal overflow on mobile');await mobile.screenshot({path:path.join(out,'learner-mobile.png'),fullPage:true});
 assert.deepEqual(errors,[]);await browser.close();console.log('PASS: familiarity, mappings, boundaries, predictions, reflection, persistence, presenter isolation, all five contexts, lab, export, mobile and keyboard.');
})().catch(e=>{console.error(e);process.exit(1)});
