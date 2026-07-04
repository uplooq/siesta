// «Свой Яндекс» на MapLibre GL + бесплатные векторные тайлы OpenFreeMap.
// Полный порт планировщика из d3-версии: инструменты, точки (drag, подписи, стороны),
// геодезические линии-дуги, подписи дистанций, инспектор, история, save/load,
// заголовок/компас, переключение слоёв карты, экспорт PNG.
// Модель state идентична старой версии — .json-проекты совместимы.
console.log('siesta-map maplibre-app v11: линию можно тянуть в любом месте (концы A/B закреплены)');

const STYLES = {
  liberty:'https://tiles.openfreemap.org/styles/liberty',
  bright:'https://tiles.openfreemap.org/styles/bright',
  positron:'https://tiles.openfreemap.org/styles/positron'
};
// «Постер (серый)» = векторный liberty, перекрашенный под палитру старой карты
const styleUrlFor = name => name==='poster' ? STYLES.liberty : (STYLES[name]||STYLES.liberty);
const NM_R = 3440.065; // радиус Земли в морских милях

const state = {
  points: [],     // {id, ll:[lng,lat], label, caption, side}
  segments: [],   // {id, a, b, dist, auto, showLabel, follow}
  counter: 1,
  title: ['МАРШРУТ №1','НАЗВАНИЕ ПУТЕШЕСТВИЯ'],
  showTitle: true,
  showCompass: true,
  sea: '#ffffff', land: '#d6d5d1', // (в тайловой версии не влияют на подложку, хранятся для совместимости)
  pointR: 11,
  lineStyle: 'dotted',
  styleName: 'poster',
  layers: { labels:true, roads:true, buildings:true, poi:true, water_labels:true }
};

let tool = 'select';
let selected = null;
let connectFrom = null;
let uid = 1;
const nid = () => 'e'+(uid++);
const byId = id => document.getElementById(id);
const esc = s => (s==null?'':String(s)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

// ---- карта ----
const map = new maplibregl.Map({
  container:'map', style:styleUrlFor(state.styleName),
  center:[100.5, 11.5], zoom:5, attributionControl:{compact:true},
  preserveDrawingBuffer:true // нужно для экспорта PNG из WebGL-канваса
});
// собственные кнопки +/− (.zoomctl) — встроенный NavigationControl не добавляем

const markers = new Map(); // id -> maplibregl.Marker

// ======================= геометрия =======================
const toR = Math.PI/180, toD = 180/Math.PI;
function distRad(a,b){
  const la1=a[1]*toR, la2=b[1]*toR, dla=(b[1]-a[1])*toR, dlo=(b[0]-a[0])*toR;
  const s=Math.sin(dla/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dlo/2)**2;
  return 2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s));
}
function geodesic(a,b){
  const d = distRad(a,b);
  if(d<1e-9) return [a,b];
  const [lo1,la1]=[a[0]*toR,a[1]*toR], [lo2,la2]=[b[0]*toR,b[1]*toR];
  const x1=Math.cos(la1)*Math.cos(lo1),y1=Math.cos(la1)*Math.sin(lo1),z1=Math.sin(la1);
  const x2=Math.cos(la2)*Math.cos(lo2),y2=Math.cos(la2)*Math.sin(lo2),z2=Math.sin(la2);
  const steps=Math.max(2,Math.min(100,Math.ceil(d*toD/2)));
  const out=[];
  for(let i=0;i<=steps;i++){
    const f=i/steps, s1=Math.sin((1-f)*d)/Math.sin(d), s2=Math.sin(f*d)/Math.sin(d);
    const x=s1*x1+s2*x2, y=s1*y1+s2*y2, z=s1*z1+s2*z2;
    out.push([Math.atan2(y,x)*toD, Math.atan2(z,Math.hypot(x,y))*toD]);
  }
  return out;
}
function geoMid(a,b){ const g=geodesic(a,b); return g[Math.floor(g.length/2)]; }

