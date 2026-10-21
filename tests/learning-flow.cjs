
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.BASE_URL||'http://127.0.0.1:8674';
const out=path.join(__dirname,'../test-results');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);
 // Learners see only the start choice. Legacy work is left untouched.
 await page.evaluate(()=>localStorage.setItem('aivd-fotosynthese-v1','{"explanation":"Eerder werk"}'));
 assert.equal(await page.getByRole('button',{name:'Presentator · didactiek'}).isVisible(),false);
 assert.equal(await page.locator('.context').count(),3);
 assert.equal(await page.locator('main a').count(),0);
 await page.screenshot({path:path.join(out,'simple-start.png'),fullPage:true});
 for(const [context,familiar] of [['cook',1],['game',1],['build',2]]){
  if(context!=='cook')await page.getByRole('button',{name:'Andere vergelijking',exact:true}).click();
  await page.locator('[data-context="'+context+'"]').click();
  await page.locator('[data-answer="0"]').click();
  assert.equal(await page.locator('[data-action="next"]').count(),0,'Incorrect prior knowledge is corrected before continuing');
  await page.locator('[data-answer="'+familiar+'"]').click();
  await page.getByRole('button',{name:'Vergelijk met de plant →'}).click();
  for(const answer of [1,0,2]){
   await page.locator('[data-answer="'+answer+'"]').click();
   assert.equal(await page.locator('.highlight').count(),2,'The corresponding parts in both images are highlighted');
   if(context==='cook'&&answer===1)await page.screenshot({path:path.join(out,'simple-comparison.png'),fullPage:true});
   await page.locator('[data-action="next"]').click();
  }
  await page.locator('[data-action="comparison"]').click();
  assert.equal(await page.locator('#comparison').isVisible(),true);
  assert.match(await page.locator('#validation').innerText(),/eigen woorden/);
  await page.locator('#comparison').fill('De plant gebruikt energie en grondstoffen om glucose te maken.');
  await page.locator('[data-action="comparison"]').click();
  await page.locator('[data-answer="'+({cook:0,game:1,build:2}[context])+'"]').click();
  await page.locator('[data-action="next"]').click();
  assert.equal(await page.locator('.scene').count(),1,'Transfer removes the analogy');
  await page.locator('[data-answer="0"]').click();
  assert.match(await page.locator('#feedback').innerText(),/Zonder lichtenergie/);
  assert.equal(await page.locator('[data-action="next"]').count(),0);
  await page.locator('[data-answer="1"]').click();
  await page.locator('[data-action="next"]').click();
  await page.locator('[data-answer="1"]').click();
  assert.match(await page.locator('#feedback').innerText(),/ontbrekende grondstof/);
  await page.locator('[data-answer="0"]').click();
  await page.locator('[data-action="next"]').click();
  await page.locator('[data-action="model"]').click();
  assert.equal(await page.locator('#model').count(),0,'An explanation is written before the model is shown');
  await page.locator('#explanation').fill('Een plant gebruikt lichtenergie om water en CO₂ in glucose om te zetten. Daarbij ontstaat zuurstof.');
  await page.locator('[data-action="model"]').click();
  await page.locator('#explanation').fill('Een plant gebruikt lichtenergie om water en CO₂ om te zetten in glucose. In glucose is energie opgeslagen. Daarbij ontstaat zuurstof.');
  if(context==='cook'){
   await page.reload();
   assert.match(await page.locator('#explanation').inputValue(),/energie opgeslagen/);
   await page.locator('[data-action="back"]').click();
   assert.equal(await page.locator('.scene').count(),1);
   await page.locator('[data-action="next"]').click();
   assert.equal(await page.locator('#model').isVisible(),true);
  }
  await page.getByRole('button',{name:'Afronden',exact:true}).click();
  assert.match(await page.locator('.finished-explanation').innerText(),/energie opgeslagen/);
 }
 assert.equal(await page.evaluate(()=>localStorage.getItem('aivd-fotosynthese-v1')),'{"explanation":"Eerder werk"}');
 const stored=await page.evaluate(()=>localStorage.getItem('aivd-fotosynthese-v4'));
 await page.goto(base+'/?presentator=1');
 assert.equal(await page.locator('#pedagogy').isVisible(),false,'Presenter notes never open automatically');
 await page.getByRole('button',{name:'Presentator · didactiek'}).click();
 assert.equal(await page.locator('#pedagogy').isVisible(),true);
 assert.match(await page.locator('#pedagogy').innerText(),/presentator/);
 await page.keyboard.press('Escape');
 assert.equal(await page.locator('#pedagogy').isVisible(),false);
 await page.locator('[data-context="cook"]').click();
 await page.locator('[data-answer="1"]').click();await page.locator('[data-action="next"]').click();
 await page.getByRole('button',{name:'Presentator · didactiek'}).click();
 assert.match(await page.locator('#principle-title').innerText(),/koppeling expliciet/);
 await page.screenshot({path:path.join(out,'simple-presenter.png')});
 await page.keyboard.press('Escape');
 assert.equal(await page.evaluate(()=>localStorage.getItem('aivd-fotosynthese-v4')),stored,'Demonstration does not alter learner work');
 const mobile=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 mobile.on('pageerror',e=>errors.push(e.message));
 await mobile.goto(base);
 await mobile.locator('[data-context="game"]').click();
 await mobile.locator('[data-answer="1"]').click();await mobile.locator('[data-action="next"]').click();
 assert.equal(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await mobile.screenshot({path:path.join(out,'simple-mobile.png'),fullPage:true});
 await mobile.getByRole('button',{name:'← Terug',exact:true}).click();
 assert.match(await mobile.locator('h1').innerText(),/Eerst gamen/);
 assert.deepEqual(errors,[]);
 await browser.close();
 console.log('PASS: all three complete learning routes, targeted feedback, paired highlights, own explanation, transfer, persistence, legacy preservation, presenter isolation, keyboard and mobile.');
})().catch(e=>{console.error(e);process.exit(1)});
