// Checks every tablature example the trainer can generate, and the practice licks: node tools/validate-tab.js js/app.js
// Rules are re-derived here, not taken from the generator: valid strings and frets, notes in order without overlapping,
// joined techniques (hammer-on, pull-off, slide) go the right way on the same string, text tabs line up,
// and the drawing contains no broken numbers.
const fs=require('fs');
const src=fs.readFileSync(process.argv[2]||'js/app.js','utf8').split('\n'),cut=src.findIndex(l=>l.startsWith('function diagram'));
(0,eval)(src.slice(0,cut).join('\n').replace("const $=id=>document.getElementById(id);","")+';globalThis.API={TECH,LICKS,asciiTab,tabSVG,withM,MID,pcOf,closeGeom,closeState,closeDyn,closeStatic,capOf,evLen};');
const{TECH,LICKS,asciiTab,tabSVG,withM,MID}=API;
let sets=0,bad=0;const msgs=new Set();
const fail=(name,m)=>{bad++;msgs.add(name+': '+m)};
function check(name,ev,expectIds){
 sets++;
 const m=withM(ev);
 ev.forEach((e,i)=>{
  if(!(e.s>=0&&e.s<=5))fail(name,'string out of range');
  if(!(e.f>=0&&e.f<=17&&Number.isInteger(e.f)))fail(name,'fret '+e.f);
  if(!(e.d>0&&e.t>=0))fail(name,'bad timing');
  if(i&&e.t+1e-9<ev[i-1].t+ev[i-1].d)fail(name,'notes overlap');
  if(e.x&&['h','p','/','\\'].includes(e.x)){
   const p=ev[i-1];
   if(!p||p.s!==e.s)fail(name,'joined note not on the same string as the one before it');
   else{const up=m[i].m>m[i-1].m;
    if((e.x==='h'||e.x==='/')&&!up)fail(name,e.x+' must go up');
    if((e.x==='p'||e.x==='\\')&&up)fail(name,e.x+' must go down');
    if(m[i].m===m[i-1].m)fail(name,'joined note has the same pitch')}}
  if(e.x==='p'&&i&&ev[i-1].s===e.s&&e.f>ev[i-1].f)fail(name,'pull-off to a higher fret');
  if(e.bend&&![1,2].includes(e.bend))fail(name,'bend size');
  if(e.pb&&![1,2].includes(e.pb))fail(name,'pre-bend size');
  if(e.bend&&e.f+e.bend>22)fail(name,'bend target beyond the neck');
  if(e.nh&&![12,7,5].includes(e.f))fail(name,'harmonic fret '+e.f);
  if(e.tr&&!(e.f2>e.f&&e.f2-e.f<=2))fail(name,'trill interval');
  if(e.x==='dead'&&e.f!==0)fail(name,'dead note carries a fret');
  const nm=m[i].m;if(!(nm>=40&&nm<=100))fail(name,'pitch out of range '+nm);
 });
 const a=asciiTab(ev).split('\n'),strRows=a.filter(l=>/^[EADGBe]\|/.test(l));
 if(strRows.length!==6)fail(name,'text tab needs 6 string lines');
 if(new Set(strRows.map(l=>l.length)).size!==1)fail(name,'text tab lines have different lengths');
 if(strRows.some(l=>!l.endsWith('|')))fail(name,'text tab line is not closed');
 if(ev.some(e=>e.pm)&&!/P\.M\./.test(a[0]))fail(name,'missing P.M. line');
 ev.forEach((e,i)=>{const need=e.x==='dead'?'x':e.nh?'<'+e.f+'>':String(e.f);if(!a.join('\n').includes(need))fail(name,'text tab is missing '+need)});
 const svg=tabSVG(ev);
 if(/NaN|undefined|null/.test(svg))fail(name,'drawing has a broken value');
 for(const tag of ['g','svg','text'])if((svg.match(new RegExp('<'+tag+'[ >]','g'))||[]).length!==(svg.match(new RegExp('</'+tag+'>','g'))||[]).length)fail(name,'unbalanced <'+tag+'>');
 if((svg.match(/class="tn"/g)||[]).length!==ev.length)fail(name,'one number per note expected');
 // the example must actually use the technique it teaches
 if(expectIds){const used=new Set();ev.forEach(e=>{if(e.x==='h')used.add('hammer');if(e.x==='p')used.add('pull');if(e.x==='/')used.add('slideup');if(e.x==='\\')used.add('slidedown');
   if(e.x==='slin'||e.x==='slout')used.add('slideinout');if(e.x==='dead')used.add('dead');if(e.vib)used.add('vib');if(e.bend&&!e.rel)used.add('bend');if(e.pb)used.add('prebend');
   if(e.bend&&e.rel)used.add('bendrel');if(e.pm)used.add('palm');if(e.nh)used.add('harm');if(e.tap)used.add('tap');if(e.tr)used.add('trill')});
  expectIds.forEach(id=>{if(id==='pull2'){if(ev.filter(e=>e.x==='p').length<2)fail(name,'tapping example needs two pull-offs')}else if(!used.has(id))fail(name,'does not use '+id)})}
}