function ptById(id){ return state.points.find(p=>p.id===id); }
// путь линии: точка А → пользовательские промежуточные узлы → точка B (прямые участки)
function segPath(s){
  const A=ptById(s.a), B=ptById(s.b);
  if(!A||!B) return [];
  return [A.ll, ...(s.waypoints||[]), B.ll];
}
// середина ломаной по длине — для размещения подписи дистанции
function pathMid(path){
  if(!path||path.length<2) return path&&path[0];
  const segs=[]; let total=0;
  for(let i=1;i<path.length;i++){ const L=Math.hypot(path[i][0]-path[i-1][0],path[i][1]-path[i-1][1]); segs.push(L); total+=L; }
  let half=total/2;
  for(let i=0;i<segs.length;i++){ if(half<=segs[i]){ const f=segs[i]?half/segs[i]:0;
      return [path[i][0]+(path[i+1][0]-path[i][0])*f, path[i][1]+(path[i+1][1]-path[i][1])*f]; } half-=segs[i]; }
  return path[Math.floor(path.length/2)];
}
// дистанция = сумма дуг большого круга по всем участкам пути
function segDistNM(s){ const path=segPath(s); let d=0; for(let i=1;i<path.length;i++) d+=distRad(path[i-1],path[i]); return d*NM_R; }
// сглаживание ломаной центростремительным сплайном Катмулла-Рома —
// кривая проходит через все узлы, но углы между ними скруглены
function smoothPath(pts){
  if(!pts || pts.length<3) return pts;             // 2 точки → прямая, сглаживать нечего
  const P=[pts[0], ...pts, pts[pts.length-1]];      // дублируем концы, чтобы дойти до A и B
  const SEG=18;
  const mix=(a,b,s)=>[a[0]+(b[0]-a[0])*s, a[1]+(b[1]-a[1])*s];
  const knot=(t,a,b)=>t+Math.hypot(b[0]-a[0],b[1]-a[1])**0.5+1e-9; // alpha=0.5 (центростремительный)
  const out=[pts[0]];
  for(let i=1;i<P.length-2;i++){
    const p0=P[i-1],p1=P[i],p2=P[i+1],p3=P[i+2];
    const t0=0,t1=knot(t0,p0,p1),t2=knot(t1,p1,p2),t3=knot(t2,p2,p3);
    for(let j=1;j<=SEG;j++){
      const t=t1+(t2-t1)*(j/SEG);
      const A1=mix(p0,p1,(t-t0)/(t1-t0)), A2=mix(p1,p2,(t-t1)/(t2-t1)), A3=mix(p2,p3,(t-t2)/(t3-t2));
      const B1=mix(A1,A2,(t-t0)/(t2-t0)), B2=mix(A2,A3,(t-t1)/(t3-t1));
      out.push(mix(B1,B2,(t-t1)/(t2-t1)));
    }
  }
  return out;
}
function distText(s){
  if(!s.auto && s.dist!=null) return s.dist;
  return segDistNM(s).toLocaleString('ru-RU',{maximumFractionDigits:1})+' nm';
}

// ======================= слои MapLibre =======================
const emptyFC = () => ({type:'FeatureCollection', features:[]});
function ensureLayers(){
  if(!map.getSource('routes')){
    map.addSource('routes',{type:'geojson',data:emptyFC()});
    map.addLayer({id:'routes-line',type:'line',source:'routes',
      layout:{'line-cap':'round','line-join':'round'},
      paint:{'line-color':'#000','line-width':1.6,'line-dasharray':lineDash()}});
  }
  if(!map.getSource('routelabels')){
    map.addSource('routelabels',{type:'geojson',data:emptyFC()});
    map.addLayer({id:'routelabels-pt',type:'symbol',source:'routelabels',
      filter:['==','$type','Point'],
      layout:{'text-field':['get','label'],'text-size':11,'text-font':['Noto Sans Regular'],
              'text-offset':[0,-0.6],'text-allow-overlap':true},
      paint:{'text-color':'#6e6e6e','text-halo-color':'#fff','text-halo-width':1.4}});
    map.addLayer({id:'routelabels-line',type:'symbol',source:'routelabels',
      filter:['==','$type','LineString'],
      layout:{'symbol-placement':'line-center','text-field':['get','label'],'text-size':11,
              'text-font':['Noto Sans Regular'],'text-offset':[0,-0.8]},
      paint:{'text-color':'#6e6e6e','text-halo-color':'#fff','text-halo-width':1.4}});
  }
}
const lineDash = () => state.lineStyle==='dashed' ? [2,1.6] : [0.4,2.2];

function updateRouteData(){
  if(!map.getSource('routes')) return;
  const valid = state.segments.filter(s=>ptById(s.a)&&ptById(s.b));
  map.getSource('routes').setData({type:'FeatureCollection',features:valid.map(s=>({
    type:'Feature',properties:{id:s.id},
    geometry:{type:'LineString',coordinates:smoothPath(segPath(s))}
  }))});
  const labels=[];
  for(const s of valid){
    if(s.showLabel===false) continue;
    const txt=distText(s); const path=segPath(s);
    if(s.follow){
      labels.push({type:'Feature',properties:{label:txt},geometry:{type:'LineString',coordinates:smoothPath(path)}});
    } else {
      labels.push({type:'Feature',properties:{label:txt},geometry:{type:'Point',coordinates:pathMid(path)}});
    }
  }
  map.getSource('routelabels').setData({type:'FeatureCollection',features:labels});
  map.setPaintProperty('routes-line','line-dasharray',lineDash());
}
function refreshRoutes(){ updateRouteData(); renderHandles(); }

