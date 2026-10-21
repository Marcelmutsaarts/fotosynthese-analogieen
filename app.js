
'use strict';
const $ = id => document.getElementById(id);
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const presenter = new URLSearchParams(location.search).get('presentator') === '1';
const STORAGE = 'aivd-fotosynthese-v4';
const fresh = () => ({context:null,step:0,map:0,transfer:0,answers:{},comparison:'',explanation:'',model:false});
let state = fresh();
const contexts = {
 cook: {
  name:'Koken',place:'In de keuken',art:'pan',materials:'Meel + melk',input:'ingredients',process:'In de pan',centre:'pan',product:'Pannenkoek',output:'pancake',energy:'Warmte',power:'heat',
  familiar:{q:'Waarvoor gebruik je de kookplaat?',options:['Om meer meel te maken.','Om warmte te leveren.','Om melk te vervangen.'],correct:1,feedback:['De kookplaat maakt geen meel. Hij geeft de warmte waarmee je bakt.','De ingrediënten zijn het materiaal. De kookplaat levert energie als warmte.','Je hebt de melk nog steeds nodig. De kookplaat levert warmte.']},
  maps:[
   {q:'Wat doet voor de plant wat de kookplaat doet bij het bakken?',options:['Water','Zonlicht','Glucose'],correct:1,part:'energy',feedback:['Water is een grondstof. Zoek de bron die energie levert.','De kookplaat levert warmte; zonlicht levert lichtenergie. Beide leveren energie om iets te maken.','Glucose is het product. Zoek de bron die energie levert.']},
   {q:'Wat zijn voor de plant de ingrediënten?',options:['Water en CO₂','Licht en warmte','Glucose en zuurstof'],correct:0,part:'materials',feedback:['Zoals je meel en melk gebruikt, gebruikt de plant water en CO₂ als grondstoffen.','Licht levert energie. De grondstoffen worden onderdeel van nieuwe stoffen.','Glucose en zuurstof ontstaan juist bij fotosynthese. Wat gaat erin?']},
   {q:'Welk product kun je hier vergelijken met de pannenkoek?',options:['Het zonlicht','De wortels','Glucose'],correct:2,part:'product',feedback:['Zonlicht levert de energie. Het is geen gemaakt product.','De wortels nemen water op. We zoeken de suiker die de plant maakt.','De plant maakt glucose: een suiker waarin energie is opgeslagen. Daarbij ontstaat ook zuurstof.']}
  ],
  stem:'Zoals je met warmte uit ingrediënten een pannenkoek maakt, zo …',
  boundary:{q:'Wat doet een plant anders dan iemand die bakt?',options:['Hij gebruikt lichtenergie in plaats van warmte van een kookplaat.','Hij bakt glucose door zijn bladeren heet te maken.','Hij heeft alleen energie nodig, geen grondstoffen.'],correct:0,feedback:['Een plant bakt niets. In het blad maakt lichtenergie de omzetting van water en CO₂ mogelijk.','Fotosynthese is geen bakken. De plant gebruikt lichtenergie.','De plant heeft water en CO₂ nodig, net zoals je bij bakken ingrediënten nodig hebt.']}
 },
 game: {
  name:'Gamen',place:'In een craftinggame',art:'machine',materials:'Erts + hout',input:'ore',process:'Craftingmachine',centre:'machine',product:'Nieuw item',output:'gem',energy:'Elektrische energie',power:'power',
  familiar:{q:'Deze machine heeft hout, erts en energie nodig. Het erts is op. Wat helpt?',options:['Alleen meer energie geven.','Meer erts verzamelen.','Alleen meer hout toevoegen.'],correct:1,feedback:['Energie vervangt het ontbrekende materiaal niet. Je hebt ook erts nodig.','Voor dit recept zijn beide materialen nodig. Energie kan het ontbrekende erts niet vervangen.','Er is al hout. Het recept vraagt ook om erts.']},
  maps:[
   {q:'Waar haalt de plant energie vandaan om glucose te maken?',options:['Uit extra water','Uit zonlicht','Uit een stopcontact'],correct:1,part:'energy',feedback:['Water is een grondstof, niet de energiebron voor fotosynthese.','De machine gebruikt elektrische energie; de plant gebruikt lichtenergie.','De plant heeft geen stekker. Zoek de energiebron die op het blad valt.']},
   {q:'Wat zijn de grondstoffen in de plant?',options:['Water en CO₂','Glucose en zuurstof','Licht en warmte'],correct:0,part:'materials',feedback:['Zoals het recept hout en erts vraagt, heeft de plant water en CO₂ nodig.','Dat zijn de stoffen die ontstaan. Welke stoffen gebruikt de plant?','Licht levert energie. We zoeken de stoffen die de plant omzet.']},
   {q:'Wat maakt de plant, zoals de machine een nieuw item maakt?',options:['Licht','Water','Glucose'],correct:2,part:'product',feedback:['Licht komt van een bron, zoals de zon. De plant maakt een suiker.','Water is een grondstof. We zoeken het product.','De plant maakt glucose: een suiker waarin energie is opgeslagen. Daarbij ontstaat ook zuurstof.']}
  ],
  stem:'Zoals de machine met energie uit materialen een item maakt, zo …',
  boundary:{q:'Waar gaat deze gamevergelijking niet meer op?',options:['Een plant kan alleen werken als een speler op een knop drukt.','De plant gebruikt licht en chemische reacties, geen elektrische craftingmachine.','Een plant kan met extra energie water vervangen.'],correct:1,feedback:['De reacties in een plant hebben geen speler nodig.','De functies komen overeen: grondstoffen, energie en een product. Een blad werkt via chemische reacties.','Ook de plant heeft de benodigde grondstoffen nodig.']}
 },
 build: {
  name:'Bouwen',place:'Bij het bouwen',art:'model',materials:'Losse blokjes',input:'blocks',process:'Samenvoegen',centre:'hands',product:'Bouwwerk',output:'model',energy:'Spierenergie',power:'muscle',
  familiar:{q:'Je bouwt een huisje. Waar komen de blokjes in het huisje vandaan?',options:['Uit je handen.','Ze ontstaan vanzelf.','Uit de losse blokjes die je gebruikt.'],correct:2,feedback:['Je handen voegen de blokjes samen; ze maken geen nieuwe blokjes.','Je gebruikt bestaande blokjes en zet ze anders in elkaar.','De blokjes zijn er al. Door ze anders samen te voegen ontstaat een nieuw bouwwerk.']},
  maps:[
   {q:'Jij gebruikt spierenergie om te bouwen. Welke energie gebruikt de plant?',options:['Spierenergie','Lichtenergie','Warmte uit de aarde'],correct:1,part:'energy',feedback:['Een plant heeft geen spieren. Welke energiebron bereikt zijn bladeren?','De plant gebruikt lichtenergie om stoffen om te zetten.','Voor fotosynthese gebruikt de plant licht, niet warmte uit de aarde.']},
   {q:'Uit welke stoffen haalt de plant de bouwstenen voor glucose?',options:['Water en CO₂','Alleen zonlicht','Alleen aarde'],correct:0,part:'materials',feedback:['De atomen uit water en CO₂ worden anders gecombineerd. Zo ontstaan nieuwe stoffen.','Licht levert energie, geen atomen om glucose van te maken.','De bouwstenen voor glucose komen uit water en CO₂. Aarde is niet de grondstof voor glucose.']},
   {q:'Welk product is hier het bouwwerk van de plant?',options:['Licht','CO₂','Glucose'],correct:2,part:'product',feedback:['Licht levert energie. We zoeken de nieuwe stof.','CO₂ is een grondstof. Wat maakt de plant daarmee?','Glucose is een nieuwe stof, opgebouwd uit bestaande atomen. Bij fotosynthese ontstaat ook zuurstof.']}
  ],
  stem:'Zoals je bestaande blokjes samenvoegt tot een bouwwerk, zo …',
  boundary:{q:'Wat is anders in een plant dan bij het bouwen met blokjes?',options:['In de plant ontstaan atomen uit niets.','Atomen verdwijnen wanneer glucose ontstaat.','Atomen worden via chemische reacties anders verbonden; het zijn geen speelgoedblokjes.'],correct:2,feedback:['De plant gebruikt bestaande atomen uit water en CO₂.','Atomen blijven behouden. Ze worden onderdeel van nieuwe stoffen.','De vergelijking gaat over bestaande bouwstenen opnieuw combineren. Een plant gebruikt daarvoor chemische reacties en lichtenergie.']}
 }
};
pictures.blocks='<g fill="#71a7a0" stroke="#315f60" stroke-width="2"><rect x="-48" y="-26" width="36" height="23" rx="3"/><rect x="12" y="-9" width="36" height="23" rx="3"/><rect x="-32" y="18" width="36" height="23" rx="3"/></g><g fill="#b7d4b6"><ellipse cx="-39" cy="-26" rx="5" ry="3"/><ellipse cx="-23" cy="-26" rx="5" ry="3"/><ellipse cx="21" cy="-9" rx="5" ry="3"/><ellipse cx="37" cy="-9" rx="5" ry="3"/></g>';
pictures.model='<path d="M-41 1 0-37 41 1v43h-82z" fill="#a6c9bd" stroke="#315f60" stroke-width="3"/><path d="M-41 1h82M-41 23h82M0-36v37M-18 1v22M22 1v22M0 23v19" fill="none" stroke="#315f60" stroke-width="2"/><rect x="-10" y="20" width="20" height="22" fill="#f6eed9" stroke="#315f60" stroke-width="2"/>';
pictures.hands='<path d="M-39 28v-39q0-13 10-10V1v-35q8-13 13 0v29-34q9-10 13 2v32-25q9-9 13 4V1l11-7q16-2 11 13L7 47" fill="#e8c6a5" stroke="#ac8666" stroke-width="2"/>';
pictures.muscle='<path d="m-37 28 18-55 24-8 11 14-9 9-16-4-4 24C5-7 35-2 38 20S2 49-37 28" fill="#e8c6a5" stroke="#ac8666" stroke-width="3"/>';

