const svg = d3.select('#map');
const mapEl = document.getElementById('map');
const hintEl = document.getElementById('hint');
const inspEl = document.getElementById('inspBody');

const NM_R = 3440.065;
let W = 0, H = 0;

const gViewport = svg.append('g').attr('class','viewport');
const gLand   = gViewport.append('g').attr('class','lands');
const gRoutes = gViewport.append('g').attr('class','routes');
const gRLab   = gViewport.append('g').attr('class','rlabels');
const gPoints = gViewport.append('g').attr('class','points');
const gOverlay = svg.append('g').attr('class','overlay');

let seaRect = svg.insert('rect', ':first-child')
  .attr('class','sea').attr('x',0).attr('y',0)
  .attr('fill','var(--sea)');

const state = {
  points: [],
  segments: [],
  counter: 1,
  title: ['МАРШРУТ №1','НАЗВАНИЕ ПУТЕШЕСТВИЯ'],
  showTitle: true,
  showCompass: true,
  sea: '#ffffff',
  land: '#d6d5d1',
  pointR: 11,
  lineStyle: 'dotted',
  projName: 'naturalEarth1'
};
let tool = 'select';
let selected = null;
let connectFrom = null;
let uid = 1;
const nid = () => 'e'+(uid++);

let projection, path, transform = d3.zoomIdentity;

function makeProjection(name){
  const fns = {naturalEarth1:d3.geoNaturalEarth1, equalEarth:d3.geoEqualEarth,
               mercator:d3.geoMercator, orthographic:d3.geoOrthographic};
  let p = (fns[name]||d3.geoNaturalEarth1)();
  const pad = 12;
  if(name==='orthographic'){
    p.rotate([-10,-25]).clipAngle(90).fitExtent([[pad,pad],[W-pad,H-pad]],{type:'Sphere'});
  } else {
    p.fitExtent([[pad,pad],[W-pad,H-pad]],{type:'Sphere'});
  }
  return p;
}

function setSize(){
  const r = mapEl.getBoundingClientRect();
  W = r.width; H = r.height;
  svg.attr('viewBox',`0 0 ${W} ${H}`);
  seaRect.attr('width',W).attr('height',H);
  projection = makeProjection(state.projName);
  path = d3.geoPath(projection);
  drawAll();
  layoutOverlay();
}

const zoom = d3.zoom().scaleExtent([1,40])
  .on('start',()=>{ if(tool==='select') mapEl.classList.add('grabbing'); })
  .on('zoom',(e)=>{ transform = e.transform; applyTransform(); if(transform.k>=HI_ZOOM) loadHiRes(); })
  .on('end',()=>{ mapEl.classList.remove('grabbing'); });
const defaultZoomFilter = zoom.filter();
svg.call(zoom).on('dblclick.zoom',null);

function applyTransform(){
  gViewport.attr('transform',transform);
  const k = transform.k;
  gPoints.selectAll('.marker').attr('transform', d=>{
    const p = projection(d.ll); return `translate(${p[0]},${p[1]}) scale(${1/k})`;
  });
  gRLab.selectAll('.distg').attr('transform', d=> distTransform(d, k));
}

function drawAll(){ drawLand(); drawRoutes(); drawPoints(); applyTransform(); }

// Базовый слой суши (110m) — мгновенный старт. Детальный (10m) докружается лениво при зуме.
let landFeatures = WORLD.features;
let hiResState = 'idle'; // idle | loading | ready
const HI_ZOOM = 2.5;     // порог приближения, после которого нужна детализация

// Страховка: полигон с неправильной обмоткой d3 трактует как «вся сфера»
// и заливает карту целиком. Развернём такие кольца (area внешнего кольца > 2π).
function fixWinding(features){
  const TWO_PI = 2*Math.PI;
  for(const f of features){
    const g = f.geometry;
    const polys = g.type==='Polygon' ? [g.coordinates]
                : g.type==='MultiPolygon' ? g.coordinates : [];
    for(const poly of polys){
      if(d3.geoArea({type:'Polygon',coordinates:[poly[0]]}) > TWO_PI){
        for(const ring of poly) ring.reverse();
      }
    }
  }
  return features;
}