// ---- редактируемые узлы пути выбранной линии ----
let handleMarkers=[];
function clearHandles(){ handleMarkers.forEach(m=>m.remove()); handleMarkers=[]; }
function renderHandles(){
  clearHandles();
  if(tool!=='select' || !selected || selected.type!=='segment') return;
  const s=state.segments.find(x=>x.id===selected.id);
  if(!s||!ptById(s.a)||!ptById(s.b)) return;
  if(!s.waypoints) s.waypoints=[];
  const path=segPath(s);
  // существующие узлы — перетаскивание меняет путь, двойной клик удаляет узел
  s.waypoints.forEach((wp,k)=>{
    const el=document.createElement('div'); el.className='wp';
    el.title='Перетащите, чтобы изменить путь · двойной клик — удалить узел';
    const m=new maplibregl.Marker({element:el,draggable:true,anchor:'center'}).setLngLat(wp).addTo(map);
    m.on('drag',()=>{ const ll=m.getLngLat(); s.waypoints[k]=[ll.lng,ll.lat]; updateRouteData(); });
    m.on('dragend',()=>{ refreshRoutes(); persistCurrent(); });
    el.addEventListener('dblclick',ev=>{ ev.stopPropagation(); s.waypoints.splice(k,1); refreshRoutes(); renderInspector(); persistCurrent(); });
    handleMarkers.push(m);
  });
  // полупрозрачные узлы в середине каждого участка — перетаскивание добавляет изгиб
  for(let g=0; g<path.length-1; g++){
    const mid=[(path[g][0]+path[g+1][0])/2,(path[g][1]+path[g+1][1])/2];
    const el=document.createElement('div'); el.className='wp ghost';
    el.title='Перетащите, чтобы добавить изгиб';
    const m=new maplibregl.Marker({element:el,draggable:true,anchor:'center'}).setLngLat(mid).addTo(map);
    const idx=g; let inserted=false, start=null;
    m.on('dragstart',()=>{ inserted=false; start=map.project(m.getLngLat()); });
    m.on('drag',()=>{
      const ll=m.getLngLat();
      if(!inserted){
        const now=map.project(ll);
        if(Math.hypot(now.x-start.x, now.y-start.y) < 6) return; // микросдвиг — узел не создаём
        s.waypoints.splice(idx,0,[ll.lng,ll.lat]); inserted=true;
      } else { s.waypoints[idx]=[ll.lng,ll.lat]; }
      updateRouteData();
    });
    m.on('dragend',()=>{ start=null; if(inserted) persistCurrent(); refreshRoutes(); renderInspector(); });
    handleMarkers.push(m);
  }
}

// ---- переключение слоёв подложки ----
const LAYER_GROUPS = {
  labels:       id => /^label_/.test(id),
  roads:        id => /road|highway|transportation|bridge|tunnel/.test(id) && !/water/.test(id),
  buildings:    id => /building/.test(id),
  poi:          id => /^poi_/.test(id),
  water_labels: id => /water_name|waterway_(line|tunnel)?_?label/.test(id)
};
function applyLayerToggle(group, visible){
  const m=LAYER_GROUPS[group]; if(!m) return;
  for(const l of map.getStyle().layers) if(m(l.id))
    map.setLayoutProperty(l.id,'visibility', visible?'visible':'none');
}
function applyAllToggles(){ for(const g in state.layers) applyLayerToggle(g, state.layers[g]); }