function art(name){return '<svg class="art" viewBox="-65 -70 130 150" aria-hidden="true">'+(pictures[name]||'')+'</svg>';}
function validState(s){
 return s && typeof s==='object' && Number.isInteger(s.step) && s.step>=0 && s.step<=6 &&
 (s.context===null || Object.hasOwn(contexts,s.context)) && (s.step===0 || s.context!==null);
}
if(!presenter){
 try {
  const stored=JSON.parse(localStorage.getItem(STORAGE));
  if(validState(stored)){
   state={...fresh(),...stored};
   state.map=Number.isInteger(state.map)?Math.max(0,Math.min(3,state.map)):0;
   state.transfer=state.transfer===1?1:0;
   state.answers=state.answers&&typeof state.answers==='object'&&!Array.isArray(state.answers)?state.answers:{};
   state.comparison=typeof state.comparison==='string'?state.comparison.slice(0,2000):'';
   state.explanation=typeof state.explanation==='string'?state.explanation.slice(0,2000):'';
   state.model=state.model===true && Boolean(state.explanation.trim());
  }
 } catch {}
}
function save(){if(!presenter){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch{}}}
function navigate(step){state.step=step;save();render();}
function current(){return contexts[state.context];}
function intro(title,subtitle=''){return '<div class="intro"><h1 id="screen-title" tabindex="-1">'+escapeHTML(title)+'</h1>'+(subtitle?'<p>'+escapeHTML(subtitle)+'</p>':'')+'</div>';}
function nav(next='',action='next'){return '<div class="nav"><button class="back" data-action="back">← Terug</button>'+(next?'<button class="primary" data-action="'+action+'">'+escapeHTML(next)+'</button>':'')+'</div>';}
function scene(bio,part=null,night=false,missingCO2=false,showResult=false){
 const c=current(), off=night||missingCO2;
 const energyArt=bio?(night?'moon':'sun'):c.power;
 const input=bio?'matter':c.input, middle=bio?'leaf':c.centre, output=bio?'glucose':c.output;
 const active=p=>part===p?' highlight':'';
 return '<div class="scene"><p class="scene-heading">'+(bio?'In de plant':c.place)+'</p>'+
 '<div class="energy-row"><div class="energy'+active('energy')+(bio&&night?' dim':'')+'">'+art(energyArt)+'<span>'+(bio?(night?'Geen licht':'Licht'):c.energy)+'</span></div><div class="down">↓</div></div>'+
 '<div class="nodes"><div class="node'+active('materials')+(bio&&missingCO2?' no-co2':'')+'">'+art(input)+'<div class="label">'+(bio?(missingCO2?'Water · geen CO₂':'Water + CO₂'):c.materials)+'</div></div><span class="arrow" aria-hidden="true">→</span>'+
 '<div class="node">'+art(middle)+'<div class="label">'+(bio?'In het blad':c.process)+'</div></div><span class="arrow'+(showResult&&off?' dim':'')+'" aria-hidden="true">→</span>'+
 '<div class="node'+active('product')+(showResult&&off?' dim':'')+'">'+art(output)+'<div class="label">'+(bio?'Glucose':c.product)+(bio?'<span class="oxygen">+ zuurstof</span>':'')+'</div></div></div></div>';
}
function pair(part=null){return '<div class="diagram pair" role="group" aria-label="De vergelijking en fotosynthese">'+scene(false,part)+scene(true,part)+'</div>';}
const transferQuestions=[
 {q:'Deze plant staat in het donker. Kan hij nu nieuwe glucose maken?',options:['Ja, want hij heeft water en CO₂.','Nee, de lichtenergie ontbreekt.','Ja, als hij meer water krijgt.'],correct:1,feedback:['Water en CO₂ zijn de grondstoffen. Zonder lichtenergie kan fotosynthese niet doorgaan.','Zonder licht kan de plant geen nieuwe glucose maken door fotosynthese. Eerder gemaakte glucose kan hij wel gebruiken.','Extra water kan lichtenergie niet vervangen.']},
 {q:'Er is licht en water, maar geen CO₂. Kan de plant nu glucose maken?',options:['Nee, er ontbreekt een grondstof.','Ja, zolang het licht sterk genoeg is.','Ja, want water bevat alle bouwstenen.'],correct:0,feedback:['CO₂ is een noodzakelijke grondstof. Meer licht of water vervangt die niet.','Meer energie vervangt geen ontbrekende grondstof. De plant heeft ook CO₂ nodig.','De koolstof in glucose komt uit CO₂. Water alleen bevat niet alle benodigde bouwstenen.']}
];
function questionData(){
 if(state.step===1)return {key:'familiar',q:current().familiar};
 if(state.step===2&&state.map<3)return {key:'map'+state.map,q:current().maps[state.map]};
 if(state.step===3)return {key:'boundary',q:current().boundary};
 if(state.step===4)return {key:'transfer'+state.transfer,q:transferQuestions[state.transfer]};
 return null;
}
function questionHTML(q,key){
 const selected=state.answers[key],answered=Number.isInteger(selected)&&selected>=0&&selected<q.options.length,ok=selected===q.correct;
 return '<div class="question-area"><h2>'+escapeHTML(q.q)+'</h2><div class="options">'+q.options.map((label,i)=>'<button class="option'+(answered&&selected===i?(ok?' correct':' wrong'):'')+'" data-answer="'+i+'"'+(ok?' disabled':'')+'>'+escapeHTML(label)+'</button>').join('')+'</div>'+
 (answered?'<div id="feedback" class="feedback'+(ok?'':' retry')+'" role="status" tabindex="-1">'+escapeHTML(q.feedback[selected])+'</div>':'')+'</div>'+
 nav(ok?nextLabel():'');
}
function nextLabel(){
 if(state.step===1)return 'Vergelijk met de plant →';
 if(state.step===2)return state.map<2?'Verder →':'Leg de vergelijking uit →';
 if(state.step===3)return 'Nu zonder vergelijking →';
 if(state.step===4)return state.transfer===0?'Nog een situatie →':'Leg fotosynthese uit →';
 return 'Verder →';
}
function render(focus=true){
 const part=state.step===2&&state.map<3&&state.answers['map'+state.map]===current()?.maps[state.map].correct?current().maps[state.map].part:null;
 let html='';
 if(state.step===0){
  html='<div class="start">'+intro('Hoe maakt een plant suiker?','Kies een vergelijking die je kent.')+
   '<div class="choices">'+Object.entries(contexts).map(([id,c])=>'<button class="context" data-context="'+id+'">'+art(c.art)+'<span>'+c.name+'</span></button>').join('')+'</div></div>';
 }else if(state.step===1){
  html=intro('Eerst '+current().name.toLowerCase())+'<div class="diagram">'+scene(false)+'</div>'+questionHTML(current().familiar,'familiar');
 }else if(state.step===2&&state.map<3){
  html=intro('Van '+current().name.toLowerCase()+' naar fotosynthese')+pair(part)+questionHTML(current().maps[state.map],'map'+state.map);
 }else if(state.step===2){
  html=intro('Leg de vergelijking uit')+pair()+
   '<div class="writing"><label for="comparison">Maak de zin af: '+escapeHTML(current().stem)+'</label><textarea id="comparison" maxlength="2000" rows="3">'+escapeHTML(state.comparison)+'</textarea><p id="validation" class="validation" role="status" hidden></p></div>'+nav('Verder →','comparison');
 }else if(state.step===3){
  html=intro('Waar stopt de vergelijking?')+
   '<div class="standalone-art" aria-hidden="true">'+art(current().power)+'<span class="versus">≠</span>'+art('sun')+'</div>'+questionHTML(current().boundary,'boundary');
 }else if(state.step===4){
  const q=transferQuestions[state.transfer],answered=Number.isInteger(state.answers['transfer'+state.transfer]);
  html=intro('Wat gebeurt er met de plant?')+'<div class="diagram">'+scene(true,null,state.transfer===0,state.transfer===1,answered)+'</div>'+questionHTML(q,'transfer'+state.transfer);
 }else if(state.step===5){
  html=intro('Leg fotosynthese uit')+
   '<div class="writing"><label for="explanation">Hoe maakt een plant glucose? Gebruik water, CO₂ en licht in je uitleg.</label><textarea id="explanation" maxlength="2000" rows="5">'+escapeHTML(state.explanation)+'</textarea><p id="validation" class="validation" role="status" hidden></p>'+
   (state.model?'<div class="model" id="model"><h2>Vergelijk met jouw uitleg</h2><p>De plant gebruikt lichtenergie om water en CO₂ om te zetten in glucose. Glucose is een suiker waarin energie is opgeslagen. Daarbij ontstaat ook zuurstof.</p><p>Ontbreekt er iets in jouw uitleg? Vul dat hierboven aan.</p></div>':'')+'</div>'+nav(state.model?'Afronden':'Vergelijk mijn uitleg',state.model?'finish':'model');
 }else{
  html=intro('Jouw uitleg van fotosynthese')+'<div class="finish-plant">'+art('tree')+'</div><div class="writing"><p class="finished-explanation">'+escapeHTML(state.explanation)+'</p></div>'+
  '<div class="nav"><button class="back" data-action="edit">Uitleg aanpassen</button><button class="primary" data-action="restart">Andere vergelijking</button></div>';
 }
 $('lesson').innerHTML=html;
 $('progress').textContent=state.step===6?'Afgerond':(state.step+1)+' / 6';
 $('progress').setAttribute('aria-label',state.step===6?'Leerroute afgerond':'Stap '+(state.step+1)+' van 6');
 $('presenter-button').hidden=!presenter;
 if(focus){$('screen-title').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});}
}
function back(){
 if(state.step===2&&state.map>0){state.map--;save();render();return;}
 if(state.step===4&&state.transfer===1){state.transfer=0;save();render();return;}
 if(state.step===3){state.map=3;navigate(2);return;}
 if(state.step===5){state.transfer=1;navigate(4);return;}
 navigate(Math.max(0,state.step-1));
}
function next(){
 const data=questionData();
 if(!data||state.answers[data.key]!==data.q.correct)return;
 if(state.step===2){state.map++;save();render();return;}
 if(state.step===4&&state.transfer===0){state.transfer=1;save();render();return;}
 navigate(state.step+1);
}
function validate(field){
 if(state[field].trim().length>=8)return true;
 $('validation').hidden=false;
 $('validation').textContent='Schrijf eerst een korte uitleg in je eigen woorden.';
 $(field).focus();
 return false;
}
function archive(){
 if(presenter)return;
 try{
  const raw=JSON.parse(localStorage.getItem(STORAGE+'-completed')||'{}');
  const completed=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw:{};
  completed[state.context]={comparison:state.comparison,explanation:state.explanation};
  localStorage.setItem(STORAGE+'-completed',JSON.stringify(completed));
 }catch{}
}
$('lesson').addEventListener('click',event=>{
 const button=event.target.closest('button');
 if(!button)return;
 if(button.dataset.context){state={...fresh(),context:button.dataset.context,step:1};save();render();return;}
 if(button.dataset.answer!==undefined){
  const data=questionData(),index=Number(button.dataset.answer);
  if(!data||state.answers[data.key]===data.q.correct||!Number.isInteger(index)||index<0||index>=data.q.options.length)return;
  state.answers[data.key]=index;save();render(false);$('feedback').focus({preventScroll:true});return;
 }
 switch(button.dataset.action){
  case 'back':back();break;
  case 'next':next();break;
  case 'comparison':if(validate('comparison'))navigate(3);break;
  case 'model':if(validate('explanation')){state.model=true;save();render(false);$('model').scrollIntoView({block:'nearest'});}break;
  case 'finish':if(validate('explanation')){archive();navigate(6);}break;
  case 'edit':navigate(5);break;
  case 'restart':state=fresh();save();render();break;
 }
});
$('lesson').addEventListener('input',event=>{
 const id=event.target.id;
 if(id==='comparison'||id==='explanation'){state[id]=event.target.value;save();if($('validation'))$('validation').hidden=true;}
});
const principles=[
 ['Start bij het leerdoel','De lerende verklaart hoe een plant met lichtenergie water en CO₂ omzet in glucose. De drie startkeuzes ondersteunen hetzelfde begrip.','De keuze verschijnt alleen aan het begin. Daarna volgt de lerende één route.'],
 ['Kies iets bekends','Een bekende hobby is nog geen begrepen vergelijking. Deze vraag controleert eerst of de lerende het relevante mechanisme in de bekende situatie begrijpt.','Geef eens een onjuist antwoord: de app geeft een korte inhoudelijke toelichting.'],
 ['Maak de koppeling expliciet','In beide beelden staan grondstoffen, omzetting en product op dezelfde plaats. Energie komt van boven. Na een goed antwoord lichten de overeenkomstige onderdelen op.','De lerende koppelt zelf en formuleert daarna de overeenkomst in een eigen zin.'],
 ['Benoem de grenzen','Deze vraag maakt duidelijk waar de vergelijking ophoudt. De lerende onderscheidt de functie die overeenkomt van het mechanisme dat verschilt.','Bij koken leveren de kookplaat en de zon beide energie, maar fotosynthese gebruikt lichtenergie en is geen bakken.'],
 ['Keer terug naar de leerstof','De bekende context verdwijnt. De lerende voorspelt nu wat er met een plant gebeurt als licht of CO₂ ontbreekt.','Zo wordt zichtbaar of de koppeling tussen grondstoffen, energie en glucose buiten het voorbeeld begrepen wordt.'],
 ['Laat zelfstandig uitleggen','De lerende schrijft eerst zelf een biologische verklaring. Pas daarna verschijnt een voorbeeld om de eigen uitleg mee te vergelijken en aan te vullen.','De app beoordeelt de vrije tekst niet automatisch. Het leerwerk zit in zelf formuleren, vergelijken en herzien.'],
 ['Bekijk het leerresultaat','De eigen uitleg blijft over. Bespreek bijvoorbeeld welke gedachte uit de vergelijking heeft geholpen.','Deze presentatortoelichting verschijnt uitsluitend via de aparte presentatorlink.']
];
$('presenter-button').addEventListener('click',()=>{
 const p=state.step===2&&state.map===3?['Laat actief vergelijken','De lerende verwoordt zelf hoe de bekende situatie samenhangt met fotosynthese. De beginzin geeft steun; de inhoudelijke koppeling moet de lerende zelf formuleren.','Vraag tijdens de demonstratie welke onderdelen en relaties in de eigen zin terugkomen.']:principles[state.step];
 $('principle-title').textContent=p[0];
 $('principle-body').innerHTML='<p>'+escapeHTML(p[1])+'</p><p>'+escapeHTML(p[2])+'</p>';
 $('pedagogy').showModal();
});
$('close-pedagogy').addEventListener('click',()=>$('pedagogy').close());
render();