// Собираем детальный слой: береговые линии 10m + локальные острова из OSM
// (по регионам — Таиланд, Эгейское море). Каждый источник опционален.
function buildHiResFeatures(){
  let feats = [];
  if(window.WORLD_HI_TOPO){
    const t = window.WORLD_HI_TOPO;
    feats = feats.concat(topojson.feature(t, t.objects.countries).features);
  }
  if(window.WORLD_ISLANDS_TOPOS){
    for(const t of window.WORLD_ISLANDS_TOPOS){
      feats = feats.concat(topojson.feature(t, t.objects.islands).features);
    }
  }
  return fixWinding(feats);
}

function applyHiResLand(){
  try{
    landFeatures = buildHiResFeatures();
    drawLand();
  }catch(e){ console.warn('hi-res land failed', e); }
}

function loadScript(src){
  return new Promise((res, rej)=>{
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

function loadHiRes(){
  if(hiResState !== 'idle') return;
  hiResState = 'loading';
  loadScript('js/world-hi.js')
    .then(()=>{ applyHiResLand(); return loadScript('js/islands.js'); }) // берега 10m сразу
    .then(()=>{ applyHiResLand(); hiResState = 'ready'; })               // затем острова OSM
    .catch(()=>{ hiResState = window.WORLD_HI_TOPO ? 'ready' : 'idle'; });
}

function drawLand(){
  seaRect.attr('fill',state.sea);
  document.documentElement.style.setProperty('--land',state.land);
  const u = gLand.selectAll('path').data(landFeatures);
  u.enter().append('path').attr('class','country')
    .merge(u).attr('d',path);
  u.exit().remove();
}

function ptById(id){ return state.points.find(p=>p.id===id); }

function drawRoutes(){
  const segs = state.segments.filter(s=>ptById(s.a)&&ptById(s.b));
  const data = segs.map(s=>({s, a:ptById(s.a).ll, b:ptById(s.b).ll}));
  const u = gRoutes.selectAll('g.routeg').data(data, d=>d.s.id);
  const en = u.enter().append('g').attr('class','routeg');
  en.append('path').attr('class','route-hit');
  en.append('path').attr('class','vis');
  const all = en.merge(u);
  all.select('.route-hit')
     .attr('d', d=> path({type:'LineString',coordinates:[d.a,d.b]}))
     .on('click',(e,d)=>{ e.stopPropagation(); onSegment(d.s.id); });
  all.select('.vis')
     .attr('class','vis route '+state.lineStyle)
     .attr('vector-effect','non-scaling-stroke')
     .attr('d', d=> path({type:'LineString',coordinates:[d.a,d.b]}));
  u.exit().remove();
  drawRouteLabels(segs);
}

function segDistanceNM(s){
  const a=ptById(s.a).ll, b=ptById(s.b).ll;
  return d3.geoDistance(a,b)*NM_R;
}
function distText(s){
  if(!s.auto && s.dist!=null) return s.dist;
  const nm = segDistanceNM(s);
  return nm.toLocaleString('ru-RU',{maximumFractionDigits:1})+' nm';
}
function distTransform(d, k){
  const a=ptById(d.s.a).ll, b=ptById(d.s.b).ll;
  const mid = projection(d3.geoInterpolate(a,b)(0.5));
  let ang=0;
  if(d.s.follow){
    const pa=projection(a), pb=projection(b);
    ang = Math.atan2(pb[1]-pa[1],pb[0]-pa[0])*180/Math.PI;
    if(ang>90) ang-=180; if(ang<-90) ang+=180;
  }
  return `translate(${mid[0]},${mid[1]}) scale(${1/k}) rotate(${ang})`;
}
function drawRouteLabels(segs){
  const data = segs.filter(s=>s.showLabel!==false).map(s=>({s}));
  const u = gRLab.selectAll('g.distg').data(data, d=>d.s.id);
  const en = u.enter().append('g').attr('class','distg');
  en.append('text').attr('class','dist').attr('text-anchor','middle').attr('dy','-4');
  const all = en.merge(u);
  all.select('text').text(d=>distText(d.s));
  u.exit().remove();
  const k = transform.k;
  all.attr('transform', d=> distTransform(d, k));
}

function drawPoints(){
  const u = gPoints.selectAll('g.marker').data(state.points, d=>d.id);
  const en = u.enter().append('g').attr('class','marker');
  en.append('rect').attr('class','pill');
  en.append('circle').attr('class','dot');
  en.append('text').attr('class','num');
  en.append('text').attr('class','cap');
  const all = en.merge(u);

  all.each(function(d){
    const g = d3.select(this);
    const r = state.pointR;
    const label = d.label||'';
    const wide = label.length>2 || label.includes('/');
    const dot = g.select('.dot'), pill=g.select('.pill');
    if(wide){
      const w = Math.max(r*2, 9*label.length+14);
      pill.attr('rx',r).attr('ry',r).attr('x',-w/2).attr('y',-r).attr('width',w).attr('height',r*2).style('display',null);
      dot.style('display','none');
    } else {
      dot.attr('r',r).style('display',null);
      pill.style('display','none');
    }
    g.select('.num').text(label).attr('x',0).attr('y',0);
    const cap = g.select('.cap').text(d.caption||'');
    const off = (wide? Math.max(r, (9*label.length+14)/2):r)+7;
    const side = d.side||'right';
    if(!d.caption){ cap.text(''); }
    else if(side==='right'){ cap.attr('x',off).attr('y',0).attr('text-anchor','start'); }
    else if(side==='left'){ cap.attr('x',-off).attr('y',0).attr('text-anchor','end'); }
    else if(side==='top'){ cap.attr('x',0).attr('y',-r-12).attr('text-anchor','middle'); }
    else { cap.attr('x',0).attr('y',r+12).attr('text-anchor','middle'); }
  });

  all.on('click',(e,d)=>{ e.stopPropagation(); onPoint(d.id); })
     .call(d3.drag()
        .filter(()=>tool==='select')
        .on('start',function(){ d3.select(this).raise(); })
        .on('drag',function(e,d){
           const lp = pointerToLL(e.sourceEvent);
           if(lp){ d.ll=lp; updateForPointMove(d); }
        })
        .on('end',()=>{ drawRoutes(); }));

  gPoints.selectAll('.selring').remove();
  if(selected && selected.type==='point'){
    const d = ptById(selected.id);
    if(d){
      const r = state.pointR;
      const label=d.label||''; const wide=label.length>2||label.includes('/');
      const rr = (wide? Math.max(r,(9*label.length+14)/2):r)+5;
      const mk = gPoints.selectAll('.marker').filter(x=>x.id===d.id);
      mk.append('circle').attr('class','selring').attr('r',rr);
    }
  }
  if(connectFrom){
    const mk = gPoints.selectAll('.marker').filter(x=>x.id===connectFrom);
    mk.append('circle').attr('class','fromring').attr('r',state.pointR+5);
  }
  u.exit().remove();
  applyTransform();
}

function updateForPointMove(d){
  const k=transform.k;
  gPoints.selectAll('.marker').filter(x=>x.id===d.id)
    .attr('transform',()=>{const p=projection(d.ll);return `translate(${p[0]},${p[1]}) scale(${1/k})`;});
  drawRoutes();
}

function layoutOverlay(){
  gOverlay.selectAll('*').remove();
  if(state.showTitle){
    const t = gOverlay.append('g');
    const x = W-26;
    t.append('text').attr('class','title-t').attr('x',x).attr('y',34)
      .attr('font-size',15).text(state.title[0]||'');
    t.append('text').attr('class','title-t').attr('x',x).attr('y',54)
      .attr('font-size',12).attr('opacity',.85).text(state.title[1]||'');
  }
  if(state.showCompass){
    const c = gOverlay.append('g').attr('transform',`translate(40,${H-58})`);
    c.append('text').attr('x',0).attr('y',-6).attr('text-anchor','middle')
      .attr('font-size',16).attr('font-weight',800).attr('fill','var(--ink)').text('N');
    c.append('path').attr('d','M0,2 L11,40 L0,30 L-11,40 Z').attr('fill','var(--ink)');
    c.append('path').attr('d','M0,30 L11,40 L0,2').attr('fill','#fff').attr('opacity',.0);
  }
}

function pointerToLL(ev){
  const r = mapEl.getBoundingClientRect();
  const mx = ev.clientX-r.left, my=ev.clientY-r.top;
  const inv = transform.invert([mx,my]);
  const ll = projection.invert(inv);
  if(!ll || isNaN(ll[0])||isNaN(ll[1])) return null;
  return ll;
}

seaRect.on('click',function(ev){
  if(tool==='point'){
    const ll = d3.pointer(ev, mapEl);
    const inv = transform.invert(ll);
    const lp = projection.invert(inv);
    if(!lp||isNaN(lp[0])) return;
    addPoint(lp);
  } else if(tool==='select' || tool==='connect'){
    selectNone();
    connectFrom=null; drawPoints(); renderInspector(); updateHint();
  }
});

function addPoint(ll){
  const p = {id:nid(), ll, label:String(state.counter++), caption:'', side:'right'};
  state.points.push(p);
  drawPoints();
  selectThing('point',p.id);
}
function onPoint(id){
  if(tool==='delete'){ deletePoint(id); return; }
  if(tool==='connect'){
    if(connectFrom===null){ connectFrom=id; drawPoints(); updateHint(); return; }
    if(connectFrom!==id){ addSegment(connectFrom,id); }
    connectFrom=null; drawPoints(); updateHint(); return;
  }
  selectThing('point',id);
}
function onSegment(id){
  if(tool==='delete'){ deleteSegment(id); return; }
  selectThing('segment',id);
}
function addSegment(a,b){
  const exists = state.segments.find(s=>(s.a===a&&s.b===b)||(s.a===b&&s.b===a));
  if(exists){ selectThing('segment',exists.id); return; }
  const s = {id:nid(), a, b, dist:null, auto:true, showLabel:true, follow:true};
  state.segments.push(s);
  drawRoutes();
  selectThing('segment',s.id);
}
function deletePoint(id){
  state.points = state.points.filter(p=>p.id!==id);
  state.segments = state.segments.filter(s=>s.a!==id&&s.b!==id);
  if(selected&&selected.id===id){ selected=null; closeSheet(); }
  drawPoints(); drawRoutes(); renderInspector();
}
function deleteSegment(id){
  state.segments = state.segments.filter(s=>s.id!==id);
  if(selected&&selected.id===id){ selected=null; closeSheet(); }
  drawRoutes(); renderInspector();
}
function selectThing(type,id){ selected={type,id}; drawPoints(); renderInspector(); openSheet(); }
function selectNone(){ selected=null; closeSheet(); }

const inspectorEl = document.getElementById('inspector');
function openSheet(){ inspectorEl.classList.add('open'); document.body.classList.add('sheet-open'); }
function closeSheet(){ inspectorEl.classList.remove('open'); document.body.classList.remove('sheet-open'); }

document.getElementById('tools').addEventListener('click',e=>{
  const b=e.target.closest('.tool'); if(!b) return; setTool(b.dataset.tool);
});
function setTool(t){
  tool=t; connectFrom=null;
  document.querySelectorAll('.tool').forEach(x=>x.classList.toggle('active',x.dataset.tool===t));
  mapEl.classList.toggle('adding',t==='point');
  mapEl.classList.toggle('connecting',t==='connect');
  mapEl.classList.toggle('deleting',t==='delete');
  if(t==='select'){ svg.call(zoom.filter(defaultZoomFilter)); }
  else { svg.call(zoom.filter(ev=>ev.type==='wheel'||(ev.touches&&ev.touches.length>1))); }
  drawPoints(); updateHint();
}

const HINTS = {
  select:'Тяните карту мышью · колесо — масштаб · кликните точку или линию, чтобы изменить',
  point:'Кликните по карте, чтобы поставить точку',
  connect:'Кликните первую точку, затем вторую — между ними появится пунктир с дистанцией',
  delete:'Кликайте по точкам или линиям, чтобы удалить'
};
function updateHint(){
  let h = HINTS[tool];
  if(tool==='connect'&&connectFrom) h='Теперь кликните вторую точку';
  hintEl.textContent=h;
}

function renderInspector(){
  if(selected&&selected.type==='point') return inspPoint(ptById(selected.id));
  if(selected&&selected.type==='segment') return inspSegment(state.segments.find(s=>s.id===selected.id));
  inspMap();
}

function inspMap(){
  const styBtn = (v,cur)=>`<button class="${v===cur?'on':''}" data-ls="${v}">${v==='dotted'?'точки':'тире'}</button>`;
  const seaSw = ['#ffffff','#eef4f7','#e8f0ee','#f4f1ea'];
  const landSw = ['#d6d5d1','#c9c8c3','#dfe0db','#cfd8cf','#e6ded2'];
  inspEl.innerHTML = `
    <div class="insp-head">Карта · постер <span class="count">${state.points.length} точек</span></div>
    <div class="card">
      <h3>Заголовок</h3>
      <div class="field"><label>Строка 1</label><input id="t0" type="text" value="${esc(state.title[0])}"></div>
      <div class="field"><label>Строка 2</label><input id="t1" type="text" value="${esc(state.title[1])}"></div>
      <div class="field toggle">Показывать заголовок <button class="switch ${state.showTitle?'on':''}" id="tgT"></button></div>
    </div>
    <div class="card">
      <h3>Стиль</h3>
      <div class="field"><label>Цвет моря</label><div class="swatches" id="seaSw">
        ${seaSw.map(c=>`<div class="sw ${c===state.sea?'on':''}" style="background:${c}" data-c="${c}"></div>`).join('')}</div></div>
      <div class="field"><label>Цвет суши</label><div class="swatches" id="landSw">
        ${landSw.map(c=>`<div class="sw ${c===state.land?'on':''}" style="background:${c}" data-c="${c}"></div>`).join('')}</div></div>
      <div class="field"><label>Линии маршрута</label><div class="seg" id="lsSeg">${styBtn('dotted',state.lineStyle)}${styBtn('dashed',state.lineStyle)}</div></div>
      <div class="field"><label>Размер точек · ${state.pointR}px</label>
        <div class="range"><input type="range" id="pr" min="7" max="18" value="${state.pointR}"></div></div>
      <div class="field toggle">Компас <button class="switch ${state.showCompass?'on':''}" id="tgC"></button></div>
    </div>
    <div class="empty">Инструменты сверху: <b>Точка</b> — поставить, <b>Линия</b> — соединить, <b>Выбрать</b> — двигать и редактировать. Клавиши <span class="kbd">V</span> <span class="kbd">P</span> <span class="kbd">L</span> <span class="kbd">D</span>.</div>
  `;
  byId('t0').oninput=e=>{state.title[0]=e.target.value;layoutOverlay();};
  byId('t1').oninput=e=>{state.title[1]=e.target.value;layoutOverlay();};
  byId('tgT').onclick=()=>{state.showTitle=!state.showTitle;layoutOverlay();renderInspector();};
  byId('tgC').onclick=()=>{state.showCompass=!state.showCompass;layoutOverlay();renderInspector();};
  byId('pr').oninput=e=>{state.pointR=+e.target.value;drawPoints();renderInspector();};
  byId('seaSw').onclick=e=>{const s=e.target.closest('.sw');if(s){state.sea=s.dataset.c;drawLand();renderInspector();}};
  byId('landSw').onclick=e=>{const s=e.target.closest('.sw');if(s){state.land=s.dataset.c;drawLand();renderInspector();}};
  byId('lsSeg').onclick=e=>{const b=e.target.closest('button');if(b){state.lineStyle=b.dataset.ls;drawRoutes();renderInspector();}};
}

function inspPoint(d){
  if(!d){ inspMap(); return; }
  const sideBtn=(v,l)=>`<button class="${(d.side||'right')===v?'on':''}" data-side="${v}">${l}</button>`;
  inspEl.innerHTML = `
    <div class="insp-head">Точка</div>
    <div class="card">
      <div class="field"><label>Метка / номер</label><input id="lab" type="text" value="${esc(d.label)}" placeholder="1 или 1/7"></div>
      <div class="field"><label>Подпись</label><input id="cap" type="text" value="${esc(d.caption)}" placeholder="КО ЧАНГ, СЕВЕР"></div>
      <div class="field"><label>Где подпись</label><div class="seg" id="sideSeg">
        ${sideBtn('left','◄')}${sideBtn('right','►')}${sideBtn('top','▲')}${sideBtn('bottom','▼')}</div></div>
      <div class="field"><label>Координаты</label><input id="coord" type="text" value="${d.ll[1].toFixed(3)}, ${d.ll[0].toFixed(3)}" placeholder="lat, lng"></div>
    </div>
    <button class="danger" id="del">Удалить точку</button>
  `;
  byId('lab').oninput=e=>{d.label=e.target.value;drawPoints();};
  byId('cap').oninput=e=>{d.caption=e.target.value;drawPoints();};
  byId('sideSeg').onclick=e=>{const b=e.target.closest('button');if(b){d.side=b.dataset.side;drawPoints();renderInspector();}};
  byId('coord').onchange=e=>{const m=e.target.value.split(',').map(s=>parseFloat(s.trim()));
    if(m.length===2&&!isNaN(m[0])&&!isNaN(m[1])){d.ll=[m[1],m[0]];drawPoints();drawRoutes();}};
  byId('del').onclick=()=>deletePoint(d.id);
}

function inspSegment(s){
  if(!s){ inspMap(); return; }
  const A=ptById(s.a), B=ptById(s.b);
  inspEl.innerHTML = `
    <div class="insp-head">Линия</div>
    <div class="card">
      <div class="field"><label>От → до</label>
        <input type="text" value="${esc(A?A.label:'?')} → ${esc(B?B.label:'?')}" disabled style="opacity:.7"></div>
      <div class="field toggle">Авто-дистанция <button class="switch ${s.auto?'on':''}" id="auto"></button></div>
      <div class="field"><label>Подпись дистанции</label>
        <input id="dist" type="text" value="${esc(distText(s))}" ${s.auto?'disabled style="opacity:.6"':''}></div>
      <div class="field toggle">Показывать подпись <button class="switch ${s.showLabel!==false?'on':''}" id="shl"></button></div>
      <div class="field toggle">Подпись вдоль линии <button class="switch ${s.follow?'on':''}" id="fol"></button></div>
    </div>
    <button class="danger" id="del">Удалить линию</button>
  `;
  byId('auto').onclick=()=>{s.auto=!s.auto; if(s.auto)s.dist=null; drawRoutes();renderInspector();};
  byId('dist').oninput=e=>{s.dist=e.target.value;s.auto=false;drawRoutes();};
  byId('shl').onclick=()=>{s.showLabel=s.showLabel===false?true:false;drawRoutes();renderInspector();};
  byId('fol').onclick=()=>{s.follow=!s.follow;drawRoutes();renderInspector();};
  byId('del').onclick=()=>deleteSegment(s.id);
}

function byId(id){return document.getElementById(id);}
function esc(s){return (s==null?'':String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}

window.addEventListener('keydown',e=>{
  if(/input|textarea|select/i.test(e.target.tagName)) return;
  const m={v:'select',p:'point',l:'connect',d:'delete'};
  if(m[e.key.toLowerCase()]){ setTool(m[e.key.toLowerCase()]); }
  if((e.key==='Delete'||e.key==='Backspace')&&selected){
    if(selected.type==='point')deletePoint(selected.id); else deleteSegment(selected.id);
  }
  if(e.key==='Escape'){ connectFrom=null; selectNone(); drawPoints(); renderInspector(); updateHint(); }
});

const menuToggle = byId('menuToggle');
menuToggle.onclick=(e)=>{ e.stopPropagation(); document.body.classList.toggle('menu-open'); };
byId('menu').addEventListener('click',e=>{ if(e.target.closest('.ghost')) document.body.classList.remove('menu-open'); });
document.addEventListener('click',e=>{
  if(document.body.classList.contains('menu-open') &&
     !e.target.closest('#menu') && !e.target.closest('#menuToggle')){
    document.body.classList.remove('menu-open');
  }
});

byId('styleFab').onclick=()=>{ selectNone(); drawPoints(); renderInspector(); openSheet(); };

const sheetHandle = byId('sheetHandle');
sheetHandle.addEventListener('click',()=>{ selectNone(); drawPoints(); renderInspector(); updateHint(); });
byId('scrim').onclick=()=>{ selectNone(); drawPoints(); renderInspector(); updateHint(); };
(function(){
  let y0=null;
  sheetHandle.addEventListener('touchstart',e=>{ y0=e.touches[0].clientY; },{passive:true});
  sheetHandle.addEventListener('touchmove',e=>{
    if(y0!=null && e.touches[0].clientY-y0>50){ y0=null;
      selectNone(); drawPoints(); renderInspector(); updateHint(); }
  },{passive:true});
})();

byId('zin').onclick=()=>svg.transition().duration(200).call(zoom.scaleBy,1.5);
byId('zout').onclick=()=>svg.transition().duration(200).call(zoom.scaleBy,1/1.5);
byId('fitWorld').onclick=()=>svg.transition().duration(350).call(zoom.transform,d3.zoomIdentity);
byId('proj').onchange=e=>{state.projName=e.target.value;transform=d3.zoomIdentity;svg.call(zoom.transform,d3.zoomIdentity);setSize();};

byId('saveBtn').onclick=()=>{
  const data=JSON.stringify({v:1,state},null,0);
  download(new Blob([data],{type:'application/json'}),'route.json');
};
byId('importBtn').onclick=()=>byId('fileInput').click();
byId('fileInput').onchange=e=>{
  const f=e.target.files[0]; if(!f)return;
  const fr=new FileReader();
  fr.onload=()=>{try{
    const obj=JSON.parse(fr.result); const s=obj.state||obj;
    applyState(s); setSize(); renderInspector(); persistCurrent();
  }catch(err){alert('Не удалось открыть файл: '+err.message);}};
  fr.readAsText(f); e.target.value='';
};
function applyState(s){
  Object.assign(state,s);
  uid=1;
  state.points.forEach(p=>{const n=+(String(p.id).replace('e',''));if(n>=uid)uid=n+1;});
  state.segments.forEach(p=>{const n=+(String(p.id).replace('e',''));if(n>=uid)uid=n+1;});
  byId('proj').value=state.projName;
  selected=null; connectFrom=null;
}
function download(blob,name){
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

const LS_CUR='kartograf:current';
const LS_HIST='kartograf:routes';
function persistCurrent(){
  try{ localStorage.setItem(LS_CUR, JSON.stringify(state)); }catch(e){}
}
function loadCurrent(){
  try{
    const raw=localStorage.getItem(LS_CUR); if(!raw) return false;
    applyState(JSON.parse(raw)); return true;
  }catch(e){ return false; }
}
function getHistory(){
  try{ return JSON.parse(localStorage.getItem(LS_HIST)||'[]'); }catch(e){ return []; }
}
function setHistory(arr){
  try{ localStorage.setItem(LS_HIST, JSON.stringify(arr)); }catch(e){}
}
function saveToHistory(name){
  const hist=getHistory();
  hist.unshift({
    id:'r'+Date.now(),
    name:(name||state.title[0]||'Без названия').trim()||'Без названия',
    savedAt:Date.now(),
    points:state.points.length,
    segments:state.segments.length,
    state:JSON.parse(JSON.stringify(state))
  });
  setHistory(hist);
}
function loadFromHistory(id){
  const h=getHistory().find(x=>x.id===id); if(!h) return;
  applyState(JSON.parse(JSON.stringify(h.state)));
  setSize(); selectNone(); renderInspector(); updateHint(); persistCurrent();
}
function deleteFromHistory(id){ setHistory(getHistory().filter(x=>x.id!==id)); }
function fmtDate(ts){
  const d=new Date(ts);
  return d.toLocaleDateString('ru-RU',{day:'2-digit',month:'short'})+' '+
         d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
}

function inspHistory(){
  const hist=getHistory();
  const list = hist.length ? hist.map(h=>`
    <div class="hist-item">
      <div class="hist-main">
        <div class="hist-name">${esc(h.name)}</div>
        <div class="hist-meta">${h.points||0} точек · ${fmtDate(h.savedAt)}</div>
      </div>
      <div class="hist-actions">
        <button class="ghost hist-open" data-id="${h.id}">Открыть</button>
        <button class="hist-del" data-id="${h.id}" aria-label="Удалить">✕</button>
      </div>
    </div>`).join('')
    : `<div class="empty">Сохранённых маршрутов пока нет. Нажмите <b>«Сохранить текущий»</b>, чтобы добавить.</div>`;
  inspEl.innerHTML = `
    <div class="insp-head">История маршрутов <span class="count">${hist.length}</span></div>
    <button class="primary" id="histSave">＋ Сохранить текущий маршрут</button>
    <div class="hist-list">${list}</div>
  `;
  byId('histSave').onclick=()=>{
    const name=prompt('Название маршрута:', state.title[0]||'Мой маршрут');
    if(name===null) return;
    saveToHistory(name); inspHistory();
  };
  inspEl.querySelectorAll('.hist-open').forEach(b=>b.onclick=()=>loadFromHistory(b.dataset.id));
  inspEl.querySelectorAll('.hist-del').forEach(b=>b.onclick=()=>{ deleteFromHistory(b.dataset.id); inspHistory(); });
}
function openHistory(){ selected=null; inspHistory(); openSheet(); }
byId('historyBtn').onclick=openHistory;

document.addEventListener('visibilitychange',()=>{ if(document.hidden) persistCurrent(); });
window.addEventListener('pagehide',persistCurrent);
window.addEventListener('beforeunload',persistCurrent);
setInterval(persistCurrent,3000);

function cloneMapForExport(){
  const clone = mapEl.cloneNode(true);
  clone.querySelectorAll('.selring,.fromring,.route-hit').forEach(n=>n.remove());
  clone.setAttribute('xmlns','http://www.w3.org/2000/svg');
  const css = `
    .sea{} .country{fill:${state.land};stroke:#fff;stroke-width:.4;stroke-linejoin:round}
    .route{fill:none;stroke:#000;stroke-width:1.4;stroke-linecap:round}
    .route.dotted{stroke-dasharray:0.1 5}.route.dashed{stroke-dasharray:6 5}
    .dist{font-family:Montserrat,Arial,sans-serif;font-size:11px;font-weight:600;fill:#6e6e6e;letter-spacing:.04em}
    .marker text.num{font-family:Montserrat,Arial,sans-serif;font-size:12px;font-weight:700;fill:#1a1a1a;text-anchor:middle;dominant-baseline:central}
    .marker text.cap{font-family:Montserrat,Arial,sans-serif;font-size:12px;font-weight:700;fill:#1a1a1a;letter-spacing:.04em;dominant-baseline:central}
    .marker circle.dot{fill:#fff;stroke:#1a1a1a;stroke-width:1.6}
    .marker .pill{fill:#fff;stroke:#1a1a1a;stroke-width:1.6}
    .title-t{font-family:Montserrat,Arial,sans-serif;fill:#6e6e6e;font-weight:800;letter-spacing:.04em;text-anchor:end}
    text{font-family:Montserrat,Arial,sans-serif}
  `;
  const st=document.createElementNS('http://www.w3.org/2000/svg','style');
  st.textContent=css; clone.insertBefore(st,clone.firstChild);
  clone.querySelector('.sea').setAttribute('fill',state.sea);
  return clone;
}
byId('svgBtn').onclick=()=>{
  const clone=cloneMapForExport();
  const xml=new XMLSerializer().serializeToString(clone);
  download(new Blob([xml],{type:'image/svg+xml'}),'map.svg');
};
byId('pngBtn').onclick=()=>{
  const scale=2;
  const clone=cloneMapForExport();
  const xml=new XMLSerializer().serializeToString(clone);
  const img=new Image();
  const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(xml);
  img.onload=()=>{
    const c=document.createElement('canvas');c.width=W*scale;c.height=H*scale;
    const ctx=c.getContext('2d');ctx.fillStyle=state.sea;ctx.fillRect(0,0,c.width,c.height);
    ctx.drawImage(img,0,0,c.width,c.height);
    c.toBlob(b=>download(b,'map.png'),'image/png');
  };
  img.onerror=()=>alert('Не удалось собрать PNG. Попробуйте экспорт в SVG.');
  img.src=url;
};

function seed(){
  const demo=[
    {ll:[100.05,12.05],label:'1',caption:'СТАРТ · ГАВАНЬ',side:'top'},
    {ll:[102.6,12.0],label:'2',caption:'ОСТРОВ ВЕТРОВ',side:'right'},
    {ll:[103.85,1.29],label:'3',caption:'ЮЖНЫЙ МЫС',side:'right'},
    {ll:[106.66,10.76],label:'4',caption:'ДЕЛЬТА',side:'bottom'}
  ];
  demo.forEach(d=>state.points.push({id:nid(),ll:d.ll,label:d.label,caption:d.caption,side:d.side}));
  state.counter=demo.length+1;
  for(let i=0;i<state.points.length-1;i++){
    state.segments.push({id:nid(),a:state.points[i].id,b:state.points[i+1].id,dist:null,auto:true,showLabel:true,follow:true});
  }
}

if(!loadCurrent()){ seed(); }
setSize();
renderInspector();
setTool('select');
updateHint();
window.addEventListener('resize',()=>{setSize();});