// затемнение оттенка для зданий/обводки относительно цвета суши
function shade(hex,amt){
  const n=parseInt(hex.slice(1),16); let r=(n>>16)&255,g=(n>>8)&255,b=n&255;
  r=Math.max(0,Math.min(255,r+amt)); g=Math.max(0,Math.min(255,g+amt)); b=Math.max(0,Math.min(255,b+amt));
  return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
// перекраска тайлов под монохромный «постер» (палитра старой карты)
function applyPosterGrey(){
  const LAND=state.land||'#d6d5d1', SEA=state.sea||'#ffffff';
  const ROAD='#ffffff', CASE=shade(LAND,-18), BLD=shade(LAND,-10), INK='#6e6e6e';
  const set=(id,prop,val)=>{ try{ map.setPaintProperty(id,prop,val); }catch(e){} };
  for(const l of map.getStyle().layers){
    const id=l.id, t=l.type;
    if(id==='routes-line'||id==='routelabels-pt'||id==='routelabels-line') continue; // свои слои не перекрашиваем
    if(t==='raster'){ try{ map.setLayoutProperty(id,'visibility','none'); }catch(e){} continue; }
    if(id==='background'){ set(id,'background-color',LAND); continue; }
    if(t==='fill'){
      if(/water/.test(id)) set(id,'fill-color',SEA);
      else if(/building/.test(id)) set(id,'fill-color',BLD);
      else set(id,'fill-color',LAND);            // park/landuse/landcover/aeroway → единый серый
    } else if(t==='fill-extrusion'){
      set(id,'fill-extrusion-color',BLD);
    } else if(t==='line'){
      if(/waterway/.test(id)) set(id,'line-color',SEA);
      else if(/casing|outline|hatching/.test(id)) set(id,'line-color',CASE);
      else set(id,'line-color',ROAD);            // дороги — белые на сером
    } else if(t==='symbol'){
      if(l.layout && l.layout['text-field']!=null){
        set(id,'text-color',INK); set(id,'text-halo-color',SEA);
      }
    }
  }
}
// единая постобработка после загрузки/смены стиля
function afterStyle(){
  ensureLayers();
  applyAllToggles();
  if(state.styleName==='poster') applyPosterGrey();
  refreshRoutes();
}

// ======================= точки (HTML-маркеры) =======================
function buildMarkerEl(p){
  const side=p.side||'right';
  const el=document.createElement('div');
  el.className='mk cap-'+side;
  if(selected&&selected.type==='point'&&selected.id===p.id) el.classList.add('sel');
  if(connectFrom===p.id) el.classList.add('from');
  const node=document.createElement('div'); node.className='node';
  node.textContent=p.label||'';
  node.style.minWidth=(state.pointR*2)+'px'; node.style.height=(state.pointR*2)+'px';
  node.style.fontSize=Math.round(state.pointR*1.05)+'px';
  el.appendChild(node);
  if(p.caption){ const c=document.createElement('div'); c.className='cap'; c.textContent=p.caption; el.appendChild(c); }
  el.addEventListener('click',ev=>{ ev.stopPropagation(); onPoint(p.id); });
  return el;
}
function renderPoints(){
  markers.forEach(m=>m.remove()); markers.clear();
  for(const p of state.points){
    const m=new maplibregl.Marker({element:buildMarkerEl(p),draggable:tool==='select',anchor:'center'})
      .setLngLat(p.ll).addTo(map);
    m.on('drag',()=>{ const ll=m.getLngLat(); p.ll=[ll.lng,ll.lat]; updateRouteData(); });
    m.on('dragend',()=>{ refreshRoutes(); persistCurrent(); });
    markers.set(p.id,m);
  }
}
function renderAll(){ renderPoints(); refreshRoutes(); drawPoster(); }

// ======================= инструменты / выбор =======================
function addPoint(ll){
  const p={id:nid(), ll, label:String(state.counter++), caption:'', side:'right'};
  state.points.push(p); renderPoints(); selectThing('point',p.id); persistCurrent();
}
function onPoint(id){
  if(tool==='delete'){ deletePoint(id); return; }
  if(tool==='connect'){
    if(connectFrom===null){ connectFrom=id; renderPoints(); updateHint(); return; }
    if(connectFrom!==id) addSegment(connectFrom,id);
    connectFrom=null; renderPoints(); updateHint(); return;
  }
  selectThing('point',id);
}
function onSegment(id){
  if(tool==='delete'){ deleteSegment(id); return; }
  selectThing('segment',id);
}
function addSegment(a,b){
  const ex=state.segments.find(s=>(s.a===a&&s.b===b)||(s.a===b&&s.b===a));
  if(ex){ selectThing('segment',ex.id); return; }
  const s={id:nid(),a,b,dist:null,auto:true,showLabel:true,follow:true};
  state.segments.push(s); refreshRoutes(); selectThing('segment',s.id); persistCurrent();
}
function deletePoint(id){
  state.points=state.points.filter(p=>p.id!==id);
  state.segments=state.segments.filter(s=>s.a!==id&&s.b!==id);
  if(selected&&selected.id===id){ selected=null; closeSheet(); }
  renderAll(); renderInspector(); persistCurrent();
}
function deleteSegment(id){
  state.segments=state.segments.filter(s=>s.id!==id);
  if(selected&&selected.id===id){ selected=null; closeSheet(); }
  refreshRoutes(); renderInspector(); persistCurrent();
}
function selectThing(type,id){ selected={type,id}; renderPoints(); renderInspector(); openSheet(); renderHandles(); }
function selectNone(){ selected=null; closeSheet(); clearHandles(); }

const inspectorEl=byId('inspector'), inspEl=byId('inspBody'), hintEl=byId('hint');
function openSheet(){ inspectorEl.classList.add('open'); document.body.classList.add('sheet-open'); }
function closeSheet(){ inspectorEl.classList.remove('open'); document.body.classList.remove('sheet-open'); }

function setTool(t){
  tool=t; connectFrom=null;
  document.querySelectorAll('.tool').forEach(x=>x.classList.toggle('active',x.dataset.tool===t));
  markers.forEach(m=>m.setDraggable(t==='select'));
  map.getCanvas().style.cursor = t==='point' ? 'crosshair' : '';
  renderPoints(); renderHandles(); updateHint();
}
const HINTS={
  select:'Тяните карту · колесо — масштаб · кликните точку или линию · тяните саму линию, чтобы изогнуть путь',
  point:'Кликните по карте, чтобы поставить точку',
  connect:'Кликните первую точку, затем вторую — между ними появится линия с дистанцией',
  delete:'Кликайте по точкам или линиям, чтобы удалить'
};
function updateHint(){
  let h=HINTS[tool];
  if(tool==='connect'&&connectFrom) h='Теперь кликните вторую точку';
  hintEl.textContent=h;
}

// ======================= постер: заголовок + компас =======================
function drawPoster(){
  const el=byId('poster'); el.innerHTML='';
  if(state.showTitle){
    const t=document.createElement('div'); t.className='title';
    t.innerHTML=`<div class="l1">${esc(state.title[0]||'')}</div><div class="l2">${esc(state.title[1]||'')}</div>`;
    el.appendChild(t);
  }
  if(state.showCompass){
    const c=document.createElement('div'); c.className='compass';
    c.innerHTML=`<b>N</b><svg viewBox="-11 0 22 40"><path d="M0,2 L11,40 L0,30 L-11,40 Z"/></svg>`;
    el.appendChild(c);
  }
}

// ======================= инспектор =======================
function renderInspector(){
  if(selected&&selected.type==='point') return inspPoint(ptById(selected.id));
  if(selected&&selected.type==='segment') return inspSegment(state.segments.find(s=>s.id===selected.id));
  inspMap();
}
function inspMap(){
  const styBtn=(v,cur)=>`<button class="${v===cur?'on':''}" data-ls="${v}">${v==='dotted'?'точки':'тире'}</button>`;
  const LAY=[['labels','Названия городов'],['roads','Дороги'],['buildings','Здания'],['poi','POI'],['water_labels','Названия воды']];
  inspEl.innerHTML=`
    <div class="insp-head">Карта <span class="count">${state.points.length} точек</span></div>
    <div class="card">
      <h3>Слои карты</h3>
      <div class="layers">${LAY.map(([k,l])=>`<div class="row">${l}
        <button class="switch ${state.layers[k]?'on':''}" data-lay="${k}"></button></div>`).join('')}</div>
    </div>
    <div class="card">
      <h3>Цвета постера</h3>
      <div class="field"><label>Цвет моря</label><div class="swatches" id="seaSw">
        ${['#ffffff','#eef4f7','#e8f0ee','#f4f1ea'].map(c=>`<div class="sw ${c===state.sea?'on':''}" style="background:${c}" data-c="${c}"></div>`).join('')}</div></div>
      <div class="field"><label>Цвет суши</label><div class="swatches" id="landSw">
        ${['#d6d5d1','#c9c8c3','#dfe0db','#cfd8cf','#e6ded2'].map(c=>`<div class="sw ${c===state.land?'on':''}" style="background:${c}" data-c="${c}"></div>`).join('')}</div></div>
      <div class="field" style="font-size:11px;color:#8b95a7">Действует в режиме «Постер (серый)».</div>
    </div>
    <div class="card">
      <h3>Заголовок</h3>
      <div class="field"><label>Строка 1</label><input id="t0" type="text" value="${esc(state.title[0])}"></div>
      <div class="field"><label>Строка 2</label><input id="t1" type="text" value="${esc(state.title[1])}"></div>
      <div class="field toggle">Показывать заголовок <button class="switch ${state.showTitle?'on':''}" id="tgT"></button></div>
      <div class="field toggle">Компас <button class="switch ${state.showCompass?'on':''}" id="tgC"></button></div>
    </div>
    <div class="card">
      <h3>Маршрут</h3>
      <div class="field"><label>Линии маршрута</label><div class="seg" id="lsSeg">${styBtn('dotted',state.lineStyle)}${styBtn('dashed',state.lineStyle)}</div></div>
      <div class="field"><label>Размер точек · ${state.pointR}px</label>
        <div class="range"><input type="range" id="pr" min="7" max="18" value="${state.pointR}"></div></div>
    </div>
    <div class="empty">Инструменты сверху: <b>Точка</b> — поставить, <b>Линия</b> — соединить, <b>Выбрать</b> — двигать и редактировать. Клавиши <span class="kbd">V</span> <span class="kbd">P</span> <span class="kbd">L</span> <span class="kbd">D</span>.</div>`;
  inspEl.querySelectorAll('[data-lay]').forEach(b=>b.onclick=()=>{
    const k=b.dataset.lay; state.layers[k]=!state.layers[k];
    applyLayerToggle(k,state.layers[k]); b.classList.toggle('on',state.layers[k]); persistCurrent();
  });
  byId('t0').oninput=e=>{state.title[0]=e.target.value;drawPoster();persistCurrent();};
  byId('t1').oninput=e=>{state.title[1]=e.target.value;drawPoster();persistCurrent();};
  byId('tgT').onclick=()=>{state.showTitle=!state.showTitle;drawPoster();renderInspector();persistCurrent();};
  byId('tgC').onclick=()=>{state.showCompass=!state.showCompass;drawPoster();renderInspector();persistCurrent();};
  byId('pr').oninput=e=>{state.pointR=+e.target.value;renderPoints();renderInspector();persistCurrent();};
  byId('lsSeg').onclick=e=>{const b=e.target.closest('button');if(b){state.lineStyle=b.dataset.ls;refreshRoutes();renderInspector();persistCurrent();}};
  const recolor=()=>{ if(state.styleName==='poster') applyPosterGrey(); };
  byId('seaSw').onclick=e=>{const s=e.target.closest('.sw');if(s){state.sea=s.dataset.c;recolor();renderInspector();persistCurrent();}};
  byId('landSw').onclick=e=>{const s=e.target.closest('.sw');if(s){state.land=s.dataset.c;recolor();renderInspector();persistCurrent();}};
}
function inspPoint(d){
  if(!d){ inspMap(); return; }
  const sideBtn=(v,l)=>`<button class="${(d.side||'right')===v?'on':''}" data-side="${v}">${l}</button>`;
  inspEl.innerHTML=`
    <div class="insp-head">Точка</div>
    <div class="card">
      <div class="field"><label>Метка / номер</label><input id="lab" type="text" value="${esc(d.label)}" placeholder="1 или 1/7"></div>
      <div class="field"><label>Подпись</label><input id="cap" type="text" value="${esc(d.caption)}" placeholder="КО ЧАНГ, СЕВЕР"></div>
      <div class="field"><label>Где подпись</label><div class="seg" id="sideSeg">
        ${sideBtn('left','◄')}${sideBtn('right','►')}${sideBtn('top','▲')}${sideBtn('bottom','▼')}</div></div>
      <div class="field"><label>Координаты (lat, lng)</label><input id="coord" type="text" value="${d.ll[1].toFixed(4)}, ${d.ll[0].toFixed(4)}"></div>
    </div>
    <button class="danger" id="del">Удалить точку</button>`;
  byId('lab').oninput=e=>{d.label=e.target.value;renderPoints();persistCurrent();};
  byId('cap').oninput=e=>{d.caption=e.target.value;renderPoints();persistCurrent();};
  byId('sideSeg').onclick=e=>{const b=e.target.closest('button');if(b){d.side=b.dataset.side;renderPoints();renderInspector();persistCurrent();}};
  byId('coord').onchange=e=>{const m=e.target.value.split(',').map(s=>parseFloat(s.trim()));
    if(m.length===2&&!isNaN(m[0])&&!isNaN(m[1])){d.ll=[m[1],m[0]];renderPoints();refreshRoutes();persistCurrent();}};
  byId('del').onclick=()=>deletePoint(d.id);
}
function inspSegment(s){
  if(!s){ inspMap(); return; }
  const A=ptById(s.a),B=ptById(s.b);
  inspEl.innerHTML=`
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
    <div class="field" style="font-size:11px;color:#8b95a7;margin:-2px 0 8px">Тяните саму линию в любом месте, чтобы менять путь — концы закреплены. Двойной клик по узлу — удалить его.</div>
    ${(s.waypoints&&s.waypoints.length)?'<button id="resetWp" style="width:100%;border:1px solid var(--line);background:#fff;color:#444;border-radius:9px;padding:10px;font-weight:600;font-family:inherit;cursor:pointer;margin-bottom:8px">Сбросить изгибы</button>':''}
    <button class="danger" id="del">Удалить линию</button>`;
  byId('auto').onclick=()=>{s.auto=!s.auto; if(s.auto)s.dist=null; refreshRoutes();renderInspector();persistCurrent();};
  byId('dist').oninput=e=>{s.dist=e.target.value;s.auto=false;refreshRoutes();persistCurrent();};
  byId('shl').onclick=()=>{s.showLabel=s.showLabel===false?true:false;refreshRoutes();renderInspector();persistCurrent();};
  byId('fol').onclick=()=>{s.follow=!s.follow;refreshRoutes();renderInspector();persistCurrent();};
  const rw=byId('resetWp'); if(rw) rw.onclick=()=>{ s.waypoints=[]; refreshRoutes(); renderInspector(); persistCurrent(); };
  byId('del').onclick=()=>deleteSegment(s.id);
}

// ======================= save / load / история =======================
function download(blob,name){
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function applyState(s){
  Object.assign(state,s);
  if(!state.layers) state.layers={labels:true,roads:true,buildings:true,poi:true,water_labels:true};
  uid=1;
  state.points.forEach(p=>{const n=+(String(p.id).replace('e',''));if(n>=uid)uid=n+1;});
  state.segments.forEach(p=>{const n=+(String(p.id).replace('e',''));if(n>=uid)uid=n+1;});
  if(state.styleName && STYLES[state.styleName]) byId('styleSel').value=STYLES[state.styleName];
  selected=null; connectFrom=null;
}

const LS_CUR='kartograf:current', LS_HIST='kartograf:routes';
function persistCurrent(){ try{ localStorage.setItem(LS_CUR,JSON.stringify(state)); }catch(e){} }
function loadCurrent(){
  try{ const raw=localStorage.getItem(LS_CUR); if(!raw) return false; applyState(JSON.parse(raw)); return true; }
  catch(e){ return false; }
}
const getHistory=()=>{ try{ return JSON.parse(localStorage.getItem(LS_HIST)||'[]'); }catch(e){ return []; } };
const setHistory=a=>{ try{ localStorage.setItem(LS_HIST,JSON.stringify(a)); }catch(e){} };
function saveToHistory(name){
  const h=getHistory();
  h.unshift({id:'r'+Date.now(),name:(name||state.title[0]||'Без названия').trim()||'Без названия',
    savedAt:Date.now(),points:state.points.length,segments:state.segments.length,
    state:JSON.parse(JSON.stringify(state))});
  setHistory(h);
}
function loadFromHistory(id){
  const h=getHistory().find(x=>x.id===id); if(!h) return;
  applyState(JSON.parse(JSON.stringify(h.state)));
  renderAll(); applyAllToggles(); selectNone(); renderInspector(); updateHint(); persistCurrent();
}
function deleteFromHistory(id){ setHistory(getHistory().filter(x=>x.id!==id)); }
function fmtDate(ts){ const d=new Date(ts);
  return d.toLocaleDateString('ru-RU',{day:'2-digit',month:'short'})+' '+d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}); }
