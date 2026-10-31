const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function page(response, ok = true) {
  const elements = {};
  for(const id of ['btnToday','btnGetImg','date','prev-btn','next-btn','todaysImg','todaysVid','title','explanation','video-wrapper','onboarding']) elements[id] = {value:'',style:{},classList:{toggle() {},add(){},remove(){}},addEventListener(event,fn){this[event]=fn;},removeAttribute(key){delete this[key];},scrollIntoView(){}};
  let calls = [];
  const context = vm.createContext({document:{getElementById:id=>elements[id],querySelector:()=>elements.date, createElement:()=>({set innerHTML(value){this.textContent=value.replace(/<[^>]*>/g,'').replace(/&amp;/g,'&');}})},Date,Datepicker:function(){},URL,AbortController,console,setTimeout:fn=>fn(),alert:()=>{},fetch:async url=>{calls.push(url);return {ok,json:async()=>response};}});
  vm.runInContext(fs.readFileSync('js/main.js','utf8'),context);
  return {elements,calls,context};
}
test('today action synchronizes selected date and renders HTML explanation as text',async()=>{const p=page({title:'Aurora',date:new Date().toISOString().slice(0,10),media_type:'image',url:'https://assets.science.nasa.gov/a.jpg',explanation:'<strong>Explanation:</strong> Ice &amp; stars',explanation_format:'html'}); p.elements.date.value='2025-01-01';await p.elements.btnToday.click(); assert.equal(p.elements.date.value,new Date().toISOString().slice(0,10));assert.equal(p.elements.explanation.textContent,'Ice & stars');assert.equal(p.elements.todaysImg.src,'https://assets.science.nasa.gov/a.jpg');});
test('HTTP failure does not render an undefined image',async()=>{const p=page({error:'No picture available'},false);await p.elements.btnGetImg.click();assert.equal(p.elements.todaysImg.src,undefined);assert.match(p.elements.explanation.textContent,/No picture available/);});
test('video hides image and uses iframe URL',async()=>{const p=page({title:'Launch',date:'2025-01-05',media_type:'video',url:'https://www.youtube.com/embed/example',explanation:'Launch'});await p.elements.btnGetImg.click();assert.equal(p.elements.todaysVid.src,'https://www.youtube.com/embed/example');assert.equal(p.elements.todaysImg.style.display,'none');});
test('previous and next fetch selected dates and clamp archive start',async()=>{const p=page({title:'Image',media_type:'image',url:'https://assets.science.nasa.gov/a.jpg'});p.elements.date.value='2025-01-02';await p.elements['prev-btn'].click();assert.match(p.calls.at(-1),/date=2025-01-01/);await p.elements['next-btn'].click();assert.match(p.calls.at(-1),/date=2025-01-02/);p.elements.date.value='1995-06-16';await p.elements['prev-btn'].click();assert.equal(p.elements.date.value,'1995-06-16');});