// The close-up of the fretting hand: where the fingers are at every moment.
function checkClose(name,ev){
 const {closeGeom,closeState,closeDyn,closeStatic,capOf,evLen}=API,g=closeGeom(ev),spb=60/70,len=evLen(ev),near=(a,b)=>Math.abs(a-b)<1.5;
 let sawTrillOn=false,sawTrillOff=false;
 for(let b=0;b<=len+0.3;b+=0.05){
  const st=closeState(ev,b,g,spb),dy=closeDyn(g,st);
  if(/NaN|undefined|null|Infinity/.test(JSON.stringify(st)+dy.dots+dy.gh+dy.strs.join()+dy.pk+dy.pm))fail(name,'close-up has a broken value at beat '+b.toFixed(2));
  st.dots.forEach(d=>{
   if(!(d.x>=0&&d.x<=g.W&&d.y>=-30&&d.y<=g.H))fail(name,'a finger is drawn outside the picture at beat '+b.toFixed(2));
   if(!(d.op>=0&&d.op<=1.0001))fail(name,'bad opacity '+d.op);
   if(d.kind==='fret'&&d.x>g.xF(1)-g.cw*0.6&&!(d.lab>=1&&d.lab<=4))fail(name,'finger number missing');
  });
  const te=ev.find(e=>e.tr);if(te&&b>te.t+0.05&&b<te.t+te.d-0.1){const x2=g.xF(te.f2),y=g.yS(te.s),on=st.dots.some(d=>near(d.x,x2)&&Math.abs(d.y-y)<3&&d.op>0.5);if(on)sawTrillOn=true;else sawTrillOff=true}
 }
 if(ev.some(e=>e.tr)&&!(sawTrillOn&&sawTrillOff))fail(name,'trill should flip between the two fingers');
 const idle=g.chains[0].map((e,j)=>capOf(g.chains[0],j,g)).join(' ');if(idle.length<15)fail(name,'caption too short');
 if(!closeStatic(g).includes('id="cs5"'))fail(name,'neck is missing a string');
 ev.forEach((e,i)=>{
  const at=(b)=>closeState(ev,b,g,spb),y=g.yS(e.s),onS=st=>st.dots.filter(d=>Math.abs(d.y-y)<30),later=ev.slice(i+1).find(q=>q.t>e.t);
  const settle=e.t+0.3/spb,free=!later||later.t>settle+0.05;
  if(e.x==='h'&&free){const st=at(settle);if(!onS(st).some(d=>d.kind==='fret'&&near(d.x,g.xF(e.f))&&d.op>0.5))fail(name,'hammer-on: no finger on the new fret');
   const pv=ev[i-1];if(pv&&pv.f>0&&!onS(st).some(d=>near(d.x,g.xF(pv.f))))fail(name,'hammer-on: the first finger should stay down')}
  if(e.x==='p'&&free){const st=at(settle),pv=ev[i-1];
   if(onS(st).some(d=>d.kind==='fret'&&d.x>g.xF(e.f)+2&&d.op>0.05))fail(name,'pull-off: the upper finger should have lifted');
   if(e.f>0&&!onS(st).some(d=>near(d.x,g.xF(e.f))&&d.op>0.5))fail(name,'pull-off: the lower finger should be down');
   if(pv&&!onS(at(pv.t+0.1/spb)).some(d=>d.kind==='fret'&&e.f>0&&near(d.x,g.xF(e.f))))fail(name,'pull-off: the lower finger should be ready before the pull')}
  if((e.x==='/'||e.x==='\\')&&free){const st=at(e.t+0.3/spb),pv=ev[i-1];
   if(!onS(st).some(d=>near(d.x,g.xF(e.f))&&d.op>0.5))fail(name,'slide: finger should end on the target fret');
   if(onS(st).some(d=>near(d.x,g.xF(pv.f))&&d.op>0.1))fail(name,'slide: no finger should be left behind')}
  if(e.bend){const st=at(e.t+Math.min(e.d*0.6,1.2)),v=st.strs[e.s];if(!(v&&v.dy<-8)&&!e.rel)fail(name,'bend: the string should be pushed up')}
  if(e.pb){const st=at(e.t+0.02),v=st.strs[e.s];if(!(v&&v.dy<-8))fail(name,'pre-bend: the string should already be bent at the pick')}
  if(e.pb&&e.rel){const st=at(e.t+e.d*0.95),v=st.strs[e.s];if(v&&v.dy<-4)fail(name,'pre-bend release: the string should be back down')}
  if(e.x==='dead'){if(!at(e.t+0.2).dots.some(d=>d.kind==='dead'))fail(name,'dead note: needs the flat finger')}
  if(e.nh){if(!at(e.t+0.05).dots.some(d=>d.kind==='harm'))fail(name,'harmonic: needs the light touch')}
  if(e.tap){if(!at(e.t+0.05).dots.some(d=>d.kind==='tap'))fail(name,'tap: needs the tapping finger');if(at(e.t+0.05).picks.some(q=>q.s===e.s&&q.op>0))fail(name,'tap: no pick')}
  if(e.pm&&!at(e.t+0.05).palms.length)fail(name,'palm mute: needs the palm');
  if(!e.pm&&i&&ev[i-1].pm&&free&&at(e.t+0.3).palms.length)fail(name,'palm mute should lift');
  const legato=['h','p','/','\\'].includes(e.x),pk=at(e.t+0.04/spb).picks.some(q=>q.s===e.s&&q.op>0.3);
  if(legato&&pk)fail(name,'legato note must not show a pick');
  if(!legato&&!e.tap&&!pk)fail(name,'picked note must show the pick');
 });
}
for(const t of TECH){for(let k=0;k<400;k++){const ev=t.gen();check('technique '+t.id,ev,t.id==='tap'?['tap','pull','pull2']:[t.id]);checkClose('close-up '+t.id,ev)}
 if(!t.name||!t.what||t.how.length<3||!t.hear||!t.slip||!t.sym||!t.txt)fail('technique '+t.id,'missing text')}
for(const l of LICKS){check('lick '+l.id,l.ev,l.techs);checkClose('close-up lick '+l.id,l.ev)}
console.log('techniques',TECH.length,'| licks',LICKS.length,'| examples checked',sets,'| problems',bad);
[...msgs].slice(0,12).forEach(m=>console.log(' -',m));
process.exit(bad?1:0);