function inspHistory(){
  const hist=getHistory();
  const list=hist.length?hist.map(h=>`
    <div class="hist-item"><div class="hist-main">
      <div class="hist-name">${esc(h.name)}</div>
      <div class="hist-meta">${h.points||0} точек · ${fmtDate(h.savedAt)}</div></div>
      <div class="hist-actions">
        <button class="ghost hist-open" data-id="${h.id}">Открыть</button>
        <button class="hist-del" data-id="${h.id}" aria-label="Удалить">✕</button></div></div>`).join('')
    :`<div class="empty">Сохранённых маршрутов пока нет. Нажмите <b>«Сохранить текущий»</b>.</div>`;
  inspEl.innerHTML=`<div class="insp-head">История маршрутов <span class="count">${hist.length}</span></div>
    <button class="primary" id="histSave">＋ Сохранить текущий маршрут</button>
    <div class="hist-list">${list}</div>`;
  byId('histSave').onclick=()=>{ const name=prompt('Название маршрута:',state.title[0]||'Мой маршрут');
    if(name===null) return; saveToHistory(name); inspHistory(); };
  inspEl.querySelectorAll('.hist-open').forEach(b=>b.onclick=()=>loadFromHistory(b.dataset.id));
  inspEl.querySelectorAll('.hist-del').forEach(b=>b.onclick=()=>{ deleteFromHistory(b.dataset.id); inspHistory(); });
}
function openHistory(){ selected=null; inspHistory(); openSheet(); }

