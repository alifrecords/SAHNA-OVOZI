(function(){
'use strict';
/* Sahna Ovozi — UZ / RU / EN tarjimon.
   Dastur matnlari o'zbekcha yoziladi; bu qatlam DOM'dagi matn, title, aria-label,
   placeholder va document.title ni tanlangan tilga real vaqtda o'giradi. */
const D=/*__I18N__*/;
const LANGS=['uz','ru','en'],KEY='sahnaOvozi.lang';
let L='uz';
try{const s=localStorage.getItem(KEY);if(LANGS.includes(s))L=s;}catch(e){}
try{const q=new URLSearchParams(location.search).get('lang');if(LANGS.includes(q))L=q;}catch(e){}
const idx=()=>L==='ru'?0:1;
const LET=/[A-Za-zЀ-ӿ]/;
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const W="A-Za-z0-9\\u0400-\\u04FF'ʻʼ’";
const phr=Object.keys(D).filter(k=>k.trim().length>=3&&!(D[k][0]===k&&D[k][1]===k)).sort((a,b)=>b.length-a.length);
const PHR=new RegExp('(?<!['+W+'])(?:'+phr.map(esc).join('|')+')(?!['+W+'])','g');
function pl(n,a,b,c){n=Math.abs(n)%100;const m=n%10;return n>10&&n<20?c:m===1?a:m>=2&&m<=4?b:c;}
const CNT={
 'ovoz fayli':[n=>pl(n,'аудиофайл','аудиофайла','аудиофайлов'),n=>n===1?'audio file':'audio files'],
 "o'z fayli":[n=>pl(n,'свой файл','своих файла','своих файлов'),n=>n===1?'own file':'own files'],
 'ovoz':[n=>pl(n,'звук','звука','звуков'),n=>n===1?'sound':'sounds'],
 'qatlam':[n=>pl(n,'слой','слоя','слоёв'),n=>n===1?'layer':'layers'],
 'fayl':[n=>pl(n,'файл','файла','файлов'),n=>n===1?'file':'files'],
 'sample':[n=>pl(n,'сэмпл','сэмпла','сэмплов'),n=>n===1?'sample':'samples'],
 'cue':[()=>'cue',n=>n===1?'cue':'cues'],
 'loyiha':[n=>pl(n,'проект','проекта','проектов'),n=>n===1?'project':'projects']
};
const CNTRE=/(\d+) ta (ovoz fayli|o'z fayli|ovoz|qatlam|fayl|sample|cue|loyiha)(?!['A-Za-z])/g;
/* butun qatorga mos dinamik shakllar: [regex, ru, en] — $1 o'zi ham tarjima qilinadi */
const PAT=[
 [/^(.+) ni tinglash$/,'Прослушать: $1','Preview: $1'],
 [/^(.+) ni to'xtatish$/,'Остановить: $1','Stop: $1'],
 [/^(.+) ni tahrirlash$/,'Изменить $1','Edit $1'],
 [/^(.+) ni pastga$/,'$1 вниз','Move $1 down'],
 [/^(.+) ni yuqoriga$/,'$1 вверх','Move $1 up'],
 [/^(.+) uchun o'z faylingizni yuklash$/,'Загрузить свой файл: $1','Load your own file: $1'],
 [/^(.+) — pauza \/ davom$/,'$1 — пауза / продолжить','$1 — pause / resume'],
 [/^(.+) — to'xtatish$/,'$1 — стоп','$1 — stop'],
 [/^(.+) darajasi$/,'Уровень: $1','$1 level'],
 [/^(.+) ovozini o'chirish$/,'Выключить звук: $1','Mute $1'],
 [/^(.+) ovozini yoqish$/,'Включить звук: $1','Unmute $1'],
 [/^SFX tugmasi (\d+)$/,'SFX-кнопка $1','SFX pad $1'],
 [/^Avval (.+) cue'larini o'zgartiring$/,'Сначала измените cue $1','Change cues $1 first'],
 [/^“(.+)” asl holiga qaytdi$/,'«$1» возвращён к исходному','“$1” restored to original'],
 [/^“(.+)” hozir yangramayapti$/,'«$1» сейчас не звучит','“$1” is not playing now'],
 [/^“(.+)” uchun ovoz fayli yo'q — Tahrirlash rejimida ✎ orqali biriktiring\.$/,'У «$1» нет аудиофайла — привяжите через ✎ в режиме редактирования.','“$1” has no audio file — attach one via ✎ in edit mode.'],
 [/^(\d+)-parda$/,'Акт $1','Act $1'],
 [/^(\d+)-ko'rinish: (.+)$/,'Картина $1: $2','Scene $1: $2']
];
const cache={ru:new Map(),en:new Map()};
function core(s,depth){
 const i=idx();
 const d=D[s];if(d)return d[i];
 if(depth<3)for(const [re,ru,en] of PAT){const m=s.match(re);if(m){return (i?en:ru).replace(/\$(\d)/g,(_,n)=>core(m[+n],depth+1));}}
 let out=s.replace(CNTRE,(_,n,w)=>n+' '+CNT[w][i](+n));
 out=out.replace(/(\d+)-parda/g,(_,n)=>(i?'Act ':'акт ')+n);
 out=out.replace(PHR,m=>{const v=D[m];return v?v[i]:m;});
 return out;
}
function tr(s){
 if(L==='uz'||!s||!LET.test(s))return s;
 const c=cache[L];let r=c.get(s);if(r!==undefined)return r;
 const m=s.match(/^(\s*)([\s\S]*?)(\s*)$/);
 r=m[1]+core(m[2],0)+m[3];
 if(c.size>6000)c.clear();c.set(s,r);return r;
}
/* ---- DOM ---- */
const TXT=new WeakMap(),ATR=new WeakMap();
const ATTRS=['title','aria-label','placeholder','alt'];
const SKIP=/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT|CODE)$/;
function skipEl(el){for(let e=el;e&&e.nodeType===1;e=e.parentElement){if(SKIP.test(e.tagName)||e.hasAttribute('data-notr'))return true;}return false;}
function doText(n){
 const cur=n.data;const rec=TXT.get(n);
 const src=rec&&cur===rec.t?rec.o:cur;
 if(!LET.test(src)){if(rec)TXT.delete(n);return;}
 if(n.parentElement&&skipEl(n.parentElement))return;
 const out=tr(src);TXT.set(n,{o:src,t:out});if(out!==cur)n.data=out;
}
function doAttr(el,a){
 const cur=el.getAttribute(a);if(cur==null)return;
 let m=ATR.get(el);if(!m){m={};ATR.set(el,m);}
 const rec=m[a];const src=rec&&cur===rec.t?rec.o:cur;
 if(!LET.test(src))return;
 const out=tr(src);m[a]={o:src,t:out};if(out!==cur)el.setAttribute(a,out);
}
function walk(root){
 if(!root)return;
 if(root.nodeType===3){doText(root);return;}
 if(root.nodeType!==1&&root.nodeType!==11)return;
 if(root.nodeType===1){if(skipEl(root))return;ATTRS.forEach(a=>root.hasAttribute(a)&&doAttr(root,a));}
 const tw=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{acceptNode:n=>n.nodeType===1&&(SKIP.test(n.tagName)||n.hasAttribute('data-notr'))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
 let n;while((n=tw.nextNode())){if(n.nodeType===3)doText(n);else ATTRS.forEach(a=>n.hasAttribute(a)&&doAttr(n,a));}
}
let titleSrc=null,titleOut=null;
function doTitle(){const cur=document.title;const src=cur===titleOut&&titleSrc!=null?titleSrc:cur;const out=tr(src);titleSrc=src;titleOut=out;if(out!==cur)document.title=out;}
const mo=new MutationObserver(list=>{
 for(const r of list){
  if(r.type==='characterData')doText(r.target);
  else if(r.type==='attributes')doAttr(r.target,r.attributeName);
  else r.addedNodes.forEach(walk);
 }
 if(document.title!==titleOut)doTitle();
});
function start(){
 walk(document.body);doTitle();
 mo.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:ATTRS});
 syncUI();
}
function syncUI(){
 document.documentElement.lang=L;
 document.querySelectorAll('select.langSel').forEach(s=>{if(s.value!==L)s.value=L;});
 document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===L?'true':'false'));
}
function setLang(l){
 if(!LANGS.includes(l)||l===L)return;
 L=l;try{localStorage.setItem(KEY,l);}catch(e){}
 walk(document.body);doTitle();syncUI();
 try{window.azNative&&window.azNative.setLang&&window.azNative.setLang(l);}catch(e){}
 window.dispatchEvent(new CustomEvent('az-lang',{detail:l}));
}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-lang]');if(b)setLang(b.dataset.lang);});
document.addEventListener('change',e=>{const s=e.target;if(s&&s.classList&&s.classList.contains('langSel'))setLang(s.value);});
window.AZ_I18N={tr,setLang,get lang(){return L;},loc:()=>L==='ru'?'ru-RU':L==='en'?'en-GB':'uz-UZ'};
try{window.azNative&&window.azNative.setLang&&window.azNative.setLang(L);}catch(e){}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