// ======================= экспорт PNG =======================
function exportPNG(){
  map.once('render',()=>{
    const gl=map.getCanvas();
    const out=document.createElement('canvas'); out.width=gl.width; out.height=gl.height;
    const ctx=out.getContext('2d');
    ctx.drawImage(gl,0,0);
    const dpr=gl.width/map.getContainer().clientWidth;
    drawOverlays(ctx,dpr);
    out.toBlob(b=>download(b,'map.png'),'image/png');
  });
  map.triggerRepaint();
}
function drawOverlays(ctx,dpr){
  ctx.textBaseline='middle';
  for(const p of state.points){
    const s=map.project(p.ll), x=s.x*dpr, y=s.y*dpr, r=state.pointR*dpr;
    ctx.beginPath(); ctx.arc(x,y,r,0,7); ctx.fillStyle='#fff'; ctx.fill();
    ctx.lineWidth=1.6*dpr; ctx.strokeStyle='#1a1a1a'; ctx.stroke();
    ctx.fillStyle='#1a1a1a'; ctx.textAlign='center'; ctx.font=`700 ${state.pointR*1.05*dpr}px Montserrat,Arial`;
    ctx.fillText(p.label||'',x,y);
    if(p.caption){
      ctx.font=`700 ${12*dpr}px Montserrat,Arial`; const off=r+7*dpr, side=p.side||'right';
      if(side==='right'){ctx.textAlign='left';ctx.fillText(p.caption,x+off,y);}
      else if(side==='left'){ctx.textAlign='right';ctx.fillText(p.caption,x-off,y);}
      else if(side==='top'){ctx.textAlign='center';ctx.fillText(p.caption,x,y-r-12*dpr);}
      else {ctx.textAlign='center';ctx.fillText(p.caption,x,y+r+12*dpr);}
    }
  }
  if(state.showTitle){
    ctx.fillStyle='#6e6e6e'; ctx.textAlign='right';
    ctx.font=`800 ${15*dpr}px Montserrat,Arial`; ctx.fillText((state.title[0]||'').toUpperCase(),ctx.canvas.width-20*dpr,24*dpr);
    ctx.font=`800 ${12*dpr}px Montserrat,Arial`; ctx.fillText((state.title[1]||'').toUpperCase(),ctx.canvas.width-20*dpr,44*dpr);
  }
  if(state.showCompass){
    const x=30*dpr, y=ctx.canvas.height-46*dpr;
    ctx.fillStyle='#1a1a1a'; ctx.textAlign='center'; ctx.font=`800 ${16*dpr}px Montserrat,Arial`;
    ctx.fillText('N',x,y-30*dpr);
    ctx.beginPath(); ctx.moveTo(x,y-24*dpr); ctx.lineTo(x+8*dpr,y+8*dpr); ctx.lineTo(x,y); ctx.lineTo(x-8*dpr,y+8*dpr); ctx.closePath(); ctx.fill();
  }
}

// ======================= события UI =======================
function setMapStyle(name){
  state.styleName=name; byId('styleSel').value=name;
  map.setStyle(styleUrlFor(name));
  map.once('styledata',()=>{ afterStyle(); persistCurrent(); });
}
map.doubleClickZoom.disable();          // двойной клик используется для узлов линии, а не для зума
map.on('load',()=>{
  if(!loadCurrent()) seed();
  state.styleName='poster';            // страница всегда стартует в сером постере
  byId('styleSel').value='poster';
  afterStyle();                        // база poster = liberty (уже загружена) → просто перекрашиваем
  renderAll(); renderInspector(); setTool('select'); updateHint();
});

map.on('click',e=>{
  const f=map.queryRenderedFeatures(e.point,{layers:['routes-line']});
  if(f.length){ onSegment(f[0].properties.id); return; }
  if(tool==='point'){ addPoint([e.lngLat.lng,e.lngLat.lat]); return; }
  if(tool==='select'||tool==='connect'){ connectFrom=null; selectNone(); renderPoints(); renderInspector(); updateHint(); }
});
map.on('mouseenter','routes-line',()=>{ if(!lineDrag) map.getCanvas().style.cursor = tool==='point'?'crosshair':(tool==='select'?'grab':'pointer'); });
map.on('mouseleave','routes-line',()=>{ if(!lineDrag) map.getCanvas().style.cursor=tool==='point'?'crosshair':''; });

// ---- перетаскивание самой линии: концы A/B закреплены, тело линии тянется в любом месте ----
// схватив линию где угодно, вставляем узел на ближайшем участке и двигаем его за курсором
let lineDrag=null;
function distToSeg(p,a,b){
  const vx=b.x-a.x, vy=b.y-a.y, wx=p.x-a.x, wy=p.y-a.y;
  const c1=vx*wx+vy*wy; if(c1<=0) return Math.hypot(wx,wy);
  const c2=vx*vx+vy*vy; if(c2<=c1) return Math.hypot(p.x-b.x,p.y-b.y);
  const t=c1/c2; return Math.hypot(p.x-(a.x+t*vx), p.y-(a.y+t*vy));
}
function lineDragStart(e){
  if(tool!=='select'||lineDrag) return;
  const id=e.features&&e.features[0]&&e.features[0].properties.id;
  const s=state.segments.find(x=>x.id===id);
  if(!s||!ptById(s.a)||!ptById(s.b)) return;
  e.preventDefault();                              // не начинать панорамирование карты
  if(!s.waypoints) s.waypoints=[];
  const path=segPath(s);                           // [A, ...узлы, B]
  let best=0, bestD=Infinity;                       // ближайший участок ломаной → индекс вставки узла
  for(let i=0;i<path.length-1;i++){
    const d=distToSeg(e.point, map.project(path[i]), map.project(path[i+1]));
    if(d<bestD){ bestD=d; best=i; }
  }
  lineDrag={s, index:best, inserted:false, start:e.point};
  map.dragPan.disable();
  map.getCanvas().style.cursor='grabbing';
}
function lineDragMove(e){
  if(!lineDrag) return;
  const s=lineDrag.s;
  if(!lineDrag.inserted){                           // микросдвиг игнорируем — это был обычный клик
    if(Math.hypot(e.point.x-lineDrag.start.x, e.point.y-lineDrag.start.y) < 4) return;
    s.waypoints.splice(lineDrag.index,0,[e.lngLat.lng,e.lngLat.lat]);
    lineDrag.inserted=true;
  } else {
    s.waypoints[lineDrag.index]=[e.lngLat.lng,e.lngLat.lat];
  }
  updateRouteData();
}
function lineDragEnd(){
  if(!lineDrag) return;
  const s=lineDrag.s, moved=lineDrag.inserted;
  lineDrag=null;
  map.dragPan.enable();
  map.getCanvas().style.cursor=tool==='select'?'grab':'';
  if(moved){
    if(!(selected&&selected.type==='segment'&&selected.id===s.id)) selectThing('segment',s.id);
    else { refreshRoutes(); renderInspector(); }
    persistCurrent();
  }
}
map.on('mousedown','routes-line',lineDragStart);
map.on('mousemove',lineDragMove);
map.on('mouseup',lineDragEnd);
map.on('touchstart','routes-line',lineDragStart);
map.on('touchmove',lineDragMove);
map.on('touchend',lineDragEnd);

byId('tools').addEventListener('click',e=>{ const b=e.target.closest('.tool'); if(b) setTool(b.dataset.tool); });
window.addEventListener('keydown',e=>{
  if(/input|textarea|select/i.test(e.target.tagName)) return;
  const m={v:'select',p:'point',l:'connect',d:'delete'};
  if(m[e.key.toLowerCase()]) setTool(m[e.key.toLowerCase()]);
  if((e.key==='Delete'||e.key==='Backspace')&&selected){ selected.type==='point'?deletePoint(selected.id):deleteSegment(selected.id); }
  if(e.key==='Escape'){ connectFrom=null; selectNone(); renderPoints(); renderInspector(); updateHint(); }
});

byId('zin').onclick=()=>map.zoomIn();
byId('zout').onclick=()=>map.zoomOut();
byId('fitWorld').onclick=()=>map.fitBounds([[-179,-78],[179,84]],{duration:500});
byId('styleSel').onchange=e=>setMapStyle(e.target.value);
byId('saveBtn').onclick=()=>download(new Blob([JSON.stringify({v:1,state})],{type:'application/json'}),'route.json');
byId('importBtn').onclick=()=>byId('fileInput').click();
byId('fileInput').onchange=e=>{
  const f=e.target.files[0]; if(!f) return;
  const fr=new FileReader();
  fr.onload=()=>{ try{ const obj=JSON.parse(fr.result); applyState(obj.state||obj);
      renderAll(); applyAllToggles(); renderInspector(); persistCurrent(); }
    catch(err){ alert('Не удалось открыть файл: '+err.message); } };
  fr.readAsText(f); e.target.value='';
};
byId('pngBtn').onclick=exportPNG;
byId('historyBtn').onclick=openHistory;
byId('styleFab').onclick=()=>{ selectNone(); renderPoints(); renderInspector(); openSheet(); };

// мобильное меню + шторка
byId('menuToggle').onclick=e=>{ e.stopPropagation(); document.body.classList.toggle('menu-open'); };
byId('menu').addEventListener('click',e=>{ if(e.target.closest('.ghost')) document.body.classList.remove('menu-open'); });
document.addEventListener('click',e=>{
  if(document.body.classList.contains('menu-open')&&!e.target.closest('#menu')&&!e.target.closest('#menuToggle'))
    document.body.classList.remove('menu-open');
});
byId('sheetHandle').addEventListener('click',()=>{ selectNone(); renderPoints(); renderInspector(); updateHint(); });
byId('scrim').onclick=()=>{ selectNone(); renderPoints(); renderInspector(); updateHint(); };

document.addEventListener('visibilitychange',()=>{ if(document.hidden) persistCurrent(); });
window.addEventListener('pagehide',persistCurrent);
setInterval(persistCurrent,3000);

// ======================= демо-данные =======================
function seed(){
  const demo=[
    {ll:[98.34,7.95],label:'1',caption:'ПХУКЕТ',side:'left'},
    {ll:[100.01,9.51],label:'2',caption:'САМУИ',side:'right'},
    {ll:[100.06,9.73],label:'3',caption:'ПАНГАН',side:'right'},
    {ll:[102.32,12.05],label:'4',caption:'КО ЧАНГ',side:'top'}
  ];
  demo.forEach(d=>state.points.push({id:nid(),ll:d.ll,label:d.label,caption:d.caption,side:d.side}));
  state.counter=demo.length+1;
  for(let i=0;i<state.points.length-1;i++)
    state.segments.push({id:nid(),a:state.points[i].id,b:state.points[i+1].id,dist:null,auto:true,showLabel:true,follow:true});
}
