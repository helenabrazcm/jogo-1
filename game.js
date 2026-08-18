// ── Safe storage (works even when localStorage is blocked by sandbox) ──
const _memStore = {};
function safeLSGet(key){
  try{ return localStorage.getItem(key); }catch(e){ return _memStore[key] ?? null; }
}
function safeLSSet(key, val){
  try{ localStorage.setItem(key, val); }catch(e){ _memStore[key]=String(val); }
}

// ══════════════════════════════════════════════════════
//  TEXTURE FACTORY
// ══════════════════════════════════════════════════════
const TC={};
function cnvTex(w,h,fn,repeat){
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const c=cv.getContext('2d');fn(c,w,h);
  const t=new THREE.CanvasTexture(cv);
  if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);}
  return t;
}
function noise(c,w,h,amt){
  const d=c.getImageData(0,0,w,h);
  for(let i=0;i<d.data.length;i+=4){const n=(Math.random()-.5)*amt;d.data[i]+=n;d.data[i+1]+=n;d.data[i+2]+=n;}
  c.putImageData(d,0,0);
}
function hex2rgb(h){return{r:(h>>16)&255,g:(h>>8)&255,b:h&255};}

function woodTex(base,dark,rep=1){
  return cnvTex(512,512,(c,w,h)=>{
    const b=hex2rgb(base);
    c.fillStyle=`rgb(${b.r},${b.g},${b.b})`;c.fillRect(0,0,w,h);
    for(let i=0;i<30;i++){
      const x=Math.random()*w;const gw=0.5+Math.random()*2;
      const grd=c.createLinearGradient(x,0,x+gw,h);
      grd.addColorStop(0,`rgba(0,0,0,0)`);
      grd.addColorStop(0.4,`rgba(0,0,0,${0.06+Math.random()*.1})`);
      grd.addColorStop(1,`rgba(0,0,0,0)`);
      c.fillStyle=grd;c.fillRect(x,0,gw,h);
    }
    for(let i=0;i<12;i++){
      const x=Math.random()*w;
      c.fillStyle=`rgba(255,255,255,${0.02+Math.random()*.04})`;
      c.fillRect(x,0,0.5+Math.random()*1.5,h);
    }
    noise(c,w,h,12);
  },rep);
}

function floorTex(base){
  return cnvTex(1024,1024,(c,w,h)=>{
    const b=hex2rgb(base);
    const pw=w/10;
    const variants=[base,base-0x0f0e0c,base+0x0c0b08,base-0x070605];
    for(let i=0;i<10;i++){
      const vb=hex2rgb(variants[i%variants.length]);
      c.fillStyle=`rgb(${Math.max(0,Math.min(255,vb.r))},${Math.max(0,Math.min(255,vb.g))},${Math.max(0,Math.min(255,vb.b))})`;
      c.fillRect(i*pw,0,pw,h);
      for(let g=0;g<20;g++){
        const gy=Math.random()*h;const gx=i*pw;
        c.strokeStyle=`rgba(0,0,0,${0.04+Math.random()*.07})`;
        c.lineWidth=0.5+Math.random();
        c.beginPath();c.moveTo(gx,gy);c.lineTo(gx+pw,gy+Math.random()*30-15);c.stroke();
      }
    }
    c.fillStyle='rgba(0,0,0,0.25)';
    for(let i=1;i<10;i++){c.fillRect(i*pw-1,0,2,h);}
    noise(c,w,h,10);
  },4);
}

function wallTex(base){
  return cnvTex(512,512,(c,w,h)=>{
    const b=hex2rgb(base);
    c.fillStyle=`rgb(${b.r},${b.g},${b.b})`;c.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=2){
      c.fillStyle=`rgba(255,255,255,${Math.random()*.025})`;
      c.fillRect(0,y,w,1);
    }
    noise(c,w,h,18);
  },2);
}

function fabricTex(base,pattern='weave'){
  return cnvTex(128,128,(c,w,h)=>{
    const b=hex2rgb(base);
    c.fillStyle=`rgb(${b.r},${b.g},${b.b})`;c.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=4){
      for(let x=0;x<w;x+=4){
        const v=((x/4+y/4)%2===0)?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.09)';
        c.fillStyle=v;c.fillRect(x,y,3,3);
      }
    }
    noise(c,w,h,8);
  });
}

function metalTex(base){
  return cnvTex(256,256,(c,w,h)=>{
    const b=hex2rgb(base);
    c.fillStyle=`rgb(${b.r},${b.g},${b.b})`;c.fillRect(0,0,w,h);
    for(let i=0;i<40;i++){
      const y=Math.random()*h;
      c.strokeStyle=`rgba(255,255,255,${0.02+Math.random()*.08})`;
      c.lineWidth=0.5+Math.random()*.8;
      c.beginPath();c.moveTo(0,y);c.lineTo(w,y+Math.random()*3-1.5);c.stroke();
    }
  });
}

function cardboardTex(){
  return cnvTex(512,256,(c,w,h)=>{
    c.fillStyle='#c09a58';c.fillRect(0,0,w,h);
    for(let y=0;y<h;y+=3){
      const a=0.03+Math.abs(Math.sin(y*.4))*.05;
      c.fillStyle=`rgba(0,0,0,${a})`;c.fillRect(0,y,w,1.5);
    }
    c.fillStyle='rgba(120,80,20,0.12)';
    c.font='bold 18px sans-serif';c.textAlign='center';
    c.fillText('📦 FRAGILE',w/2,h*.4);
    c.fillText('⬆ ESTE LADO',w/2,h*.65);
    noise(c,w,h,14);
  });
}

function marbleTex(){
  return cnvTex(512,512,(c,w,h)=>{
    c.fillStyle='#e8dcc8';c.fillRect(0,0,w,h);
    for(let i=0;i<8;i++){
      c.strokeStyle=`rgba(180,160,130,${0.15+Math.random()*.2})`;
      c.lineWidth=0.5+Math.random()*2;
      c.beginPath();
      let x=Math.random()*w,y=0;
      c.moveTo(x,y);
      for(let s=0;s<20;s++){x+=Math.random()*60-30;y+=h/20;c.lineTo(x+Math.random()*10-5,y);}
      c.stroke();
    }
    noise(c,w,h,8);
  });
}

function tileTex(){
  return cnvTex(256,256,(c,w,h)=>{
    c.fillStyle='#ddd0b0';c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(160,140,90,0.5)';c.lineWidth=1.5;
    for(let x=0;x<=w;x+=32){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
    for(let y=0;y<=h;y+=32){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    noise(c,w,h,6);
  });
}

function grassTex(){
  return cnvTex(512,512,(c,w,h)=>{
    c.fillStyle='#5a8c3a';c.fillRect(0,0,w,h);
    for(let i=0;i<2200;i++){
      const x=Math.random()*w,y=Math.random()*h;
      const g=Math.random()*30-15;
      c.strokeStyle=`rgba(${60+g},${120+g},${40+g*.5},0.5)`;
      c.lineWidth=1;
      c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.random()*2-1,y-3-Math.random()*4);c.stroke();
    }
    noise(c,w,h,10);
  },3);
}

function skyTex(){
  return cnvTex(512,512,(c,w,h)=>{
    const grad=c.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#6fa8d8');grad.addColorStop(.55,'#bcdcef');grad.addColorStop(1,'#eaf4f6');
    c.fillStyle=grad;c.fillRect(0,0,w,h);
    c.fillStyle='rgba(255,255,255,0.85)';
    [[80,90,40,18],[180,140,55,20],[380,80,45,16],[300,200,38,14]].forEach(([x,y,rx,ry])=>{
      c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();
    });
  });
}

function pavingTex(){
  return cnvTex(256,256,(c,w,h)=>{
    c.fillStyle='#9a9082';c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(60,55,45,0.4)';c.lineWidth=2;
    for(let x=0;x<=w;x+=42)for(let y=0;y<=h;y+=42){
      c.strokeRect(x+(y/42%2?21:0),y,40,40);
    }
    noise(c,w,h,12);
  },2);
}

function clockFaceTex(){
  return cnvTex(256,256,(c,w,h)=>{
    c.fillStyle='#f5f0e0';c.fillRect(0,0,w,h);
    c.beginPath();c.arc(128,128,118,0,Math.PI*2);c.strokeStyle='#403020';c.lineWidth=6;c.stroke();
    c.fillStyle='#302010';c.textAlign='center';c.textBaseline='middle';c.font='bold 28px sans-serif';
    [['12',128,34],['3',222,128],['6',128,222],['9',34,128]].forEach(([t,x,y])=>c.fillText(t,x,y));
    c.strokeStyle='#403020';c.lineWidth=3;
    for(let i=0;i<12;i++){
      const a=i/12*Math.PI*2;
      c.beginPath();c.moveTo(128+Math.cos(a)*100,128+Math.sin(a)*100);
      c.lineTo(128+Math.cos(a)*112,128+Math.sin(a)*112);c.stroke();
    }
  });
}

function soccerTex(){
  return cnvTex(256,256,(c,w,h)=>{
    c.fillStyle='#f0f0f0';c.fillRect(0,0,w,h);
    c.fillStyle='#1c1c1c';
    const pent=(cx,cy,r,rot)=>{
      c.beginPath();
      for(let i=0;i<5;i++){const a=rot+i/5*Math.PI*2;const px=cx+Math.cos(a)*r,py=cy+Math.sin(a)*r;i===0?c.moveTo(px,py):c.lineTo(px,py);}
      c.closePath();c.fill();
    };
    pent(64,64,30,.2);pent(192,64,30,.5);pent(128,150,34,0);pent(40,200,28,.8);pent(216,200,28,.1);
    c.strokeStyle='rgba(0,0,0,0.5)';c.lineWidth=3;
    c.strokeRect(0,0,w,h);
    noise(c,w,h,6);
  });
}

function photoTex(){
  return cnvTex(128,160,(c,w,h)=>{
    const grad=c.createLinearGradient(0,0,0,h);
    grad.addColorStop(0,'#a8d0e8');grad.addColorStop(.55,'#cfe8d8');grad.addColorStop(1,'#7aa860');
    c.fillStyle=grad;c.fillRect(0,0,w,h);
    c.fillStyle='rgba(255,230,140,0.9)';c.beginPath();c.arc(94,30,16,0,Math.PI*2);c.fill();
    c.fillStyle='#4a6038';
    c.beginPath();c.moveTo(0,h*.6);c.quadraticCurveTo(w*.3,h*.45,w*.5,h*.58);c.quadraticCurveTo(w*.75,h*.5,w,h*.62);c.lineTo(w,h);c.lineTo(0,h);c.closePath();c.fill();
    c.fillStyle='#2a3a20';
    [[20,h*.62],[60,h*.58],[100,h*.65]].forEach(([x,y])=>{
      c.beginPath();c.moveTo(x,y);c.lineTo(x+4,y-22);c.lineTo(x+8,y);c.closePath();c.fill();
    });
  });
}

function labelTex(col){
  return cnvTex(128,64,(c,w,h)=>{
    const b=hex2rgb(col);
    c.fillStyle='#f5f0e0';c.fillRect(0,0,w,h);
    c.fillStyle=`rgba(${b.r},${b.g},${b.b},0.85)`;c.fillRect(0,h*.28,w,h*.44);
    c.strokeStyle='rgba(255,255,255,0.6)';c.lineWidth=2;c.strokeRect(6,h*.3,w-12,h*.4);
    noise(c,w,h,8);
  });
}

// ══════════════════════════════════════════════════════
//  GAME DATA
// ══════════════════════════════════════════════════════
const ROOMS=[
{
  id:'bedroom',name:'Quarto',
  wallColor:0x5a5048,floorColor:0xd4c8b0,trimColor:0x4a4038,
  size:{w:12,d:12,h:4.5},
  boxPositions:[{x:-5.2,z:5.0},{x:-3.2,z:5.1},{x:-1.2,z:4.9}],
  furniture:[
    {id:'bed',      type:'bed',      label:'Cama',           pos:{x:0,z:-4.0}, rot:0,
     size:{w:2.6,h:0.9,d:3.4}, color:0xd0c8bc,
     slots:[{x:-0.5,z:-1.0,l:'Travesseiro esq'},{x:0.5,z:-1.0,l:'Travesseiro dir'},{x:0,z:0,l:'Centro cama'},{x:0,z:1.0,l:'Pé da cama'}]},
    {id:'nightstand',type:'nightstand',label:'Criado-mudo', pos:{x:-1.9,z:-5.55},rot:0, wall:true,
     size:{w:0.55,h:0.55,d:0.45}, color:0xc8b8a0,
     slots:[{x:0,z:0,l:'Topo'},{x:0,z:0,yFrac:0.4,l:'Gaveta'}]},
    {id:'nightstand2',type:'nightstand',label:'Criado Dir', pos:{x:1.9,z:-5.55},rot:0, wall:true,
     size:{w:0.55,h:0.55,d:0.45}, color:0xc8b8a0,
     slots:[{x:0,z:0,l:'Topo'},{x:0,z:0,yFrac:0.4,l:'Gaveta'}]},
    {id:'closet',   type:'closet',   label:'Guarda-roupa',   pos:{x:-5.7,z:-0.8},  rot:1.5707963267948966, wall:true,
     size:{w:3.4,h:2.9,d:0.85}, color:0x3a3e44,
     slots:[{x:-0.9,z:0,l:'Esq'},{x:0,z:0,l:'Centro'},{x:0.9,z:0,l:'Dir'},{x:-0.9,z:0,yFrac:0.3,l:'Prat. esq'},{x:0.9,z:0,yFrac:0.3,l:'Prat. dir'}]},
    {id:'desk',     type:'desk',     label:'Escrivaninha',   pos:{x:5.5,z:-3.5}, rot:-1.5707963267948966, wall:true,
     size:{w:1.9,h:0.75,d:0.65}, color:0xe8e4dc,
     slots:[{x:-0.5,z:0,l:'Esq'},{x:0,z:0,l:'Centro'},{x:0.5,z:0,l:'Dir'}]},
    {id:'wallcab',  type:'wallcabinet', label:'Armário Aéreo', pos:{x:5.55,z:-3.5}, rot:-1.5707963267948966, wall:true, elevY:1.55,
     size:{w:1.9,h:0.42,d:0.38}, color:0xe8e4dc,
     slots:[{x:-0.4,z:0,l:'Esq'},{x:0.4,z:0,l:'Dir'}]},
    {id:'chair',     type:'gamingchair', label:'Cadeira Gamer', pos:{x:4.3,z:-3.5},  rot:1.5707963267948966,
     size:{w:0.7,h:1.35,d:0.7}, color:0x1a1a1e,
     slots:[{x:0,z:0,l:'Assento'}]},
    {id:'shelf',    type:'shelf',    label:'Estante',        pos:{x:5.6,z:1.2}, rot:-1.5707963267948966, wall:true,
     size:{w:1.2,h:2.3,d:0.45}, color:0xd8d0c4,
     slots:[{x:0,z:0,yFrac:0.78,l:'Topo'},{x:0,z:0,yFrac:0.53,l:'2ª prat'},{x:0,z:0,yFrac:0.28,l:'3ª prat'},{x:0,z:0,yFrac:0.03,l:'Base'}]},
    // Plant in far right corner against walls
    {id:'plant',    type:'bigplant', label:'Planta',         pos:{x:5.4,z:5.2}, rot:0,
     size:{w:0.55,h:1.3,d:0.55}, color:0x4a8c44,
     slots:[{x:0,z:0,l:'Base'}]},
    // Second plant left front corner
    {id:'plant2',   type:'bigplant', label:'Planta 2',       pos:{x:-5.4,z:5.2}, rot:0,
     size:{w:0.5,h:1.15,d:0.5}, color:0x4a8c44,
     slots:[{x:0,z:0,l:'Base'}]},
    {id:'floorlamp', type:'floorlamp',label:'Luminária',pos:{x:-3.1,z:-5.4},rot:0,
     size:{w:0.28,h:1.6,d:0.28},  color:0xe8c060,
     slots:[{x:0,z:0,l:'Base'}]},
    {id:'floorlamp2', type:'floorlamp',label:'Abajur',pos:{x:5.2,z:-5.4},rot:0,
     size:{w:0.25,h:1.4,d:0.25},  color:0xe8c060,
     slots:[{x:0,z:0,l:'Base'}]},
    // Wall art above bed
    {id:'wallart1', type:'wallart',  label:'Quadro',         pos:{x:-0.55,z:-5.9}, rot:0, wall:true, elevY:1.6,
     size:{w:0.7,h:0.85,d:0.06}, color:0x2a2a2e,
     slots:[{x:0,z:0,l:'Parede'}]},
    {id:'wallart2', type:'wallart',  label:'Quadro 2',       pos:{x:0.55,z:-5.9}, rot:0, wall:true, elevY:1.6,
     size:{w:0.7,h:0.85,d:0.06}, color:0x2a2a2e,
     slots:[{x:0,z:0,l:'Parede'}]},
    // Floating shelf on back wall
    {id:'floatshelf', type:'floatshelf', label:'Prateleira', pos:{x:3.5,z:-5.85}, rot:0, wall:true, elevY:1.7,
     size:{w:1.2,h:0.12,d:0.28}, color:0xc8b8a0,
     slots:[{x:-0.3,z:0,l:'Esq'},{x:0.3,z:0,l:'Dir'}]},
    {id:'rug',       type:'rug',      label:'Tapete',        pos:{x:0,z:-2.0},  rot:0,
     size:{w:3.2,h:0.02,d:2.6}, color:0xc8c0b0,
     slots:[{x:-0.6,z:0,l:'Esq'},{x:0.6,z:0,l:'Dir'},{x:0,z:0,l:'Centro'}]},
    {id:'bench',    type:'ottoman',  label:'Banco',          pos:{x:0,z:-1.7}, rot:0,
     size:{w:1.3,h:0.48,d:0.45}, color:0x6a6560,
     slots:[{x:0,z:0,l:'Assento'}]},
    // Small dresser near closet
    {id:'dresser',  type:'nightstand', label:'Cômoda',       pos:{x:-5.5,z:2.8}, rot:1.5707963267948966, wall:true,
     size:{w:1.0,h:0.85,d:0.5}, color:0xc8b8a0,
     slots:[{x:0,z:0,l:'Topo'},{x:0,z:0,yFrac:0.4,l:'Gaveta'}]},
    {id:'deco1', type:'floorlamp', label:'Abajur Deco', pos:{x:-4.5,z:3.5}, rot:0,
     size:{w:0.25,h:1.3,d:0.25}, color:0xe8c060, slots:[{x:0,z:0,l:'Base'}]},
    {id:'deco2', type:'wallart', label:'Quadro Deco', pos:{x:3.2,z:-5.9}, rot:0, wall:true, elevY:1.8,
     size:{w:0.55,h:0.7,d:0.05}, color:0x2a2a2e, slots:[{x:0,z:0,l:'Parede'}]},
    {id:'floor',     type:'floor',    label:'Chão',          pos:{x:0,z:4.2},     rot:0,
     size:{w:3.5,h:0.02,d:2.0}, color:0,
     slots:[{x:-0.8,z:0,l:'Esq'},{x:0.8,z:0,l:'Dir'},{x:0,z:0,l:'Centro'}]},
  ],
  items:[
    {id:'pillow',   e:'🛏️',n:'Travesseiro',    h:'Na cama',          bz:'bed',    bp:32,az:'nightstand',ap:14,col:0xf5f2ec,shape:'pillow',  anim:'drop_soft'},
    {id:'bear',     e:'🧸',n:'Ursinho',         h:'Na cama/estante',  bz:'bed',    bp:28,az:'shelf',    ap:22,col:0xb07848,shape:'bear',    anim:'bounce'},
    {id:'blanket',  e:'🛌',n:'Cobertor',        h:'Na cama',          bz:'bed',    bp:36,az:'floor',    ap:4, col:0x2a2e36,shape:'blanket', anim:'cloth'},
    {id:'book',     e:'📖',n:'Livro',           h:'Na estante',       bz:'shelf',  bp:34,az:'desk',     ap:20,col:0xc04444,shape:'book',    anim:'slide'},
    {id:'novels',   e:'📚',n:'Romances',        h:'Na estante',       bz:'shelf',  bp:34,az:'nightstand',ap:12,col:0x4468c4,shape:'book',   anim:'slide'},
    {id:'laptop',   e:'💻',n:'Notebook',        h:'Na escrivaninha',  bz:'desk',   bp:38,az:'floor',    ap:4, col:0x383838,shape:'laptop',  anim:'place_flat'},
    {id:'lamp',     e:'🪔',n:'Luminária',       h:'Na escrivaninha',  bz:'desk',   bp:30,az:'nightstand',ap:18,col:0xe8c060,shape:'lamp',   anim:'place_tall'},
    {id:'clock',    e:'⏰',n:'Despertador',     h:'No criado-mudo',   bz:'nightstand',bp:34,az:'desk', ap:22,col:0xd84040,shape:'clock',   anim:'place_small'},
    {id:'phone',    e:'📱',n:'Celular',         h:'No criado-mudo',   bz:'nightstand',bp:30,az:'desk', ap:18,col:0x202020,shape:'phone',   anim:'place_flat'},
    {id:'clothes',  e:'👕',n:'Camisetas',       h:'No guarda-roupa',  bz:'closet', bp:36,az:'floor',    ap:2, col:0x4090c0,shape:'clothes', anim:'fold'},
    {id:'shoes',    e:'👟',n:'Tênis',           h:'No chão',          bz:'floor',  bp:20,az:'closet',   ap:14,col:0x1a1a1e,shape:'shoes',   anim:'drop'},
    {id:'photo',    e:'🖼️',n:'Porta-retrato',   h:'Na estante',       bz:'shelf',  bp:32,az:'desk',     ap:18,col:0x906030,shape:'photo',   anim:'lean'},
    {id:'plant',    e:'🪴',n:'Planta',          h:'Na escrivaninha',  bz:'desk',   bp:26,az:'floor',    ap:20,col:0x4a8c44,shape:'plant',   anim:'place_tall'},
    {id:'hdp',      e:'🎧',n:'Fone de ouvido',  h:'Na escrivaninha',  bz:'desk',   bp:28,az:'shelf',    ap:20,col:0x303030,shape:'headphones',anim:'place_small'},
    {id:'mirror',   e:'🪞',n:'Espelho',         h:'Na estante',       bz:'shelf',  bp:30,az:'closet',   ap:16,col:0xb8c8d8,shape:'mirror',  anim:'lean'},
    {id:'jewelrybox',e:'💎',n:'Caixa de Joias',  h:'No criado-mudo',   bz:'nightstand',bp:30,az:'shelf', ap:16,col:0xc060a0,shape:'jewelrybox',anim:'place_small'},
    {id:'slippers', e:'🥿',n:'Chinelos',        h:'No chão/guarda-roupa',bz:'floor', bp:18,az:'closet', ap:14,col:0xd8b070,shape:'shoes',   anim:'drop'},
    {id:'diary',    e:'📔',n:'Diário',          h:'No criado-mudo',   bz:'nightstand',bp:26,az:'shelf',  ap:18,col:0x704030,shape:'book',    anim:'place_flat'},
    {id:'socks',    e:'🧦',n:'Meias',           h:'No guarda-roupa',  bz:'closet', bp:22,az:'floor',   ap:6, col:0x406080,shape:'clothes', anim:'fold'},
    {id:'perfume',  e:'🌸',n:'Perfume',         h:'No criado-mudo',   bz:'nightstand',bp:28,az:'desk',  ap:16,col:0xe8c0d0,shape:'bottle',  anim:'place_tall'},
    {id:'glasses',  e:'👓',n:'Óculos',          h:'No criado-mudo',   bz:'nightstand',bp:24,az:'desk',  ap:14,col:0x303030,shape:'place_small',anim:'place_small'},
    {id:'candle2',  e:'🕯️',n:'Vela',            h:'No criado-mudo',   bz:'nightstand',bp:22,az:'desk',  ap:14,col:0xe8d8b0,shape:'candle',anim:'place_small'},
    {id:'mug2',     e:'☕',n:'Caneca',          h:'Na escrivaninha',  bz:'desk',   bp:24,az:'shelf', ap:16,col:0xd06040,shape:'mug',anim:'place_small'},
    {id:'camera2',  e:'📷',n:'Câmera',          h:'Na estante',       bz:'shelf',  bp:28,az:'desk',  ap:18,col:0x303038,shape:'camera',anim:'place_small'},
    {id:'socks2',   e:'🧦',n:'Meias Esportivas',h:'No guarda-roupa',  bz:'closet', bp:20,az:'floor', ap:8, col:0x306050,shape:'clothes',anim:'fold'},
  ]
},
{
  id:'bathroom',name:'Banheiro',
  wallColor:0x7a9a90,floorColor:0xe0d4c0,trimColor:0x5a6a60,
  size:{w:9,d:9,h:4.2},
  boxPositions:[{x:-2.8,z:3.0},{x:0.5,z:3.1}],
  furniture:[
    {id:'sink',    type:'sink',    label:'Pia',          pos:{x:-3.3,z:-3.8}, rot:0, wall:true,
     size:{w:1.6,h:1.15,d:0.7}, color:0xe8e4dc,
     slots:[{x:-0.4,z:0,l:'Esq'},{x:0.4,z:0,l:'Dir'},{x:0,z:0,l:'Centro'}]},
    {id:'toilet',  type:'toilet',  label:'Vaso Sanitário',pos:{x:-1.2,z:-3.9},  rot:0, wall:true,
     size:{w:0.75,h:1.1,d:0.95}, color:0xf0f0ec,
     slots:[{x:0,z:0,l:'Tampa'}]},
    {id:'shower',  type:'shower',  label:'Box/Chuveiro',  pos:{x:3.1,z:-3.4},   rot:0, wall:true,
     size:{w:1.7,h:2.2,d:1.6}, color:0xcfe6e8,
     slots:[{x:-0.35,z:0.3,l:'Canto esq'},{x:0.35,z:0.3,l:'Canto dir'}]},
    {id:'cabinet', type:'bathcabinet',label:'Armário',    pos:{x:-3.75,z:1.0},  rot:1.5707963267948966, wall:true,
     size:{w:1.1,h:2.1,d:0.5}, color:0xffffff,
     slots:[{x:-0.25,z:0,yFrac:0.75,l:'Prat. alta'},{x:0.25,z:0,yFrac:0.75,l:'Prat. alta dir'},{x:-0.25,z:0,yFrac:0.45,l:'Prat. média'},{x:0.25,z:0,yFrac:0.45,l:'Prat. média dir'},{x:0,z:0,yFrac:0.2,l:'Baixo'}]},
    {id:'hamper',  type:'hamper',  label:'Cesto de Roupa',pos:{x:1.7,z:-3.5},  rot:0,
     size:{w:0.55,h:0.65,d:0.55}, color:0xc0c8d0,
     slots:[{x:0,z:0,l:'Dentro'}]},
    {id:'floor',   type:'floor',   label:'Chão',          pos:{x:0.5,z:2.0},   rot:0,
     size:{w:2.0,h:0.02,d:1.4}, color:0,
     slots:[{x:-0.4,z:0,l:'Esq'},{x:0.4,z:0,l:'Dir'}]},
  ],
  items:[
    {id:'towel',   e:'🧺',n:'Toalhas',        h:'No armário',       bz:'cabinet', bp:32,az:'hamper', ap:14,col:0x4ab0c0,shape:'clothes', anim:'fold'},
    {id:'soap',    e:'🧼',n:'Sabonete',       h:'Na pia',           bz:'sink',    bp:26,az:'cabinet',ap:18,col:0xeee0b0,shape:'soap',anim:'place_small'},
    {id:'shampoo', e:'🧴',n:'Shampoo',        h:'No box/chuveiro',  bz:'shower',  bp:30,az:'cabinet',ap:18,col:0x5ab0a0,shape:'bottle',  anim:'place_tall'},
    {id:'toothbrush',e:'🪥',n:'Escova Dental',h:'Na pia',           bz:'sink',    bp:28,az:'cabinet',ap:16,col:0x3ca0d0,shape:'toothbrush',anim:'place_small'},
    {id:'tpaper',  e:'🧻',n:'Papel Higiênico',h:'No vaso',          bz:'toilet',  bp:24,az:'cabinet',ap:16,col:0xf8f4ea,shape:'roll',anim:'place_small'},
    {id:'rugbath', e:'🟦',n:'Tapete de Banho',h:'No chão',          bz:'floor',   bp:22,az:'shower', ap:10,col:0x4a90c0,shape:'blanket',  anim:'cloth'},
    {id:'plantb',  e:'🪴',n:'Planta',         h:'Na pia/armário',   bz:'sink',    bp:20,az:'cabinet',ap:18,col:0x4a8c44,shape:'plant',   anim:'place_tall'},
    {id:'mirrorb', e:'🪞',n:'Espelho',        h:'No armário',       bz:'cabinet', bp:24,az:'sink',   ap:14,col:0xb8c8d8,shape:'mirror',  anim:'lean'},
    {id:'robe',    e:'🥋',n:'Roupão',         h:'No cesto/armário', bz:'hamper',  bp:22,az:'cabinet',ap:16,col:0xe8d8c0,shape:'clothes', anim:'fold'},
    {id:'duck',    e:'🦆',n:'Patinho',        h:'No box/chuveiro',  bz:'shower',  bp:18,az:'sink',   ap:8, col:0xf0c020,shape:'bear',    anim:'bounce'},
    {id:'razor',   e:'🪒',n:'Barbeador',      h:'Na pia',           bz:'sink',    bp:24,az:'cabinet',ap:16,col:0x707070,shape:'razor',anim:'place_small'},
    {id:'candle',  e:'🕯️',n:'Vela Aromática', h:'No armário/pia',   bz:'cabinet', bp:22,az:'sink',   ap:14,col:0xe8d8b0,shape:'candle',  anim:'place_small'},
    {id:'soap2',   e:'🧼',n:'Saboneteira',    h:'Na pia',           bz:'sink',    bp:20,az:'cabinet',ap:12,col:0xe0e8f0,shape:'place_small',anim:'place_small'},
    {id:'towel2',  e:'🧺',n:'Toalha Extra',   h:'No armário',       bz:'cabinet', bp:22,az:'hamper', ap:14,col:0xd0e0f0,shape:'clothes',anim:'fold'},
  ]
},
{
  id:'kitchen',name:'Cozinha',
  wallColor:0x8aaa70,floorColor:0xd0bc88,trimColor:0x6a5028,
  size:{w:12,d:12,h:4.5},
  boxPositions:[{x:-4,z:4.2},{x:-1.6,z:4.1},{x:0.6,z:4.2}],
  furniture:[
    {id:'fridge', type:'fridge',   label:'Geladeira',  pos:{x:-5.0,z:-5.4},rot:0, wall:true,
     size:{w:1.2,h:2.1,d:0.9},  color:0xe8eef4,
     slots:[{x:-0.25,z:0,yFrac:0.7,l:'Prat. superior'},{x:0,z:0,yFrac:0.45,l:'Prat. meio'},{x:0.25,z:0,yFrac:0.2,l:'Gaveta'}]},
    {id:'stove',  type:'stove',    label:'Fogão',      pos:{x:-3.3,z:-5.4},rot:0, wall:true,
     size:{w:1.5,h:0.95,d:0.88}, color:0x606060,
     slots:[{x:-0.3,z:0,l:'Queimador esq'},{x:0.3,z:0,l:'Queimador dir'},{x:0,z:0,yFrac:0.25,l:'Forno'}]},
    {id:'counter',type:'counter',  label:'Bancada',    pos:{x:1.2,z:-5.4},  rot:0, wall:true,
     size:{w:5.0,h:0.95,d:0.9}, color:0xb89860,
     slots:[{x:-1.8,z:0,l:'Esq'},{x:-0.9,z:0,l:'Centro-esq'},{x:0,z:0,l:'Centro'},{x:0.9,z:0,l:'Centro-dir'},{x:1.8,z:0,l:'Dir'},{x:0,z:0,yFrac:0.35,l:'Dentro'}]},
    {id:'cabinet',type:'cabinet',  label:'Armário',    pos:{x:5.5,z:-2.5},rot:-1.5707963267948966, wall:true,
     size:{w:1.7,h:2.2,d:0.65},  color:0x9a7450,
     slots:[{x:-0.5,z:0,l:'Prat. alta'},{x:0,z:0,l:'Prat. média'},{x:0.5,z:0,l:'Prat. baixa'}]},
    {id:'microwave',type:'microwave',label:'Micro-ondas',pos:{x:2.8,z:-5.0},rot:0,
     size:{w:0.55,h:0.4,d:0.4}, color:0x303030,
     slots:[{x:0,z:0,l:'Prato giratório'}]},
    {id:'table',  type:'table',    label:'Mesa Jantar', pos:{x:0,z:0.3},  rot:0,
     size:{w:1.8,h:0.78,d:1.0},  color:0x8a6c4a,
     slots:[{x:-0.5,z:0,l:'Esq'},{x:0.5,z:0,l:'Dir'},{x:0,z:0,l:'Centro'}]},
    {id:'chair1', type:'chair',    label:'Cadeira 1',  pos:{x:-0.9,z:-0.5}, rot:0,
     size:{w:0.5,h:0.95,d:0.5}, color:0x6a4a30,
     slots:[{x:0,z:0,l:'Assento'}]},
    {id:'chair2', type:'chair',    label:'Cadeira 2',  pos:{x:0.9,z:-0.5}, rot:0,
     size:{w:0.5,h:0.95,d:0.5}, color:0x6a4a30,
     slots:[{x:0,z:0,l:'Assento'}]},
    {id:'chair3', type:'chair',    label:'Cadeira 3',  pos:{x:-0.9,z:1.1}, rot:3.14159,
     size:{w:0.5,h:0.95,d:0.5}, color:0x6a4a30,
     slots:[{x:0,z:0,l:'Assento'}]},
    {id:'chair4', type:'chair',    label:'Cadeira 4',  pos:{x:0.9,z:1.1}, rot:3.14159,
     size:{w:0.5,h:0.95,d:0.5}, color:0x6a4a30,
     slots:[{x:0,z:0,l:'Assento'}]},
    {id:'floor',  type:'floor',    label:'Chão',        pos:{x:0,z:3.5},rot:0,
     size:{w:2.8,h:0.02,d:1.6},  color:0,
     slots:[{x:-0.5,z:0,l:'Esq'},{x:0.5,z:0,l:'Dir'},{x:0,z:0,l:'Centro'}]},
  ],
  items:[
    {id:'pan',    e:'🍳',n:'Frigideira',  h:'No fogão/bancada',bz:'stove',  bp:32,az:'counter',ap:20,col:0x282828,shape:'pan',     anim:'drop'},
    {id:'pot',    e:'🫕',n:'Panela',      h:'No armário',       bz:'cabinet',bp:30,az:'stove',  ap:22,col:0x484848,shape:'pot',     anim:'place_tall'},
    {id:'mug',    e:'☕',n:'Caneca',      h:'No armário',       bz:'cabinet',bp:26,az:'counter',ap:18,col:0xc06040,shape:'mug',     anim:'place_small'},
    {id:'knife',  e:'🔪',n:'Faqueiro',    h:'Na bancada',       bz:'counter',bp:28,az:'floor',  ap:4, col:0xc0c0c0,shape:'knife',   anim:'place_flat'},
    {id:'fruit',  e:'🍎',n:'Fruteira',    h:'Na bancada/mesa',  bz:'counter',bp:22,az:'table',  ap:18,col:0xc03030,shape:'bowl',    anim:'bounce'},
    {id:'kettle', e:'🫖',n:'Chaleira',    h:'No fogão/bancada', bz:'stove',  bp:28,az:'counter',ap:18,col:0x405060,shape:'kettle',  anim:'place_tall'},
    {id:'plate',  e:'🍽️',n:'Pratos',      h:'No armário',       bz:'cabinet',bp:26,az:'table',  ap:16,col:0xf0f0e8,shape:'plate',   anim:'stack'},
    {id:'spice',  e:'🧂',n:'Temperos',    h:'Na bancada',       bz:'counter',bp:22,az:'cabinet',ap:18,col:0xd8a040,shape:'spice',   anim:'place_tall'},
    {id:'wine',   e:'🍷',n:'Vinho',       h:'Na geladeira',     bz:'fridge', bp:30,az:'cabinet',ap:14,col:0x602030,shape:'bottle',  anim:'place_tall'},
    {id:'bread',  e:'🍞',n:'Pão',         h:'Na bancada/mesa',  bz:'counter',bp:20,az:'table',  ap:16,col:0xc89050,shape:'bread',   anim:'drop_soft'},
    {id:'blender',e:'🥤',n:'Liquidificador',h:'Na bancada',     bz:'counter',bp:26,az:'cabinet',ap:12,col:0x4090a0,shape:'blender', anim:'place_tall'},
    {id:'honey',  e:'🍯',n:'Pote de Mel',  h:'No armário',       bz:'cabinet',bp:22,az:'counter',ap:16,col:0xd8a020,shape:'jar',     anim:'place_small'},
    {id:'cookbook',e:'📕',n:'Livro de Receitas',h:'Na bancada/mesa',bz:'counter',bp:24,az:'table', ap:16,col:0xb03030,shape:'book',   anim:'place_flat'},
  
    {id:'bowl2',  e:'🥣',n:'Tigela',       h:'Na bancada',  bz:'counter',bp:20,az:'cabinet',ap:12,col:0xf0e8d8,shape:'bowl',anim:'place_small'},
    {id:'oil',    e:'🫒',n:'Azeite',       h:'Na bancada',  bz:'counter',bp:22,az:'cabinet',ap:14,col:0xc8a040,shape:'bottle',anim:'place_tall'},
    {id:'chop',   e:'🔪',n:'Tábua',        h:'Na bancada',  bz:'counter',bp:24,az:'table',  ap:12,col:0xb08050,shape:'place_flat',anim:'place_flat'},
]
},
{
  id:'office',name:'Escritório',
  wallColor:0x7a7088,floorColor:0xb8a890,trimColor:0x5a4a30,
  size:{w:12,d:12,h:4.5},
  boxPositions:[{x:-4,z:4.2},{x:-1.6,z:4.1},{x:0.6,z:4.2}],
  furniture:[
    {id:'desk',   type:'bigdesk',  label:'Mesa',        pos:{x:0,z:-5.4},  rot:0, wall:true,
     size:{w:4.5,h:0.85,d:1.0},   color:0x3c2818,
     slots:[{x:-1.6,z:0,l:'Extremo esq'},{x:-0.6,z:0,l:'Esq-ctr'},{x:0.4,z:0,l:'Centro'},{x:1.4,z:0,l:'Dir-ctr'},{x:2.0,z:0,l:'Extremo dir'}]},
    {id:'shelf',  type:'bookcase', label:'Estante',     pos:{x:5.3,z:0},   rot:-1.5707963267948966, wall:true,
     size:{w:1.6,h:2.4,d:0.45},    color:0x4a3020,
     slots:[{x:0,z:0,yFrac:0.84,l:'Prat. sup'},{x:0,z:0,yFrac:0.57,l:'Prat. 2'},{x:0,z:0,yFrac:0.30,l:'Prat. 3'},{x:0,z:0,yFrac:0.03,l:'Prat. base'}]},
    {id:'couch',  type:'couch',    label:'Sofá',        pos:{x:-5.38,z:2.8},rot:1.5707963267948966, wall:true,
     size:{w:3.0,h:1.05,d:1.2},   color:0x503870,
     slots:[{x:-0.8,z:0,l:'Esq'},{x:0.8,z:0,l:'Dir'},{x:0,z:0,l:'Centro'}]},
    {id:'offchair',type:'offchair',label:'Cadeira Escritório',pos:{x:0,z:-4.0},rot:Math.PI,
     size:{w:0.7,h:1.2,d:0.7},    color:0x303848,
     slots:[{x:0,z:0,l:'Assento'}]},
    {id:'plant2', type:'bigplant', label:'Planta Decorativa',pos:{x:-5.5,z:-5.5},rot:0,
     size:{w:0.7,h:1.4,d:0.7},    color:0x3a7030,
     slots:[{x:0,z:0,l:'Vaso'}]},
    {id:'floor',  type:'floor',    label:'Chão',        pos:{x:-1.5,z:-0.5},rot:0,
     size:{w:2.8,h:0.02,d:1.8},   color:0,
     slots:[{x:-0.5,z:0,l:'Esq'},{x:0.5,z:0,l:'Dir'},{x:0,z:0,l:'Centro'}]},
  ],
  items:[
    {id:'monitor',e:'🖥️',n:'Monitor',    h:'Na mesa',          bz:'desk',  bp:40,az:'floor',  ap:4, col:0x1c1c1c,shape:'monitor',  anim:'place_flat'},
    {id:'kbd',    e:'⌨️',n:'Teclado',    h:'Na mesa',          bz:'desk',  bp:36,az:'floor',  ap:4, col:0x2a2a2a,shape:'keyboard', anim:'place_flat'},
    {id:'mouse2', e:'🖱️',n:'Mouse',      h:'Na mesa',          bz:'desk',  bp:34,az:'floor',  ap:4, col:0x282828,shape:'mouse',    anim:'place_small'},
    {id:'notepad',e:'📓',n:'Caderno',    h:'Na mesa',          bz:'desk',  bp:28,az:'shelf',  ap:22,col:0xd8c8a0,shape:'book',     anim:'place_flat'},
    {id:'files',  e:'📁',n:'Pastas',     h:'Na estante',       bz:'shelf', bp:32,az:'desk',   ap:20,col:0xc09040,shape:'book',     anim:'slide'},
    {id:'trophy', e:'🏆',n:'Troféu',     h:'Na estante',       bz:'shelf', bp:38,az:'desk',   ap:14,col:0xe8c040,shape:'trophy',   anim:'place_tall'},
    {id:'cactus', e:'🌵',n:'Cacto',      h:'Na mesa',          bz:'desk',  bp:26,az:'floor',  ap:20,col:0x4a8c44,shape:'plant',    anim:'place_tall'},
    {id:'coffee', e:'☕',n:'Café',       h:'Na mesa',          bz:'desk',  bp:22,az:'floor',  ap:8, col:0x604030,shape:'mug',      anim:'place_small'},
    {id:'hset',   e:'🎧',n:'Headset',    h:'Na mesa/estante',  bz:'desk',  bp:28,az:'shelf',  ap:20,col:0x282828,shape:'headphones',anim:'place_small'},
    {id:'camera', e:'📷',n:'Câmera',     h:'Na estante',       bz:'shelf', bp:32,az:'desk',   ap:24,col:0x383838,shape:'camera',   anim:'place_small'},
    {id:'printer',e:'🖨️',n:'Impressora', h:'Na mesa',          bz:'desk',  bp:36,az:'floor',  ap:4, col:0xe0e0d8,shape:'printer',  anim:'place_flat'},
    {id:'lamp2',  e:'💡',n:'Luminária',  h:'Na mesa',          bz:'desk',  bp:28,az:'shelf',  ap:14,col:0xe8c060,shape:'lamp',     anim:'place_tall'},
    {id:'calendar',e:'📅',n:'Calendário', h:'Na mesa',          bz:'desk',  bp:22,az:'shelf',  ap:16,col:0xe8e0c8,shape:'book',     anim:'place_flat'},
    {id:'globe',  e:'🌍',n:'Globo Terrestre',h:'Na estante/mesa',bz:'shelf', bp:26,az:'desk',  ap:18,col:0x3878b0,shape:'globe',    anim:'place_tall'},
  
    {id:'pen_set', e:'🖊️',n:'Kit Canetas',   h:'Na mesa',      bz:'desk', bp:22,az:'shelf', ap:14,col:0x203060,shape:'place_small',anim:'place_small'},
    {id:'stapler', e:'📎',n:'Grampeador',    h:'Na mesa',      bz:'desk', bp:20,az:'shelf', ap:12,col:0x404050,shape:'place_small',anim:'place_small'},
    {id:'frame_o', e:'🖼️',n:'Quadro',        h:'Na estante',   bz:'shelf',bp:24,az:'desk',  ap:16,col:0x8a6040,shape:'photo',anim:'lean'},
]
},
{id:'living',name:'Sala',
  wallColor:0x9a8a70,floorColor:0xc8a878,trimColor:0x5a4a30,
  size:{w:12,d:12,h:4.5},
  boxPositions:[{x:-3.5,z:4.0},{x:-1.0,z:4.1},{x:1.5,z:4.0}],
  furniture:[
    {id:'couch',  type:'couch',  label:'Sofá',       pos:{x:0,z:-4.5}, rot:0, wall:true,
     size:{w:3.4,h:0.95,d:1.3}, color:0xe8e0d4,
     slots:[{x:-1.0,z:0,l:'Esq'},{x:0,z:0,l:'Centro'},{x:1.0,z:0,l:'Dir'}]},
    {id:'table',  type:'coffeetable',  label:'Mesa Centro', pos:{x:0,z:-2.0}, rot:0,
     size:{w:1.5,h:0.42,d:0.75}, color:0xf0ece4,
     slots:[{x:-0.4,z:0,l:'Esq'},{x:0.4,z:0,l:'Dir'},{x:0,z:0,l:'Centro'}]},
    {id:'shelf',  type:'tvwall',  label:'Painel TV',  pos:{x:5.3,z:-0.5}, rot:-1.5707963267948966, wall:true,
     size:{w:3.6,h:4.3,d:0.35}, color:0xc4a060,
     slots:[{x:0,z:0,yFrac:0.52,l:'TV'},{x:-0.9,z:0,yFrac:0.22,l:'Console esq'},{x:0.9,z:0,yFrac:0.22,l:'Console dir'},{x:0,z:0,yFrac:0.72,l:'Prateleira'}]},
    {id:'plant',  type:'planter',label:'Planta',      pos:{x:-4.5,z:-4.0}, rot:0,
     size:{w:0.5,h:1.1,d:0.5}, color:0x4a8c3a,
     slots:[{x:0,z:0,l:'Vaso'}]},
    {id:'chair',  type:'armchair',  label:'Poltrona',    pos:{x:-3.5,z:-2.0}, rot:0.8,
     size:{w:0.95,h:0.95,d:0.9}, color:0xd8c8b0,
     slots:[{x:0,z:0,l:'Assento'}]},
    {id:'floorlamp',type:'floorlamp',label:'Abajur',  pos:{x:3.5,z:-4.5}, rot:0,
     size:{w:0.3,h:1.6,d:0.3}, color:0xe8c060,
     slots:[{x:0,z:0,l:'Base'}]},
    {id:'rug',    type:'rug',    label:'Tapete',      pos:{x:0,z:-1.5}, rot:0,
     size:{w:3.8,h:0.02,d:2.8}, color:0xe8e0d0,
     slots:[{x:-0.8,z:0,l:'Esq'},{x:0.8,z:0,l:'Dir'},{x:0,z:0,l:'Centro'}]},
    {id:'floor',  type:'floor',  label:'Chão',        pos:{x:0,z:3.5}, rot:0,
     size:{w:2.5,h:0.02,d:1.5}, color:0,
     slots:[{x:-0.5,z:0,l:'Esq'},{x:0.5,z:0,l:'Dir'}]},
  ],
  items:[
    {id:'remote',  e:'📺',n:'Controle',     h:'Na mesa de centro', bz:'table', bp:28,az:'couch',  ap:16,col:0x303030,shape:'remote', anim:'place_small'},
    {id:'cushion', e:'🛋️',n:'Almofada',     h:'No sofá',          bz:'couch', bp:30,az:'chair',  ap:18,col:0xc07080,shape:'pillow', anim:'drop_soft'},
    {id:'vase',    e:'🏺',n:'Vaso',         h:'Na estante',       bz:'shelf', bp:26,az:'table',  ap:14,col:0xc0a070,shape:'bottle', anim:'place_tall'},
    {id:'magazines',e:'📰',n:'Revistas',    h:'Na mesa de centro', bz:'table', bp:24,az:'shelf',  ap:16,col:0x4060a0,shape:'book',   anim:'slide'},
    {id:'candle',  e:'🕯️',n:'Vela',        h:'Na mesa de centro', bz:'table', bp:22,az:'shelf',  ap:14,col:0xf0e0c0,shape:'place_small',anim:'place_small'},
    {id:'blanket2',e:'🧣',n:'Manta',       h:'No sofá',          bz:'couch', bp:28,az:'chair',  ap:12,col:0x7868a0,shape:'clothes',anim:'fold'},
    {id:'photo',   e:'🖼️',n:'Porta-retrato',h:'Na estante',      bz:'shelf', bp:26,az:'table',  ap:14,col:0xd0c0a0,shape:'frame',  anim:'place_flat'},
    {id:'speaker', e:'🔊',n:'Caixa de Som', h:'Na estante',       bz:'shelf', bp:24,az:'floor',  ap:8, col:0x282828,shape:'place_tall',anim:'place_tall'},
  
    {id:'vase',   e:'🏺',n:'Vaso',         h:'Na mesa',     bz:'table', bp:22,az:'shelf', ap:14,col:0xc0a080,shape:'plant',anim:'place_tall'},
    {id:'magazine',e:'📰',n:'Revista',     h:'No sofá',     bz:'couch', bp:18,az:'table', ap:12,col:0xe04040,shape:'book',anim:'place_flat'},
    {id:'console',e:'🎮',n:'Videogame',    h:'No rack',     bz:'tv',    bp:28,az:'table', ap:16,col:0x1a1a1e,shape:'place_flat',anim:'place_flat'},
]
},
{
  id:'yard',name:'Quintal',outdoor:true,locksUntilHouseDone:true,
  wallColor:0x8ab0c8,floorColor:0x5a8c3a,trimColor:0x5a4a30,
  size:{w:16,d:16,h:6},
  boxPositions:[{x:-5.5,z:5.6},{x:-2.6,z:5.8},{x:0.4,z:5.7},{x:3.2,z:5.8}],
  furniture:[
    {id:'table',   type:'yardtable', label:'Mesa de Jardim', pos:{x:2.6,z:-1.0}, rot:0,
     size:{w:1.6,h:0.75,d:1.6}, color:0x8a6c4a,
     slots:[{x:-0.4,z:-0.4,l:'Canto 1'},{x:0.4,z:-0.4,l:'Canto 2'},{x:0,z:0,l:'Centro'},{x:-0.4,z:0.4,l:'Canto 3'},{x:0.4,z:0.4,l:'Canto 4'}]},
    {id:'grill',   type:'grill',    label:'Churrasqueira', pos:{x:-3.8,z:-2.6}, rot:0,
     size:{w:1.7,h:1.2,d:0.9}, color:0xe8eef4,
     slots:[{x:0,z:0,l:'Grelha'}]},
    {id:'shed',    type:'shed',     label:'Galpão',        pos:{x:-6.8,z:1.2},  rot:1.5707963267948966, wall:true,
     size:{w:2.2,h:2.2,d:1.7}, color:0xc4a060,
     slots:[{x:-0.4,z:0,l:'Esq'},{x:0.4,z:0,l:'Dir'},{x:0,z:0,l:'Centro'}]},
    {id:'bench',   type:'bench',    label:'Banco de Jardim',pos:{x:5.2,z:2.4},  rot:Math.PI*.5, wall:true,
     size:{w:1.5,h:0.85,d:0.6}, color:0x6a8c50,
     slots:[{x:-0.4,z:0,l:'Esq'},{x:0.4,z:0,l:'Dir'}]},
    {id:'planter', type:'planter',  label:'Floreira',      pos:{x:5.0,z:-3.0},  rot:0, wall:true,
     size:{w:1.8,h:0.5,d:0.6}, color:0x8a6040,
     slots:[{x:-0.5,z:0,l:'Esq'},{x:0,z:0,l:'Centro'},{x:0.5,z:0,l:'Dir'}]},
    {id:'clothesline',type:'clothesline',label:'Varal',    pos:{x:0,z:3.6},     rot:0,
     size:{w:2.4,h:1.6,d:0.3}, color:0xc0c0c0,
     slots:[{x:-0.7,z:0,l:'Esq'},{x:0,z:0,l:'Centro'},{x:0.7,z:0,l:'Dir'}]},
    {id:'ground',  type:'floor',    label:'Gramado',       pos:{x:-1.0,z:5.0},  rot:0,
     size:{w:3.0,h:0.02,d:1.8}, color:0,
     slots:[{x:-0.6,z:0,l:'Esq'},{x:0.6,z:0,l:'Dir'},{x:0,z:0,l:'Centro'}]},
  ],
  items:[
    {id:'bbqtools',e:'🍖',n:'Utensílios Churrasco',h:'Na churrasqueira',bz:'grill',bp:32,az:'table',ap:18,col:0x904030,shape:'bbq',anim:'place_flat'},
    {id:'charcoal',e:'🪵',n:'Carvão',     h:'Na churrasqueira',  bz:'grill',  bp:26,az:'shed',  ap:18,col:0x302820,shape:'charcoal',anim:'drop'},
    {id:'umbrella',e:'⛱️',n:'Guarda-sol', h:'Na mesa de jardim', bz:'table',  bp:30,az:'ground',ap:14,col:0xd0563c,shape:'umbrella', anim:'place_tall'},
    {id:'plates2', e:'🍽️',n:'Pratos de Piquenique',h:'Na mesa',  bz:'table',  bp:24,az:'bench', ap:16,col:0xf0f0e8,shape:'plate',   anim:'stack'},
    {id:'flowers', e:'🌸',n:'Flores',     h:'Na floreira',       bz:'planter',bp:28,az:'table',  ap:14,col:0xe070a0,shape:'plant',   anim:'place_tall'},
    {id:'wateringcan',e:'🪣',n:'Regador', h:'Na floreira/galpão',bz:'planter',bp:24,az:'shed',  ap:18,col:0x4090c0,shape:'kettle',  anim:'place_tall'},
    {id:'tools',   e:'🔧',n:'Ferramentas',h:'No galpão',         bz:'shed',   bp:30,az:'ground', ap:10,col:0x707070,shape:'toolkit',anim:'place_flat'},
    {id:'hose',    e:'🧵',n:'Mangueira', h:'No galpão',          bz:'shed',   bp:22,az:'ground', ap:10,col:0x408050,shape:'hose',anim:'drop'},
    {id:'laundry', e:'👕',n:'Roupa Lavada',h:'No varal',         bz:'clothesline',bp:30,az:'bench',ap:12,col:0xf0e8d0,shape:'clothes',anim:'fold'},
    {id:'pegs',    e:'🦴',n:'Pregadores',h:'No varal',           bz:'clothesline',bp:18,az:'shed', ap:10,col:0xe0c060,shape:'pegs',anim:'place_small'},
    {id:'ball',    e:'⚽',n:'Bola',       h:'No gramado',         bz:'ground', bp:22,az:'bench',  ap:12,col:0xf0f0f0,shape:'ball',anim:'bounce'},
    {id:'gnome',   e:'🧙',n:'Anão de Jardim',h:'No gramado/floreira',bz:'ground',bp:20,az:'planter',ap:14,col:0xc04040,shape:'bear',anim:'drop'},
    {id:'lanternY',e:'🏮',n:'Lanterna',  h:'No banco/mesa',      bz:'bench',  bp:24,az:'table',  ap:16,col:0xe89030,shape:'lantern', anim:'place_tall'},
    {id:'petbowl', e:'🐾',n:'Tigela de Pet',h:'No gramado',      bz:'ground', bp:18,az:'shed',   ap:10,col:0xc8a060,shape:'bowl',    anim:'drop_soft'},
    {id:'frisbee', e:'🥏',n:'Disco Voador', h:'No gramado',      bz:'ground', bp:18,az:'bench',  ap:12,col:0xe85050,shape:'disc',   anim:'bounce'},
    {id:'gloves',  e:'🧤',n:'Luvas de Jardim',h:'No galpão',     bz:'shed',   bp:20,az:'table',  ap:14,col:0x589048,shape:'clothes', anim:'fold'},
  
    {id:'ball2',  e:'⚽',n:'Bola',         h:'No chão',     bz:'floor', bp:16,az:'bench', ap:10,col:0xffffff,shape:'ball',anim:'bounce'},
    {id:'gloves', e:'🧤',n:'Luvas Jardim', h:'No galpão',   bz:'shed',  bp:20,az:'bench', ap:12,col:0x4a6a30,shape:'clothes',anim:'fold'},
]
}
];

const HOUSE_ROOM_IDS=['bedroom','bathroom','kitchen','office']; // must finish these to unlock yard

// Random things the player can "say" — flavor speech bubble lines
// ── História ──
const STORY = {
  title: "Uma nova casa, um novo começo",
  blurb: "Depois de anos juntando caixas e adiações, chegou o dia: as chaves da casa nova estão na sua mão. Dentro de cada caixa há um pedaço da sua vida — o ursinho da infância, a caneca do primeiro emprego, fotos, livros, o edredom que ainda cheira a casa antiga. Organize tudo com carinho. Cada item no lugar certo faz deste espaço o seu lar.",
  rooms: {
    bedroom: "O quarto é o primeiro a ganhar vida. Cama, travesseiros, o silêncio depois da mudança...",
    bathroom: "Banheiro pequeno, mas é seu. Toalhas, sabonete, o cheiro de casa limpa.",
    kitchen: "A cozinha — onde as histórias começam de verdade. Panelas, temperos, café da manhã.",
    office: "Um cantinho para trabalhar e sonhar. Livros, lampada, o notebook ainda na caixa.",
    living: "A sala espera visitas e filmes. Sofá, controle, o vaso que quase quebrou na mudança.",
    yard: "O quintal: churrasco, sol e a sensação de que, enfim, você chegou em casa."
  }
};

const IDLE_LINES=[
  "Cada caixa é um pedaço da vida antiga...","Isso aqui me lembra tanta coisa.",
  "Onde isso ficava na casa velha?","Hmm, onde combina melhor?",
  "Já tá parecendo um lar de verdade.","Essa caixa é pesada demais!",
  "Quase lá — um cômodo de cada vez.","Adoro quando tudo encontra o lugar certo.",
  "Será que tem mais alguma caixa escondida?","Mudança cansa, mas vale cada caixa.",
  "Preciso de um café depois disso.","Esse cantinho ficou bonito.",
  "O ursinho ainda cheira a infância...","Fotos, livros, memórias — tudo isso é meu.",
  "Quando a última caixa sumir, é oficial: morei."
];
const VISIT_LINES=[
  "A VISITA TÁ CHEGANDO?! 😱","Rápido — ainda tem caixa no meio da sala!",
  "Não tem tempo a perder!","Cadê o resto das coisas?!",
  "Vou só... ajeitar isso rapidinho!","Respira... ainda dá tempo!",
  "Por favor, não toquem a campainha ainda!","Quase lá, só mais um pouco!",
  "Eles não podem ver essa bagunça!"
];
const VISIT_ARRIVED_LINES=[
  "Ah não, chegaram! 😳","Bem-vindos... desculpa a bagunça!",
  "Já vou aí! Só um segundinho!","Tá uma zona, mas entrem!",
  "Fingam que não viram as caixas, hehe.","A casa ainda está virando lar — bem-vindos!"
];

// ══════════════════════════════════════════════════════
//  STATE
// ══════════════════════════════════════════════════════
let G={
  curRoom:0,rooms:[],score:0,placed:0,total:0,startTime:0,
  playerName:'Jogador',isAdmin:false,mode:'zen',timeLimitSec:300,timeLeft:300,
  visitArrived:false,timerActive:false,houseDone:false,yardUnlocked:false
};

// ══════════════════════════════════════════════════════
//  BACKGROUND MUSIC
//  Se você tiver um arquivo de música próprio (mp3/ogg), cole a URL
//  ou caminho dele aqui — ex: 'musica.mp3' ou 'https://site.com/trilha.mp3'.
//  Deixando vazio ('') como está, o jogo toca uma trilha ambiente
//  gerada por código (sem precisar de nenhum arquivo).
// ══════════════════════════════════════════════════════
const BGM_URL='';
const BGM_VOLUME=0.35;
let musicOn=true;
let audioCtx=null,musicMasterGain=null,musicNodes=[],musicTimers=[],musicRunning=false,chordIdx=0;

// Suave progressão lo-fi (Cmaj7 → Am7 → Fmaj7 → G9) tocada em loop com
// "pads" longos e pequenos "plucks" aleatórios por cima.
const MUSIC_CHORDS=[
  [130.81,164.81,196.00,246.94],
  [110.00,130.81,164.81,220.00],
  [87.31,110.00,130.81,174.61],
  [98.00,123.47,146.83,196.00],
];

function ensureAudioCtx(){
  if(!audioCtx){
    audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    musicMasterGain=audioCtx.createGain();
    musicMasterGain.gain.value=BGM_VOLUME;
    musicMasterGain.connect(audioCtx.destination);
  }
  if(audioCtx.state==='suspended')audioCtx.resume();
}
function playPad(freqs,duration){
  const now=audioCtx.currentTime;
  freqs.forEach((f,i)=>{
    const osc=audioCtx.createOscillator();
    osc.type='sine';osc.frequency.value=f;
    const filt=audioCtx.createBiquadFilter();
    filt.type='lowpass';filt.frequency.value=1100;
    const g=audioCtx.createGain();g.gain.value=0;
    osc.connect(filt);filt.connect(g);g.connect(musicMasterGain);
    const peak=0.085/(i*0.35+1);
    g.gain.linearRampToValueAtTime(peak,now+1.3);
    g.gain.linearRampToValueAtTime(0,now+duration-0.6);
    osc.start(now);osc.stop(now+duration+0.1);
    musicNodes.push(osc);
  });
}
function playPluck(freq){
  const osc=audioCtx.createOscillator();
  osc.type='triangle';osc.frequency.value=freq;
  const filt=audioCtx.createBiquadFilter();
  filt.type='lowpass';filt.frequency.value=2200;
  const g=audioCtx.createGain();g.gain.value=0;
  osc.connect(filt);filt.connect(g);g.connect(musicMasterGain);
  const now=audioCtx.currentTime;
  g.gain.linearRampToValueAtTime(0.05,now+.02);
  g.gain.exponentialRampToValueAtTime(0.001,now+1.1);
  osc.start(now);osc.stop(now+1.2);
  musicNodes.push(osc);
}
function scheduleChordLoop(){
  if(!musicRunning)return;
  const chord=MUSIC_CHORDS[chordIdx%MUSIC_CHORDS.length];
  playPad(chord,4.4);
  const plucks=1+Math.floor(Math.random()*2);
  for(let i=0;i<plucks;i++){
    const delay=400+Math.random()*3200;
    const note=chord[Math.floor(Math.random()*chord.length)]*2;
    musicTimers.push(setTimeout(()=>{if(musicRunning)playPluck(note);},delay));
  }
  chordIdx++;
  musicTimers.push(setTimeout(scheduleChordLoop,4200));
}
function startMusicEngine(){
  if(musicRunning||BGM_URL)return;
  ensureAudioCtx();
  musicRunning=true;chordIdx=0;
  scheduleChordLoop();
}
function stopMusicEngine(){
  musicRunning=false;
  musicTimers.forEach(t=>clearTimeout(t));musicTimers=[];
  musicNodes.forEach(o=>{try{o.stop();}catch(e){}});musicNodes=[];
}

function initMusic(){
  const bgm=document.getElementById('bgm');
  if(BGM_URL)bgm.src=BGM_URL;
  bgm.volume=BGM_VOLUME;
  const saved=safeLSGet('music_pref');
  if(saved==='off')musicOn=false;
  updateMusicBtn();
  const btn=document.getElementById('music-btn');
  if(btn)btn.addEventListener('click',toggleMusic);
}
function updateMusicBtn(){
  const btn=document.getElementById('music-btn');
  if(!btn)return;
  btn.textContent=musicOn?'🔊':'🔇';
  btn.classList.toggle('muted',!musicOn);
}
function toggleMusic(){
  musicOn=!musicOn;
  const bgm=document.getElementById('bgm');
  if(musicOn){
    if(BGM_URL)bgm.play().catch(()=>{});
    else startMusicEngine();
  }else{
    bgm.pause();
    stopMusicEngine();
  }
  safeLSSet('music_pref',musicOn?'on':'off');
  updateMusicBtn();
}
function tryStartMusic(){
  if(!musicOn)return;
  if(BGM_URL){const bgm=document.getElementById('bgm');bgm.play().catch(()=>{});}
  else startMusicEngine();
}

function activeRoomDefs(){
  // Yard only included in pool once unlocked; otherwise house rooms only
  return G.yardUnlocked ? ROOMS : ROOMS.filter(r=>!r.outdoor);

}

function initGame(){
  G.score=0;G.placed=0;G.startTime=Date.now();
  G.visitArrived=false;G.houseDone=false;G.yardUnlocked=false;
  G.timeLeft=G.timeLimitSec;
  G.timerActive=(G.mode==='visit');
  const defs=activeRoomDefs();
  G.rooms=defs.map((rd,i)=>({
    def:rd,boxes:[],placed:{},score:0,unlocked:i===0
  }));
  G.total=defs.reduce((s,r)=>s+r.items.length,0);
  G.curRoom=0;
  document.getElementById('log').innerHTML='';
  updateTimerUI();
}

function houseTotal(){
  return ROOMS.filter(r=>HOUSE_ROOM_IDS.includes(r.id)).reduce((s,r)=>s+r.items.length,0);
}
function housePlacedCount(){
  let c=0;
  G.rooms.forEach(r=>{if(HOUSE_ROOM_IDS.includes(r.def.id))c+=Object.keys(r.placed).length;});
  return c;
}

function calcScore(item,zone){
  if(zone===item.bz)return item.bp;
  if(zone===item.az)return item.ap;
  return Math.max(2,Math.floor(item.bp*.07));
}


// ══════════════════════════════════════════════════════
//  ACCOUNTS (name + password) + PROGRESS SAVE
// ══════════════════════════════════════════════════════
const ACC_KEY='unpacking3d_accounts_v1';
const RANK_KEY='unpacking3d_rank_v1';

function simpleHash(s){
  let h=0;
  for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}
  return 'h'+Math.abs(h).toString(36);
}
function loadAccounts(){
  try{return JSON.parse(safeLSGet(ACC_KEY)||'{}');}catch(e){return {};}
}
function saveAccounts(obj){
  try{safeLSSet(ACC_KEY,JSON.stringify(obj));}catch(e){}
}
// Built-in admin credentials (always available)
const ADMIN_USER='admin';
const ADMIN_PASS='admin123';

function ensureAdminAccount(){
  const acc=loadAccounts();
  const key=ADMIN_USER;
  const hp=simpleHash(ADMIN_PASS+key);
  if(!acc[key] || acc[key].pass!==hp || !acc[key].isAdmin){
    acc[key]={
      display:'Admin',
      pass:hp,
      isAdmin:true,
      created:Date.now(),
      bestScore:acc[key]?.bestScore||0,
      games:acc[key]?.games||0,
      progress:acc[key]?.progress||null
    };
    saveAccounts(acc);
  }
  return acc;
}

function authLoginOrRegister(name, pass){
  name=(name||'').trim().slice(0,16);
  pass=(pass||'').trim();
  if(!name) return {ok:false, msg:'Digite um nome'};
  if(pass.length<3) return {ok:false, msg:'Senha com pelo menos 3 caracteres'};
  const acc=ensureAdminAccount();
  const key=name.toLowerCase();
  const hp=simpleHash(pass+name.toLowerCase());

  // Direct admin login
  if(key===ADMIN_USER && pass===ADMIN_PASS){
    return {ok:true, name:'Admin', data:acc[key], isNew:false, isAdmin:true};
  }

  if(acc[key]){
    if(acc[key].pass!==hp) return {ok:false, msg:'Senha incorreta'};
    const isAdmin=!!acc[key].isAdmin;
    return {ok:true, name:acc[key].display||name, data:acc[key], isNew:false, isAdmin};
  }
  // Normal users cannot register as "admin"
  if(key===ADMIN_USER) return {ok:false, msg:'Conta reservada'};
  acc[key]={display:name, pass:hp, isAdmin:false, created:Date.now(), bestScore:0, games:0, progress:null};
  saveAccounts(acc);
  return {ok:true, name:name, data:acc[key], isNew:true, isAdmin:false};
}
function saveProgressToAccount(){
  if(!G.playerName)return;
  const acc=loadAccounts();
  const key=G.playerName.toLowerCase();
  if(!acc[key])return;
  // Snapshot room placement
  const roomsSnap=G.rooms.map(r=>({
    placed: Object.fromEntries(Object.entries(r.placed||{}).map(([id,p])=>[id,{
      zone:p.zone, slotIdx:p.slotIdx, localOffset:p.localOffset||null, inside:!!p.inside, rotY:p.rotY||0
    }])),
    boxes: (r.boxes||[]).map(b=>({items:(b.items||[]).map(it=>it.id)})),
  }));
  acc[key].progress={
    rooms:roomsSnap,
    score:G.score,
    curRoom:G.curRoom,
    mode:G.mode,
    yardUnlocked:G.yardUnlocked,
    savedAt:Date.now()
  };
  acc[key].bestScore=Math.max(acc[key].bestScore||0, G.score||0);
  saveAccounts(acc);
}
function loadProgressFromAccount(){
  if(!G.playerName)return false;
  const acc=loadAccounts();
  const key=G.playerName.toLowerCase();
  const prog=acc[key]?.progress;
  if(!prog||!prog.rooms)return false;
  try{
    prog.rooms.forEach((rs,ri)=>{
      if(!G.rooms[ri])return;
      const room=G.rooms[ri];
      const def=room.def;
      // restore box item queues
      if(rs.boxes){
        rs.boxes.forEach((b,bi)=>{
          if(!room.boxes[bi])return;
          const ids=b.items||[];
          room.boxes[bi].items = ids.map(id=>def.items.find(it=>it.id===id)).filter(Boolean);
        });
      }
      // restore placed
      room.placed={};
      if(rs.placed){
        Object.entries(rs.placed).forEach(([id,p])=>{
          const item=def.items.find(it=>it.id===id);
          if(!item)return;
          room.placed[id]={item, zone:p.zone, slotIdx:p.slotIdx||0, localOffset:p.localOffset, inside:!!p.inside, rotY:p.rotY||0};
        });
      }
    });
    G.score=prog.score||0;
    G.yardUnlocked=!!prog.yardUnlocked;
    return true;
  }catch(e){console.warn(e);return false;}
}
function submitRankEntry(){
  const name=G.playerName||'Jogador';
  const score=G.score||0;
  let rank=[];
  try{rank=JSON.parse(safeLSGet(RANK_KEY)||'[]');}catch(e){rank=[];}
  rank.push({name, score, mode:G.mode, at:Date.now()});
  rank.sort((a,b)=>b.score-a.score);
  rank=rank.slice(0,30);
  try{safeLSSet(RANK_KEY,JSON.stringify(rank));}catch(e){}
  // also update account best
  const acc=loadAccounts();
  const key=name.toLowerCase();
  if(acc[key]){acc[key].bestScore=Math.max(acc[key].bestScore||0,score);acc[key].games=(acc[key].games||0)+1;saveAccounts(acc);}
  return rank;
}
function getRankList(){
  try{return JSON.parse(safeLSGet(RANK_KEY)||'[]');}catch(e){return [];}
}


// ══════════════════════════════════════════════════════
//  LEADERBOARD (persistent storage)
// ══════════════════════════════════════════════════════
const LB_KEY='leaderboard_entries';
const LB_LOCAL_KEY='unpacking3d_leaderboard_local';
function lbLoadLocal(){
  try{
    const raw=safeLSGet(LB_LOCAL_KEY);
    return raw?JSON.parse(raw):[];
  }catch(e){return [];}
}
function lbSaveLocal(arr){
  try{safeLSSet(LB_LOCAL_KEY,JSON.stringify(arr.slice(0,50)));}catch(e){}
}
async function lbLoad(){
  try{
    const res=await window.storage.get(LB_KEY,true);
    if(!res)return lbLoadLocal();
    const arr=JSON.parse(res.value);
    return Array.isArray(arr)?arr:lbLoadLocal();
  }catch(e){return lbLoadLocal();}
}
async function lbSave(entry){
  // Always merge with local entries too, so two devices/browsers never
  // silently diverge — local copy is the safety net if shared storage fails.
  let arr;
  try{
    arr=await lbLoad();
  }catch(e){arr=lbLoadLocal();}
  arr.push(entry);
  arr.sort((a,b)=>b.score-a.score);
  const trimmed=arr.slice(0,50);
  lbSaveLocal(trimmed);
  try{
    await window.storage.set(LB_KEY,JSON.stringify(trimmed),true);
    return {entries:trimmed,saved:true};
  }catch(e){
    return {entries:trimmed,saved:false};
  }
}
function renderBoard(rowsEl,countEl,entries,highlightIdx){
  if(!entries||entries.length===0){
    rowsEl.innerHTML='<div class="board-empty">Ninguém no ranking ainda. Seja o primeiro!</div>';
    if(countEl)countEl.textContent='';
    return;
  }
  const top=entries.slice(0,8);
  if(countEl)countEl.textContent=entries.length+' jogador'+(entries.length>1?'es':'');
  rowsEl.innerHTML=top.map((e,i)=>{
    const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':(i+1);
    const modeLabel=e.mode==='visit'?'⏰ visita':'🧘 zen';
    const hl=highlightIdx===i?'style="background:rgba(255,210,74,.12);border-radius:8px"':'';
    return `<div class="board-row" ${hl}><span class="board-rank">${medal}</span><span class="board-name">${escapeHtml(e.name)}</span><span class="board-mode">${modeLabel}</span><span class="board-score">${e.score}</span></div>`;
  }).join('');
}
function escapeHtml(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}

async function refreshEntryBoard(){
  const rows=document.getElementById('entry-board-rows');
  const count=document.getElementById('entry-board-count');
  const entries=await lbLoad();
  renderBoard(rows,count,entries,-1);
}


// ══════════════════════════════════════════════════════
//  DAY CYCLE + WEATHER AT WINDOW
// ══════════════════════════════════════════════════════
const DAY_PHASES = [
  {id:'morning',   label:'🌅 Manhã',   duration:90},
  {id:'afternoon', label:'☀️ Tarde',   duration:90},
  {id:'evening',   label:'🌇 Entardecer', duration:70},
  {id:'night',     label:'🌙 Noite',   duration:80},
];
const WEATHERS = [
  {id:'clear',  label:'Céu limpo'},
  {id:'cloudy', label:'Nublado'},
  {id:'rain',   label:'Chuva'},
  {id:'storm',  label:'Tempestade'},
];
let dayState = {
  phaseIdx: 2,
  phaseT: 0,       // seconds into current phase
  weatherIdx: 0,
  weatherT: 0,
  nextWeatherIn: 40 + Math.random()*40,
  lights: {},      // refs to lights in current room
  windowMats: [],  // window glass materials to update
};
let dayHudTimer = 0;

function currentPhase(){ return DAY_PHASES[dayState.phaseIdx % DAY_PHASES.length]; }
function currentWeather(){ return WEATHERS[dayState.weatherIdx % WEATHERS.length]; }

function phaseColors(phaseId, weatherId){
  // Returns {hemiSky, hemiGround, amb, sun, sunInt, ambInt, hemiInt, ceilInt, winInt, bg, fog, exposure}
  const rainy = weatherId==='rain'||weatherId==='storm';
  const cloudy = weatherId==='cloudy'||rainy;
  const table = {
    morning:   {hemiSky:0xffe8d0, hemiGround:0x8a6a48, amb:0xfff0dc, sun:0xffe0a8, sunInt:0.85, ambInt:0.42, hemiInt:0.52, ceilInt:0.75, winInt:0.65, bg:0x1c1612, fog:0x1c1612, exposure:1.08},
    afternoon: {hemiSky:0xffe0c0, hemiGround:0x7a5a38, amb:0xffe8c8, sun:0xffd090, sunInt:0.95, ambInt:0.45, hemiInt:0.55, ceilInt:0.7,  winInt:0.7,  bg:0x1a1410, fog:0x1a1410, exposure:1.12},
    evening:   {hemiSky:0xffc090, hemiGround:0x6a4830, amb:0xffd8a8, sun:0xffb068, sunInt:0.65, ambInt:0.38, hemiInt:0.48, ceilInt:1.15, winInt:0.5,  bg:0x16100c, fog:0x16100c, exposure:1.05},
    night:     {hemiSky:0x3a3028, hemiGround:0x201810, amb:0x504030, sun:0xc88850, sunInt:0.15, ambInt:0.32, hemiInt:0.25, ceilInt:1.55, winInt:0.12, bg:0x100c0a, fog:0x100c0a, exposure:1.0},
  };
  const base = Object.assign({}, table[phaseId] || table.afternoon);

  if(cloudy){
    base.sunInt *= 0.55;
    base.winInt *= 0.6;
    base.ambInt = Math.max(base.ambInt, 0.3);
    base.ceilInt = Math.max(base.ceilInt * 1.5, 1.1);
    base.exposure = Math.max(base.exposure, 1.05);
  }
  if(weatherId==='storm' || weatherId==='rain'){
    base.sunInt *= 0.4;
    base.winInt *= 0.45;
    base.ambInt = Math.max(base.ambInt, 0.28);
    base.ceilInt = Math.max(base.ceilInt * 1.7, 1.4);
    base.exposure = Math.max(base.exposure, 1.05);
    if(weatherId==='storm') base.bg = 0x0a0c12;
  }
  if(rainy && phaseId!=='night'){
    base.hemiSky = 0xa0b0c0;
  }
  return base;
}

function applyDayLighting(root, outdoor, w, d, h){
  dayState.lights = {};
  dayState.windowMats = [];
  const phase = currentPhase().id;
  const weather = currentWeather().id;
  const c = phaseColors(phase, weather);

  if(renderer) renderer.toneMappingExposure = c.exposure;

  if(outdoor){
    const hemi=new THREE.HemisphereLight(c.hemiSky, 0x5a7a40, c.hemiInt*1.4);
    root.add(hemi); dayState.lights.hemi=hemi;
    const amb=new THREE.AmbientLight(c.amb, c.ambInt*1.2);
    root.add(amb); dayState.lights.amb=amb;
    const sun=new THREE.DirectionalLight(c.sun, c.sunInt*1.5);
    sun.position.set(8, phase==='morning'?8:phase==='evening'?5:12, -6);
    sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-14;sun.shadow.camera.right=14;
    sun.shadow.camera.top=14;sun.shadow.camera.bottom=-14;
    sun.shadow.camera.near=1;sun.shadow.camera.far=40;
    sun.shadow.bias=-0.0003;sun.shadow.normalBias=0.03;
    root.add(sun); dayState.lights.sun=sun;
    scene.background=new THREE.Color(phase==='night'?0x121018:phase==='evening'?0xd08050:0xa8c8e0);
    scene.fog=new THREE.FogExp2(phase==='night'?0x121018:0xc0d8e8, weather==='storm'?0.035:0.022);
  } else {
    const hemi=new THREE.HemisphereLight(c.hemiSky, c.hemiGround, c.hemiInt);
    root.add(hemi); dayState.lights.hemi=hemi;
    const amb=new THREE.AmbientLight(c.amb, c.ambInt);
    root.add(amb); dayState.lights.amb=amb;
    const sun=new THREE.DirectionalLight(c.sun, c.sunInt);
    sun.position.set(phase==='morning'?-4:2, h-0.3, -8);
    sun.castShadow=true;
    sun.shadow.mapSize.set(2048,2048);
    sun.shadow.camera.left=-w*0.7;sun.shadow.camera.right=w*0.7;
    sun.shadow.camera.top=d*0.7;sun.shadow.camera.bottom=-d*0.7;
    sun.shadow.camera.near=0.5;sun.shadow.camera.far=28;
    sun.shadow.bias=-0.00025;sun.shadow.normalBias=0.025;
    root.add(sun); dayState.lights.sun=sun;
    // Ceiling lamp
    const ceil=new THREE.PointLight(0xffd090, c.ceilInt*1.15, 14, 1.55);
    ceil.position.set(0,h-0.35,0);root.add(ceil); dayState.lights.ceil=ceil;
    // Window lights
    const win1=new THREE.PointLight(0xffc088, c.winInt*1.1, 9, 1.5);
    win1.position.set(-2.8,h*.55,-d/2+0.55);root.add(win1); dayState.lights.win1=win1;
    const win2=new THREE.PointLight(0xffb878, c.winInt*0.9, 8, 1.5);
    win2.position.set(1.8,h*.55,-d/2+0.55);root.add(win2); dayState.lights.win2=win2;
    // Soft fill
    const fill=new THREE.PointLight(0xffe0c0, 0.22, 11, 1.8);
    fill.position.set(-w*0.25,h*0.45,d*0.2);root.add(fill); dayState.lights.fill=fill;

    scene.background=new THREE.Color(c.bg);
    scene.fog=new THREE.Fog(c.fog, 14, 30);
  }
  updateWindowViews();
  notifyDayPhase();
}

function updateDayCycle(dt){
  if(!gameActive)return;
  dayState.phaseT += dt;
  dayState.weatherT += dt;
  const phase = currentPhase();
  if(dayState.phaseT >= phase.duration){
    dayState.phaseT = 0;
    dayState.phaseIdx = (dayState.phaseIdx + 1) % DAY_PHASES.length;
    // Rebuild lighting for new phase
    if(sceneRoot && G.rooms[G.curRoom]){
      const rd=G.rooms[G.curRoom].def;
      // Remove old dynamic lights only — full rebuild is safer via re-apply
      reapplyLightingOnly();
    }
    notifyDayPhase();
  }
  // Weather changes
  if(dayState.weatherT >= dayState.nextWeatherIn){
    dayState.weatherT = 0;
    dayState.nextWeatherIn = 35 + Math.random()*50;
    let next;
    do{ next = Math.floor(Math.random()*WEATHERS.length); }while(next===dayState.weatherIdx && WEATHERS.length>1);
    dayState.weatherIdx = next;
    reapplyLightingOnly();
    notify('☁️ Clima: '+currentWeather().label, '');
  }
  // Animate window weather texture
  dayHudTimer += dt;
  if(dayHudTimer > 0.12){
    dayHudTimer = 0;
    updateWindowViews();
  }
  // Storm lightning flicker
  if(currentWeather().id==='storm' && dayState.lights.sun){
    if(Math.random()<0.008){
      const flash = dayState.lights.amb;
      if(flash){ flash.intensity = 0.8; setTimeout(()=>{if(flash)flash.intensity=phaseColors(currentPhase().id,'storm').ambInt;}, 80); }
    }
  }
}

function reapplyLightingOnly(){
  if(!sceneRoot || !G.rooms[G.curRoom])return;
  const rd=G.rooms[G.curRoom].def;
  const outdoor=!!rd.outdoor;
  const {w,d,h}=rd.size;
  // Remove previous day lights
  Object.values(dayState.lights).forEach(l=>{
    if(l && l.parent) l.parent.remove(l);
  });
  dayState.lights={};
  applyDayLighting(sceneRoot, outdoor, w, d, h);
}

function notifyDayPhase(){
  const p=currentPhase();
  const w=currentWeather();
  notify(p.label+' · '+w.label, '');
  // Update HUD logo subtitle if present
  const logo=document.getElementById('logo');
  if(logo && G.playerName) logo.title = p.label+' — '+w.label;
}

// Dynamic window glass texture (sky + weather)
function makeWindowSkyTex(){
  const cv=document.createElement('canvas');cv.width=256;cv.height=192;
  const c=cv.getContext('2d');
  paintWindowSky(c, cv.width, cv.height);
  const tex=new THREE.CanvasTexture(cv);
  tex.needsUpdate=true;
  return {tex, cv, c};
}

function paintWindowSky(c, w, h){
  const phase=currentPhase().id;
  const weather=currentWeather().id;
  // Sky gradient by phase
  const grad=c.createLinearGradient(0,0,0,h);
  if(phase==='morning'){
    grad.addColorStop(0,'#7ab0d8');grad.addColorStop(.45,'#c8dce8');grad.addColorStop(1,'#f0d8b0');
  }else if(phase==='afternoon'){
    // golden hour sky
    grad.addColorStop(0,'#e87840');grad.addColorStop(.35,'#f0a060');grad.addColorStop(.65,'#ffc878');grad.addColorStop(1,'#ffd8a0');
  }else if(phase==='evening'){
    grad.addColorStop(0,'#2a1830');grad.addColorStop(.3,'#c05028');grad.addColorStop(.55,'#e87840');grad.addColorStop(.8,'#f0a060');grad.addColorStop(1,'#d06030');
  }else{
    grad.addColorStop(0,'#050510');grad.addColorStop(.5,'#101828');grad.addColorStop(1,'#1a2030');
  }
  if(weather==='storm'){ grad.addColorStop(0,'#1a2030');grad.addColorStop(1,'#2a3040'); }
  c.fillStyle=grad;c.fillRect(0,0,w,h);

  // Sun / moon
  if(weather!=='storm' && weather!=='rain'){
    if(phase==='night'){
      c.fillStyle='rgba(240,240,255,0.9)';
      c.beginPath();c.arc(w*.75,h*.25,14,0,Math.PI*2);c.fill();
      // stars
      c.fillStyle='rgba(255,255,255,0.8)';
      for(let i=0;i<30;i++){c.fillRect(Math.random()*w,Math.random()*h*.6,1.5,1.5);}
    }else if(phase==='evening'){
      c.fillStyle='rgba(255,180,80,0.9)';
      c.beginPath();c.arc(w*.2,h*.55,18,0,Math.PI*2);c.fill();
    }else{
      c.fillStyle='rgba(255,240,180,0.85)';
      c.beginPath();c.arc(phase==='morning'?w*.25:w*.7, h*.22, phase==='morning'?16:20,0,Math.PI*2);c.fill();
    }
  }

  // Clouds
  if(weather==='cloudy'||weather==='rain'||weather==='storm'||phase==='morning'){
    const cloudAlpha = weather==='storm'?0.55:weather==='rain'?0.4:0.3;
    c.fillStyle=`rgba(255,255,255,${cloudAlpha})`;
    if(weather==='storm') c.fillStyle=`rgba(80,90,100,${cloudAlpha})`;
    const t=Date.now()*0.00002;
    [[.2,.3,.35],[.55,.22,.4],[.8,.35,.3],[.4,.4,.28]].forEach(([fx,fy,fs],i)=>{
      const cx=(fx+t*(0.3+i*.1))%1.2*w - w*.1;
      const cy=fy*h;
      c.beginPath();
      c.ellipse(cx,cy,fs*w*.5,fs*h*.25,0,0,Math.PI*2);
      c.ellipse(cx+fs*w*.25,cy-4,fs*w*.35,fs*h*.2,0,0,Math.PI*2);
      c.ellipse(cx-fs*w*.2,cy-2,fs*w*.3,fs*h*.18,0,0,Math.PI*2);
      c.fill();
    });
  }

  // Rain streaks
  if(weather==='rain'||weather==='storm'){
    c.strokeStyle=weather==='storm'?'rgba(180,200,220,0.45)':'rgba(200,220,240,0.35)';
    c.lineWidth=1.2;
    const t=Date.now()*0.015;
    for(let i=0;i<50;i++){
      const x=((i*47+t*30)%w);
      const y=((i*31+t*80)%h);
      c.beginPath();c.moveTo(x,y);c.lineTo(x-2,y+12);c.stroke();
    }
  }

  // Distant trees / horizon silhouette
  c.fillStyle=phase==='night'?'rgba(10,15,20,0.7)':'rgba(40,60,40,0.35)';
  c.beginPath();
  c.moveTo(0,h);
  c.lineTo(0,h*.72);
  for(let x=0;x<=w;x+=20){
    c.lineTo(x, h*.7 - Math.sin(x*.04)*8 - Math.random()*6);
  }
  c.lineTo(w,h);c.closePath();c.fill();
}

let _windowTexCache = null;
function updateWindowViews(){
  if(!_windowTexCache){
    _windowTexCache = makeWindowSkyTex();
  }else{
    paintWindowSky(_windowTexCache.c, _windowTexCache.cv.width, _windowTexCache.cv.height);
    _windowTexCache.tex.needsUpdate=true;
  }
  // Apply to all window glass meshes tagged
  if(sceneRoot){
    sceneRoot.traverse(o=>{
      if(o.userData && o.userData.isWindowGlass && o.material){
        o.material.map = _windowTexCache.tex;
        o.material.needsUpdate = true;
      }
    });
  }
}


// ══════════════════════════════════════════════════════
//  THREE SETUP
// ══════════════════════════════════════════════════════
let scene,camera,renderer,clock;
let sceneRoot;
let zoneMeshes={},zoneGroups={},zoneSlotGroups={},slotGhosts={};
let carriedItem=null; let carriedRotY=0; let handMesh=null;
// Gamepad / videogame controller
let gamepadIndex=null;
let gpPrevButtons={};
const GP_DEAD=0.20;
const GP_LOOK_SPEED=4.2;
// Axis map for generic PC pads (SatelliteInt / DirectInput) — auto-filled
let gpAxisMap={lx:0,ly:1,rx:2,ry:3,calibrated:false};
const GP_MOVE_MULT=1.0;
let raycaster=new THREE.Raycaster();
let boxMeshes=[],boxGroups=[],boxOpenAnims={};
let lookTarget=null;
let hoveredGhost=null;
let gameActive=false,pointerLocked=false,fallbackMode=false;
let vrSession=null, vrControllers=[], vrIsPresenting=false;
let vrTempMatrix=null, vrSelectPressed={0:false,1:false};
// Shinecon / Cardboard mobile VR
let mobileVR=false;
let mobileVROrient={alpha:0,beta:0,gamma:0,ok:false};
let mobileVRBaseYaw=null;
const MOBILE_EYE_SEP=0.064; // interpupillary distance
let doorTransitioning=false,lastLockedDoorNotify=0;
let isDragging=false,lastDragX=0,lastDragY=0,dragMoved=false;
let yaw=0,pitch=0;
let lookVelX=0, lookVelY=0; // smoothed gamepad look
const keys={};
const SPEED=4.2;
let walkInput={x:0,y:0}; // persistent WASD/stick/touchpad
let placementAnims=[];

function initThree(){
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x1a1410);
  scene.fog=new THREE.Fog(0x1a1410,14,32);
  camera=new THREE.PerspectiveCamera(70,innerWidth/innerHeight,.1,100);
  camera.position.set(0,1.6,4.2);
  renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;
  renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  renderer.physicallyCorrectLights=true;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure=1.08;
  if(THREE.sRGBEncoding!==undefined) renderer.outputEncoding=THREE.sRGBEncoding;
  clock=new THREE.Clock();
  document.getElementById('app').appendChild(renderer.domElement);
  renderer.domElement.setAttribute('tabindex','0');
  // WebXR (óculos VR)
  renderer.xr.enabled = true;
  if(typeof THREE.Matrix4==='function') vrTempMatrix = new THREE.Matrix4();
  setupVR();
  addEventListener('resize',()=>{
    camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight);
  });
}

// ══════════════════════════════════════════════════════
//  BUILD ROOM
// ══════════════════════════════════════════════════════
function buildRoom(ri){
  if(sceneRoot)scene.remove(sceneRoot);
  sceneRoot=new THREE.Group();
  zoneMeshes={};zoneGroups={};zoneSlotGroups={};slotGhosts={};
  boxMeshes=[];boxGroups=[];boxOpenAnims={};
  placementAnims=[];
  Object.keys(zoneDoorMeshes).forEach(k=>delete zoneDoorMeshes[k]);

  const room=G.rooms[ri],rd=room.def;
  const {w,d,h}=rd.size;
  const outdoor=!!rd.outdoor;

  // Lighting driven by day phase (morning / afternoon / night)
  applyDayLighting(sceneRoot, outdoor, w, d, h);

  // Floor / ground
  const flMat=outdoor
    ? new THREE.MeshStandardMaterial({map:grassTex(),roughness:.95,metalness:0})
    : new THREE.MeshStandardMaterial({map:floorTex(rd.floorColor),roughness:.65,metalness:.02});
  const fl=new THREE.Mesh(new THREE.PlaneGeometry(w,d),flMat);
  fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;sceneRoot.add(fl);

  if(outdoor){
    scene.background=new THREE.Color(0x8ec0e0);
    scene.fog=new THREE.FogExp2(0xb0d0e8,0.028);
    const skyGeo=new THREE.SphereGeometry(32,32,18,0,Math.PI*2,0,Math.PI*.55);
    const skyMesh=new THREE.Mesh(skyGeo,new THREE.MeshBasicMaterial({map:skyTex(),side:THREE.BackSide,fog:false}));
    sceneRoot.add(skyMesh);
    const sunDisc=new THREE.Mesh(new THREE.CircleGeometry(1.6,24),new THREE.MeshBasicMaterial({color:0xfff2c0,fog:false,transparent:true,opacity:.9}));
    sunDisc.position.set(10,14,-18);sunDisc.lookAt(0,0,0);sceneRoot.add(sunDisc);
    const patio=new THREE.Mesh(new THREE.PlaneGeometry(6.2,4.2),new THREE.MeshStandardMaterial({map:pavingTex(),roughness:.85}));
    patio.rotation.x=-Math.PI/2;patio.position.set(1.4,.012,0.2);patio.receiveShadow=true;sceneRoot.add(patio);
    for(let i=0;i<5;i++){
      const stone=new THREE.Mesh(new THREE.BoxGeometry(.55+Math.random()*.15,.04,.4+Math.random()*.1),sm(0x9a9082,.9));
      stone.position.set(-1.0+i*.55,.02,-d/2+1.2+i*.55);stone.rotation.y=(Math.random()-.5)*.3;stone.receiveShadow=true;sceneRoot.add(stone);
    }
    const fenceMat=new THREE.MeshStandardMaterial({map:woodTex(0x9a7a50,0x7a5a30),roughness:.8});
    const fenceH=1.05;
    [[0,-d/2,w,0],[0,d/2,w,0],[-w/2,0,d,Math.PI/2],[w/2,0,d,Math.PI/2]].forEach(([x,z,len,ry])=>{
      const segs=Math.floor(len/0.55);
      for(let i=0;i<segs;i++){
        const t=(i+.5)/segs-.5;
        const px=ry?x:x+t*len, pz=ry?z+t*len:z;
        const post=new THREE.Mesh(new THREE.BoxGeometry(.06,fenceH,.04),fenceMat);
        post.position.set(px,fenceH/2,pz);post.castShadow=true;sceneRoot.add(post);
      }
      [fenceH*.92, fenceH*.45].forEach(hy=>{
        const rail=new THREE.Mesh(new THREE.BoxGeometry(ry?0.05:len,.05,ry?len:0.05),fenceMat);
        rail.position.set(x,hy,z);sceneRoot.add(rail);
      });
    });
    function addTree(tx,tz,scale=1){
      const trunkM=sm(0x6a4a28,.8);
      // Tapered trunk with bark feel
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.08*scale,.16*scale,2.2*scale,12),trunkM);
      trunk.position.set(tx,1.1*scale,tz);trunk.castShadow=true;sceneRoot.add(trunk);
      // Secondary branch stubs
      for(let i=0;i<3;i++){
        const ang=i*2.1;
        const br=new THREE.Mesh(new THREE.CylinderGeometry(.02*scale,.04*scale,.5*scale,6),trunkM);
        br.position.set(tx+Math.cos(ang)*.15*scale, 1.4*scale+i*.2, tz+Math.sin(ang)*.15*scale);
        br.rotation.z=Math.cos(ang)*.6; br.rotation.x=Math.sin(ang)*.4;
        sceneRoot.add(br);
      }
      // Dense multi-layer canopy
      const greens=[0x2a7a30,0x3a8c38,0x4a9a40,0x228028,0x359a35,0x1e6a24];
      const layers=[
        [0,2.1,1.15],[.45,2.4,.8],[-.4,2.35,.75],[.2,2.9,.65],
        [-.25,2.7,.6],[.35,2.0,.7],[-.3,2.0,.65],[0,3.2,.5],
        [.15,2.5,.55],[-.15,2.5,.55]
      ];
      layers.forEach(([ox,oy,r],i)=>{
        const leaves=new THREE.Mesh(new THREE.SphereGeometry(r*scale,16,14),sm(greens[i%greens.length],.82));
        leaves.position.set(tx+ox*scale,oy*scale,tz+((i%3)-1)*.12*scale);
        leaves.scale.set(1, 0.9+Math.random()*.15, 1);
        leaves.castShadow=true;sceneRoot.add(leaves);
      });
    }
    addTree(-7,5.5,1.25);addTree(6.8,4.8,1.1);addTree(7.2,-5.2,1.0);addTree(-6.5,-4.8,0.95);addTree(0,7.5,0.8);
    // Fuller bushes
    const bushGreens=[0x3a8c30,0x4a9a38,0x2d7a28,0x48a040];
    [[-5,7],[5,7],[-7,0],[7,-2],[4,-7],[-3,-6]].forEach(([bx,bz])=>{
      for(let i=0;i<5;i++){
        const r=.22+Math.random()*.2;
        const bush=new THREE.Mesh(new THREE.SphereGeometry(r,12,10),sm(bushGreens[i%4],.85));
        bush.position.set(bx+(Math.random()-.5)*.6, r*.7, bz+(Math.random()-.5)*.6);
        bush.scale.y=.7+Math.random()*.25;
        bush.castShadow=true;sceneRoot.add(bush);
      }
    });
    const flowerCols=[0xe05070,0xf0c040,0x5090e0,0xe070c0,0xf08040];
    [[-2,6],[3,5.5],[-5,3],[6,-3]].forEach(([fx,fz])=>{
      for(let i=0;i<6;i++){
        const px=fx+(Math.random()-.5)*.9, pz=fz+(Math.random()-.5)*.9;
        const stem=new THREE.Mesh(new THREE.CylinderGeometry(.008,.01,.18,6),sm(0x3a7030,.9));
        stem.position.set(px,.09,pz);sceneRoot.add(stem);
        const bloom=new THREE.Mesh(new THREE.SphereGeometry(.04,8,6),sm(flowerCols[i%flowerCols.length],.7));
        bloom.position.set(px,.2,pz);sceneRoot.add(bloom);
      }
    });
    const wallBack=new THREE.Mesh(new THREE.PlaneGeometry(w,h*.7),new THREE.MeshStandardMaterial({map:wallTex(0x9a8868),roughness:.85}));
    wallBack.position.set(0,h*.35,-d/2+.02);sceneRoot.add(wallBack);
    buildDoor(sceneRoot,-1.0,1.2,-d/2+.04,1.05,2.4,0);
    buildWindow(sceneRoot,2.6,h*.45,-d/2+.04,2.0,1.5);
  } else {
    scene.background=new THREE.Color(0x1a1610);
    scene.fog=new THREE.Fog(0x1a1610, 14, 32);
    // Ceiling
    const ceilMesh=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshStandardMaterial({color:0xf2ebe0,roughness:.92,emissive:0xfff8f0,emissiveIntensity:0.04}));
    ceilMesh.rotation.x=Math.PI/2;ceilMesh.position.y=h;sceneRoot.add(ceilMesh);

    // Ceiling light fixture
    // Ceiling lamp with strong emissive glow
    const fixMesh=new THREE.Mesh(new THREE.CylinderGeometry(.22,.32,.14,20),new THREE.MeshStandardMaterial({color:0xfff8e8,emissive:0xfff0b0,emissiveIntensity:0.6,metalness:.4,roughness:.25}));
    fixMesh.position.set(0,h-.07,0);sceneRoot.add(fixMesh);
    const bulbGlow=new THREE.Mesh(new THREE.SphereGeometry(.12,16,12),new THREE.MeshStandardMaterial({color:0xfff8e0,emissive:0xffe8a0,emissiveIntensity:0.7,roughness:.3}));
    bulbGlow.position.set(0,h-.18,0);sceneRoot.add(bulbGlow);
    const cord=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.35,8),new THREE.MeshStandardMaterial({color:0x888878}));
    cord.position.set(0,h-.35,0);sceneRoot.add(cord);

    // Walls
    const wTex=wallTex(rd.wallColor);
    const wMat=new THREE.MeshStandardMaterial({map:wTex,roughness:.82,metalness:0.02});
    [[0,h/2,-d/2,0],[0,h/2,d/2,Math.PI],[-w/2,h/2,0,Math.PI/2],[w/2,h/2,0,-Math.PI/2]].forEach(([x,y,z,ry],i)=>{
      const m=new THREE.Mesh(new THREE.PlaneGeometry(i%2===0?w:d,h),wMat.clone());
      m.position.set(x,y,z);if(ry)m.rotation.y=ry;m.receiveShadow=true;sceneRoot.add(m);
    });

    // Trim
    const tTex=woodTex(rd.trimColor,rd.trimColor-0x151210);
    const tMat=new THREE.MeshStandardMaterial({map:tTex,roughness:.7});
    [[0,-d/2+.025,w,0],[0,d/2-.025,w,Math.PI],[-w/2+.025,0,d,Math.PI/2],[w/2-.025,0,d,-Math.PI/2]].forEach(([x,z,len,rot])=>{
      const t=new THREE.Mesh(new THREE.BoxGeometry(len,.15,.055),tMat);
      t.position.set(x,.075,z);t.rotation.y=rot;sceneRoot.add(t);
    });

    // Baseboard
    const baseMat=new THREE.MeshStandardMaterial({color:rd.trimColor,roughness:.9});
    [[0,-d/2+.01,w,0],[0,d/2-.01,w,Math.PI],[-w/2+.01,0,d,Math.PI/2],[w/2-.01,0,d,-Math.PI/2]].forEach(([x,z,len,rot])=>{
      const b=new THREE.Mesh(new THREE.BoxGeometry(len,.04,.03),baseMat);
      b.position.set(x,.02,z);b.rotation.y=rot;sceneRoot.add(b);
    });

    // Windows with soft daylight spilling in
    buildWindow(sceneRoot,-2.8,h*.62,-d/2+.03,2.4,1.8);
    buildWindow(sceneRoot,3.0,h*.62,-d/2+.03,2.4,1.8);
    // Window lights set by applyDayLighting / updateWeather

    // Door
    buildDoor(sceneRoot,w/2-.03,1.2,3.0,1.05,2.4,-Math.PI/2);
  }

  // Furniture
  rd.furniture.forEach(fDef=>{
    const grp=new THREE.Group();
    grp.position.set(fDef.pos.x, fDef.elevY!==undefined?fDef.elevY:(fDef.type==='microwave'?0.92:0), fDef.pos.z);
    if(fDef.rot)grp.rotation.y=fDef.rot;
    sceneRoot.add(grp);
    zoneGroups[fDef.id]=grp;
    buildFurniturePiece(grp,fDef);
    if(grp.userData.openable && (grp.userData.doorLeft || grp.userData.doorRight)){
      const mode = (fDef.type==='nightstand'||fDef.type==='desk'||fDef.type==='bigdesk') ? 'drawer'
        : (grp.userData.doorMode==='drop' || fDef.type==='stove' || fDef.type==='grill') ? 'drop' : 'swing';
      zoneDoorMeshes[fDef.id]={left:grp.userData.doorLeft,right:grp.userData.doorRight,openAngle:1.7,mode};
      if(zoneOpen[fDef.id]){
        if(mode==='drawer'){
          if(grp.userData.doorLeft){ const d=grp.userData.doorLeft; if(d.userData.baseZ===undefined)d.userData.baseZ=d.position.z; d.position.z=d.userData.baseZ+0.45; }
        }else if(mode==='drop'){
          if(grp.userData.doorLeft) grp.userData.doorLeft.rotation.x=1.35;
        }else{
          if(grp.userData.doorLeft) grp.userData.doorLeft.rotation.y=-1.7;
          if(grp.userData.doorRight) grp.userData.doorRight.rotation.y=1.7;
        }
      }
    }

    if(fDef.type!=='floor'&&fDef.type!=='rug'){
      const hitH=Math.max(fDef.size.h,.7)+.4;
      const hit=new THREE.Mesh(
        new THREE.BoxGeometry(fDef.size.w+.35,hitH,fDef.size.d+.35),
        new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false})
      );
      hit.position.set(0,hitH/2,0);
      hit.userData.zoneId=fDef.id;
      grp.add(hit);
      zoneMeshes[fDef.id]=hit;
    } else {
      const hit=new THREE.Mesh(
        new THREE.BoxGeometry(fDef.size.w+.4,.5,fDef.size.d+.4),
        new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false})
      );
      hit.position.set(0,.25,0);
      hit.userData.zoneId=fDef.id;
      grp.add(hit);
      zoneMeshes[fDef.id]=hit;
    }

    const sg=new THREE.Group();
    sg.position.set(0,0,0);
    grp.add(sg);
    zoneSlotGroups[fDef.id]=sg;

    slotGhosts[fDef.id]=[];
    (fDef.slots||[]).forEach((sl,si)=>{
      const g=makeGhost();
      const sp=slotPos(fDef,sl);
      g.position.set(sp.x,sp.y,sp.z);
      g.visible=false;g.userData.zoneId=fDef.id;g.userData.slotIdx=si;
      sg.add(g);slotGhosts[fDef.id].push(g);
    });

    const lbl=makeTextSprite(fDef.label);
    lbl.position.set(0,fDef.type==='floor'||fDef.type==='rug'?.5:fDef.size.h+.5,0);
    grp.add(lbl);
  });

  // Boxes
  const items=[...rd.items.map(it=>({...it}))];
  const nb=rd.boxPositions.length;
  const boxItems=rd.boxPositions.map(()=>[]);
  items.forEach((it,i)=>boxItems[i%nb].push(it));
  room.boxes=rd.boxPositions.map((pos,bi)=>({items:[...boxItems[bi]],state:'closed',pos,idx:bi}));
  rd.boxPositions.forEach((pos,bi)=>{
    const {grp:bg,flapMesh,interior,sideFlaps,flaps}=buildBox(sceneRoot,pos.x,pos.z,bi);
    boxGroups[bi]=bg;
    boxOpenAnims[bi]={t:0,flapMesh,opening:false,done:false,interior,sideFlaps,flaps:flaps||[]};
    // Pre-populate interior with packing paper + items
    if(interior){
      // Crumpled packing paper layer
      for(let i=0;i<5;i++){
        const paper=new THREE.Mesh(
          new THREE.BoxGeometry(0.2+Math.random()*0.15, 0.02, 0.15+Math.random()*0.1),
          sm(0xe8dcc0, 0.95)
        );
        paper.position.set((Math.random()-0.5)*0.5, 0.01+i*0.01, (Math.random()-0.5)*0.4);
        paper.rotation.y=Math.random()*Math.PI;
        interior.add(paper);
      }
      const boxItems=room.boxes[bi]?.items||[];
      boxItems.slice(0,5).forEach((it,ii)=>{
        const im=makeItemMesh(it);
        im.scale.setScalar(0.55);
        const col=ii%2, row=Math.floor(ii/2);
        im.position.set(-0.18+col*0.36, 0.06+row*0.12, -0.12+row*0.08);
        im.rotation.y=(ii%3-1)*0.2;
        interior.add(im);
      });
    }
  });

  scene.add(sceneRoot);
  Object.values(room.placed).forEach(p=>arrangeSlot(p.zone,room));
  updateBoxGrid(ri);
}

// Computes the effective local (x,z) position of a slot, biasing items
// toward the back/wall side (-z, by this codebase's convention — see
// buildBed's headboard at -d/2 and buildShelf's back panel at -d/2) for
// furniture flagged as being against a wall. Slots that already define a
// deliberate non-zero z (e.g. the shower's front-corner slots) are left
// untouched so we don't undo intentional placement.
function surfaceY(fDef){
  if(!fDef||!fDef.size) return 0.02;
  const t=fDef.type, h=fDef.size.h||1;
  if(t==='floor'||t==='rug') return 0.04;
  if(t==='bed') return h*0.58;
  if(t==='sink') return h*0.78;
  if(t==='toilet') return h*0.48;
  if(t==='table'||t==='desk'||t==='bigdesk') return h+0.02;
  if(t==='counter'||t==='stove') return h*0.92;
  if(t==='nightstand'||t==='microwave'||t==='ottoman') return h+0.02;
  if(t==='gamingchair') return h*0.48;
  if(t==='couch'||t==='chair') return h*0.48;
  if(t==='shelf'||t==='bookcase') return h*0.55;
  if(t==='cabinet'||t==='closet'||t==='bathcabinet'||t==='fridge') return h*0.35;
  if(t==='shower'||t==='hamper'||t==='planter') return h*0.9;
  return h*0.95;
}
// Returns Y positions of each shelf/level for multi-level furniture
function shelfLevels(fDef){
  if(!fDef||!fDef.size) return [0.1];
  const t=fDef.type, h=fDef.size.h||1;
  if(t==='shelf'||t==='bookcase'){
    // 4 shelves matching buildShelf
    return [0.12, h*0.32, h*0.55, h*0.78].map(y=>y+0.03);
  }
  if(t==='closet'||t==='cabinet'||t==='bathcabinet'||t==='wallcabinet'){
    return [h*0.15, h*0.35, h*0.55, h*0.75].map(y=>y+0.02);
  }
  if(t==='fridge'){
    return [h*0.15, h*0.4, h*0.65].map(y=>y+0.02);
  }
  if(t==='counter'){
    return [0.12, h*0.35];
  }
  if(t==='nightstand'||t==='desk'||t==='bigdesk'){
    return [0.12, h*0.35];
  }
  return [surfaceY(fDef)];
}
function snapToShelf(fDef, aimY, inside){
  const levels = shelfLevels(fDef);
  if(!inside && (fDef.type==='shelf'||fDef.type==='bookcase')){
    // open shelves: always snap to nearest level
    let best=levels[0], bestD=Math.abs(aimY-levels[0]);
    levels.forEach(y=>{ const d=Math.abs(aimY-y); if(d<bestD){bestD=d;best=y;} });
    return best;
  }
  if(inside){
    let best=levels[0], bestD=Math.abs(aimY-levels[0]);
    levels.forEach(y=>{ const d=Math.abs(aimY-y); if(d<bestD){bestD=d;best=y;} });
    return best;
  }
  return surfaceY(fDef)+0.02;
}
function slotPos(fDef,sl){
  let x=sl.x||0, z=sl.z||0;
  if(fDef.wall && z===0 && fDef.size && fDef.size.d){
    const halfD=fDef.size.d/2;
    const inset=Math.min(halfD*0.32, 0.16);
    z=-halfD+inset;
  }
  let y;
  if(sl.yFrac!==undefined && fDef.size){
    y=sl.yFrac*fDef.size.h;
  }else{
    y=surfaceY(fDef);
  }
  return {x,y,z};
}

// Picks whichever free slot is closest to the point the player actually
// aimed at, instead of always grabbing the first open slot — this is what
// lets the player choose exactly where on a piece of furniture an item
// lands.
function nearestFreeSlot(fDef,room,localPt){
  const occupied=Object.values(room.placed).filter(p=>p.zone===fDef.id).map(p=>p.slotIdx);
  let si=0,bestDist=Infinity,found=false;
  (fDef.slots||[]).forEach((sl,i)=>{
    if(occupied.includes(i))return;
    const sp=slotPos(fDef,sl);
    const dx=localPt.x-sp.x, dz=localPt.z-sp.z;
    const dy=(sl.yFrac!==undefined&&localPt.y!==undefined)?(localPt.y-sp.y)*0.6:0;
    const dist=dx*dx+dz*dz+dy*dy;
    if(dist<bestDist){bestDist=dist;si=i;found=true;}
  });
  if(found)return si;
  return occupied.length?occupied[0]:0;
}

function makeGhost(){
  const grp=new THREE.Group();
  const geo=new THREE.BoxGeometry(.2,.05,.2);
  const m1=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:0xffd24a,transparent:true,opacity:.25}));
  grp.add(m1);
  const edges=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xffd24a,transparent:true,opacity:.9}));
  grp.add(edges);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(.04,.09,8),new THREE.MeshBasicMaterial({color:0xffd24a,transparent:true,opacity:.75}));
  cone.rotation.x=Math.PI;cone.position.y=.14;cone.userData.isArrow=true;
  grp.add(cone);
  grp.userData.isGhost=true;
  return grp;
}

function makeTextSprite(text){
  const cv=document.createElement('canvas');cv.width=256;cv.height=64;
  const c=cv.getContext('2d');
  c.font='bold 26px sans-serif';
  c.fillStyle='rgba(255,255,255,0.92)';
  c.textAlign='center';c.textBaseline='middle';
  c.shadowColor='rgba(0,0,0,0.95)';c.shadowBlur=10;
  c.fillText(text,128,32);
  const t=new THREE.CanvasTexture(cv);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));
  sp.scale.set(1.6,.4,1);
  return sp;
}

// ══════════════════════════════════════════════════════
//  FURNITURE BUILDERS
// ══════════════════════════════════════════════════════
function sm(color,rough=.8,metal=.05,map=null){
  return new THREE.MeshStandardMaterial({color,roughness:rough,metalness:metal,...(map?{map}:{})});
}
function box3(grp,w,h,d,x,y,z,mat){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;grp.add(m);return m;
}


function makePillowMesh(w,h,d,col){
  // Soft rectangular hotel pillow
  const g=new THREE.Group();
  const mat=sm(col||0xf5f2ec,.88,0,fabricTex(col||0xf5f2ec));
  const soft=sm(0xffffff,.9);
  // Main body
  const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
  body.castShadow=true; body.receiveShadow=true; g.add(body);
  // Slightly smaller top for soft edge look
  const top=new THREE.Mesh(new THREE.BoxGeometry(w*.92,h*.35,d*.9),soft);
  top.position.y=h*.28; g.add(top);
  // Side seam lines
  [-1,1].forEach(s=>{
    const seam=new THREE.Mesh(new THREE.BoxGeometry(w*.02,h*.7,d*.02),sm(0xe8e4dc,.85));
    seam.position.set(s*(w/2-.01), 0, 0); g.add(seam);
  });
  return g;
}
function buildFurniturePiece(grp,fDef){
  const {w,h,d}=fDef.size;
  switch(fDef.type){
    case 'bed':        buildBed(grp,w,h,d,fDef.color);break;
    case 'desk':       buildDesk(grp,w,h,d,fDef.color);break;
    case 'shelf':      buildShelf(grp,w,h,d,fDef.color);break;
    case 'tallcabinet':buildTallCabinet(grp,w,h,d,fDef.color);break;
    case 'wallcabinet':buildWallCabinet(grp,w,h,d,fDef.color);break;
    case 'wallart':buildWallArt(grp,w,h,d,fDef.color);break;
    case 'floatshelf':buildFloatShelf(grp,w,h,d,fDef.color);break;
    case 'closet':     buildCloset(grp,w,h,d,fDef.color);break;
    case 'nightstand': buildNightstand(grp,w,h,d,fDef.color);break;
    case 'floorlamp':  buildFloorLamp(grp,w,h,d);break;
    case 'rug':        buildRug(grp,w,d,fDef.color);break;
    case 'chair':      buildChair(grp,w,h,d,fDef.color);break;
    case 'gamingchair':buildGamingChair(grp,w,h,d,fDef.color);break;
    case 'armchair':   buildArmchair(grp,w,h,d,fDef.color);break;
    case 'coffeetable':buildCoffeeTable(grp,w,h,d,fDef.color);break;
    case 'tvwall':     buildTvWall(grp,w,h,d,fDef.color);break;
    case 'counter':    buildCounter(grp,w,h,d,fDef.color);break;
    case 'fridge':     buildFridge(grp,w,h,d,fDef.color);break;
    case 'cabinet':    buildCabinet(grp,w,h,d,fDef.color);break;
    case 'stove':      buildStove(grp,w,h,d);break;
    case 'microwave':  buildMicrowave(grp,w,h,d);break;
    case 'table':      buildTable(grp,w,h,d,fDef.color);break;
    case 'bigdesk':    buildBigDesk(grp,w,h,d,fDef.color);break;
    case 'bookcase':   buildBookcase(grp,w,h,d,fDef.color);break;
    case 'couch':      buildCouch(grp,w,h,d,fDef.color);break;
    case 'offchair':   buildOfficeChair(grp,w,h,d);break;
    case 'bigplant':   buildBigPlant(grp);break;
    case 'sink':         buildSink(grp,w,h,d);break;
    case 'toilet':        buildToilet(grp,w,h,d);break;
    case 'shower':         buildShower(grp,w,h,d);break;
    case 'bathcabinet':    buildBathCabinet(grp,w,h,d);break;
    case 'hamper':         buildHamper(grp,w,h,d);break;
    case 'yardtable':      buildYardTable(grp,w,h,d);break;
    case 'grill':          buildGrill(grp,w,h,d);break;
    case 'shed':           buildShed(grp,w,h,d);break;
    case 'bench':          buildBench(grp,w,h,d);break;
    case 'ottoman':        buildOttoman(grp,w,h,d,fDef.color);break;
    case 'planter':        buildPlanter(grp,w,h,d);break;
    case 'clothesline':    buildClothesline(grp,w,h,d);break;
    case 'floor':      break; // floor marker, no visual needed
    default: break;
  }
}

function buildBed(grp,w,h,d,col){
  // Modern upholstered bed — muted beige/gray (img1 tones + img2 form)
  const fabric=sm(0xb8b0a4,.82,0,fabricTex(0xb8b0a4));
  const fabricSoft=sm(0xc8c0b4,.85);
  const sheet=sm(0xe8e4dc,.9);
  const throwC=sm(0xa09890,.8,0,fabricTex(0xa09890));
  // Platform base
  box3(grp,w,.16,d, 0, .18, 0, fabric);
  // Legs
  const legM=sm(0x2a2a2e,.4,.3);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.02,.025,.14,8),legM);
    leg.position.set(sx*(w/2-.1), .07, sz*(d/2-.1)); grp.add(leg);
  });
  // Mattress + sheet
  box3(grp,w-.08,.2,d-.1, 0, .38, 0, fabricSoft);
  box3(grp,w-.06,.035,d-.08, 0, .5, 0, sheet);
  // Wide padded headboard
  const hbH=1.05, hbD=.12;
  box3(grp,w+.1,hbH,hbD, 0, hbH/2+.12, -d/2+hbD/2, fabric);
  // Soft face with horizontal channel tufting lines
  box3(grp,w+.02,hbH-.1,.04, 0, hbH/2+.12, -d/2+hbD+.02, fabricSoft);
  for(let i=1;i<=3;i++){
    box3(grp,w*.95,.012,.02, 0, .25+i*.22, -d/2+hbD+.04, sm(0xa8a098,.75));
  }
  // White hotel pillows (2 large + 2 smaller)
  [-.26,.26].forEach(px=>{
    const p=makePillowMesh(w*.32, .14, d*.16, 0xf5f2ec);
    p.position.set(px*w*.4, .68, -d*.26); grp.add(p);
  });
  [-.16,.16].forEach(px=>{
    const p=makePillowMesh(w*.24, .11, d*.12, 0xffffff);
    p.position.set(px*w*.32, .64, -d*.14); grp.add(p);
  });
  // Throw at foot
  box3(grp,w-.08,.05,d*.25, 0, .54, d*.3, throwC);
}

function buildDesk(grp,w,h,d,col){
  // White desk — drawer identical to nightstand system
  const body=sm(0xe8e4dc,.4,.04);
  const soft=sm(0xd8d4cc,.45,.03);
  const chrome=new THREE.MeshStandardMaterial({color:0xc0c8d0,metalness:.8,roughness:.2});
  // Desktop
  box3(grp,w,.05,d, 0, h, 0, soft);
  // Right thin legs
  box3(grp,.05,h-.05,.05, w/2-.1, (h-.05)/2,  d/2-.1, body);
  box3(grp,.05,h-.05,.05, w/2-.1, (h-.05)/2, -d/2+.1, body);
  // Left pedestal body (static shell under top)
  const pw=w*.36, ph=h-.05, pd=d*.9;
  const px=-w/2+pw/2+.03;
  box3(grp,pw,ph,pd, px, ph/2, 0, body);
  // Opening cut is visual only — drawer sits in front
  // === Drawer exactly like nightstand ===
  const drawer=new THREE.Group();
  drawer.position.set(px, 0, 0);
  drawer.userData.baseZ=0;
  const drH=ph*.42, drW=pw-.1, drD=pd-.12;
  // Front panel
  const front=new THREE.Mesh(new THREE.BoxGeometry(drW,drH,.04),soft);
  front.position.set(0, ph*.35, pd/2+.01); drawer.add(front);
  // Handle
  const hd=new THREE.Mesh(new THREE.BoxGeometry(drW*.4,.015,.02),chrome);
  hd.position.set(0, ph*.35, pd/2+.04); drawer.add(hd);
  // Second drawer front (stacked look)
  const front2=new THREE.Mesh(new THREE.BoxGeometry(drW,drH,.04),soft);
  front2.position.set(0, ph*.72, pd/2+.01); drawer.add(front2);
  const hd2=new THREE.Mesh(new THREE.BoxGeometry(drW*.4,.015,.02),chrome);
  hd2.position.set(0, ph*.72, pd/2+.04); drawer.add(hd2);
  // Hollow interior (same structure as nightstand)
  const floor=new THREE.Mesh(new THREE.BoxGeometry(drW,.02,drD),body);
  floor.position.set(0, ph*.15, 0); drawer.add(floor);
  const sideL=new THREE.Mesh(new THREE.BoxGeometry(.025,drH*1.8,drD),body);
  sideL.position.set(-drW/2, ph*.45, 0); drawer.add(sideL);
  const sideR=new THREE.Mesh(new THREE.BoxGeometry(.025,drH*1.8,drD),body);
  sideR.position.set(drW/2, ph*.45, 0); drawer.add(sideR);
  const back=new THREE.Mesh(new THREE.BoxGeometry(drW,drH*1.8,.025),body);
  back.position.set(0, ph*.45, -drD/2); drawer.add(back);
  const interior=new THREE.Group();
  interior.position.set(0, ph*.18, 0);
  interior.userData.isDrawerInterior=true;
  drawer.add(interior);
  grp.add(drawer);
  grp.userData.doorLeft=drawer; grp.userData.doorRight=null; grp.userData.openable=true;
}



function buildWallArt(grp,w,h,d,col){
  // Framed picture on wall
  const frame=sm(0x2a2a2e,.5,.1);
  const matte=sm(0xe8e4dc,.7);
  box3(grp,w,h,d*.4, 0, h/2, 0, frame);
  // Inner art
  const art=new THREE.Mesh(new THREE.PlaneGeometry(w*.75,h*.75),
    new THREE.MeshStandardMaterial({color:0x6a7080,roughness:.6,metalness:.05}));
  art.position.set(0, h/2, d*.25); grp.add(art);
  // Abstract shapes on canvas
  const a1=new THREE.Mesh(new THREE.CircleGeometry(w*.12,12),sm(0xc0a070,.5));
  a1.position.set(-w*.1, h/2+h*.08, d*.26); grp.add(a1);
  const a2=new THREE.Mesh(new THREE.BoxGeometry(w*.2,h*.15,.01),sm(0x5080a0,.5));
  a2.position.set(w*.12, h/2-h*.1, d*.26); grp.add(a2);
}
function buildFloatShelf(grp,w,h,d,col){
  const wood=sm(col||0xc8b8a0,.5,.05);
  box3(grp,w,h,d, 0, h/2, 0, wood);
  // Support brackets
  [-w*.35, w*.35].forEach(sx=>{
    box3(grp,.04,.08,.06, sx, -0.02, -d*.2, sm(0x3a3a3e,.4,.2));
  });
}
function buildWallCabinet(grp,w,h,d,col){
  // Floating wall cabinet — openable doors
  const white=sm(0xe8e4dc,.4,.04);
  const soft=sm(0xd8d4cc,.45,.03);
  const chrome=new THREE.MeshStandardMaterial({color:0xc0c8d0,metalness:.8,roughness:.2});
  // Carcass (no front)
  box3(grp,.04,h,d, -w/2+.02, h/2, 0, white);
  box3(grp,.04,h,d,  w/2-.02, h/2, 0, white);
  box3(grp,w,.04,d, 0, h-.02, 0, white);
  box3(grp,w,.04,d, 0, .02, 0, white);
  box3(grp,w-.04,h-.04,.03, 0, h/2, -d/2+.02, soft);
  // Shelf inside
  box3(grp,w-.1,.025,d-.08, 0, h*.5, 0, soft);
  // Left door
  const doorW=w/2-.03, doorH=h-.06;
  const doorL=new THREE.Group();
  doorL.position.set(-w/2+.02, 0, d/2);
  const pL=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,.035),soft);
  pL.position.set(doorW/2, h/2, .018); doorL.add(pL);
  const hL=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.12,8),chrome);
  hL.position.set(doorW-.05, h/2, .04); doorL.add(hL);
  grp.add(doorL);
  // Right door
  const doorR=new THREE.Group();
  doorR.position.set(w/2-.02, 0, d/2);
  const pR=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,.035),soft);
  pR.position.set(-doorW/2, h/2, .018); doorR.add(pR);
  const hR=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.12,8),chrome);
  hR.position.set(-doorW+.05, h/2, .04); doorR.add(hR);
  grp.add(doorR);
  grp.userData.doorLeft=doorL; grp.userData.doorRight=doorR; grp.userData.openable=true;
}
function buildTallCabinet(grp,w,h,d,col){
  // Tall narrow open-shelf cabinet (white)
  const white=new THREE.MeshStandardMaterial({color:0xf0f0f0, roughness:.38, metalness:.04});
  const soft=new THREE.MeshStandardMaterial({color:0xe4e4e4, roughness:.42, metalness:.03});
  // Outer frame
  box3(grp,.04,h,d, -w/2+.02, h/2, 0, white);
  box3(grp,.04,h,d,  w/2-.02, h/2, 0, white);
  box3(grp,w,.04,d, 0, h-.02, 0, white);
  box3(grp,w,.04,d, 0, .02, 0, white);
  // Back panel
  box3(grp,w-.04,h-.04,.03, 0, h/2, -d/2+.02, soft);
  // 5 internal shelves evenly spaced
  for(let i=1;i<=5;i++){
    const y=h*(i/6);
    box3(grp,w-.08,.03,d-.06, 0, y, 0, white);
  }
  // Soft folded towels / decor on shelves
  const cols=[0xd8d0c8,0xc8b8a8,0xe8e0d8,0xb0c0d0,0xd0c0b0];
  for(let i=0;i<5;i++){
    const y=h*((i+1)/6)+.06;
    box3(grp,w*.55,.08,d*.5, 0, y, .02, sm(cols[i%cols.length],.85));
  }
}


function buildShelf(grp,w,h,d,col){
  // Uses room color — light beige to match bedroom furniture
  const c=col||0xd8d0c4;
  const sideM=sm(c,.5,.04);
  const shelfM=sm(Math.min(0xffffff,c+0x101010),.48,.03);
  const dark=sm(c-0x151510,.55,.04);
  // Side panels
  box3(grp,.06,h,d, -w/2+.03, h/2, 0, sideM);
  box3(grp,.06,h,d,  w/2-.03, h/2, 0, sideM);
  // Back
  box3(grp,w-.02,h,.04, 0, h/2, -d/2+.02, dark);
  // Top
  box3(grp,w+.02,.05,d+.02, 0, h+.02, 0, shelfM);
  // Shelves
  for(let i=0;i<4;i++){
    const y=0.08+i*((h-0.2)/3.5);
    box3(grp,w-.1,.035,d-.06, 0, y, 0, shelfM);
  }
  // Base
  box3(grp,w,.06,d, 0, .03, 0, sideM);
}

function buildCloset(grp,w,h,d,col){
  // Dark modern wardrobe with center mirror (img1 style)
  const dark=sm(0x3a3e44,.45,.08);
  const darkSoft=sm(0x4a4e54,.5,.06);
  const frame=sm(0x2a2e34,.4,.1);
  // Carcass
  box3(grp,.06,h,d, -w/2+.03, h/2, 0, frame);
  box3(grp,.06,h,d,  w/2-.03, h/2, 0, frame);
  box3(grp,w,.05,d, 0, h-.025, 0, frame);
  box3(grp,w,.05,d, 0, .025, 0, frame);
  box3(grp,w-.08,h-.08,.04, 0, h/2, -d/2+.02, darkSoft);
  // Interior shelves + rod
  box3(grp,w-.14,.03,d-.1, 0, h*.25, -.02, darkSoft);
  box3(grp,w-.14,.03,d-.1, 0, h*.45, -.02, darkSoft);
  const rod=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,w-.2,10),
    new THREE.MeshStandardMaterial({color:0xc0c8d0,metalness:.7,roughness:.25}));
  rod.rotation.z=Math.PI/2;rod.position.set(0,h*.75,-.04);grp.add(rod);
  // Clothes
  const clothCols=[0x4060a0,0xa04040,0x308050,0x7050a0,0xc0a040];
  [-.5,-.25,0,.25,.5].forEach((cx,i)=>{
    box3(grp,.1,.3,.03, cx*(w*.35), h*.55, -.04, sm(clothCols[i%5],.85));
  });
  const inL=new THREE.PointLight(0xfff0d0,0.45,2.5,2);
  inL.position.set(0,h*.7,0.05);grp.add(inL);
  // 3 doors: dark | mirror | dark
  const doorH=h-.1, doorD=.04, doorW=w/3-.02;
  const chrome=new THREE.MeshStandardMaterial({color:0xc0c8d0,metalness:.85,roughness:.15});
  // Left door
  const doorL=new THREE.Group();
  doorL.position.set(-w/2+.02, 0, d/2);
  const pL=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,doorD),dark);
  pL.position.set(doorW/2, h/2, doorD/2); doorL.add(pL);
  const hL=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.4,8),chrome);
  hL.position.set(doorW-.05, h/2, doorD+.03); doorL.add(hL);
  grp.add(doorL);
  // Center mirror panel (fixed)
  const mid=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,doorD),darkSoft);
  mid.position.set(0, h/2, d/2+doorD/2); grp.add(mid);
  const mirror=new THREE.Mesh(new THREE.PlaneGeometry(doorW-.08,doorH-.1),
    new THREE.MeshStandardMaterial({color:0xc8d0d8,roughness:.12,metalness:.6,emissive:0x101418,emissiveIntensity:.1}));
  mirror.position.set(0, h/2, d/2+doorD+.012); grp.add(mirror);
  // Right door
  const doorR=new THREE.Group();
  doorR.position.set(w/2-.02, 0, d/2);
  const pR=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,doorD),dark);
  pR.position.set(-doorW/2, h/2, doorD/2); doorR.add(pR);
  const hR=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.4,8),chrome);
  hR.position.set(-doorW+.05, h/2, doorD+.03); doorR.add(hR);
  grp.add(doorR);
  grp.userData.doorLeft=doorL; grp.userData.doorRight=doorR; grp.userData.openable=true;
}

function buildNightstand(grp,w,h,d,col){
  // Modern beige nightstand
  const body=sm(0xc8b8a0,.5,.04);
  const soft=sm(0xb8a890,.55,.03);
  const chrome=new THREE.MeshStandardMaterial({color:0xc0c8d0,metalness:.8,roughness:.2});
  // Body
  box3(grp,w,h-.04,d, 0, (h-.04)/2+.02, 0, body);
  // Top
  box3(grp,w+.02,.04,d+.02, 0, h, 0, soft);
  // Drawer front
  const drawer=new THREE.Group();
  drawer.position.set(0, 0, 0);
  drawer.userData.baseZ=0;
  const drH=h*.4, drW=w-.08, drD=d-.1;
  const front=new THREE.Mesh(new THREE.BoxGeometry(drW,drH,.04),soft);
  front.position.set(0, h*.35, d/2+.01); drawer.add(front);
  const hd=new THREE.Mesh(new THREE.BoxGeometry(drW*.4,.015,.02),chrome);
  hd.position.set(0, h*.35, d/2+.04); drawer.add(hd);
  // Hollow interior
  const floor=new THREE.Mesh(new THREE.BoxGeometry(drW,.02,drD),body);
  floor.position.set(0, h*.15, 0); drawer.add(floor);
  const sideL=new THREE.Mesh(new THREE.BoxGeometry(.025,drH,drD),body);
  sideL.position.set(-drW/2, h*.35, 0); drawer.add(sideL);
  const sideR=new THREE.Mesh(new THREE.BoxGeometry(.025,drH,drD),body);
  sideR.position.set(drW/2, h*.35, 0); drawer.add(sideR);
  const back=new THREE.Mesh(new THREE.BoxGeometry(drW,drH,.025),body);
  back.position.set(0, h*.35, -drD/2); drawer.add(back);
  const interior=new THREE.Group();
  interior.position.set(0, h*.18, 0);
  interior.userData.isDrawerInterior=true;
  drawer.add(interior);
  grp.add(drawer);
  // Legs
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.015,.018,.06,8),sm(0x3a3a3e,.4,.3));
    leg.position.set(sx*(w/2-.08), .03, sz*(d/2-.08)); grp.add(leg);
  });
  grp.userData.doorLeft=drawer; grp.userData.doorRight=null; grp.userData.openable=true;
}

function buildFloorLamp(grp,w,h,d){
  const brass=new THREE.MeshStandardMaterial({color:0xc8a050,metalness:.7,roughness:.28});
  // Weighted base
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.2,.24,.05,20),brass);
  base.position.y=.025;grp.add(base);
  const base2=new THREE.Mesh(new THREE.CylinderGeometry(.1,.14,.04,16),brass);
  base2.position.y=.06;grp.add(base2);
  // Pole
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.018,.022,h-.4,12),brass);
  pole.position.y=(h-.4)/2+.08;grp.add(pole);
  // Shade (warm fabric)
  const shade=new THREE.Mesh(
    new THREE.CylinderGeometry(.12,.26,.34,24,1,true),
    new THREE.MeshStandardMaterial({color:0xf5ead0,roughness:.88,side:THREE.DoubleSide,emissive:0xffe8b0,emissiveIntensity:.25})
  );
  shade.position.y=h-.1;grp.add(shade);
  // Shade top cap
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.1,.12,.03,16),brass);
  cap.position.y=h+.05;grp.add(cap);
  // Bulb glow
  const glow=new THREE.Mesh(new THREE.SphereGeometry(.09,12,10),
    new THREE.MeshStandardMaterial({color:0xfff8e0,emissive:0xffe8a0,emissiveIntensity:1.1,transparent:true,opacity:0.75}));
  glow.position.y=h-.15;grp.add(glow);
  // Light
  const ptLight=new THREE.PointLight(0xfff0c0,0.9,6.5,1.4);
  ptLight.position.y=h-.18;grp.add(ptLight);
}

function buildRug(grp,w,d,col){
  // Soft light area rug
  const base=sm(col||0xc8c0b0,.92);
  const fringe=sm(0xb8b0a0,.9);
  box3(grp,w,.02,d, 0, .01, 0, base);
  // Soft border
  box3(grp,w*.92,.005,d*.92, 0, .022, 0, fringe);
  // Subtle center pattern stripes
  for(let i=0;i<5;i++){
    box3(grp,w*.7,.003,.04, 0, .025, -d*.3+i*(d*.15), sm(0xb0a898,.88));
  }
}

function buildGamingChair(grp,w,h,d,col){
  // Black & white racing gaming chair
  const black=sm(0x1a1a1e,.75,0,fabricTex(0x1a1a1e));
  const white=sm(0xf0f0f0,.55);
  const chrome=new THREE.MeshStandardMaterial({color:0xc8d0d8, metalness:.85, roughness:.15});
  const gold=new THREE.MeshStandardMaterial({color:0xc8a040, metalness:.7, roughness:.3});
  // Seat
  box3(grp,w*.85,.12,d*.75, 0, .48, .02, black);
  box3(grp,w*.7,.06,d*.55, 0, .56, .04, white); // white center stripe
  // High back
  box3(grp,w*.8,.75,.12, 0, .95, -d*.32, black);
  // White side bolsters on back
  [-1,1].forEach(s=>{
    box3(grp,.1,.65,.1, s*(w*.32), .95, -d*.3, white);
  });
  // Headrest pillow
  box3(grp,w*.45,.12,.1, 0, 1.35, -d*.28, black);
  box3(grp,w*.35,.06,.06, 0, 1.38, -d*.22, white);
  // Armrests
  [-1,1].forEach(s=>{
    box3(grp,.08,.06,d*.5, s*(w/2-.06), .62, 0, white);
    const pole=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.2,8),chrome);
    pole.position.set(s*(w/2-.06), .52, .05); grp.add(pole);
  });
  // Footrest hint
  box3(grp,w*.55,.04,d*.25, 0, .42, d*.35, black);
  // Chrome star base
  const cyl=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.35,12),chrome);
  cyl.position.y=.22; grp.add(cyl);
  for(let i=0;i<5;i++){
    const ang=i/5*Math.PI*2;
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.42,.03,.05),chrome);
    arm.rotation.y=ang; arm.position.y=.04; grp.add(arm);
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.04,10),sm(0x222226,.5,.3));
    wheel.rotation.x=Math.PI/2;
    wheel.position.set(Math.cos(ang)*.2, .035, Math.sin(ang)*.2); grp.add(wheel);
  }
  // Gold badge accent
  const badge=new THREE.Mesh(new THREE.CircleGeometry(.04,12),gold);
  badge.position.set(0, 1.05, -d*.25); grp.add(badge);
}
function buildChair(grp,w,h,d,col){
  // Modern soft chair
  const fab=sm(col||0x8a8070,.85,0,fabricTex(col||0x8a8070));
  const legM=sm(0x3a3a3e,.4,.3);
  // Seat
  box3(grp,w,.08,d, 0, .45, 0, fab);
  // Back
  box3(grp,w,.5,.08, 0, .75, -d/2+.04, fab);
  // Legs
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.45,8),legM);
    leg.position.set(sx*(w/2-.08), .225, sz*(d/2-.08)); grp.add(leg);
  });
}

function buildArmchair(grp,w,h,d,col){
  // Plush tufted armchair like reference
  const c=col||0xd8c8b0;
  const fabM=sm(c,.85,0,fabricTex(c));
  const softM=sm(Math.min(0xffffff,c+0x12100c),.88);
  // Seat base
  box3(grp,w*.9,.2,d*.75, 0, .28, .05, fabM);
  // Thick seat cushion with tuft look (4 pads)
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    box3(grp,w*.38,.12,d*.3, sx*w*.2, .42, .05+sz*d*.12, softM);
  });
  // Back cushion (tall, tufted)
  box3(grp,w*.85,.5,.16, 0, .65, -d*.28, fabM);
  [[-1,1],[-1,-1],[1,1],[1,-1]].forEach(([sx,sy])=>{
    box3(grp,w*.32,.2,.08, sx*w*.18, .55+sy*.12, -d*.22, softM);
  });
  // Soft armrests
  [-1,1].forEach(s=>{
    box3(grp,.18,.28,d*.6, s*(w/2-.12), .42, .05, fabM);
    const roll=new THREE.Mesh(new THREE.CylinderGeometry(.09,.09,d*.5,12),fabM);
    roll.rotation.x=Math.PI/2;
    roll.position.set(s*(w/2-.12), .58, .05); grp.add(roll);
  });
  // Wooden angled legs
  const legM=sm(0x6a4a28,.55,.1);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.018,.03,.2,8),legM);
    leg.position.set(sx*(w/2-.15), .1, sz*(d*.28));
    leg.rotation.z=sx*0.12;
    grp.add(leg);
  });
}

function buildCoffeeTable(grp,w,h,d,col){
  // Modern oval coffee table
  const topM=sm(col||0xf0ece4,.35,.08);
  // Oval top
  const top=new THREE.Mesh(new THREE.CylinderGeometry(w/2,w/2,.05,32),topM);
  top.scale.z=(d/w);
  top.position.y=h; top.castShadow=true; grp.add(top);
  // Wooden angled leg frames
  const wood=sm(0xc4a060,.55,.08);
  // Left V-frame
  [[-1,1],[-1,-1]].forEach(([sx,sz])=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.04,h-.05,.04),wood);
    leg.position.set(sx*w*.28, (h-.05)/2, sz*d*.2);
    leg.rotation.z=sx*0.25;
    leg.rotation.x=sz*-0.15;
    grp.add(leg);
  });
  // Right V-frame
  [[1,1],[1,-1]].forEach(([sx,sz])=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.04,h-.05,.04),wood);
    leg.position.set(sx*w*.28, (h-.05)/2, sz*d*.2);
    leg.rotation.z=sx*0.25;
    leg.rotation.x=sz*-0.15;
    grp.add(leg);
  });
  // Cross bar
  box3(grp,w*.5,.03,.03, 0, .08, 0, wood);
}

function buildTvWall(grp,w,h,d,col){
  // Wooden vertical slat wall panel + TV + floating console
  const wood=sm(col||0xc4a060,.55,.08);
  const woodDark=sm(0xa08040,.6,.06);
  // Vertical slats covering wall panel
  const nSlats=14;
  const slatW=w/nSlats;
  for(let i=0;i<nSlats;i++){
    const sx=-w/2+slatW*(i+.5);
    box3(grp,slatW*.7,h,.04, sx, h/2, -d/2+.02, i%2===0?wood:woodDark);
  }
  // Backing board
  box3(grp,w,h,.02, 0, h/2, -d/2, sm(0x8a7040,.7));
  // TV centered on panel height
  const tvW=Math.min(w*.5, 1.55), tvH=0.95;
  const tvY=h*0.42; // a bit lower
  box3(grp,tvW+.08,tvH+.08,.03, 0, tvY, -d/2+.06, sm(0x1a1a1a,.4,.3));
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(tvW,tvH),
    new THREE.MeshStandardMaterial({color:0x0a0a12,roughness:.15,metalness:.3,emissive:0x101018,emissiveIntensity:.15}));
  screen.position.set(0, tvY, -d/2+.08); grp.add(screen);
  // Warm LED strip above TV
  const led=new THREE.Mesh(new THREE.BoxGeometry(tvW+.15,.02,.02),
    new THREE.MeshStandardMaterial({color:0xffcc60,emissive:0xffaa30,emissiveIntensity:.9}));
  led.position.set(0, tvY+tvH/2+.05, -d/2+.07); grp.add(led);
  const ledLight=new THREE.PointLight(0xffcc60,0.5,3.0,2);
  ledLight.position.set(0,tvY+tvH/2+.08,-d/2+.2);grp.add(ledLight);
  // Floating shelf above TV
  box3(grp,w*.7,.05,.2, 0, tvY+tvH/2+.2, -d/2+.12, wood);
  // White media console raised higher
  const consoleW=w*.75, consoleH=.22;
  const consoleY=0.85;
  box3(grp,consoleW,consoleH,.32, 0, consoleY, -d/2+.16, sm(0xf0f0ec,.4,.05));
  box3(grp,.012,consoleH*.7,.012, -consoleW*.2, consoleY, -d/2+.32, sm(0xd0d0d0,.5));
  box3(grp,.012,consoleH*.7,.012,  consoleW*.2, consoleY, -d/2+.32, sm(0xd0d0d0,.5));
}

function buildCounter(grp,w,h,d,col){
  const wt=woodTex(0x8a6a48,0x6a4a28);
  const bodyM=sm(0x8a6a48,.8,0,wt);
  const doorMat=sm(0x7a5a38,.72,0,wt);
  const innerM=sm(0x9a7a50,.75,0,wt);
  const hMat=new THREE.MeshStandardMaterial({color:0xd4a840,metalness:.7,roughness:.3});
  const bodyH=h*.88;
  const doorSecW=w*.58;
  // === Hollow cabinet section (left) ===
  // Sides of hollow section
  box3(grp,.05,bodyH,d, -w/2+.025, bodyH/2, 0, bodyM); // left outer
  box3(grp,.05,bodyH,d, -w/2+doorSecW-.025, bodyH/2, 0, bodyM); // divider wall
  // Back of hollow section
  box3(grp,doorSecW,bodyH-.02,.04, -w/2+doorSecW/2, bodyH/2, -d/2+.02, innerM);
  // Bottom floor of hollow section
  box3(grp,doorSecW-.05,.04,d, -w/2+doorSecW/2, .02, 0, bodyM);
  // Top of carcass under countertop (hollow section)
  box3(grp,doorSecW,.04,d, -w/2+doorSecW/2, bodyH-.02, 0, bodyM);
  // Interior shelves
  box3(grp,doorSecW-.12,.03,d-.12, -w/2+doorSecW/2, bodyH*.35, 0, sm(0x8a6a48,.7,0,wt));
  box3(grp,doorSecW-.12,.03,d-.12, -w/2+doorSecW/2, bodyH*.62, 0, sm(0x8a6a48,.7,0,wt));
  // Interior light
  const inL=new THREE.PointLight(0xfff0d0,0.5,2.2,2);
  inL.position.set(-w/2+doorSecW/2, bodyH*.7, 0.05); grp.add(inL);
  // === Solid drawer section (right) ===
  const drSecW=w-doorSecW;
  box3(grp,drSecW,bodyH,d, -w/2+doorSecW+drSecW/2, bodyH/2, 0, bodyM);
  // === Countertop full width ===
  box3(grp,w+.06,.055,d+.04, 0, bodyH+.027, 0, sm(0xc8b8a0,.35,.08));
  // Sink
  const sink=new THREE.Mesh(new THREE.BoxGeometry(w*.12,.05,d*.3), sm(0xc0c8d0,.3,.4));
  sink.position.set(-w*.3, bodyH+.03, 0); grp.add(sink);
  const fM=new THREE.MeshStandardMaterial({color:0xc0c8d0,metalness:.8,roughness:.2});
  const faucet=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.12,8),fM);
  faucet.position.set(-w*.3, bodyH+.1, -d*.12); grp.add(faucet);
  const spout=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.08,8),fM);
  spout.rotation.x=Math.PI/2; spout.position.set(-w*.3, bodyH+.14, -d*.05); grp.add(spout);
  // Backsplash
  box3(grp,w,.28,.03, 0, bodyH+.14, -d/2+.02, sm(0xd0c8b8,.55));
  // === Two doors ===
  const doorW=doorSecW/2-.03, doorH=bodyH*.75, doorD=.045;
  const doorL=new THREE.Group();
  doorL.position.set(-w/2+.02, 0, d/2);
  const pL=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,doorD),doorMat);
  pL.position.set(doorW/2, bodyH*.42, doorD/2); doorL.add(pL);
  const insetL=new THREE.Mesh(new THREE.BoxGeometry(doorW-.1,doorH*.7,.01),sm(0x6a4a28,.7,0,wt));
  insetL.position.set(doorW/2, bodyH*.42, doorD+.005); doorL.add(insetL);
  const hdL=new THREE.Mesh(new THREE.SphereGeometry(.016,8,8),hMat);
  hdL.position.set(doorW-.08, bodyH*.42, doorD+.03); doorL.add(hdL);
  grp.add(doorL);
  const doorR=new THREE.Group();
  doorR.position.set(-w/2+doorSecW-.02, 0, d/2);
  const pR=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,doorD),doorMat);
  pR.position.set(-doorW/2, bodyH*.42, doorD/2); doorR.add(pR);
  const insetR=new THREE.Mesh(new THREE.BoxGeometry(doorW-.1,doorH*.7,.01),sm(0x6a4a28,.7,0,wt));
  insetR.position.set(-doorW/2, bodyH*.42, doorD+.005); doorR.add(insetR);
  const hdR=new THREE.Mesh(new THREE.SphereGeometry(.016,8,8),hMat);
  hdR.position.set(-doorW+.08, bodyH*.42, doorD+.03); doorR.add(hdR);
  grp.add(doorR);
  // === Three drawer fronts (right) ===
  const drW=drSecW-.08;
  const drX=-w/2+doorSecW+drSecW/2;
  for(let i=0;i<3;i++){
    const dy=0.08+i*(bodyH*.28);
    const dh=bodyH*.25;
    const front=new THREE.Mesh(new THREE.BoxGeometry(drW,dh,.04),doorMat);
    front.position.set(drX, dy+dh/2, d/2+.02); grp.add(front);
    const inset=new THREE.Mesh(new THREE.BoxGeometry(drW-.08,dh*.7,.01),sm(0x6a4a28,.7,0,wt));
    inset.position.set(drX, dy+dh/2, d/2+.04); grp.add(inset);
    const hd=new THREE.Mesh(new THREE.SphereGeometry(.014,8,8),hMat);
    hd.position.set(drX, dy+dh/2, d/2+.05); grp.add(hd);
  }
  grp.userData.doorLeft=doorL; grp.userData.doorRight=doorR; grp.userData.openable=true;
}

function buildFridge(grp,w,h,d,col){
  // Side-by-side stainless fridge (Samsung style)
  const ss=new THREE.MeshStandardMaterial({color:0xd8dde4, roughness:.18, metalness:.65});
  const ssDark=new THREE.MeshStandardMaterial({color:0xb8c0c8, roughness:.22, metalness:.55});
  const black=new THREE.MeshStandardMaterial({color:0x2a2a30, roughness:.4, metalness:.3});
  // Base / feet
  box3(grp,w*.95,.05,d*.95, 0, .025, 0, black);
  const bodyH=h-.05;
  // Hollow body
  box3(grp,.04,bodyH,d, -w/2+.02, .05+bodyH/2, 0, ss);
  box3(grp,.04,bodyH,d,  w/2-.02, .05+bodyH/2, 0, ss);
  box3(grp,w,.04,d, 0, h-.02, 0, ss);
  box3(grp,w,.04,d, 0, .07, 0, ss);
  box3(grp,w-.06,bodyH-.04,.04, 0, .05+bodyH/2, -d/2+.025, ssDark);
  // Center divider
  box3(grp,.03,bodyH-.08,d-.08, 0, .05+bodyH/2, 0, ssDark);
  // Interior shelves both sides
  [ -w*.22, w*.22 ].forEach(sx=>{
    box3(grp,w*.38,.015,d-.14, sx, .05+bodyH*.7, -.02, sm(0xd0d8e0,.3,.2));
    box3(grp,w*.38,.015,d-.14, sx, .05+bodyH*.45, -.02, sm(0xd0d8e0,.3,.2));
    box3(grp,w*.38,.015,d-.14, sx, .05+bodyH*.22, -.02, sm(0xd0d8e0,.3,.2));
  });
  const inL=new THREE.PointLight(0xf0f8ff,0.7,2.6,2);
  inL.position.set(0,.05+bodyH*.5,0);grp.add(inL);
  const hMat=new THREE.MeshStandardMaterial({color:0xc0c8d0,metalness:.9,roughness:.1});
  // Left door (fridge with dispenser)
  const doorL=new THREE.Group();
  doorL.position.set(-w/2+.02, 0, d/2);
  const dW=w/2-.04, dH=bodyH-.06;
  const pL=new THREE.Mesh(new THREE.BoxGeometry(dW,dH,.05),ss);
  pL.position.set(dW/2, .05+bodyH/2, .025); doorL.add(pL);
  // Water/ice dispenser
  const disp=new THREE.Mesh(new THREE.BoxGeometry(dW*.42,dH*.28,.03),ssDark);
  disp.position.set(dW*.45, .05+bodyH*.55, .055); doorL.add(disp);
  // Dispenser recess
  const recess=new THREE.Mesh(new THREE.BoxGeometry(dW*.32,dH*.18,.02),black);
  recess.position.set(dW*.45, .05+bodyH*.52, .07); doorL.add(recess);
  // Dispenser levers
  [-.04,.04].forEach(ox=>{
    const lev=new THREE.Mesh(new THREE.BoxGeometry(.04,.06,.015),sm(0xe8ecf0,.3,.4));
    lev.position.set(dW*.45+ox, .05+bodyH*.48, .08); doorL.add(lev);
  });
  // Vertical handle left
  const hdL=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,dH*.45,10),hMat);
  hdL.position.set(dW-.06, .05+bodyH/2, .06); doorL.add(hdL);
  // Handle mounts
  [dH*.18,-dH*.18].forEach(oy=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(.04,.02,.03),hMat);
    m.position.set(dW-.06, .05+bodyH/2+oy, .05); doorL.add(m);
  });
  grp.add(doorL);
  // Right door
  const doorR=new THREE.Group();
  doorR.position.set(w/2-.02, 0, d/2);
  const pR=new THREE.Mesh(new THREE.BoxGeometry(dW,dH,.05),ss);
  pR.position.set(-dW/2, .05+bodyH/2, .025); doorR.add(pR);
  // Vertical handle right
  const hdR=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,dH*.45,10),hMat);
  hdR.position.set(-dW+.06, .05+bodyH/2, .06); doorR.add(hdR);
  [dH*.18,-dH*.18].forEach(oy=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(.04,.02,.03),hMat);
    m.position.set(-dW+.06, .05+bodyH/2+oy, .05); doorR.add(m);
  });
  grp.add(doorR);
  // Brand strip top
  box3(grp,w*.2,.02,.01, w*.25, h-.08, d/2+.03, sm(0xa0a8b0,.4,.5));
  grp.userData.doorLeft=doorL; grp.userData.doorRight=doorR; grp.userData.openable=true;
}

function buildCabinet(grp,w,h,d,col){
  const wt=woodTex(0x9a7450,0x7a5430);
  const bodyM=sm(0x9a7450,.82,0,wt);
  const innerM=sm(0xb89868,.75,0,wt);
  // Hollow carcass
  box3(grp,.05,h,d, -w/2+.025, h/2, 0, bodyM);
  box3(grp,.05,h,d,  w/2-.025, h/2, 0, bodyM);
  box3(grp,w,.05,d, 0, h-.025, 0, bodyM);
  box3(grp,w,.05,d, 0, .025, 0, bodyM);
  // Interior back (lighter so shelves stand out)
  box3(grp,w-.1,h-.1,.03, 0, h/2, -d/2+.04, innerM);
  // Center vertical divider
  box3(grp,.03,h-.1,d-.08, 0, h/2, 0, bodyM);
  // Interior shelves (3 levels both sides)
  [0.22, 0.48, 0.74].forEach(fy=>{
    box3(grp,w-.12,.03,d-.1, 0, h*fy, 0, sm(0x8a6440,.7,0,wt));
  });
  // Small decorative jars / plates baked in back
  const decorCols=[0xc06040,0xe8e0d0,0x4a8c44,0x6080c0];
  [-.3,.3].forEach((sx,si)=>{
    for(let i=0;i<2;i++){
      const jar=new THREE.Mesh(new THREE.CylinderGeometry(.04,.045,.1,10),sm(decorCols[(si+i)%4],.6));
      jar.position.set(sx, h*(0.25+i*0.26)+.05, -d*.25); grp.add(jar);
    }
  });
  const cabLight=new THREE.PointLight(0xfff0d0,0.55,2.4,2);
  cabLight.position.set(0,h*.75,0.08);grp.add(cabLight);
  const hMat=new THREE.MeshStandardMaterial({color:0xdcb43c,metalness:.75,roughness:.25});
  const doorMat=sm(0x9a7450,.75,0,wt);
  const doorW=w/2-.025, doorH=h-.1, doorD=.04;
  // Left door
  const doorL=new THREE.Group();
  doorL.position.set(-w/2+.02,0,d/2);
  const pL=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,doorD),doorMat);
  pL.position.set(doorW/2,h/2,doorD/2);doorL.add(pL);
  const insetL=new THREE.Mesh(new THREE.BoxGeometry(doorW-.12,doorH*.7,.015),sm(0x8a6440,.7,0,wt));
  insetL.position.set(doorW/2,h/2,doorD+.008);doorL.add(insetL);
  const hdL=new THREE.Mesh(new THREE.SphereGeometry(.02,10,10),hMat);
  hdL.position.set(doorW-.07,h*.5,doorD+.025);doorL.add(hdL);
  grp.add(doorL);
  // Right door
  const doorR=new THREE.Group();
  doorR.position.set(w/2-.02,0,d/2);
  const pR=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,doorD),doorMat);
  pR.position.set(-doorW/2,h/2,doorD/2);doorR.add(pR);
  const insetR=new THREE.Mesh(new THREE.BoxGeometry(doorW-.12,doorH*.7,.015),sm(0x8a6440,.7,0,wt));
  insetR.position.set(-doorW/2,h/2,doorD+.008);doorR.add(insetR);
  const hdR=new THREE.Mesh(new THREE.SphereGeometry(.02,10,10),hMat);
  hdR.position.set(-doorW+.07,h*.5,doorD+.025);doorR.add(hdR);
  grp.add(doorR);
  grp.userData.doorLeft=doorL;
  grp.userData.doorRight=doorR;
  grp.userData.openable=true;
}

function buildStove(grp,w,h,d){
  const body=sm(0x3a3a42,.4,.35);
  const dark=sm(0x18181c,.5,.25);
  const hMat=new THREE.MeshStandardMaterial({color:0xc8d0d8,metalness:.8,roughness:.2});
  // Upper body (above oven) + sides + top — leave front open at oven
  const ovenH=h*.38, ovenY=0.1, ovenW=w*.8, ovenD=d*.65;
  // Top section (above oven opening)
  box3(grp,w, h*.88-ovenY-ovenH, d, 0, ovenY+ovenH+(h*.88-ovenY-ovenH)/2, 0, body);
  // Left side full height
  box3(grp,(w-ovenW)/2, h*.88, d, -w/2+(w-ovenW)/4, h*.44, 0, body);
  // Right side full height
  box3(grp,(w-ovenW)/2, h*.88, d,  w/2-(w-ovenW)/4, h*.44, 0, body);
  // Bottom strip below oven
  box3(grp,w, ovenY, d, 0, ovenY/2, 0, body);
  // Back panel
  box3(grp,w, h*.88, .05, 0, h*.44, -d/2+.025, body);
  // Cooktop
  box3(grp,w+.02,.04,d+.02, 0, h*.88+.02, 0, sm(0x2e2e34,.35,.45));
  const bM=new THREE.MeshStandardMaterial({color:0x1a1a1e,roughness:.55,metalness:.35});
  [[-.22,.12],[.22,.12],[-.22,-.12],[.22,-.12]].forEach(([bx,bz])=>{
    const burner=new THREE.Mesh(new THREE.CylinderGeometry(.075,.085,.018,12),bM);
    burner.position.set(bx*w, h*.88+.04, bz*d); grp.add(burner);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.065,.008,6,16),sm(0x4a4a50,.45,.4));
    ring.position.set(bx*w, h*.88+.05, bz*d); ring.rotation.x=Math.PI/2; grp.add(ring);
  });
  // Oven cavity interior
  box3(grp,ovenW,.025,ovenD, 0, ovenY+.012, 0, dark); // floor
  box3(grp,ovenW,.025,ovenD, 0, ovenY+ovenH-.012, 0, dark); // ceiling
  box3(grp,.025,ovenH,ovenD, -ovenW/2+.012, ovenY+ovenH/2, 0, dark);
  box3(grp,.025,ovenH,ovenD,  ovenW/2-.012, ovenY+ovenH/2, 0, dark);
  box3(grp,ovenW,ovenH,.025, 0, ovenY+ovenH/2, -ovenD/2+.012, dark);
  // Rack
  const rack=new THREE.Mesh(new THREE.BoxGeometry(ovenW*.85,.012,ovenD*.75),sm(0x606068,.4,.5));
  rack.position.set(0, ovenY+ovenH*.4, -0.02); grp.add(rack);
  for(let i=0;i<4;i++){
    const bar=new THREE.Mesh(new THREE.BoxGeometry(ovenW*.8,.006,.006),sm(0x707078,.4,.4));
    bar.position.set(0, ovenY+ovenH*.4+.008, -ovenD*.25+i*(ovenD*.14)); grp.add(bar);
  }
  const inL=new THREE.PointLight(0xffe8c0,0.45,1.6,2);
  inL.position.set(0,ovenY+ovenH*.65,0);grp.add(inL);
  // Door hinged at bottom of opening
  const door=new THREE.Group();
  door.position.set(0, ovenY, d/2);
  door.userData.mode='drop';
  const panel=new THREE.Mesh(new THREE.BoxGeometry(ovenW+.04, ovenH+.02, .045), sm(0x3a3a42,.4,.35));
  panel.position.set(0, (ovenH+.02)/2, .022); door.add(panel);
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(ovenW*.65,ovenH*.5),
    new THREE.MeshStandardMaterial({color:0x1a1a22,roughness:.15,metalness:.3,emissive:0x101018,emissiveIntensity:.25}));
  glass.position.set(0, ovenH/2, .05); door.add(glass);
  const handle=new THREE.Mesh(new THREE.BoxGeometry(ovenW*.45,.02,.03),hMat);
  handle.position.set(0, ovenH-.03, .055); door.add(handle);
  grp.add(door);
  // Knobs
  for(let i=0;i<4;i++){
    const kn=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.028,8),hMat);
    kn.rotation.x=Math.PI/2;
    kn.position.set(-w*.28+i*.18, h*.75, d/2+.025); grp.add(kn);
  }
  grp.userData.doorLeft=door; grp.userData.doorRight=null; grp.userData.openable=true;
  grp.userData.doorMode='drop';
}

function buildMicrowave(grp,w,h,d){
  const body=sm(0x3a3a40,.4,.45);
  const dark=sm(0x1a1a20,.4,.4);
  const silver=new THREE.MeshStandardMaterial({color:0xb0b8c0,metalness:.7,roughness:.25});
  // Full solid shell with front opening only on left portion
  // Top, bottom, left, right, back
  box3(grp,w,.04,d, 0, h-.02, 0, body); // top
  box3(grp,w,.04,d, 0, .02, 0, body); // bottom
  box3(grp,.04,h,d, -w/2+.02, h/2, 0, body); // left
  box3(grp,.04,h,d,  w/2-.02, h/2, 0, body); // right
  box3(grp,w,h,.04, 0, h/2, -d/2+.02, body); // back
  // Control panel column (right front, always closed)
  const ctrlW=w*.28;
  box3(grp,ctrlW,h*.9,.04, w/2-ctrlW/2-.02, h/2, d/2-.02, body);
  // Buttons
  for(let i=0;i<4;i++){
    const btn=new THREE.Mesh(new THREE.BoxGeometry(.05,.025,.015), sm(0x505058,.4,.3));
    btn.position.set(w/2-ctrlW/2-.02, h*.25+i*.12, d/2+.01); grp.add(btn);
  }
  // Display
  box3(grp,ctrlW*.7,.06,.01, w/2-ctrlW/2-.02, h*.78, d/2+.005, sm(0x203040,.3,.2));
  // Interior cavity (visible when door open)
  box3(grp,w*.6,.02,d*.7, -w*.08, .08, 0, dark); // floor
  box3(grp,w*.6,.02,d*.7, -w*.08, h-.08, 0, dark); // ceiling
  box3(grp,.02,h*.8,d*.7, -w*.38, h/2, 0, dark); // left inner
  box3(grp,.02,h*.8,d*.7,  w*.2, h/2, 0, dark); // right inner (before controls)
  box3(grp,w*.6,h*.8,.02, -w*.08, h/2, -d*.3, dark); // back inner
  // Turntable
  const turn=new THREE.Mesh(new THREE.CylinderGeometry(w*.18,w*.18,.01,16),sm(0x888890,.5));
  turn.position.set(-w*.08, .1, 0); grp.add(turn);
  const inL=new THREE.PointLight(0xfff0d0,0.4,1.5,2);
  inL.position.set(-w*.08,h*.6,0);grp.add(inL);
  // Door — covers the cavity opening
  const door=new THREE.Group();
  door.position.set(-w/2+.02, 0, d/2);
  const doorW=w-ctrlW-.06, doorH=h-.08;
  const panel=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,.04),body);
  panel.position.set(doorW/2, h/2, .02); door.add(panel);
  // Glass window
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(doorW*.7,doorH*.6),
    new THREE.MeshStandardMaterial({color:0x111118,roughness:.12,metalness:.35,emissive:0x0a0a12,emissiveIntensity:.2}));
  glass.position.set(doorW/2, h/2, .045); door.add(glass);
  // Handle
  const handle=new THREE.Mesh(new THREE.BoxGeometry(.02,.16,.03),silver);
  handle.position.set(doorW-.05, h/2, .05); door.add(handle);
  grp.add(door);
  // Feet
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    box3(grp,.035,.015,.035, sx*w*.38, .008, sz*d*.38, sm(0x1a1a1a,.8));
  });
  grp.userData.doorLeft=door; grp.userData.doorRight=null; grp.userData.openable=true;
}

function buildTable(grp,w,h,d,col){
  const wt=woodTex(0x6a4a30,0x4a3018);
  const topM=sm(0x8a6848,.55,.04,wt);
  // Thick top with slight overhang
  box3(grp,w,h*.08,d, 0, h-.04, 0, topM);
  // Under apron
  box3(grp,w*.92,.06,d*.92, 0, h-.1, 0, sm(0x6a4a30,.7,0,wt));
  // Legs - tapered
  const legM=sm(0x5a3a20,.75,0,wt);
  const lw=.07, inset=0.1;
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(lw, h-.12, lw), legM);
    leg.position.set(sx*(w/2-inset), (h-.12)/2, sz*(d/2-inset));
    grp.add(leg);
  });
  // Center stretcher
  box3(grp,w*.7,.03,.04, 0, .12, 0, legM);
  box3(grp,.04,.03,d*.6, 0, .12, 0, legM);
}

function buildBigDesk(grp,w,h,d,col){
  const wt=woodTex(0x3c2818,0x2c1808);
  const bodyM=sm(0x3a2416,.78,0,wt);
  const innerM=sm(0x2a1c10,.85,0,wt);
  // Desktop
  const top=new THREE.Mesh(new THREE.BoxGeometry(w,.07,d),new THREE.MeshStandardMaterial({map:wt,roughness:.38,metalness:.06}));
  top.position.y=h;top.castShadow=true;grp.add(top);
  // Legs
  const legMat=sm(0x2a1c10,.8,0,wt);
  [[-w/2+.1,-d/2+.1],[w/2-.1,-d/2+.1],[-w/2+.1,d/2-.1],[w/2-.1,d/2-.1]].forEach(([lx,lz])=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.085,h-.07,.085),legMat);
    leg.position.set(lx,(h-.07)/2,lz);leg.castShadow=true;grp.add(leg);
  });
  // Pedestal carcass (right side) — open front
  const duW=w*.28, duH=h*.9, duD=d*.88;
  const px=w/2-duW/2-.05;
  const pedBottom=h-duH;
  box3(grp,.04,duH,duD, px-duW/2+.02, pedBottom+duH/2, 0, bodyM);
  box3(grp,.04,duH,duD, px+duW/2-.02, pedBottom+duH/2, 0, bodyM);
  box3(grp,duW,.04,duD, px, pedBottom+.02, 0, bodyM);
  box3(grp,duW,duH,.04, px, pedBottom+duH/2, -duD/2+.02, bodyM);
  // Hollow drawer unit
  const drawer=new THREE.Group();
  drawer.position.set(px, pedBottom, 0);
  drawer.userData.baseZ=0;
  const dw=duW-.1, dd=duD-.08, th=.025, wallH=duH*.88;
  const floor=new THREE.Mesh(new THREE.BoxGeometry(dw,th,dd),innerM);
  floor.position.set(0, .04, 0); drawer.add(floor);
  const left=new THREE.Mesh(new THREE.BoxGeometry(th,wallH,dd),bodyM);
  left.position.set(-dw/2+th/2, wallH/2, 0); drawer.add(left);
  const right=new THREE.Mesh(new THREE.BoxGeometry(th,wallH,dd),bodyM);
  right.position.set(dw/2-th/2, wallH/2, 0); drawer.add(right);
  const back=new THREE.Mesh(new THREE.BoxGeometry(dw,wallH,th),bodyM);
  back.position.set(0, wallH/2, -dd/2+th/2); drawer.add(back);
  // Front with 3 faux drawer lines
  const front=new THREE.Mesh(new THREE.BoxGeometry(dw+.02,wallH+.02,.04),sm(0x2c1c10,.7,0,wt));
  front.position.set(0, wallH/2, dd/2); drawer.add(front);
  const hMat=new THREE.MeshStandardMaterial({color:0xd4a840,metalness:.75,roughness:.25});
  for(let i=0;i<3;i++){
    const ly=wallH*(0.18+i*0.28);
    const line=new THREE.Mesh(new THREE.BoxGeometry(dw*.85,.012,.01),sm(0x1a1008,.7));
    line.position.set(0, ly, dd/2+.025); drawer.add(line);
    const hd=new THREE.Mesh(new THREE.SphereGeometry(.016,10,10),hMat);
    hd.position.set(0, ly+wallH*.08, dd/2+.04); drawer.add(hd);
  }
  const interior=new THREE.Group();
  interior.position.set(0, .08, 0);
  interior.userData.isDrawerInterior=true;
  drawer.add(interior);
  grp.add(drawer);
  // Cable hole
  const hole=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.08,12),sm(0x1a1008,.9));
  hole.position.set(-w*.15,h+.04,-d*.25);grp.add(hole);
  grp.userData.doorLeft=drawer; grp.userData.doorRight=null; grp.userData.openable=true;
}

function buildBookcase(grp,w,h,d,col){
  const wt=woodTex(0x4a3020,0x3a2010);
  const sideM=sm(0x3a2010,.82,0,wt);
  // Thick side panels
  box3(grp,.08,h,d, -w/2+.04, h/2, 0, sideM);
  box3(grp,.08,h,d,  w/2-.04, h/2, 0, sideM);
  // Back
  box3(grp,w-.04,h,.05, 0, h/2, -d/2+.03, sm(0x4a3020,.82,0,wt));
  // Top & bottom
  box3(grp,w,.06,d, 0, h-.03, 0, sm(0x6a4830,.62,0,wt));
  box3(grp,w,.06,d, 0, .03, 0, sm(0x6a4830,.62,0,wt));
  // Shelves
  for(let i=1;i<=4;i++) box3(grp,w-.12,.045,d-.04, 0, h*i/5, 0, sm(0x6a4830,.62,0,wt));
  // Decorative books
  const bc=[0xc04444,0x4a8844,0x4468c4,0xc09020,0x8844c0,0x44808c];
  for(let s=0;s<4;s++){
    let bx=-w/2+.12;const by=h*s/5+.12;
    for(let b=0;b<7&&bx<w/2-.1;b++){
      const bw=.04+Math.random()*.035;
      box3(grp,bw,.2,d*.55,bx+bw/2,by,0.02,sm(bc[(s+b)%bc.length],.72));bx+=bw+.01;
    }
  }
}

function buildCouch(grp,w,h,d,col){
  const c=col||0xe8e0d4;
  const fabM=sm(c,.88,0,fabricTex(c));
  const softM=sm(Math.min(0xffffff,c+0x101010),.9);
  // Seat base (slightly curved look via center raised)
  box3(grp,w*.95,.18,d*.7, 0, .28, .08, fabM);
  // Seat cushions (2 large)
  box3(grp,w*.42,.14,d*.55, -w*.22, .42, .1, softM);
  box3(grp,w*.42,.14,d*.55,  w*.22, .42, .1, softM);
  // Curved back (thick rounded feel)
  box3(grp,w*.95,.42,.18, 0, .55, -d*.28, fabM);
  // Rounded armrests (thick cylinders-ish via boxes)
  [-1,1].forEach(s=>{
    box3(grp,.16,.32,d*.65, s*(w/2-.1), .4, .05, fabM);
    // top of arm rounded
    const armTop=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,d*.55,12),fabM);
    armTop.rotation.x=Math.PI/2;
    armTop.position.set(s*(w/2-.1), .58, .05); grp.add(armTop);
  });
  // Soft rectangular throw pillows
  const pCols=[0xf5f2ec,0xffffff,0xf0ebe4,0xe8e4dc];
  [-.65,-.22,.22,.65].forEach((px,i)=>{
    const p=makePillowMesh(.28, .12, .16, pCols[i%4]);
    p.position.set(px*(w*.42), .64, -d*.12); grp.add(p);
  });
  // Wooden tapered legs
  const legM=sm(0x6a4a28,.6,.1);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.02,.035,.16,8),legM);
    leg.position.set(sx*(w/2-.15), .08, sz*(d*.25)); grp.add(leg);
  });
}

function buildOfficeChair(grp,w,h,d){
  const fabM=sm(0x2a3038,.88,0,fabricTex(0x2a3038));
  box3(grp,w-.06,.1,d-.06,0,.48,0,fabM);
  const bk=new THREE.Mesh(new THREE.BoxGeometry(w-.08,.56,.12),fabM);
  bk.position.set(0,h*.55,-d/2+.06);grp.add(bk);
  box3(grp,w*.6,.12,.08,0,h*.32,-d/2+.06,sm(0x232830,.9));
  const armM=sm(0x1c2028,.85,.2);
  [[-w/2-.04],[w/2+.04]].forEach(([ax])=>{
    box3(grp,.06,.04,.3,ax,.64,0,armM);
    const asp=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.18,8),armM);
    asp.position.set(ax,.55,0);grp.add(asp);
  });
  const cylM=new THREE.MeshStandardMaterial({color:0x282828,metalness:.6,roughness:.4});
  const cyl=new THREE.Mesh(new THREE.CylinderGeometry(.04,.06,.46,12),cylM);
  cyl.position.y=.23;grp.add(cyl);
  for(let i=0;i<5;i++){
    const ang=i/5*Math.PI*2;
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.48,.04,.06),cylM);
    arm.rotation.y=ang;arm.position.y=.04;grp.add(arm);
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.06,10),sm(0x181818,.7));
    wheel.rotation.x=Math.PI/2;wheel.position.set(Math.cos(ang)*.2,.04,Math.sin(ang)*.2);grp.add(wheel);
  }
}

function buildBigPlant(grp){
  // Nice ceramic pot
  const potMat=new THREE.MeshStandardMaterial({color:0x8a6050,roughness:.5,metalness:.05});
  const pot=new THREE.Mesh(new THREE.CylinderGeometry(.22,.17,.4,24),potMat);
  pot.position.y=.2;grp.add(pot);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.22,.03,8,24),potMat);
  rim.position.y=.4;rim.rotation.x=Math.PI/2;grp.add(rim);
  // Decorative pot bands
  box3(grp,.44,.02,.44, 0, .15, 0, sm(0x7a5040,.55));
  box3(grp,.44,.02,.44, 0, .32, 0, sm(0x7a5040,.55));
  const soil=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.05,16),sm(0x2a1c0a,.95));
  soil.position.y=.42;grp.add(soil);
  const stemM=new THREE.MeshStandardMaterial({color:0x2a5018,roughness:.8});
  // Multiple stems
  const leafM=new THREE.MeshStandardMaterial({color:0x4aaa3a,roughness:.6,side:THREE.DoubleSide});
  const leafM2=new THREE.MeshStandardMaterial({color:0x3a9030,roughness:.65,side:THREE.DoubleSide});
  const leafM3=new THREE.MeshStandardMaterial({color:0x5aba48,roughness:.55,side:THREE.DoubleSide});
  function makeLeaf(len, wid, mat){
    const shape=new THREE.Shape();
    shape.moveTo(0,0);
    shape.quadraticCurveTo(wid*.7, len*.25, wid*.55, len*.5);
    shape.quadraticCurveTo(wid*.35, len*.8, 0, len);
    shape.quadraticCurveTo(-wid*.35, len*.8, -wid*.55, len*.5);
    shape.quadraticCurveTo(-wid*.7, len*.25, 0, 0);
    return new THREE.Mesh(new THREE.ShapeGeometry(shape, 8), mat);
  }
  const mats=[leafM,leafM2,leafM3];
  // Central stem
  const mainStem=new THREE.Mesh(new THREE.CylinderGeometry(.02,.035,.5,10),stemM);
  mainStem.position.y=.68;grp.add(mainStem);
  // Branches
  for(let i=0;i<8;i++){
    const ang=i/8*Math.PI*2 + 0.3;
    const len=.4+Math.random()*.35;
    const bg=new THREE.Group();
    bg.position.set(Math.cos(ang)*.03, .48, Math.sin(ang)*.03);
    bg.rotation.y=ang;
    bg.rotation.z=-0.35-Math.random()*.35;
    const st=new THREE.Mesh(new THREE.CylinderGeometry(.01,.02,len,8),stemM);
    st.position.y=len/2;bg.add(st);
    const nLeaves=3+Math.floor(Math.random()*3);
    for(let j=0;j<nLeaves;j++){
      const leaf=makeLeaf(0.3+Math.random()*.15, 0.13+Math.random()*.05, mats[(i+j)%3]);
      const t=(j+1)/(nLeaves+1);
      leaf.position.set(Math.sin(j*1.5)*.05, len*t, Math.cos(j*1.5)*.04);
      leaf.rotation.z=(j%2?0.5:-0.5)+(Math.random()-.5)*.4;
      leaf.rotation.y=j*1.1;
      bg.add(leaf);
    }
    grp.add(bg);
  }
  // Crown leaves on top
  for(let i=0;i<6;i++){
    const leaf=makeLeaf(0.38, 0.15, mats[i%3]);
    leaf.position.set(Math.sin(i*1.1)*.1, 1.05+i*.03, Math.cos(i*1.1)*.1);
    leaf.rotation.z=0.25+Math.random()*.5;
    leaf.rotation.y=i*1.05;
    grp.add(leaf);
  }
}

// ── Bathroom furniture ──
function buildSink(grp,w,h,d,col){
  const ceram=sm(0xf2f0ea,.4,.1);
  const cab=sm(0xe8e4dc,.55);
  // Tall vanity cabinet body
  box3(grp,w*.9,h*.72,d*.85, 0, h*.36, 0, cab);
  // Door lines on vanity
  box3(grp,w*.38,h*.55,.02, -w*.22, h*.35, d*.42, sm(0xd8d4cc,.6));
  box3(grp,w*.38,h*.55,.02,  w*.22, h*.35, d*.42, sm(0xd8d4cc,.6));
  // Countertop
  box3(grp,w,.06,d, 0, h*.75, 0, ceram);
  // Basin inset
  const bowl=new THREE.Mesh(new THREE.BoxGeometry(w*.55,.08,d*.5),sm(0xe0dcd4,.3,.12));
  bowl.position.set(0, h*.76, 0.02); grp.add(bowl);
  // Faucet
  const fM=new THREE.MeshStandardMaterial({color:0xc0c8d0,metalness:.85,roughness:.15});
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.035,10),fM);
  base.position.set(0, h*.82, -d*.28); grp.add(base);
  const neck=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.16,8),fM);
  neck.position.set(0, h*.9, -d*.28); grp.add(neck);
  const spout=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.1,8),fM);
  spout.rotation.x=Math.PI/2; spout.position.set(0, h*.97, -d*.15); grp.add(spout);
  [-.1,.1].forEach(sx=>{
    const hdl=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.03,8),fM);
    hdl.position.set(sx, h*.84, -d*.28); grp.add(hdl);
  });
  // Compact mirror above sink (not huge)
  const mir=new THREE.Mesh(new THREE.PlaneGeometry(w*.7,h*.45),
    new THREE.MeshStandardMaterial({color:0xc0d0e0,roughness:.05,metalness:.55,emissive:0x152030,emissiveIntensity:.08}));
  mir.position.set(0, h*1.25, -d/2+.03); grp.add(mir);
  box3(grp,w*.75,.03,.025, 0, h*1.48, -d/2+.03, sm(0xa09890,.55));
  box3(grp,w*.75,.03,.025, 0, h*1.02, -d/2+.03, sm(0xa09890,.55));
  box3(grp,.03,h*.48,.025, -w*.36, h*1.25, -d/2+.03, sm(0xa09890,.55));
  box3(grp,.03,h*.48,.025,  w*.36, h*1.25, -d/2+.03, sm(0xa09890,.55));
}

function buildToilet(grp,w,h,d){
  const ceram=sm(0xf4f2ee,.35,.08);
  // Bowl
  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(w*.42,w*.34,h*.3,16),ceram);
  bowl.position.y=h*.3;grp.add(bowl);
  // Seat ring
  const seat=new THREE.Mesh(new THREE.TorusGeometry(w*.34,.055,8,18),ceram);
  seat.position.y=h*.46;seat.rotation.x=Math.PI/2;grp.add(seat);
  // Tank taller
  box3(grp,w*.75,h*.42,d*.3, 0, h*.75, -d*.3, ceram);
  // Lid
  box3(grp,w*.7,.05,d*.28, 0, h*.98, -d*.3, ceram);
  // Flush
  const btn=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.025,10),
    new THREE.MeshStandardMaterial({color:0xc0c8d0,metalness:.7,roughness:.25}));
  btn.position.set(0, h*1.01, -d*.3);grp.add(btn);
  // Base
  box3(grp,w*.55,.1,d*.45, 0, .05, 0.02, ceram);
}

function buildShower(grp,w,h,d){
  const glass=new THREE.MeshStandardMaterial({color:0xc8e4e8,roughness:.15,metalness:.2,transparent:true,opacity:0.35,side:THREE.DoubleSide});
  const chrome=new THREE.MeshStandardMaterial({color:0xc0c8d0,metalness:.85,roughness:.18});
  const tile=sm(0xe8f0f2,.5);
  // Base tray
  box3(grp,w,.06,d, 0, .03, 0, sm(0xd8e0e4,.4,.1));
  // Raised lip
  box3(grp,w,.04,.04, 0, .08, d/2-.02, tile);
  box3(grp,w,.04,.04, 0, .08, -d/2+.02, tile);
  box3(grp,.04,.04,d, -w/2+.02, .08, 0, tile);
  box3(grp,.04,.04,d,  w/2-.02, .08, 0, tile);
  // Glass walls
  const gL=new THREE.Mesh(new THREE.PlaneGeometry(d*.9,h*.85),glass);
  gL.position.set(-w/2+.02, h*.5, 0); gL.rotation.y=Math.PI/2; grp.add(gL);
  const gR=new THREE.Mesh(new THREE.PlaneGeometry(d*.9,h*.85),glass);
  gR.position.set(w/2-.02, h*.5, 0); gR.rotation.y=-Math.PI/2; grp.add(gR);
  const gB=new THREE.Mesh(new THREE.PlaneGeometry(w*.9,h*.85),glass);
  gB.position.set(0, h*.5, -d/2+.02); grp.add(gB);
  // Frame posts
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    const post=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,h*.9,8),chrome);
    post.position.set(sx*(w/2-.04), h*.45, sz*(d/2-.04)); grp.add(post);
  });
  // Shower head
  const arm=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,.35,8),chrome);
  arm.rotation.x=Math.PI/2; arm.position.set(0, h*.85, -d*.25); grp.add(arm);
  const head=new THREE.Mesh(new THREE.CylinderGeometry(.08,.06,.04,12),chrome);
  head.position.set(0, h*.82, -d*.08); grp.add(head);
  // Handle / mixer
  const mix=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.06,10),chrome);
  mix.position.set(w*.25, h*.45, -d/2+.04); grp.add(mix);
  const lever=new THREE.Mesh(new THREE.BoxGeometry(.02,.08,.02),chrome);
  lever.position.set(w*.25, h*.5, -d/2+.06); grp.add(lever);
}

function buildBathCabinet(grp,w,h,d){
  // Tall white double-door wardrobe (like reference)
  const white=sm(0xf5f3ef,.45,.04);
  const soft=sm(0xebe8e2,.5);
  // Body panels (hollow front)
  box3(grp,.05,h,d, -w/2+.025, h/2, 0, white); // left
  box3(grp,.05,h,d,  w/2-.025, h/2, 0, white); // right
  box3(grp,w,.05,d, 0, h-.025, 0, white); // top
  box3(grp,w,.05,d, 0, .025, 0, white); // bottom
  box3(grp,w-.06,h-.06,.04, 0, h/2, -d/2+.02, soft); // back
  // Crown molding
  box3(grp,w+.06,.06,d+.04, 0, h+.02, 0, white);
  // Interior shelves
  box3(grp,w-.14,.03,d-.1, 0, h*.28, 0, soft);
  box3(grp,w-.14,.03,d-.1, 0, h*.52, 0, soft);
  box3(grp,w-.14,.03,d-.1, 0, h*.75, 0, soft);
  // Soft interior light
  const inL=new THREE.PointLight(0xfff6e8,0.45,2.2,2);
  inL.position.set(0,h*.55,0);grp.add(inL);
  // Double doors
  const doorW=(w-.08)/2, doorH=h-.1, doorD=.04;
  const hMat=new THREE.MeshStandardMaterial({color:0xc8c8c8,metalness:.7,roughness:.25});
  // Left door
  const doorL=new THREE.Group();
  doorL.position.set(-w/2+.03, 0, d/2);
  const pL=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,doorD),white);
  pL.position.set(doorW/2, h/2, doorD/2); doorL.add(pL);
  // Vertical handle left
  const hL=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.28,8),hMat);
  hL.position.set(doorW-.08, h/2, doorD+.03); doorL.add(hL);
  grp.add(doorL);
  // Right door
  const doorR=new THREE.Group();
  doorR.position.set(w/2-.03, 0, d/2);
  const pR=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,doorD),white);
  pR.position.set(-doorW/2, h/2, doorD/2); doorR.add(pR);
  // Vertical handle right
  const hR=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.28,8),hMat);
  hR.position.set(-doorW+.08, h/2, doorD+.03); doorR.add(hR);
  grp.add(doorR);
  // Small feet
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    const foot=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.04,8),sm(0x303030,.5,.3));
    foot.position.set(sx*(w/2-.08), .02, sz*(d/2-.08)); grp.add(foot);
  });
  grp.userData.doorLeft=doorL; grp.userData.doorRight=doorR; grp.userData.openable=true;
}

function buildHamper(grp,w,h,d){
  const wickerTex=cnvTex(128,128,(c,cw,ch)=>{
    c.fillStyle='#c0c8d0';c.fillRect(0,0,cw,ch);
    for(let y=0;y<ch;y+=6){c.strokeStyle='rgba(255,255,255,0.12)';c.lineWidth=2;c.beginPath();c.moveTo(0,y);c.lineTo(cw,y+4);c.stroke();}
    noise(c,cw,ch,10);
  });
  const basket=new THREE.Mesh(new THREE.CylinderGeometry(w*.55,w*.45,h*.85,16,1,true),new THREE.MeshStandardMaterial({map:wickerTex,roughness:.9,side:THREE.DoubleSide}));
  basket.position.y=h*.42;grp.add(basket);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(w*.55,.025,8,18),sm(0xa8b0b8,.6));
  rim.rotation.x=Math.PI/2;rim.position.y=h*.85;grp.add(rim);
}

// ── Yard furniture ──
function buildYardTable(grp,w,h,d){
  const wood=sm(0xc4a060,.5,.08);
  const woodDark=sm(0xa88848,.55,.06);
  // Solid round base disc under slats
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(w*.48,w*.48,.03,28),wood);
  disc.position.y=h-.01; disc.castShadow=true; grp.add(disc);
  // Parallel wood slats across the top
  const n=9;
  for(let i=0;i<n;i++){
    const t=(i/(n-1))-0.5; // -0.5..0.5
    const x=t*w*.88;
    // chord length shrinks near edges for round look
    const half=Math.sqrt(Math.max(0.01, 0.25-(t*t)))*w*.92;
    const slat=new THREE.Mesh(new THREE.BoxGeometry(.07,.035,half*2), i%2?wood:woodDark);
    slat.position.set(x, h+.01, 0);
    grp.add(slat);
  }
  // Center umbrella hole
  const hole=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.06,12),sm(0x2a1c10,.85));
  hole.position.y=h+.03; grp.add(hole);
  // X-frame folding legs
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.045,h-.06,.045),woodDark);
    leg.position.set(sx*w*.22, (h-.06)/2, sz*w*.18);
    leg.rotation.z=sx*0.18;
    leg.rotation.x=sz*-0.12;
    grp.add(leg);
  });
  // Cross stretchers
  box3(grp,w*.42,.03,.03, 0, .14, 0, woodDark);
  box3(grp,.03,.03,w*.36, 0, .14, 0, woodDark);
}
function buildGrill(grp,w,h,d){
  // Bright stainless American BBQ with openable lid
  const ss=new THREE.MeshStandardMaterial({color:0xe8eef4, roughness:.18, metalness:.85});
  const ssMid=new THREE.MeshStandardMaterial({color:0xc8d0d8, roughness:.22, metalness:.8});
  const ssDark=new THREE.MeshStandardMaterial({color:0xa8b0b8, roughness:.28, metalness:.7});
  const black=new THREE.MeshStandardMaterial({color:0x222228, roughness:.45, metalness:.35});
  const chrome=new THREE.MeshStandardMaterial({color:0xd0d8e0, metalness:.9, roughness:.12});
  // Cabinet body
  box3(grp,w,h*.5,d, 0, h*.25, 0, ss);
  // Doors
  box3(grp,w*.42,h*.36,.035, -w*.23, h*.25, d/2+.02, ssMid);
  box3(grp,w*.42,h*.36,.035,  w*.23, h*.25, d/2+.02, ssMid);
  box3(grp,w*.32,h*.26,.01, -w*.23, h*.25, d/2+.04, ss);
  box3(grp,w*.32,h*.26,.01,  w*.23, h*.25, d/2+.04, ss);
  // Handles
  [-w*.1, w*.1].forEach(hx=>{
    const hd=new THREE.Mesh(new THREE.CylinderGeometry(.014,.014,.16,10),chrome);
    hd.position.set(hx, h*.25, d/2+.055); grp.add(hd);
  });
  // Cooktop frame
  const topY=h*.5;
  box3(grp,w+.04,.04,d+.04, 0, topY+.02, 0, ssDark);
  // Grill grates
  box3(grp,w*.72,.015,d*.5, 0, topY+.04, 0.02, black);
  for(let i=0;i<7;i++){
    const bar=new THREE.Mesh(new THREE.BoxGeometry(w*.68,.014,.018),black);
    bar.position.set(0, topY+.05, -d*.2+i*(d*.07)); grp.add(bar);
  }
  // Side shelves
  box3(grp,w*.28,.035,d*.55,  w*.66, topY, 0, ss);
  box3(grp,w*.28,.035,d*.55, -w*.66, topY, 0, ss);
  [[1],[-1]].forEach(([s])=>{
    box3(grp,.03,h*.14,.03, s*w*.5, topY-.12,  d*.18, ssDark);
    box3(grp,.03,h*.14,.03, s*w*.5, topY-.12, -d*.18, ssDark);
  });
  // Wheels
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.04,12),black);
    wheel.rotation.z=Math.PI/2;
    wheel.position.set(sx*(w/2-.1), .05, sz*(d/2-.1)); grp.add(wheel);
  });
  // === Hinged lid (opens upward from back edge) ===
  const lidW=w*.78, lidD=d*.55;
  const lid=new THREE.Group();
  // Pivot at back of cooktop
  lid.position.set(0, topY+.04, -d*.28);
  lid.userData.mode='drop';
  lid.userData.liftUp=true; // open upward (negative rotX)
  // Lid panel
  const panel=new THREE.Mesh(new THREE.BoxGeometry(lidW, .04, lidD), ssMid);
  panel.position.set(0, .02, lidD/2); lid.add(panel);
  // Dark underside
  const under=new THREE.Mesh(new THREE.BoxGeometry(lidW*.95, .015, lidD*.92), black);
  under.position.set(0, -.005, lidD/2); lid.add(under);
  // Front handle bar on lid
  const handle=new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,lidW*.45,10),chrome);
  handle.rotation.z=Math.PI/2;
  handle.position.set(0, .05, lidD-.04); lid.add(handle);
  // Handle posts
  [-lidW*.2, lidW*.2].forEach(hx=>{
    const post=new THREE.Mesh(new THREE.BoxGeometry(.02,.04,.02),chrome);
    post.position.set(hx, .03, lidD-.04); lid.add(post);
  });
  grp.add(lid);
  // Knobs on front of cooktop
  for(let i=0;i<5;i++){
    const kn=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.03,10),chrome);
    kn.rotation.x=Math.PI/2;
    kn.position.set(-w*.26+i*.13, topY+.06, d/2+.025); grp.add(kn);
  }
  grp.userData.doorLeft=lid;
  grp.userData.doorRight=null;
  grp.userData.openable=true;
  grp.userData.doorMode='drop';
}
function buildShed(grp,w,h,d){
  // Modern horizontal-slat garden shed (like reference)
  const wood=sm(0xc4a060,.55,.06);
  const woodDark=sm(0xa88840,.6,.05);
  const woodLight=sm(0xd4b878,.5,.05);
  const wallH=h*0.88;
  // Floor
  box3(grp,w,.04,d, 0, .02, 0, woodDark);
  // Back wall solid
  box3(grp,w,wallH,.06, 0, wallH/2, -d/2+.03, wood);
  // Left / right walls
  box3(grp,.06,wallH,d, -w/2+.03, wallH/2, 0, wood);
  box3(grp,.06,wallH,d,  w/2-.03, wallH/2, 0, wood);
  // Horizontal slats on left, right, back (front mostly door)
  const nSlats=Math.floor(wallH/0.09);
  for(let i=0;i<nSlats;i++){
    const y=0.08+i*0.09;
    const col=i%2?wood:woodLight;
    // left exterior slats
    box3(grp,.02,.07,d-.08, -w/2-.01, y, 0, col);
    // right
    box3(grp,.02,.07,d-.08,  w/2+.01, y, 0, col);
    // back
    box3(grp,w-.08,.07,.02, 0, y, -d/2-.01, col);
  }
  // Front frame (opening for door)
  const doorW=w*.55, doorH=wallH*.88;
  // Front left/right posts
  box3(grp,(w-doorW)/2,wallH,.06, -w/2+(w-doorW)/4, wallH/2, d/2-.03, wood);
  box3(grp,(w-doorW)/2,wallH,.06,  w/2-(w-doorW)/4, wallH/2, d/2-.03, wood);
  // Top lintel
  box3(grp,w,wallH-doorH,.06, 0, doorH+(wallH-doorH)/2, d/2-.03, wood);
  // Front horizontal slats on side panels
  for(let i=0;i<nSlats;i++){
    const y=0.08+i*0.09;
    if(y>doorH) continue;
    const col=i%2?wood:woodLight;
    const sideW=(w-doorW)/2-.04;
    box3(grp,sideW,.07,.02, -w/2+sideW/2+.02, y, d/2+.01, col);
    box3(grp,sideW,.07,.02,  w/2-sideW/2-.02, y, d/2+.01, col);
  }
  // Flat roof with slight overhang
  box3(grp,w+.12,.05,d+.12, 0, wallH+.03, 0, woodDark);
  // Roof edge trim
  box3(grp,w+.14,.03,d+.14, 0, wallH+.06, 0, sm(0x8a7040,.55));
  // Interior shelves
  box3(grp,w-.2,.04,d-.2, 0, wallH*.3, -.05, woodDark);
  box3(grp,w-.2,.04,d-.2, 0, wallH*.55, -.05, woodDark);
  // Interior light
  const inL=new THREE.PointLight(0xfff0d0,0.4,3,2);
  inL.position.set(0,wallH*.7,0);grp.add(inL);
  // Door — hinged left, full height, horizontal slats
  const door=new THREE.Group();
  door.position.set(-doorW/2, 0, d/2);
  const doorPanel=new THREE.Mesh(new THREE.BoxGeometry(doorW,.04,doorH), wood);
  doorPanel.rotation.x=Math.PI/2; // will reorient
  // Build door as vertical panel facing Z
  const dBody=new THREE.Mesh(new THREE.BoxGeometry(doorW,doorH,.05), wood);
  dBody.position.set(doorW/2, doorH/2, .025); door.add(dBody);
  // Horizontal slats on door
  for(let i=0;i<Math.floor(doorH/0.09);i++){
    const y=0.06+i*0.09;
    const col=i%2?woodLight:wood;
    const slat=new THREE.Mesh(new THREE.BoxGeometry(doorW-.04,.07,.02), col);
    slat.position.set(doorW/2, y, .05); door.add(slat);
  }
  // Handle
  const hMat=new THREE.MeshStandardMaterial({color:0x909898,metalness:.8,roughness:.2});
  const handle=new THREE.Mesh(new THREE.BoxGeometry(.03,.12,.04),hMat);
  handle.position.set(doorW-.1, doorH*.5, .07); door.add(handle);
  grp.add(door);
  grp.userData.doorLeft=door; grp.userData.doorRight=null; grp.userData.openable=true;
}
function buildOttoman(grp,w,h,d,col){
  // Upholstered bedroom bench / ottoman (reference style)
  const fab=sm(col||0x6a6560,.85,0,fabricTex(col||0x6a6560));
  const fabSoft=sm(0x7a7570,.82);
  const legM=new THREE.MeshStandardMaterial({color:0xb0a090, metalness:.55, roughness:.3});
  // Main cushion body
  box3(grp,w,h*.55,d, 0, h*.55, 0, fab);
  // Soft top cushion
  box3(grp,w*.96,h*.12,d*.96, 0, h*.88, 0, fabSoft);
  // Subtle seam line
  box3(grp,w*.9,.008,d*.9, 0, h*.78, 0, sm(0x5a5550,.8));
  // Tapered metal legs
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,h*.42,8),legM);
    leg.position.set(sx*(w/2-.08), h*.21, sz*(d/2-.08)); grp.add(leg);
  });
}
function buildBench(grp,w,h,d){
  // Outdoor rope-weave loveseat style
  const frame=sm(0x2a2a2e,.4,.4);
  const rope=sm(0xc4a878,.8);
  const cushion=sm(0xe8e0d4,.85,0,fabricTex(0xe8e0d4));
  // Metal frame legs
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.04,h*.42,.04),frame);
    leg.position.set(sx*(w/2-.08), h*.21, sz*(d*.28)); grp.add(leg);
  });
  // Seat frame
  box3(grp,w,.04,d*.6, 0, h*.42, .05, frame);
  // Seat cushion
  box3(grp,w*.9,.08,d*.5, 0, h*.48, .08, cushion);
  // Back frame
  box3(grp,w,.5,.04, 0, h*.7, -d*.28, frame);
  // Rope weave on back (horizontal + diagonal lines)
  for(let i=0;i<8;i++){
    const y=h*.5+i*(h*.06);
    const bar=new THREE.Mesh(new THREE.BoxGeometry(w*.9,.012,.012),rope);
    bar.position.set(0, y, -d*.26); grp.add(bar);
  }
  for(let i=0;i<10;i++){
    const x=-w*.4+i*(w*.09);
    const bar=new THREE.Mesh(new THREE.BoxGeometry(.01,h*.4,.01),rope);
    bar.position.set(x, h*.7, -d*.26); grp.add(bar);
  }
  // Armrests with wood top
  [-1,1].forEach(s=>{
    box3(grp,.05,.04,d*.55, s*(w/2-.05), h*.55, .05, frame);
    box3(grp,.06,.03,d*.5, s*(w/2-.05), h*.58, .05, sm(0xb89860,.55,.1));
  });
  // Throw blanket hint
  box3(grp,w*.25,.04,d*.3, w*.2, h*.52, .1, sm(0xf0ece4,.9));
}
function buildPlanter(grp,w,h,d){
  // Rectangular concrete planter
  const conc=new THREE.MeshStandardMaterial({color:0xb8b8b4, roughness:.7, metalness:.05});
  const concDark=new THREE.MeshStandardMaterial({color:0x9a9a96, roughness:.75, metalness:.04});
  box3(grp,w,h*.7,d, 0, h*.35, 0, conc);
  const inset=0.06;
  box3(grp,w-inset*2,.04,d-inset*2, 0, h*.68, 0, sm(0x2a1c0a,.95));
  box3(grp,w,.03,d, 0, h*.72, 0, concDark);
  // Fuller foliage inside
  const greens=[0x3a8a2a,0x4a9a3a,0x2d7a28,0x5aaa40,0x48a038,0x359030];
  for(let i=0;i<10;i++){
    const px=(i/9-0.5)*(w*.75);
    const pz=(Math.random()-.5)*d*.3;
    const r=.09+Math.random()*.07;
    const bush=new THREE.Mesh(new THREE.SphereGeometry(r,12,10),sm(greens[i%greens.length],.8));
    bush.position.set(px, h*.78+r*.4, pz);
    bush.scale.y=1.15; grp.add(bush);
  }
  // Leafy stems
  for(let i=0;i<5;i++){
    const fx=(i/4-0.5)*(w*.6);
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.008,.012,.18,6),sm(0x2a5a1a,.8));
    stem.position.set(fx, h*.85, -d*.1); grp.add(stem);
    const leaf=new THREE.Mesh(new THREE.SphereGeometry(.06,8,6),sm(greens[i%6],.75));
    leaf.position.set(fx, h*.96, -d*.1); leaf.scale.set(1.2,.5,1); grp.add(leaf);
  }
  // Flowers
  const fCols=[0xe070a0,0xf0c040,0x6080d0,0xe05050,0xf0a0c0];
  for(let i=0;i<5;i++){
    const fx=(i/4-0.5)*(w*.55);
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.006,.01,.14,6),sm(0x2a5a1a,.8));
    stem.position.set(fx, h*.84, d*.12); grp.add(stem);
    const flower=new THREE.Mesh(new THREE.SphereGeometry(.04,8,6),sm(fCols[i%fCols.length],.55));
    flower.position.set(fx, h*.93, d*.12); grp.add(flower);
  }
}

function buildClothesline(grp,w,h,d){
  const poleMat=new THREE.MeshStandardMaterial({color:0xb0b0b0,metalness:.6,roughness:.4});
  [-w/2,w/2].forEach(px=>{
    const post=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,h,8),poleMat);
    post.position.set(px,h/2,0);grp.add(post);
  });
  const line=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,w,6),sm(0xd8d0c0,.7));
  line.rotation.z=Math.PI/2;line.position.y=h*.92;grp.add(line);
}

// ══════════════════════════════════════════════════════
//  WINDOW & DOOR
// ══════════════════════════════════════════════════════
function buildWindow(parent,x,y,z,ww,wh){
  const grp=new THREE.Group();grp.position.set(x,y,z);
  const wt=woodTex(0xa08060,0x7a6040);
  // Frame (hollow center)
  const fw=ww+.2, fh=wh+.2;
  box3(grp,fw,.08,.08, 0, wh/2+.04, 0, sm(0xa08060,.72,0,wt)); // top
  box3(grp,fw,.08,.08, 0,-wh/2-.04, 0, sm(0xa08060,.72,0,wt)); // bottom
  box3(grp,.08,fh,.08, -ww/2-.04, 0, 0, sm(0xa08060,.72,0,wt)); // left
  box3(grp,.08,fh,.08,  ww/2+.04, 0, 0, sm(0xa08060,.72,0,wt)); // right
  // Glass with unlit sky texture so it always reads clearly
  if(!_windowTexCache) _windowTexCache=makeWindowSkyTex();
  const glassMat=new THREE.MeshBasicMaterial({
    map:_windowTexCache.tex, side:THREE.DoubleSide, toneMapped:false
  });
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(ww,wh), glassMat);
  glass.position.z=0.01;glass.userData.isWindowGlass=true;grp.add(glass);
  // Mullion cross
  box3(grp,.035,wh,.05, 0, 0, 0.02, sm(0xa08060,.7,0,wt));
  box3(grp,ww,.035,.05, 0, 0, 0.02, sm(0xa08060,.7,0,wt));
  parent.add(grp);
  return grp;
}

function buildDoor(parent,x,y,z,dw,dh,rotY){
  const grp=new THREE.Group();
  grp.position.set(x, 0, z);
  if(rotY) grp.rotation.y = rotY;
  const wt=woodTex(0x7a5a38,0x5a3a20);
  // Frame
  box3(grp,.1,dh+.15,.14, -dw/2-.05, (dh+.15)/2, 0, sm(0x5a3a20,.75,0,wt));
  box3(grp,.1,dh+.15,.14,  dw/2+.05, (dh+.15)/2, 0, sm(0x5a3a20,.75,0,wt));
  box3(grp,dw+.2,.1,.14, 0, dh+.05, 0, sm(0x5a3a20,.75,0,wt));
  // Door leaf facing +Z of local group
  const doorM=sm(0x8a6a48,.7,0,wt);
  const panel=new THREE.Mesh(new THREE.BoxGeometry(dw,dh,.08),doorM);
  panel.position.set(0, dh/2, .03); panel.castShadow=true; grp.add(panel);
  // Raised panels
  box3(grp,dw*.7,dh*.32,.03, 0, dh*.7, .08, sm(0x7a5a38,.65,0,wt));
  box3(grp,dw*.7,dh*.32,.03, 0, dh*.3, .08, sm(0x7a5a38,.65,0,wt));
  // Knob
  const hMat=new THREE.MeshStandardMaterial({color:0xd4a840,metalness:.8,roughness:.22});
  const knob=new THREE.Mesh(new THREE.SphereGeometry(.04,12,12),hMat);
  knob.position.set(dw*.35, dh*.48, .1); grp.add(knob);
  const plate=new THREE.Mesh(new THREE.BoxGeometry(.04,.12,.02),hMat);
  plate.position.set(dw*.35, dh*.48, .07); grp.add(plate);
  parent.add(grp);
  return grp;
}

// ══════════════════════════════════════════════════════
//  BOX
// ══════════════════════════════════════════════════════
function buildBox(parent,x,z,bi){
  const grp=new THREE.Group();grp.position.set(x,0,z);
  const cTex=cardboardTex();
  const cMat=new THREE.MeshStandardMaterial({map:cTex,roughness:.88,side:THREE.DoubleSide});
  const innerMat=new THREE.MeshStandardMaterial({color:0xd8c4a0,roughness:.92});
  const bw=.95,bh=.75,bd=.95, th=.032;
  // Bottom
  box3(grp,bw,th,bd, 0, th/2, 0, cMat);
  box3(grp,bw-th*2,.01,bd-th*2, 0, th+.006, 0, innerMat);
  // 4 walls (hollow) — NO center divider
  box3(grp,bw,bh-th,th, 0, th+(bh-th)/2, -bd/2+th/2, cMat);
  box3(grp,th,bh-th,bd, -bw/2+th/2, th+(bh-th)/2, 0, cMat);
  box3(grp,th,bh-th,bd,  bw/2-th/2, th+(bh-th)/2, 0, cMat);
  box3(grp,bw,bh-th,th, 0, th+(bh-th)/2,  bd/2-th/2, cMat);
  // Inner liners
  box3(grp,bw-th*2,bh-th*2,.008, 0, th+(bh-th)/2, -bd/2+th+.008, innerMat);
  box3(grp,.008,bh-th*2,bd-th*2, -bw/2+th+.008, th+(bh-th)/2, 0, innerMat);
  box3(grp,.008,bh-th*2,bd-th*2,  bw/2-th-.008, th+(bh-th)/2, 0, innerMat);
  box3(grp,bw-th*2,bh-th*2,.008, 0, th+(bh-th)/2,  bd/2-th-.008, innerMat);
  // Only edge tape (no middle cross divider)
  const tape=new THREE.MeshStandardMaterial({color:0xc9a24a,roughness:.6});
  box3(grp,bw+.02,.035,.07, 0, bh*.55, bd/2+.01, tape);
  box3(grp,bw+.02,.035,.07, 0, bh*.55, -bd/2-.01, tape);
  // 4 independent top flaps
  const flaps=[];
  // Front flap (+Z)
  const pf=new THREE.Group(); pf.position.set(0,bh, bd/2); grp.add(pf);
  const mf=new THREE.Mesh(new THREE.BoxGeometry(bw*.92,.025,bd*.44),cMat.clone());
  mf.position.set(0,.012, -bd*.22); pf.add(mf); flaps.push({g:pf, axis:'x', dir:-1});
  // Back flap (-Z)
  const pb=new THREE.Group(); pb.position.set(0,bh,-bd/2); grp.add(pb);
  const mb=new THREE.Mesh(new THREE.BoxGeometry(bw*.92,.025,bd*.44),cMat.clone());
  mb.position.set(0,.012,  bd*.22); pb.add(mb); flaps.push({g:pb, axis:'x', dir:1});
  // Left flap (-X)
  const pl=new THREE.Group(); pl.position.set(-bw/2,bh,0); grp.add(pl);
  const ml=new THREE.Mesh(new THREE.BoxGeometry(bw*.44,.025,bd*.88),cMat.clone());
  ml.position.set( bw*.22,.012, 0); pl.add(ml); flaps.push({g:pl, axis:'z', dir:1});
  // Right flap (+X)
  const pr=new THREE.Group(); pr.position.set(bw/2,bh,0); grp.add(pr);
  const mr=new THREE.Mesh(new THREE.BoxGeometry(bw*.44,.025,bd*.88),cMat.clone());
  mr.position.set(-bw*.22,.012, 0); pr.add(mr); flaps.push({g:pr, axis:'z', dir:-1});
  // FRAGIL stamp
  const stampCv=document.createElement('canvas');stampCv.width=128;stampCv.height=64;
  const sc=stampCv.getContext('2d');
  sc.fillStyle='#ebe0c0';sc.fillRect(0,0,128,64);
  sc.strokeStyle='#b03028';sc.lineWidth=5;sc.strokeRect(6,6,116,52);
  sc.fillStyle='#b03028';sc.font='bold 22px sans-serif';sc.textAlign='center';
  sc.fillText('FRAGIL',64,40);
  const stamp=new THREE.Mesh(new THREE.PlaneGeometry(.4,.2),
    new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(stampCv),toneMapped:false,side:THREE.DoubleSide}));
  stamp.position.set(bw/2+.003,bh*.5,0);stamp.rotation.y=Math.PI/2;grp.add(stamp);
  // Arrow
  const arrCv=document.createElement('canvas');arrCv.width=64;arrCv.height=64;
  const ac=arrCv.getContext('2d');
  ac.fillStyle='#3a6a9a';ac.beginPath();
  ac.moveTo(32,8);ac.lineTo(48,28);ac.lineTo(38,28);ac.lineTo(38,56);ac.lineTo(26,56);ac.lineTo(26,28);ac.lineTo(16,28);
  ac.closePath();ac.fill();
  const arrow=new THREE.Mesh(new THREE.PlaneGeometry(.2,.2),
    new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(arrCv),toneMapped:false,transparent:true,side:THREE.DoubleSide}));
  arrow.position.set(0,bh*.5,bd/2+.003);grp.add(arrow);
  // Interior
  const interior=new THREE.Group();interior.position.set(0,th+.08,0);interior.visible=false;
  interior.userData.isBoxInterior=true;grp.add(interior);
  const lbl=makeTextSprite('Caixa '+(bi+1));
  lbl.position.set(0,bh+.35,0);grp.add(lbl);
  grp.userData.isBox=true;grp.userData.boxIdx=bi;
  const hit=new THREE.Mesh(
    new THREE.BoxGeometry(bw+.25,bh+.3,bd+.25),
    new THREE.MeshBasicMaterial({transparent:true,opacity:0.01,depthWrite:false})
  );
  hit.position.y=bh/2;hit.userData.isBox=true;hit.userData.boxIdx=bi;grp.add(hit);
  boxMeshes.push(hit);
  parent.add(grp);
  return {grp,flapMesh:null,interior,sideFlaps:null,flaps};
}

// ══════════════════════════════════════════════════════
//  ITEM MESH (with shapes & textures)
// ══════════════════════════════════════════════════════

function blanketTex(){
  return cnvTex(256,256,(c,w,h)=>{
    // Dark charcoal base
    c.fillStyle='#2a2e36';c.fillRect(0,0,w,h);
    // Quilted diamond / cable texture
    c.strokeStyle='#3a404a';c.lineWidth=2;
    const step=18;
    for(let y=0;y<h;y+=step){
      for(let x=0;x<w;x+=step){
        c.beginPath();
        c.moveTo(x, y+step/2);
        c.lineTo(x+step/2, y);
        c.lineTo(x+step, y+step/2);
        c.lineTo(x+step/2, y+step);
        c.closePath();
        c.stroke();
        // subtle fill variation
        if((x+y)%(step*2)===0){
          c.fillStyle='rgba(50,56,66,0.45)';
          c.fill();
        }
      }
    }
    noise(c,w,h,12);
    // Soft highlight lines
    c.strokeStyle='rgba(80,88,100,0.35)';c.lineWidth=1;
    for(let i=0;i<12;i++){
      const y=20+i*18;
      c.beginPath();c.moveTo(12,y);c.lineTo(w-12,y);c.stroke();
    }
  });
}

function makeItemMesh(item){
  const grp=new THREE.Group();
  const c=item.col||0x888888;
  const dk=(col,amt)=>{const r=hex2rgb(col);return (Math.max(0,r.r-amt)<<16)|(Math.max(0,r.g-amt)<<8)|Math.max(0,r.b-amt);};
  const lt=(col,amt)=>{const r=hex2rgb(col);return (Math.min(255,r.r+amt)<<16)|(Math.min(255,r.g+amt)<<8)|Math.min(255,r.b+amt);};
  let mainMesh, emojiY=.16, emojiScale=.2;
  switch(item.shape){
    case 'pillow':{
      const pil=makePillowMesh(.5, .14, .34, c||0xf5f2ec);
      pil.position.y=.08; grp.add(pil);
      emojiY=.2;emojiScale=.05;
      return finishItem(grp,item,emojiY,emojiScale);}
    case 'blanket':{
      const bt=blanketTex();
      const fabM=new THREE.MeshStandardMaterial({map:bt,roughness:.9,metalness:.02});
      const sherpa=sm(0xf0ece6,.92);
      // Folded dark blanket
      for(let i=0;i<3;i++){
        const layer=new THREE.Mesh(new THREE.BoxGeometry(.48-(i*.02),.035,.56-(i*.02)),fabM);
        layer.position.y=.02+i*.036;layer.rotation.y=i*.02;
        grp.add(layer);
      }
      // White sherpa border edges
      const edge=new THREE.Mesh(new THREE.BoxGeometry(.46,.02,.07),sherpa);
      edge.position.set(0, .12, .24); grp.add(edge);
      const edge2=new THREE.Mesh(new THREE.BoxGeometry(.46,.02,.05),sherpa);
      edge2.position.set(0, .12, -.24); grp.add(edge2);
      emojiY=.16;emojiScale=.08;
      return finishItem(grp,item,emojiY,emojiScale);}
    case 'bear':{
      // Cute sitting teddy — belly, pink nose, paw pads
      const fur=sm(c||0xb07040,.82);
      const cream=sm(0xf0e8dc,.88);
      const pink=sm(0xe888a8,.7);
      const dark=sm(0x1a1a1e,.4);
      // Body (sitting)
      const body=new THREE.Mesh(new THREE.SphereGeometry(.12,16,14),fur);
      body.scale.set(1.05,1.0,0.9); body.position.y=.14; grp.add(body);
      // Belly patch
      const belly=new THREE.Mesh(new THREE.SphereGeometry(.075,12,10),cream);
      belly.scale.set(0.9,1.0,0.5); belly.position.set(0,.13,.08); grp.add(belly);
      // Head
      const head=new THREE.Mesh(new THREE.SphereGeometry(.095,16,14),fur);
      head.position.set(0,.30,0.02); grp.add(head);
      // Ears
      [-.07,.07].forEach(ex=>{
        const ear=new THREE.Mesh(new THREE.SphereGeometry(.04,10,8),fur);
        ear.position.set(ex,.38,0); grp.add(ear);
        const inner=new THREE.Mesh(new THREE.SphereGeometry(.022,8,6),cream);
        inner.position.set(ex,.38,.02); grp.add(inner);
      });
      // Snout
      const snout=new THREE.Mesh(new THREE.SphereGeometry(.038,10,8),cream);
      snout.position.set(0,.27,.08); grp.add(snout);
      // Pink nose
      const nose=new THREE.Mesh(new THREE.SphereGeometry(.018,8,6),pink);
      nose.scale.set(1.2,0.8,0.9); nose.position.set(0,.275,.11); grp.add(nose);
      // Eyes
      [-.032,.032].forEach(ex=>{
        const eye=new THREE.Mesh(new THREE.SphereGeometry(.016,8,6),dark);
        eye.position.set(ex,.305,.08); grp.add(eye);
        const shine=new THREE.Mesh(new THREE.SphereGeometry(.005,6,4),sm(0xffffff,.3));
        shine.position.set(ex+.005,.31,.092); grp.add(shine);
      });
      // Arms
      [-1,1].forEach(s=>{
        const arm=new THREE.Mesh(new THREE.SphereGeometry(.045,10,8),fur);
        arm.position.set(s*.12,.16,.02); grp.add(arm);
      });
      // Legs + pink paw pads
      [-1,1].forEach(s=>{
        const leg=new THREE.Mesh(new THREE.SphereGeometry(.05,10,8),fur);
        leg.scale.set(1.1,0.7,1.2); leg.position.set(s*.08,.05,.06); grp.add(leg);
        const pad=new THREE.Mesh(new THREE.SphereGeometry(.028,8,6),pink);
        pad.scale.set(1,0.4,1.1); pad.position.set(s*.08,.03,.1); grp.add(pad);
      });
      emojiY=.42;emojiScale=.05;
      return finishItem(grp,item,emojiY,emojiScale);}
    case 'ball':{
      mainMesh=new THREE.Mesh(new THREE.SphereGeometry(.13,24,18),sm(0xffffff,.45,.05,soccerTex()));
      mainMesh.position.y=.13;
      emojiY=.32;emojiScale=.16;
      break;}
    case 'roll':{
      mainMesh=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.12,16),sm(c,.85));
      mainMesh.rotation.z=Math.PI/2;mainMesh.position.y=.06;
      const hole=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.122,12),sm(0xc8b89c,.7));
      hole.rotation.z=Math.PI/2;hole.position.y=.06;grp.add(hole);
      emojiY=.16;emojiScale=.16;
      break;}
    case 'book':{
      const bg=new THREE.Group();
      const cov=new THREE.Mesh(new THREE.BoxGeometry(.18,.26,.06),sm(c,.55,.05));bg.add(cov);
      const pgs=new THREE.Mesh(new THREE.BoxGeometry(.15,.235,.048),sm(0xf5f0e4,.9));pgs.position.x=.01;bg.add(pgs);
      const spn=new THREE.Mesh(new THREE.BoxGeometry(.014,.26,.06),sm(dk(c,35),.6));spn.position.x=-.085;bg.add(spn);
      const band=new THREE.Mesh(new THREE.BoxGeometry(.14,.04,.002),sm(0xf0e8d0,.5));
      band.position.set(.01,.05,.032);bg.add(band);
      bg.position.y=.03;grp.add(bg);
      emojiY=.2;emojiScale=.05;
      return finishItem(grp,item,emojiY,emojiScale);}
    case 'laptop':{
      const bodyM=sm(0x2a2a2e,.4,.35);
      const screenM=new THREE.MeshStandardMaterial({color:0x1a3048,roughness:.25,metalness:.15,emissive:0x0a1828,emissiveIntensity:.3});
      const base=new THREE.Mesh(new THREE.BoxGeometry(.42,.02,.28),bodyM);
      base.position.y=.01;grp.add(base);
      const keys=new THREE.Mesh(new THREE.BoxGeometry(.34,.008,.18),sm(0x1a1a1e,.5));
      keys.position.set(0,.022,.02);grp.add(keys);
      const pad=new THREE.Mesh(new THREE.BoxGeometry(.1,.005,.07),sm(0x3a3a40,.4));
      pad.position.set(0,.022,.1);grp.add(pad);
      const lid=new THREE.Group();
      const bezel=new THREE.Mesh(new THREE.BoxGeometry(.42,.26,.012),bodyM);
      bezel.position.set(0,.13,-.14);lid.add(bezel);
      const screen=new THREE.Mesh(new THREE.PlaneGeometry(.38,.22),screenM);
      screen.position.set(0,.13,-.133);lid.add(screen);
      lid.rotation.x=-0.35;grp.add(lid);
      emojiY=.28;emojiScale=.05;
      return finishItem(grp,item,emojiY,emojiScale);}
    case 'lamp':{
      const brass=new THREE.MeshStandardMaterial({color:0xc8a050,metalness:.7,roughness:.28});
      const base=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,.03,16),brass);
      base.position.y=.015;grp.add(base);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.012,.014,.2,10),brass);
      pole.position.y=.13;grp.add(pole);
      const shade=new THREE.Mesh(new THREE.CylinderGeometry(.06,.12,.14,16,1,true),
        new THREE.MeshStandardMaterial({color:0xf5ead0,roughness:.88,side:THREE.DoubleSide,emissive:0xffe8b0,emissiveIntensity:.2}));
      shade.position.y=.3;grp.add(shade);
      const glow=new THREE.Mesh(new THREE.SphereGeometry(.04,10,8),
        new THREE.MeshStandardMaterial({color:0xfff8e0,emissive:0xffe8a0,emissiveIntensity:.8,transparent:true,opacity:.7}));
      glow.position.y=.28;grp.add(glow);
      emojiY=.38;emojiScale=.05;
      break;}
    case 'monitor':{
      const mg=new THREE.Group();
      const standBase=new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.018,24),sm(0x282828,.5,.4));standBase.position.y=.009;mg.add(standBase);
      const neck=new THREE.Mesh(new THREE.BoxGeometry(.045,.16,.03),sm(0x303030,.5,.4));neck.position.y=.09;mg.add(neck);
      const hinge=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.05,12),sm(0x202020,.4,.5));
      hinge.rotation.x=Math.PI/2;hinge.position.y=.165;mg.add(hinge);
      const panel=new THREE.Mesh(new THREE.BoxGeometry(.46,.28,.022),sm(0x161616,.4,.5));
      panel.position.set(0,.32,0);mg.add(panel);
      const glow=new THREE.Mesh(new THREE.PlaneGeometry(.43,.25),new THREE.MeshStandardMaterial({color:0x1c3850,emissive:0x205070,emissiveIntensity:.6}));
      glow.position.set(0,.32,.0125);mg.add(glow);
      const brand=new THREE.Mesh(new THREE.BoxGeometry(.05,.008,.005),sm(0x606060,.4,.5));
      brand.position.set(0,.187,.013);mg.add(brand);
      grp.add(mg);emojiY=.46;emojiScale=.14;return finishItem(grp,item,emojiY,emojiScale);}
    case 'keyboard':{
      mainMesh=new THREE.Mesh(new THREE.BoxGeometry(.44,.025,.15),sm(c,.55,.1));
      mainMesh.position.y=.0125;
      const keyM=sm(dk(c,20),.5);
      for(let kx=0;kx<13;kx++)for(let kz=0;kz<4;kz++){
        const key=new THREE.Mesh(new THREE.BoxGeometry(.026,.012,.026),keyM);
        key.position.set(-.2+kx*.032,.027,-.05+kz*.032);grp.add(key);
      }
      emojiY=.12;emojiScale=.13;
      break;}
    case 'mouse':{
      mainMesh=new THREE.Mesh(new THREE.SphereGeometry(.055,14,12),sm(c,.45,.15));
      mainMesh.scale.set(1,.6,1.5);mainMesh.position.y=.033;
      const wheel=new THREE.Mesh(new THREE.BoxGeometry(.008,.01,.018),sm(0x202020,.5));
      wheel.position.set(0,.065,.02);grp.add(wheel);
      emojiY=.13;emojiScale=.13;
      break;}
    case 'printer':{
      mainMesh=new THREE.Mesh(new THREE.BoxGeometry(.4,.16,.34),sm(c,.5,.08));
      mainMesh.position.y=.08;
      const lid=new THREE.Mesh(new THREE.BoxGeometry(.38,.025,.32),sm(dk(c,15),.5,.08));
      lid.position.y=.17;grp.add(lid);
      const tray=new THREE.Mesh(new THREE.BoxGeometry(.3,.02,.12),sm(0xf0f0e8,.7));
      tray.position.set(0,.17,-.14);tray.rotation.x=-.25;grp.add(tray);
      const slot=new THREE.Mesh(new THREE.BoxGeometry(.32,.012,.03),sm(0x101010,.5));
      slot.position.set(0,.16,.15);grp.add(slot);
      const panel=new THREE.Mesh(new THREE.BoxGeometry(.1,.03,.04),sm(0xe8e4dc,.5));
      panel.position.set(.12,.165,.16);grp.add(panel);
      [-.02,.01,.04].forEach((bx,i)=>{
        const btn=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.01,10),sm(i===1?0x4090e0:0x808080,.4));
        btn.position.set(.12+bx,.182,.16);grp.add(btn);
      });
      emojiY=.26;emojiScale=.14;
      break;}
    case 'clock':{
      mainMesh=new THREE.Mesh(new THREE.CylinderGeometry(.085,.085,.04,24),sm(c,.5,.15));
      mainMesh.rotation.x=Math.PI/2;mainMesh.position.y=.085;
      const face=new THREE.Mesh(new THREE.CircleGeometry(.072,32),sm(0xffffff,.5,0,clockFaceTex()));
      face.position.set(0,.085,.0201);grp.add(face);
      const handM=sm(0x202020,.4);
      const hourHand=new THREE.Mesh(new THREE.BoxGeometry(.005,.04,.002),handM);
      hourHand.position.set(0,.1,.022);grp.add(hourHand);
      const minHand=new THREE.Mesh(new THREE.BoxGeometry(.005,.055,.002),handM);
      minHand.rotation.z=.9;minHand.position.set(0,.085,.022);grp.add(minHand);
      const bells=sm(c,.5,.15);
      [-.06,.06].forEach(bx=>{const bell=new THREE.Mesh(new THREE.SphereGeometry(.025,10,10),bells);bell.position.set(bx,.13,0);grp.add(bell);});
      const feet=sm(dk(c,30),.5);
      [-.04,.04].forEach(fx=>{const foot=new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.02,8),feet);foot.position.set(fx,.055,0);grp.add(foot);});
      emojiY=.2;emojiScale=.14;
      break;}
    case 'place_small':{
      mainMesh=new THREE.Mesh(new THREE.BoxGeometry(.1,.08,.07),sm(c,.55,.05,metalTex(c)));
      mainMesh.position.y=.04;
      emojiY=.13;emojiScale=.15;
      break;}
    case 'mug':{
      mainMesh=new THREE.Mesh(new THREE.CylinderGeometry(.045,.04,.1,16),sm(c,.45,.1));
      mainMesh.position.y=.05;
      const handle=new THREE.Mesh(new THREE.TorusGeometry(.032,.009,8,14,Math.PI*1.4),sm(c,.45,.1));
      handle.rotation.y=Math.PI/2;handle.position.set(.05,.05,0);grp.add(handle);
      const liquid=new THREE.Mesh(new THREE.CylinderGeometry(.038,.038,.01,16),sm(0x4a2c14,.4));
      liquid.position.y=.095;grp.add(liquid);
      emojiY=.15;emojiScale=.16;
      break;}
    case 'camera':{
      mainMesh=new THREE.Mesh(new THREE.BoxGeometry(.13,.09,.06),sm(c,.5,.15));
      mainMesh.position.y=.045;
      const lens=new THREE.Mesh(new THREE.CylinderGeometry(.035,.04,.06,16),sm(0x181818,.3,.3));
      lens.rotation.x=Math.PI/2;lens.position.set(0,.05,.06);grp.add(lens);
      const flash=new THREE.Mesh(new THREE.BoxGeometry(.025,.02,.02),sm(0xe8e8e0,.4));
      flash.position.set(-.045,.085,.025);grp.add(flash);
      emojiY=.18;emojiScale=.15;
      break;}
    case 'headphones':{
      const band=new THREE.Mesh(new THREE.TorusGeometry(.085,.012,10,20,Math.PI),sm(c,.5,.2));
      band.rotation.z=Math.PI;band.position.y=.11;grp.add(band);
      [-.085,.085].forEach(ex=>{
        const cup=new THREE.Mesh(new THREE.CylinderGeometry(.034,.034,.03,16),sm(dk(c,20),.45,.2));
        cup.rotation.z=Math.PI/2;cup.position.set(ex,.05,0);grp.add(cup);
        const pad=new THREE.Mesh(new THREE.TorusGeometry(.03,.009,8,14),sm(0x101010,.7));
        pad.rotation.y=Math.PI/2;pad.position.set(ex+(ex>0?.015:-.015),.05,0);grp.add(pad);
      });
      emojiY=.18;emojiScale=.15;
      return finishItem(grp,item,emojiY,emojiScale);}
    case 'plant':{
      const pot=new THREE.Mesh(new THREE.CylinderGeometry(.09,.07,.11,14),sm(0x8a5a40,.6));
      pot.position.y=.055;grp.add(pot);
      const soil=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.02,12),sm(0x2a1c0a,.95));
      soil.position.y=.12;grp.add(soil);
      for(let i=0;i<6;i++){
        const ang=i/6*Math.PI*2;
        const leaf=new THREE.Mesh(new THREE.SphereGeometry(.05,8,6),sm(0x3a8a3a,.65));
        leaf.scale.set(1.2,1.8,.25);
        leaf.position.set(Math.cos(ang)*.05,.24,Math.sin(ang)*.05);
        leaf.rotation.z=Math.cos(ang)*.4;
        grp.add(leaf);
      }
      emojiY=.38;emojiScale=.05;
      break;}
    case 'spice':{
      mainMesh=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,.1,14),sm(c,.4,.1));
      mainMesh.position.y=.05;
      const cap2=new THREE.Mesh(new THREE.CylinderGeometry(.042,.042,.025,14),sm(0x707070,.5,.3));
      cap2.position.y=.11;grp.add(cap2);
      emojiY=.18;emojiScale=.15;
      break;}
    case 'pot':{
      mainMesh=new THREE.Mesh(new THREE.CylinderGeometry(.1,.095,.12,18),sm(c,.4,.3,metalTex(c)));
      mainMesh.position.y=.06;
      const lid=new THREE.Mesh(new THREE.CylinderGeometry(.095,.085,.03,18),sm(dk(c,15),.4,.3));
      lid.position.y=.135;grp.add(lid);
      const knob=new THREE.Mesh(new THREE.SphereGeometry(.018,10,10),sm(0x202020,.5));
      knob.position.y=.16;grp.add(knob);
      const handleM=sm(0x202020,.5,.3);
      [-1,1].forEach(s=>{const hd=new THREE.Mesh(new THREE.TorusGeometry(.025,.007,8,10,Math.PI),handleM);hd.rotation.z=Math.PI/2;hd.rotation.y=s>0?0:Math.PI;hd.position.set(s*.115,.06,0);grp.add(hd);});
      emojiY=.24;emojiScale=.15;
      break;}
    case 'kettle':{
      mainMesh=new THREE.Mesh(new THREE.SphereGeometry(.085,16,14),sm(c,.35,.4,metalTex(c)));
      mainMesh.scale.set(1,.85,1);mainMesh.position.y=.08;
      const spout=new THREE.Mesh(new THREE.CylinderGeometry(.012,.022,.09,10),sm(c,.35,.4));
      spout.rotation.z=-.9;spout.position.set(.09,.12,0);grp.add(spout);
      const handleT=new THREE.Mesh(new THREE.TorusGeometry(.045,.009,8,14,Math.PI*1.3),sm(0x282828,.5));
      handleT.rotation.z=Math.PI/2;handleT.rotation.y=Math.PI;handleT.position.set(-.06,.15,0);grp.add(handleT);
      const lidK=new THREE.Mesh(new THREE.SphereGeometry(.025,10,10,0,Math.PI*2,0,Math.PI*.5),sm(c,.35,.4));
      lidK.position.y=.165;grp.add(lidK);
      emojiY=.27;emojiScale=.15;
      break;}
    case 'trophy':{
      const tM=sm(c,.3,.7,metalTex(c));
      mainMesh=new THREE.Mesh(new THREE.CylinderGeometry(.05,.08,.025,16),tM);
      mainMesh.position.y=.0125;
      const stem=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.08,10),tM);
      stem.position.y=.065;grp.add(stem);
      const cup=new THREE.Mesh(new THREE.CylinderGeometry(.06,.035,.11,16),tM);
      cup.position.y=.16;grp.add(cup);
      [-1,1].forEach(s=>{const handle=new THREE.Mesh(new THREE.TorusGeometry(.03,.007,8,12,Math.PI),tM);handle.rotation.z=Math.PI/2;handle.rotation.y=s>0?Math.PI/2:-Math.PI/2;handle.position.set(s*.07,.16,0);grp.add(handle);});
      const star=new THREE.Mesh(new THREE.ConeGeometry(.025,.05,5),sm(0xffe070,.3,.6));
      star.position.y=.24;grp.add(star);
      emojiY=.32;emojiScale=.15;
      break;}
    case 'blender':{
      const baseB=new THREE.Mesh(new THREE.CylinderGeometry(.06,.065,.07,16),sm(0x282828,.5,.3));
      baseB.position.y=.035;grp.add(baseB);
      mainMesh=new THREE.Mesh(new THREE.CylinderGeometry(.045,.055,.18,16),sm(c,.15,.05));
      mainMesh.position.y=.16;
      const lidB=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.02,16),sm(0x282828,.5,.3));
      lidB.position.y=.26;grp.add(lidB);
      emojiY=.34;emojiScale=.15;
      break;}
    case 'pan':{
      mainMesh=new THREE.Mesh(new THREE.CylinderGeometry(.14,.13,.035,24),sm(c,.35,.55,metalTex(c)));
      mainMesh.position.y=.0175;
      const handlePan=new THREE.Mesh(new THREE.CylinderGeometry(.012,.014,.2,10),sm(0x1c1c1c,.6));
      handlePan.rotation.z=Math.PI/2;handlePan.position.set(.22,.025,0);grp.add(handlePan);
      emojiY=.1;emojiScale=.16;
      break;}
    case 'plate':{
      for(let i=0;i<3;i++){
        const plate=new THREE.Mesh(new THREE.CylinderGeometry(.13,.125,.018,24),sm(c,.3,.1));
        plate.position.y=.009+i*.022;grp.add(plate);
      }
      emojiY=.16;emojiScale=.16;
      return finishItem(grp,item,emojiY,emojiScale);}
    case 'bowl':{
      mainMesh=new THREE.Mesh(new THREE.SphereGeometry(.11,18,12,0,Math.PI*2,0,Math.PI*.55),sm(c,.4,.1));
      mainMesh.position.y=.05;
      emojiY=.18;emojiScale=.16;
      break;}
    case 'phone':{
      mainMesh=new THREE.Mesh(new THREE.BoxGeometry(.08,.16,.01),sm(0x1a1a1e,.35,.4));
      mainMesh.position.y=.08;
      const screenP=new THREE.Mesh(new THREE.PlaneGeometry(.07,.14),
        new THREE.MeshStandardMaterial({color:0x1a4060,roughness:.2,metalness:.1,emissive:0x0a2030,emissiveIntensity:.4}));
      screenP.position.set(0,.08,.006);grp.add(screenP);
      emojiY=.18;emojiScale=.05;
      break;}
    case 'shoes':{
      // Black & white skate sneakers (Vans-style)
      const black=sm(0x1a1a1e,.7);
      const white=sm(0xf5f5f5,.55);
      const lace=sm(0xffffff,.6);
      [-.09,.09].forEach((sx,i)=>{
        const g=new THREE.Group();
        // Thick white sole
        const sole=new THREE.Mesh(new THREE.BoxGeometry(.11,.03,.28),white);
        sole.position.set(0,.015,0); g.add(sole);
        // Black mid stripe on sole
        const stripe=new THREE.Mesh(new THREE.BoxGeometry(.112,.008,.282),sm(0x0a0a0a,.5));
        stripe.position.set(0,.028,0); g.add(stripe);
        // Upper body
        const body=new THREE.Mesh(new THREE.BoxGeometry(.1,.055,.24),black);
        body.position.set(0,.055, -.01); g.add(body);
        // Toe box
        const toe=new THREE.Mesh(new THREE.BoxGeometry(.095,.04,.08),black);
        toe.position.set(0,.045, .1); g.add(toe);
        // White side wave / stripe
        const wave=new THREE.Mesh(new THREE.BoxGeometry(.02,.03,.18),white);
        wave.position.set(sx>0?.048:-.048, .05, 0); g.add(wave);
        // Laces
        for(let k=0;k<3;k++){
          const l=new THREE.Mesh(new THREE.BoxGeometry(.06,.008,.01),lace);
          l.position.set(0, .075, -.04+k*.035); g.add(l);
        }
        // Tongue
        const tongue=new THREE.Mesh(new THREE.BoxGeometry(.05,.02,.06),black);
        tongue.position.set(0, .08, -.08); g.add(tongue);
        g.position.set(sx,0,0);
        g.rotation.y=i===0?-0.1:0.1;
        grp.add(g);
      });
      emojiY=.12;emojiScale=.05;
      return finishItem(grp,item,emojiY,emojiScale);}
    case 'bread':{
      mainMesh=new THREE.Mesh(new THREE.SphereGeometry(.1,14,10),sm(c,.85));
      mainMesh.scale.set(1.6,.7,.85);mainMesh.position.y=.06;
      const slashM=sm(dk(c,40),.85);
      for(let i=-1;i<=1;i++){
        const slash=new THREE.Mesh(new THREE.BoxGeometry(.03,.01,.08),slashM);
        slash.position.set(i*.05,.1,0);slash.rotation.y=.6;grp.add(slash);
      }
      emojiY=.18;emojiScale=.16;
      break;}
    case 'place_flat':{
      mainMesh=new THREE.Mesh(new THREE.BoxGeometry(.26,.03,.18),sm(c,.6,.1));
      mainMesh.position.y=.015;
      emojiY=.1;emojiScale=.16;
      break;}
    case 'clothes':{
      const fabM2=sm(c,.85,0,fabricTex(c));
      for(let i=0;i<4;i++){
        const layer=new THREE.Mesh(new THREE.BoxGeometry(.3-(i*.025),.028,.36-(i*.025)),fabM2);
        layer.position.y=.014+i*.03;
        layer.rotation.y=(i%2===0?1:-1)*0.04;
        grp.add(layer);
      }
      // Sleeve hint
      const sleeve=new THREE.Mesh(new THREE.BoxGeometry(.08,.025,.12),fabM2);
      sleeve.position.set(.16,.05,0);grp.add(sleeve);
      emojiY=.16;emojiScale=.1;
      return finishItem(grp,item,emojiY,emojiScale);}
    case 'knife':{
      const board=new THREE.Mesh(new THREE.BoxGeometry(.28,.018,.1),sm(0x9a7a50,.7,0,woodTex(0x9a7a50,0x7a5a30)));
      board.position.y=.009;grp.add(board);
      [0,1,2].forEach(i=>{
        const bladeM=sm(0xd8d8d8,.25,.7);
        const blade=new THREE.Mesh(new THREE.BoxGeometry(.16-i*.03,.012,.018),bladeM);
        blade.position.set(-.02-i*.005,.024,-.03+i*.03);grp.add(blade);
        const handleK=new THREE.Mesh(new THREE.BoxGeometry(.07,.014,.022),sm(c,.6));
        handleK.position.set(.08-i*.005,.024,-.03+i*.03);grp.add(handleK);
      });
      emojiY=.12;emojiScale=.16;
      return finishItem(grp,item,emojiY,emojiScale);}
    case 'photo':{
      const frameM=sm(c,.55,.1);
      mainMesh=new THREE.Mesh(new THREE.BoxGeometry(.16,.2,.015),frameM);
      mainMesh.position.y=.1;
      const pic=new THREE.Mesh(new THREE.PlaneGeometry(.12,.16),sm(0xd8c8a8,.7));
      pic.position.set(0,.1,.009);grp.add(pic);
      const standP=new THREE.Mesh(new THREE.BoxGeometry(.01,.07,.06),sm(dk(c,20),.6));
      standP.position.set(0,.035,-.04);standP.rotation.x=.5;grp.add(standP);
      emojiY=.22;emojiScale=.15;
      break;}
    case 'mirror':{
      const frameM2=sm(c,.5,.15);
      mainMesh=new THREE.Mesh(new THREE.BoxGeometry(.2,.26,.015),frameM2);
      mainMesh.position.y=.13;
      const reflect=new THREE.Mesh(new THREE.PlaneGeometry(.17,.23),new THREE.MeshStandardMaterial({color:0xc8d8dc,roughness:.05,metalness:.5,emissive:0x405050,emissiveIntensity:.1}));
      reflect.position.set(0,.13,.009);grp.add(reflect);
      const standM=new THREE.Mesh(new THREE.BoxGeometry(.01,.08,.06),sm(dk(c,20),.6));
      standM.position.set(0,.04,-.04);standM.rotation.x=.5;grp.add(standM);
      emojiY=.3;emojiScale=.15;
      break;}
    case 'soap':{
      mainMesh=new THREE.Mesh(new THREE.SphereGeometry(.05,14,10),sm(c,.4,.05));
      mainMesh.scale.set(1.5,.6,1);mainMesh.position.y=.03;
      const groove=new THREE.Mesh(new THREE.BoxGeometry(.06,.005,.04),sm(dk(c,15),.4));
      groove.position.y=.058;grp.add(groove);
      emojiY=.1;emojiScale=.14;
      break;}
    case 'toothbrush':{
      const handle=new THREE.Mesh(new THREE.CylinderGeometry(.007,.009,.14,8),sm(c,.4,.2));
      handle.rotation.z=Math.PI/2;handle.position.set(0,.025,0);grp.add(handle);
      const head=new THREE.Mesh(new THREE.BoxGeometry(.03,.012,.018),sm(0xf0f0f0,.5));
      head.position.set(.085,.025,0);grp.add(head);
      const bristle=sm(0x3090d0,.6);
      for(let i=0;i<4;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.005,.01,.003),bristle);b.position.set(.075+i*.007,.033,0);grp.add(b);}
      emojiY=.1;emojiScale=.14;
      break;}
    case 'charcoal':{
      const cM=sm(c,.95);
      for(let i=0;i<5;i++){
        const chunk=new THREE.Mesh(new THREE.DodecahedronGeometry(.025+Math.random()*.018),cM);
        chunk.position.set((Math.random()-.5)*.11,.022,(Math.random()-.5)*.11);
        chunk.rotation.set(Math.random(),Math.random(),Math.random());
        grp.add(chunk);
      }
      emojiY=.12;emojiScale=.15;
      break;}
    case 'bbq':{
      const tongM=sm(0xb0b0b0,.4,.5);
      [-1,1].forEach(s=>{
        const arm=new THREE.Mesh(new THREE.BoxGeometry(.018,.01,.22),tongM);
        arm.position.set(s*.012,.012,0);arm.rotation.y=s*.06;grp.add(arm);
      });
      const brushHandle=new THREE.Mesh(new THREE.CylinderGeometry(.01,.01,.2,8),sm(0x8a6840,.7));
      brushHandle.rotation.z=Math.PI/2;brushHandle.position.set(0,.012,.16);grp.add(brushHandle);
      const brushHead=new THREE.Mesh(new THREE.BoxGeometry(.03,.025,.025),sm(0x303030,.7));
      brushHead.position.set(0,.012,.27);grp.add(brushHead);
      emojiY=.1;emojiScale=.16;
      break;}
    case 'umbrella':{
      const poleM=sm(0xd8d8d0,.5,.3);
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.012,.014,.32,10),poleM);
      pole.position.y=.16;grp.add(pole);
      const canopy=new THREE.Mesh(new THREE.ConeGeometry(.24,.16,12),sm(c,.7,0,fabricTex(c)));
      canopy.position.y=.36;grp.add(canopy);
      const tip=new THREE.Mesh(new THREE.SphereGeometry(.012,8,8),sm(0xd8d8d0,.4,.4));
      tip.position.y=.45;grp.add(tip);
      for(let i=0;i<8;i++){
        const ang=i/8*Math.PI*2;
        const rib=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.18,6),poleM);
        rib.position.set(Math.cos(ang)*.1,.3,Math.sin(ang)*.1);
        rib.rotation.x=Math.cos(ang)*.5;rib.rotation.z=Math.sin(ang)*.5;
        grp.add(rib);
      }
      emojiY=.5;emojiScale=.16;
      break;}
    case 'toolkit':{
      const box2=new THREE.Mesh(new THREE.BoxGeometry(.22,.1,.13),sm(0xd03030,.55));
      box2.position.y=.05;grp.add(box2);
      const handleTk=new THREE.Mesh(new THREE.TorusGeometry(.05,.01,8,12,Math.PI),sm(0x303030,.5));
      handleTk.rotation.z=Math.PI/2;handleTk.position.set(0,.12,0);grp.add(handleTk);
      const wrenchM=sm(0xb0b0b0,.3,.6);
      const wrench=new THREE.Mesh(new THREE.BoxGeometry(.13,.018,.018),wrenchM);
      wrench.position.set(.02,.105,.04);wrench.rotation.z=.3;grp.add(wrench);
      const screwHandle=new THREE.Mesh(new THREE.CylinderGeometry(.013,.013,.05,8),sm(0xe85050,.6));
      screwHandle.rotation.z=Math.PI/2;screwHandle.position.set(-.05,.105,-.03);grp.add(screwHandle);
      const screwShaft=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.08,8),sm(0xb0b0b0,.3,.6));
      screwShaft.rotation.z=Math.PI/2;screwShaft.position.set(-.11,.105,-.03);grp.add(screwShaft);
      emojiY=.18;emojiScale=.16;
      break;}
    case 'hose':{
      const hoseM=sm(c,.7);
      const coilR=.09;
      for(let i=0;i<3;i++){
        const ring=new THREE.Mesh(new THREE.TorusGeometry(coilR-i*.018,.014,8,20),hoseM);
        ring.rotation.x=Math.PI/2;ring.position.y=.014+i*.026;grp.add(ring);
      }
      const nozzle=new THREE.Mesh(new THREE.CylinderGeometry(.012,.018,.06,10),sm(0x707070,.4,.4));
      nozzle.rotation.z=Math.PI/2;nozzle.position.set(coilR+.02,.014,0);grp.add(nozzle);
      emojiY=.16;emojiScale=.15;
      break;}
    case 'pegs':{
      const pegM=sm(c,.55);
      for(let i=0;i<3;i++){
        const peg=new THREE.Group();
        peg.position.set(-.05+i*.05,.018,0);
        const top=new THREE.Mesh(new THREE.BoxGeometry(.018,.008,.05),pegM);top.position.y=.012;peg.add(top);
        const bot=new THREE.Mesh(new THREE.BoxGeometry(.018,.008,.05),pegM);bot.position.y=-.002;peg.add(bot);
        const spring=new THREE.Mesh(new THREE.TorusGeometry(.008,.003,6,8),sm(0xb0b0b0,.4,.5));
        spring.rotation.x=Math.PI/2;spring.position.y=.005;peg.add(spring);
        grp.add(peg);
      }
      emojiY=.1;emojiScale=.14;
      break;}
    case 'lantern':{
      const frameM3=sm(0x303030,.5,.3);
      mainMesh=new THREE.Mesh(new THREE.CylinderGeometry(.045,.05,.13,10),frameM3);
      mainMesh.position.y=.075;
      const glassL=new THREE.Mesh(new THREE.CylinderGeometry(.038,.042,.11,10),new THREE.MeshStandardMaterial({color:0xfff0c0,emissive:0xffcc60,emissiveIntensity:.55,transparent:true,opacity:.8}));
      glassL.position.y=.075;grp.add(glassL);
      const top2=new THREE.Mesh(new THREE.ConeGeometry(.05,.04,10),frameM3);
      top2.position.y=.16;grp.add(top2);
      const handleL=new THREE.Mesh(new THREE.TorusGeometry(.025,.006,6,10,Math.PI),frameM3);
      handleL.rotation.z=Math.PI;handleL.position.y=.2;grp.add(handleL);
      emojiY=.26;emojiScale=.15;
      break;}
    case 'candle':{
      mainMesh=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.1,14),sm(c,.6,0));
      mainMesh.position.y=.05;
      const wick=new THREE.Mesh(new THREE.CylinderGeometry(.003,.003,.02,6),sm(0x402810,.5));
      wick.position.y=.11;grp.add(wick);
      const flame=new THREE.Mesh(new THREE.ConeGeometry(.012,.025,8),new THREE.MeshStandardMaterial({color:0xffa030,emissive:0xff8020,emissiveIntensity:.9}));
      flame.position.y=.13;grp.add(flame);
      emojiY=.2;emojiScale=.14;
      break;}
    case 'jar':{
      mainMesh=new THREE.Mesh(new THREE.CylinderGeometry(.05,.045,.09,16),sm(c,.2,.05));
      mainMesh.position.y=.045;
      const jarLid=new THREE.Mesh(new THREE.CylinderGeometry(.052,.052,.025,16),sm(0xd0b878,.6));
      jarLid.position.y=.1;grp.add(jarLid);
      emojiY=.16;emojiScale=.15;
      break;}
    case 'globe':{
      const standG=new THREE.Mesh(new THREE.CylinderGeometry(.018,.05,.05,12),sm(0x6a4830,.7));
      standG.position.y=.025;grp.add(standG);
      const armG=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.1,8),sm(0x8a6840,.6));
      armG.rotation.z=.45;armG.position.set(0,.08,0);grp.add(armG);
      mainMesh=new THREE.Mesh(new THREE.SphereGeometry(.075,20,16),sm(c,.5,.05,cnvTex(128,128,(cc,ww,hh)=>{
        cc.fillStyle='#3878b0';cc.fillRect(0,0,ww,hh);
        cc.fillStyle='rgba(120,180,90,0.85)';
        for(let i=0;i<7;i++){const x=Math.random()*ww,y=Math.random()*hh;cc.beginPath();cc.ellipse(x,y,12+Math.random()*14,8+Math.random()*8,0,0,Math.PI*2);cc.fill();}
      })));
      mainMesh.position.set(0,.16,0);mainMesh.rotation.z=.36;
      emojiY=.3;emojiScale=.15;
      break;}
    case 'disc':{
      mainMesh=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.018,24),sm(c,.45,.1));
      mainMesh.rotation.x=Math.PI/2;mainMesh.position.y=.009;
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.105,.012,8,24),sm(dk(c,20),.45,.1));
      rim.rotation.x=Math.PI/2;rim.position.y=.012;grp.add(rim);
      emojiY=.1;emojiScale=.16;
      break;}
    case 'jewelrybox':{
      const baseJ=new THREE.Mesh(new THREE.BoxGeometry(.13,.05,.09),sm(c,.45,.3,woodTex(c,dk(c,40))));
      baseJ.position.y=.025;grp.add(baseJ);
      const lidJ=new THREE.Mesh(new THREE.BoxGeometry(.132,.025,.092),sm(dk(c,15),.4,.3));
      lidJ.position.set(0,.062,-.02);lidJ.rotation.x=-.55;grp.add(lidJ);
      const trim1=new THREE.Mesh(new THREE.BoxGeometry(.135,.006,.005),sm(0xd4a840,.4,.6));
      trim1.position.set(0,.038,.046);grp.add(trim1);
      const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.018),new THREE.MeshStandardMaterial({color:0xe060a0,emissive:0xa03060,emissiveIntensity:.4,metalness:.3,roughness:.2}));
      gem.position.set(0,.07,.015);grp.add(gem);
      const clasp=new THREE.Mesh(new THREE.SphereGeometry(.01,8,8),sm(0xd4a840,.4,.6));
      clasp.position.set(0,.05,.046);grp.add(clasp);
      mainMesh=null;
      emojiY=.14;emojiScale=.15;
      break;}
    case 'razor':{
      const handleR=new THREE.Mesh(new THREE.CylinderGeometry(.011,.013,.1,12),sm(c,.3,.55,metalTex(c)));
      handleR.position.y=.05;grp.add(handleR);
      const headR=new THREE.Mesh(new THREE.BoxGeometry(.03,.015,.012),sm(0xd8d8d8,.25,.6));
      headR.position.y=.105;grp.add(headR);
      const stripeR=new THREE.Mesh(new THREE.BoxGeometry(.03,.004,.013),sm(0x3090d0,.4,.3));
      stripeR.position.y=.098;grp.add(stripeR);
      mainMesh=null;
      emojiY=.16;emojiScale=.14;
      break;}
    default:{
      mainMesh=new THREE.Mesh(new THREE.BoxGeometry(.2,.08,.16),sm(c,.64,.05));
      mainMesh.position.y=.04;
      break;}
  }
  if(mainMesh){mainMesh.castShadow=true;grp.add(mainMesh);}
  return finishItem(grp,item,emojiY,emojiScale);
}
let _contactShadowTex=null;
const zoneOpen={};
const zoneDoorMeshes={};

function getContactShadowTex(){
  if(_contactShadowTex)return _contactShadowTex;
  _contactShadowTex=cnvTex(64,64,(c,w,h)=>{
    const grd=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
    grd.addColorStop(0,'rgba(0,0,0,0.38)');
    grd.addColorStop(0.7,'rgba(0,0,0,0.16)');
    grd.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=grd;c.fillRect(0,0,w,h);
  });
  return _contactShadowTex;
}
function addContactShadow(grp,radius){
  const disc=new THREE.Mesh(
    new THREE.PlaneGeometry(radius*2,radius*2),
    new THREE.MeshBasicMaterial({map:getContactShadowTex(),transparent:true,depthWrite:false})
  );
  disc.rotation.x=-Math.PI/2;disc.position.y=0.003;
  grp.add(disc);
}
function finishItem(grp,item,y,scale){
  grp.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
  addContactShadow(grp,Math.max(.08,(scale||.22)*.62));
  addEmojiSpr(grp,item.e,y,scale);
  return grp;
}
function addEmojiSpr(grp,emoji,y,scale){
  const s=(scale||.22)*0.12;
  const cv=document.createElement('canvas');cv.width=192;cv.height=192;
  const c=cv.getContext('2d');
  c.font='124px "Segoe UI Emoji","Apple Color Emoji",sans-serif';
  c.textAlign='center';c.textBaseline='middle';c.fillText(emoji,96,105);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:true,opacity:0.85}));
  sp.scale.set(s,s,1);sp.position.y=y;grp.add(sp);
}

// ══════════════════════════════════════════════════════
//  CLOTH SIMULATION (blanket)
// ══════════════════════════════════════════════════════
class ClothSim {
  constructor(segsX,segsZ,sx,sz){
    if(sz===undefined){ // backwards-compatible square signature: (segs,segSize)
      sz=sx;segsZ=segsX;
    }
    this.segsX=segsX;this.segsZ=segsZ;
    this.n=(segsX+1)*(segsZ+1);
    this.pos=[];this.prev=[];
    for(let zI=0;zI<=segsZ;zI++)for(let xI=0;xI<=segsX;xI++){
      const p=new THREE.Vector3(xI*sx-segsX*sx/2,.5,zI*sz-segsZ*sz/2);
      this.pos.push(p.clone());this.prev.push(p.clone());
    }
    this.constraints=[];
    const idx=(x,z)=>z*(segsX+1)+x;
    const diag=Math.sqrt(sx*sx+sz*sz);
    for(let zI=0;zI<=segsZ;zI++)for(let xI=0;xI<=segsX;xI++){
      if(xI<segsX)this.constraints.push([idx(xI,zI),idx(xI+1,zI),sx]);
      if(zI<segsZ)this.constraints.push([idx(xI,zI),idx(xI,zI+1),sz]);
      if(xI<segsX&&zI<segsZ){
        this.constraints.push([idx(xI,zI),idx(xI+1,zI+1),diag]);
        this.constraints.push([idx(xI+1,zI),idx(xI,zI+1),diag]);
      }
    }
    this.pinned=new Set();
    this.floorY=.02; // world-space rest floor; raised for items draped over furniture (e.g. a bed)
  }
  step(dt,gravity=-4){
    const damping=.98;
    for(let i=0;i<this.n;i++){
      if(this.pinned.has(i))continue;
      const p=this.pos[i],v=this.prev[i];
      const vx=p.x-v.x,vy=p.y-v.y,vz=p.z-v.z;
      v.copy(p);
      p.x+=vx*damping;
      p.y+=vy*damping+gravity*dt*dt;
      p.z+=vz*damping;
    }
    for(let iter=0;iter<8;iter++){
      for(const [a,b,rest] of this.constraints){
        const pa=this.pos[a],pb=this.pos[b];
        const dx=pb.x-pa.x,dy=pb.y-pa.y,dz=pb.z-pa.z;
        const dist=Math.sqrt(dx*dx+dy*dy+dz*dz)||.0001;
        const diff=(dist-rest)/dist*.5;
        if(!this.pinned.has(a)){pa.x+=dx*diff;pa.y+=dy*diff;pa.z+=dz*diff;}
        if(!this.pinned.has(b)){pb.x-=dx*diff;pb.y-=dy*diff;pb.z-=dz*diff;}
      }
      for(let i=0;i<this.n;i++) if(this.pos[i].y<this.floorY) this.pos[i].y=this.floorY;
    }
  }
  updateGeo(geo){
    const pos=geo.attributes.position;
    for(let i=0;i<this.n;i++){
      pos.setXYZ(i,this.pos[i].x,this.pos[i].y,this.pos[i].z);
    }
    pos.needsUpdate=true;geo.computeVertexNormals();
  }
}

function makeClothMesh(col,segsX=10,segsZ=10,sx=.08,sz=.08){
  const geo=new THREE.PlaneGeometry(segsX*sx,segsZ*sz,segsX,segsZ);
  geo.rotateX(-Math.PI/2);
  const mat=new THREE.MeshStandardMaterial({color:col,roughness:.92,side:THREE.DoubleSide,map:fabricTex(col)});
  return new THREE.Mesh(geo,mat);
}

// Builds a static, already-settled bedspread mesh sized to fully cover a
// bed's mattress, with a subtle wrinkled surface so it doesn't look like a
// flat plastic sheet once the placement animation hands off to it.
function makeBedCoverMesh(col,w,d){
  // Bedspread that drapes over mattress top + sides + foot
  const grp=new THREE.Group();
  const bt=blanketTex();
  const fabM=new THREE.MeshStandardMaterial({map:bt, roughness:0.9, metalness:0.02, side:THREE.DoubleSide});
  const sherpa=new THREE.MeshStandardMaterial({color:0xf2eee8, roughness:0.95, side:THREE.DoubleSide});
  // Top surface — covers most of bed, leaves pillows at head
  const cw=w*0.98, cd=d*0.72, yTop=0.54;
  const main=new THREE.Mesh(new THREE.BoxGeometry(cw, 0.045, cd), fabM);
  main.position.set(0, yTop, 0.32);
  main.castShadow=true; main.receiveShadow=true;
  grp.add(main);
  // Soft top layer
  const top=new THREE.Mesh(new THREE.BoxGeometry(cw*0.98, 0.025, cd*0.98), fabM);
  top.position.set(0, yTop+0.03, 0.32);
  top.castShadow=true; grp.add(top);
  // Side drapes hanging down over mattress edges
  const hangH=0.28;
  [-1,1].forEach(s=>{
    const side=new THREE.Mesh(new THREE.BoxGeometry(0.04, hangH, cd*0.98), fabM);
    side.position.set(s*(cw/2+0.01), yTop-hangH/2+0.02, 0.32);
    side.castShadow=true; grp.add(side);
    // sherpa edge on side
    const se=new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.06, cd*0.98), sherpa);
    se.position.set(s*(cw/2+0.02), yTop-hangH+0.03, 0.32);
    grp.add(se);
  });
  // Foot drape hanging down
  const foot=new THREE.Mesh(new THREE.BoxGeometry(cw*1.02, hangH, 0.04), fabM);
  foot.position.set(0, yTop-hangH/2+0.02, 0.32+cd/2+0.01);
  foot.castShadow=true; grp.add(foot);
  // White sherpa cuff at foot bottom
  const cuff=new THREE.Mesh(new THREE.BoxGeometry(cw*1.04, 0.07, 0.06), sherpa);
  cuff.position.set(0, yTop-hangH+0.04, 0.32+cd/2+0.02);
  grp.add(cuff);
  // Sherpa strip at head edge of cover
  const headE=new THREE.Mesh(new THREE.BoxGeometry(cw*1.0, 0.04, 0.07), sherpa);
  headE.position.set(0, yTop+0.01, 0.32-cd/2+0.02);
  grp.add(headE);
  return grp;
}

// ══════════════════════════════════════════════════════
//  PLACEMENT ANIMATIONS
// ══════════════════════════════════════════════════════
const ANIM_DURATION=0.7;

function startPlacementAnim(item, zoneId, slotIdx, room){
  const zone=room.def.furniture.find(f=>f.id===zoneId);
  if(!zone)return;
  const slots=zone.slots||[{x:0,z:0}];
  const sl=slots[slotIdx]||slots[0];
  const isBedCover=item.shape==='blanket'&&zone.type==='bed';
  const placed=room.placed[item.id];
  let sp;
  if(isBedCover){
    sp={x:0,y:.01,z:0};
  }else if(placed && placed.localOffset){
    sp={x:placed.localOffset.x, y:placed.localOffset.y, z:placed.localOffset.z};
  }else{
    sp=slotPos(zone,sl);
  }
  const local = new THREE.Vector3(sp.x, 0, sp.z);
  if(zone.rot) local.applyAxisAngle(new THREE.Vector3(0,1,0), zone.rot);
  const elev = zone.elevY||0;
  const target=new THREE.Vector3(
    zone.pos.x+local.x,
    isBedCover ? 0.67 : (elev + sp.y),
    zone.pos.z+local.z
  );

  const camDir=new THREE.Vector3();
  camera.getWorldDirection(camDir);
  const startPos=camera.position.clone().add(camDir.multiplyScalar(.6)).add(new THREE.Vector3(0,-.2,0));

  const mesh=makeItemMesh(item);
  mesh.position.copy(startPos);
  sceneRoot.add(mesh);

  const animData={
    mesh, startPos:startPos.clone(), target:target.clone(),
    t:0, duration:ANIM_DURATION, item, zoneId, slotIdx, room,
    type:item.anim||'default',
    cloth:null, clothSim:null,
    done:false
  };

  if(item.anim==='cloth'){
    sceneRoot.remove(mesh);
    let clothMesh, sim;
    if(isBedCover){
      const cover=makeBedCoverMesh(item.col||0x7880c8, zone.size.w-.06, zone.size.d-.12);
      cover.scale.set(0.2, 0.2, 0.2);
      cover.position.set(target.x, target.y+0.8, target.z);
      sceneRoot.add(cover);
      animData.mesh=cover;
      animData.cloth=null;animData.clothSim=null;
      animData.isBedCover=true;
      animData.type='blanket_unfold';
      animData.duration=1.0;
      animData.blanketTarget=new THREE.Vector3(target.x, 0, target.z);
    } else {
      clothMesh=makeClothMesh(item.col||0x7880c8,10,10,.08,.08);
      clothMesh.position.copy(target).add(new THREE.Vector3(0,.5,0));
      sceneRoot.add(clothMesh);
      sim=new ClothSim(10,10,.08,.08);
      sim.floorY=.02;
      sim.pos.forEach((p,i)=>{
        p.x+=target.x;p.y+=target.y+.6;p.z+=target.z;
        sim.prev[i].copy(sim.pos[i]);
      });
      animData.mesh=clothMesh;animData.cloth=clothMesh;animData.clothSim=sim;
      animData.clothGravity=-4;
      animData.isBedCover=false;
      animData.simSteps=80;animData.simDone=false;
    }
  }

  placementAnims.push(animData);
}

function updatePlacementAnims(dt){
  const toRemove=[];
  placementAnims.forEach(a=>{
    if(a.done){toRemove.push(a);return;}

    if(a.clothSim){
      if(a.simSteps>0){
        a.clothSim.step(dt*3,a.clothGravity!==undefined?a.clothGravity:-4);
        a.clothSim.updateGeo(a.cloth.geometry);
        a.simSteps--;
        if(a.simSteps<=0){
          a.done=true;
          setTimeout(()=>sceneRoot.remove(a.cloth),200);
        }
      }
      return;
    }

    // Special: blanket unfolds over the whole bed
    if(a.type==='blanket_unfold'){
      a.t+=dt;
      const raw=Math.min(1,a.t/(a.duration||1.0));
      const ease=1-Math.pow(1-raw,3);
      const s=0.2+ease*0.8;
      a.mesh.scale.set(s, 0.5+s*0.5, s);
      const startY=0.9, endY=0;
      a.mesh.position.y = startY+(endY-startY)*ease;
      a.mesh.rotation.y = (1-ease)*0.5;
      if(a.blanketTarget){
        a.mesh.position.x=a.blanketTarget.x;
        a.mesh.position.z=a.blanketTarget.z;
      }
      if(raw>0.85){
        const b=(raw-0.85)/0.15;
        a.mesh.position.y = endY + Math.sin(b*Math.PI)*0.03*(1-b);
      }
      if(raw>=1){
        a.done=true;
        sceneRoot.remove(a.mesh);
      }
      return;
    }

    a.t+=dt;
    const raw=Math.min(1,a.t/a.duration);
    const ease=raw<.5?2*raw*raw:1-Math.pow(-2*raw+2,2)/2;
    const arc=Math.sin(raw*Math.PI)*(a.type==='bounce'?.4:.25);

    a.mesh.position.lerpVectors(a.startPos,a.target,ease);
    a.mesh.position.y+=arc;

    if(a.type==='slide') a.mesh.rotation.z=Math.sin(raw*Math.PI)*.3;
    if(a.type==='fold') a.mesh.rotation.x=Math.sin(raw*Math.PI)*.5;
    if(a.type==='lean') a.mesh.rotation.z=.05+Math.sin(raw*Math.PI)*.2;

    const popPhase=Math.max(0,(raw-.85)/.15);
    const popScale=1+Math.sin(popPhase*Math.PI)*.15;
    a.mesh.scale.set(popScale,popScale,popScale);

    if(raw>=1){
      a.done=true;
      sceneRoot.remove(a.mesh);
    }
  });
  toRemove.forEach(a=>placementAnims.splice(placementAnims.indexOf(a),1));
}

// ══════════════════════════════════════════════════════
//  SLOT MANAGEMENT
// ══════════════════════════════════════════════════════
function arrangeSlot(zoneId,room){
  const sg=zoneSlotGroups[zoneId];if(!sg)return;
  const fDef=room.def.furniture.find(f=>f.id===zoneId);
  const rem=[];
  for(const c of sg.children) if(!c.userData.isGhost)rem.push(c);
  rem.forEach(c=>sg.remove(c));
  // Also clear items parented to doors/drawers
  const doors=zoneDoorMeshes[zoneId];
  if(doors){
    ['left','right'].forEach(side=>{
      const d=doors[side]; if(!d)return;
      const kill=[];
      d.traverse(o=>{ if(o.userData&&o.userData.isPlacedItem&&o.userData.itemId) kill.push(o); });
      kill.forEach(o=>{ if(o.parent) o.parent.remove(o); });
    });
  }
  const items=Object.values(room.placed).filter(p=>p.zone===zoneId);
  items.forEach(p=>{
    const isBedCover=p.item.shape==='blanket'&&fDef&&fDef.type==='bed';
    const si=p.slotIdx||0;
    let mesh, sp;
    if(isBedCover){
      mesh=makeBedCoverMesh(p.item.col||0x7880c8, fDef.size.w-.06, fDef.size.d-.12);
      sp={x:0,y:0,z:0};
    }else{
      mesh=makeItemMesh(p.item);
      if(p.localOffset){
        sp={x:p.localOffset.x, y:p.localOffset.y, z:p.localOffset.z};
      }else{
        const sl=fDef?.slots?.[si]||{x:0,z:0};
        sp=slotPos(fDef||{},sl);
      }
    }
    if(!isBedCover){
      mesh.position.set(sp.x, sp.y, sp.z);
    }
    // bed cover keeps its internal local positions
    mesh.userData.itemId=p.item.id;mesh.userData.zoneId=zoneId;
    mesh.userData.isPlacedItem=true;
    if(p.rotY) mesh.rotation.y = p.rotY;
    const hb=new THREE.Mesh(
      new THREE.BoxGeometry(0.35,0.35,0.35),
      new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false,colorWrite:false})
    );
    hb.position.y=0.15;
    hb.userData.isPlacedItem=true;
    hb.userData.itemId=p.item.id;
    hb.userData.zoneId=zoneId;
    mesh.add(hb);
    // Parent inside items to door/drawer so they move when closing
    const doors=zoneDoorMeshes[zoneId];
    if(p.inside && doors && doors.left){
      if(doors.mode==='drawer'){
        // sit on drawer floor
        mesh.position.set(
          (p.localOffset?.x||0)*0.5,
          0.16,
          (p.localOffset?.z||0)*0.35
        );
      }else{
        mesh.position.set(p.localOffset?.x||0, Math.max(0.2,(fDef.size?.h||1)*0.3), -0.15);
      }
      doors.left.add(mesh);
    }else{
      sg.add(mesh);
    }
  });
}

function showGhosts(item){
  Object.entries(slotGhosts).forEach(([zid,gs])=>{
    const best=zid===item.bz,good=zid===item.az;
    gs.forEach(g=>{
      g.visible=true;
      g.children.forEach(c=>{
        if(!c.material)return;
        c.material.color=new THREE.Color(best?0xffd24a:good?0x7de08a:0x888888);
        c.material.opacity=best?.9:good?.7:.4;
      });
    });
  });
}
function hideGhosts(){Object.values(slotGhosts).forEach(gs=>gs.forEach(g=>{g.visible=false;g.scale.set(1,1,1);}));hoveredGhost=null;}

// ══════════════════════════════════════════════════════
//  CONTROLS
// ══════════════════════════════════════════════════════
function setupControls(){
  // Keyboard
  window.addEventListener('keydown', e=>{
    keys[e.code]=true;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code)&&gameActive) e.preventDefault();
    if(e.code==='KeyT'&&gameActive) sayRandomLine(false);
    if(e.code==='KeyR'&&gameActive&&carriedItem){
      rotateCarriedItem(Math.PI/4);
      notify('🔄 Rotacionado','');
    }
  });
  window.addEventListener('keyup', e=>{ keys[e.code]=false; });
  // Clear stuck keys when tab loses focus
  window.addEventListener('blur', ()=>{ for(const k in keys) keys[k]=false; isDragging=false; });

  document.addEventListener('pointerlockchange', ()=>{
    pointerLocked = document.pointerLockElement===renderer.domElement;
  });
  document.addEventListener('pointerlockerror', ()=>enterFallback());

  renderer.domElement.addEventListener('click', e=>{
    renderer.domElement.focus();
    if(mobileVR) return;
    if(fallbackMode || !pointerLocked){
      if(dragMoved){ dragMoved=false; return; }
      if(!pointerLocked) tryLock();
      // interact on click without drag
      if(!dragMoved) onInteract();
      return;
    }
    onInteract();
  });

  // Mouse look — pointer lock OR click-and-drag (fallback)
  const LOOK_SENS = 0.0035;
  window.addEventListener('mousemove', e=>{
    if(!gameActive || mobileVR) return;
    // Pointer lock: free look
    if(pointerLocked){
      const mx = e.movementX || 0;
      const my = e.movementY || 0;
      if(mx || my){
        yaw   -= mx * LOOK_SENS;
        pitch -= my * LOOK_SENS;
        pitch  = Math.max(-1.45, Math.min(1.45, pitch));
      }
      return;
    }
    // Fallback / always: drag with left OR right button
    if(isDragging){
      const dx = e.clientX - lastDragX;
      const dy = e.clientY - lastDragY;
      if(Math.abs(dx)>1 || Math.abs(dy)>1) dragMoved = true;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      yaw   -= dx * LOOK_SENS;
      pitch -= dy * LOOK_SENS;
      pitch  = Math.max(-1.45, Math.min(1.45, pitch));
    }
  });

  renderer.domElement.addEventListener('mousedown', e=>{
    if(mobileVR) return;
    if(e.button===0 || e.button===2){
      isDragging = true;
      dragMoved = false;
      lastDragX = e.clientX;
      lastDragY = e.clientY;
      // Try pointer lock on left click if not locked
      if(e.button===0 && !pointerLocked && !fallbackMode){
        tryLock();
      }
    }
  });
  window.addEventListener('mouseup', ()=>{ isDragging=false; });
  renderer.domElement.addEventListener('contextmenu', e=> e.preventDefault());

  // Touch look
  renderer.domElement.addEventListener('touchstart', e=>{
    if(e.touches.length!==1) return;
    isDragging=true; dragMoved=false;
    lastDragX=e.touches[0].clientX; lastDragY=e.touches[0].clientY;
  }, {passive:true});
  renderer.domElement.addEventListener('touchmove', e=>{
    if(!isDragging||e.touches.length!==1) return;
    const dx=e.touches[0].clientX-lastDragX, dy=e.touches[0].clientY-lastDragY;
    if(Math.abs(dx)>2||Math.abs(dy)>2) dragMoved=true;
    lastDragX=e.touches[0].clientX; lastDragY=e.touches[0].clientY;
    yaw  -= dx * 0.003;
    pitch-= dy * 0.003;
    pitch = Math.max(-1.45, Math.min(1.45, pitch));
  }, {passive:true});
  renderer.domElement.addEventListener('touchend', e=>{
    isDragging=false;
    if(dragMoved){ dragMoved=false; return; }
    onInteract();
  });

  // Mobile movement pad
  const pad=document.getElementById('mobile-pad');
  if(pad){
    pad.querySelectorAll('.pad-btn').forEach(btn=>{
      const k=btn.dataset.k;
      const down=ev=>{ev.preventDefault();keys[k]=true;};
      const up=ev=>{ev.preventDefault();keys[k]=false;};
      btn.addEventListener('touchstart',down,{passive:false});
      btn.addEventListener('touchend',up,{passive:false});
      btn.addEventListener('touchcancel',up,{passive:false});
      btn.addEventListener('mousedown',down);
      btn.addEventListener('mouseup',up);
      btn.addEventListener('mouseleave',up);
    });
    if('ontouchstart' in window){
      pad.classList.add('show');
      const sb=document.getElementById('speech-btn');
      if(sb) sb.classList.add('show');
    }
  }
  const speechBtn=document.getElementById('speech-btn');
  if(speechBtn) speechBtn.addEventListener('click',()=>sayRandomLine(false));

  // Gamepad connect / disconnect (Shinecon SC-B03 Bluetooth)
  window.addEventListener('gamepadconnected', e=>{
    gamepadIndex=e.gamepad.index;
    gpPrevButtons={};
    gpAxisMap={lx:0,ly:1,rx:2,ry:3,calibrated:false};
    const id=(e.gamepad.id||'Shinecon').slice(0,50);
    const axes=e.gamepad.axes?e.gamepad.axes.length:0;
    const btns=e.gamepad.buttons?e.gamepad.buttons.length:0;
    notify('🎮 Controle: '+id+' · '+axes+' eixos · '+btns+' botões','good');
  });
  window.addEventListener('gamepaddisconnected', e=>{
    if(gamepadIndex===e.gamepad.index) gamepadIndex=null;
    notify('🎮 Controle desconectado','');
  });

  // Shinecon SC-B03 often emulates KEYBOARD + MOUSE over Bluetooth
  // Touchpad → mouse move; click/A → Enter or click; arrows on some firmwares
  window._shineconPad = {x:0,y:0};
  let shineconMouseTimer = null;
  window.addEventListener('keydown', e=>{
    // Shinecon SC-B03 confirmation often arrives as keyboard HID
    if(!gameActive) return;
    const confirmKeys = [
      'Enter','NumpadEnter','Space','Select',
      'MediaPlayPause','MediaTrackNext','MediaTrackPrevious',
      'SoftLeft','SoftRight','Escape'
    ];
    if(confirmKeys.includes(e.code) || confirmKeys.includes(e.key) ||
       e.key==='Enter' || e.key===' ' || e.keyCode===13 || e.keyCode===32){
      // Space/Enter from remote = confirmation button
      if(e.code==='Space'||e.code==='Enter'||e.code==='NumpadEnter'||
         e.key==='Enter'||e.key===' '||e.key==='Select'||
         e.code==='MediaPlayPause'||e.keyCode===13||e.keyCode===32){
        e.preventDefault();
        onInteract();
      }
    }
  }, true);

  // Shinecon touchpad-as-mouse ONLY when a gamepad is connected and not pointer-locked
  window.addEventListener('mousemove', e=>{
    if(!gameActive || pointerLocked || isDragging) return;
    if(gamepadIndex===null && !mobileVR) return; // don't steal PC mouse
    if(Math.abs(e.movementX)>40 || Math.abs(e.movementY)>40) return;
    if(e.movementX===0 && e.movementY===0) return;
    window._shineconPad.x = Math.max(-1, Math.min(1, e.movementX * 0.08));
    window._shineconPad.y = Math.max(-1, Math.min(1, e.movementY * 0.08));
    clearTimeout(shineconMouseTimer);
    shineconMouseTimer = setTimeout(()=>{ window._shineconPad.x=0; window._shineconPad.y=0; }, 120);
  }, true);

  // Shinecon confirmation = mouse left click (touchpad press)
  window.addEventListener('mousedown', e=>{
    if(!gameActive) return;
    if(e.button!==0) return;
    const ov=document.getElementById('overlay');
    const en=document.getElementById('entry');
    if(ov && !ov.classList.contains('hidden')) return;
    if(en && !en.classList.contains('hidden')) return;
    // When using Shinecon remote (gamepad connected) or mobile VR: click = confirm/interact
    if(mobileVR || gamepadIndex!==null){
      e.preventDefault();
      onInteract();
    }
  }, true);
}
function tryLock(){
  try{
    const el = renderer.domElement;
    const req = el.requestPointerLock || el.mozRequestPointerLock || el.webkitRequestPointerLock;
    if(req){
      const p = req.call(el);
      if(p && p.catch) p.catch(()=>enterFallback());
    } else {
      enterFallback();
    }
    setTimeout(()=>{ if(!pointerLocked) enterFallback(); }, 500);
  }catch(e){ enterFallback(); }
}
function enterFallback(){
  if(fallbackMode) return;
  fallbackMode=true;
  notify('🖱️ Segure o botão do mouse e arraste para olhar · clique solto para interagir','');
}


// ══════════════════════════════════════════════════════
//  GAMEPAD (controle de videogame)
// ══════════════════════════════════════════════════════
function getActiveGamepad(){
  const pads=navigator.getGamepads ? navigator.getGamepads() : [];
  if(gamepadIndex!==null && pads[gamepadIndex]) return pads[gamepadIndex];
  for(let i=0;i<pads.length;i++){
    if(pads[i]){ gamepadIndex=i; return pads[i]; }
  }
  return null;
}
function gpPressed(gp, i){
  const b=gp.buttons[i];
  if(!b) return false;
  return (typeof b==='object') ? (b.pressed||b.value>0.5) : !!b;
}
function gpJustPressed(gp, i){
  const now=gpPressed(gp,i);
  const was=!!gpPrevButtons[i];
  gpPrevButtons[i]=now;
  return now && !was;
}

// ══════════════════════════════════════════════════════
//  WEBXR — Óculos VR + controles
// ══════════════════════════════════════════════════════
function setupVR(){
  const btn = document.getElementById('vr-btn');
  if(!btn) return;
  // Always show for Shinecon / mobile VR (phone in headset)
  btn.classList.add('show');
  btn.title = 'Shinecon VR / Cardboard / WebXR';

  // Also check full WebXR headsets
  if(navigator.xr){
    navigator.xr.isSessionSupported('immersive-vr').then(ok=>{
      if(ok) btn.textContent = '🥽 VR / Shinecon';
    }).catch(()=>{});
  }

  btn.addEventListener('click', async ()=>{
    // Exit if already in any VR mode
    if(mobileVR){ exitMobileVR(); return; }
    if(vrSession){ try{ await vrSession.end(); }catch(e){} return; }

    // Prefer full WebXR if available (Quest etc.)
    if(navigator.xr){
      try{
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        if(supported){
          const session = await navigator.xr.requestSession('immersive-vr', {
            optionalFeatures: ['local-floor','bounded-floor','hand-tracking','layers']
          });
          await onVRSessionStarted(session);
          return;
        }
      }catch(err){
        console.warn('WebXR falhou, usando VR celular:', err);
      }
    }
    // Shinecon / cardboard / phone VR
    enterMobileVR();
  });
}

function enterMobileVR(){
  mobileVR = true;
  vrIsPresenting = true;
  const btn = document.getElementById('vr-btn');
  if(btn){ btn.textContent='🚪 Sair do VR'; btn.classList.add('active'); }

  // Hide UI chrome for immersion
  ['hud-top','right-panel','box-panel','timer-wrap','crosshair','interact-hint','mobile-pad','speech-btn'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display='none';
  });
  const hint=document.getElementById('hud-bottom');
  if(hint) hint.style.opacity='0.35';

  // Fullscreen + landscape
  const el = renderer.domElement;
  const reqFS = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen;
  if(reqFS) try{ reqFS.call(document.documentElement); }catch(e){}

  // Request device orientation (iOS needs permission)
  const enableOrient = ()=>{
    window.addEventListener('deviceorientation', onDeviceOrientation, true);
    mobileVROrient.ok = true;
  };
  if(typeof DeviceOrientationEvent !== 'undefined' &&
     typeof DeviceOrientationEvent.requestPermission === 'function'){
    DeviceOrientationEvent.requestPermission()
      .then(state=>{
        if(state==='granted') enableOrient();
        else notify('⚠️ Permita o acesso ao giroscópio nas configurações','danger');
      })
      .catch(()=>enableOrient());
  } else {
    enableOrient();
  }

  // Lower pixel ratio for stereo performance on phones
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  notify('🥽 VR: stick na tela ou touchpad SC-B03 = andar | botão vermelho/confirmação = interagir','good');
  gameActive = true;
  setupShineconHID();
  setupVRScreenControls();
  if(navigator.getGamepads) navigator.getGamepads();
  try{ renderer.domElement.focus(); document.body.focus(); window.focus(); }catch(e){}
}

function exitMobileVR(){
  mobileVR = false;
  vrIsPresenting = false;
  mobileVRBaseYaw = null;
  window.removeEventListener('deviceorientation', onDeviceOrientation, true);
  const btn = document.getElementById('vr-btn');
  if(btn){ btn.textContent='🥽 Entrar em VR'; btn.classList.remove('active'); }
  ['hud-top','right-panel','box-panel','timer-wrap','crosshair','mobile-pad','speech-btn'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display='';
  });
  const hb=document.getElementById('hud-bottom');
  if(hb) hb.style.opacity='';
  const xh=document.getElementById('crosshair');
  if(xh) xh.style.display='';
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setViewport(0,0,innerWidth,innerHeight);
  renderer.setScissorTest(false);
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  if(document.exitFullscreen) try{ document.exitFullscreen(); }catch(e){}
  teardownShineconHID();
  notify('🥽 Saiu do VR Shinecon','');
}

function onDeviceOrientation(e){
  if(!mobileVR) return;
  // alpha: compass (z), beta: front-back (x), gamma: left-right (y)
  if(e.alpha===null || e.beta===null || e.gamma===null) return;
  mobileVROrient.alpha = e.alpha;
  mobileVROrient.beta = e.beta;
  mobileVROrient.gamma = e.gamma;
  mobileVROrient.ok = true;
}

function applyMobileVROrientation(){
  if(!mobileVR || !mobileVROrient.ok || !camera) return;
  // Convert device orientation to yaw/pitch (Cardboard-style)
  const alpha = mobileVROrient.alpha * Math.PI/180; // 0..360
  const beta  = mobileVROrient.beta  * Math.PI/180; // -180..180
  const gamma = mobileVROrient.gamma * Math.PI/180; // -90..90

  // Screen orientation offset
  const orient = (typeof screen !== 'undefined' && screen.orientation && screen.orientation.angle) || window.orientation || 0;
  const orientRad = orient * Math.PI/180;

  // Simple mapping for phone in landscape inside Shinecon headset
  // Looking: device beta ~ 90 when looking forward while lying in headset
  let lookYaw = -alpha - orientRad;
  let lookPitch = (beta - Math.PI/2);

  if(mobileVRBaseYaw === null){
    mobileVRBaseYaw = lookYaw;
  }
  yaw = lookYaw - mobileVRBaseYaw;
  pitch = Math.max(-1.3, Math.min(1.3, lookPitch * 0.85));

  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;
  camera.rotation.z = 0;
}

function renderMobileStereo(){
  // Side-by-side stereo for Shinecon / Cardboard
  const w = innerWidth, h = innerHeight;
  const half = Math.floor(w/2);
  camera.aspect = (half) / h;
  camera.updateProjectionMatrix();

  // Left eye
  camera.position.x -= MOBILE_EYE_SEP/2;
  renderer.setViewport(0, 0, half, h);
  renderer.setScissor(0, 0, half, h);
  renderer.setScissorTest(true);
  renderer.render(scene, camera);

  // Right eye
  camera.position.x += MOBILE_EYE_SEP;
  renderer.setViewport(half, 0, half, h);
  renderer.setScissor(half, 0, half, h);
  renderer.render(scene, camera);

  // Restore camera position
  camera.position.x -= MOBILE_EYE_SEP/2;
}

async function onVRSessionStarted(session){
  vrSession = session;
  vrIsPresenting = true;
  const btn = document.getElementById('vr-btn');
  if(btn){ btn.textContent='🚪 Sair do VR'; btn.classList.add('active'); }

  session.addEventListener('end', onVRSessionEnded);

  // Set reference space
  try{
    await renderer.xr.setSession(session);
  }catch(e){
    console.error(e);
    notify('⚠️ Erro ao iniciar sessão XR','danger');
    return;
  }

  // Controllers (0 e 1)
  vrControllers = [];
  for(let i=0;i<2;i++){
    const ctrl = renderer.xr.getController(i);
    ctrl.userData.index = i;
    // Laser pointer
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0,0,0),
      new THREE.Vector3(0,0,-1)
    ]);
    const line = new THREE.Line(geo, new THREE.LineBasicMaterial({color:0x88ccff, linewidth:2}));
    line.scale.z = 2.5;
    line.name = 'vr-ray';
    ctrl.add(line);
    // Tip sphere
    const tip = new THREE.Mesh(
      new THREE.SphereGeometry(0.015, 8, 8),
      new THREE.MeshBasicMaterial({color:0xffd24a})
    );
    tip.position.z = -2.5;
    tip.name = 'vr-tip';
    ctrl.add(tip);
    ctrl.addEventListener('selectstart', onVRSelectStart);
    ctrl.addEventListener('selectend', onVRSelectEnd);
    scene.add(ctrl);
    vrControllers.push(ctrl);

    // Grip model (simple block)
    try{
      const grip = renderer.xr.getControllerGrip(i);
      const hand = new THREE.Mesh(
        new THREE.BoxGeometry(0.04, 0.04, 0.1),
        new THREE.MeshStandardMaterial({color:0x334455, roughness:0.5, metalness:0.3})
      );
      hand.position.z = 0.02;
      grip.add(hand);
      scene.add(grip);
    }catch(e){}
  }

  notify('🥽 VR ativo — Stick esq: andar | Gatilho: interagir','good');
  gameActive = true;
}

function onVRSessionEnded(){
  vrIsPresenting = false;
  vrSession = null;
  const btn = document.getElementById('vr-btn');
  if(btn){ btn.textContent='🥽 Entrar em VR'; btn.classList.remove('active'); }
  // Remove controllers from scene
  vrControllers.forEach(c=>{
    if(c.parent) c.parent.remove(c);
  });
  vrControllers = [];
  notify('🥽 Saiu do VR','');
}

function onVRSelectStart(e){
  const i = e.target.userData.index;
  vrSelectPressed[i] = true;
  // Raycast from controller and interact
  if(gameActive) vrInteractFromController(e.target);
}

function onVRSelectEnd(e){
  const i = e.target.userData.index;
  vrSelectPressed[i] = false;
}

function vrInteractFromController(ctrl){
  // Build ray from controller
  const origin = new THREE.Vector3();
  const direction = new THREE.Vector3(0, 0, -1);
  ctrl.getWorldPosition(origin);
  direction.transformDirection(ctrl.matrixWorld);
  raycaster.set(origin, direction);
  raycaster.far = 4.5;

  const placedTargets=[];
  if(sceneRoot){
    sceneRoot.traverse(o=>{
      if(o.userData && o.userData.isPlacedItem && o.userData.itemId) placedTargets.push(o);
    });
  }
  const targets=[...boxMeshes.filter(Boolean),...Object.values(zoneMeshes),...placedTargets];
  const hits=raycaster.intersectObjects(targets,true);
  if(!hits.length){ onInteract(); return; }

  // Temporarily set lookTarget from hit (reuse desktop logic)
  updateLookTargetFromRay(hits);
  onInteract();
}

function updateLookTargetFromRay(hits){
  // Minimal: set lookTarget based on first meaningful hit (mirrors updateLookTarget)
  if(!hits.length||hits[0].distance>4.5){ lookTarget=null; return; }
  let obj=hits[0].object;
  for(const h of hits){
    if(h.distance>4.5) break;
    let o=h.object;
    while(o && !(o.userData && o.userData.isPlacedItem && o.userData.itemId)) o=o.parent;
    if(o && o.userData && o.userData.isPlacedItem){ obj=o; break; }
    if(h.object.userData && h.object.userData.isBox){ obj=h.object; break; }
  }
  if(obj.userData && obj.userData.isPlacedItem && obj.userData.itemId && !carriedItem){
    lookTarget={type:'placed', itemId:obj.userData.itemId, zoneId:obj.userData.zoneId};
    return;
  }
  if(obj.userData.isBox){
    lookTarget={type:'box', boxIdx:obj.userData.boxIdx};
    return;
  }
  // Walk up for zoneId
  let o=obj;
  while(o && !o.userData.zoneId) o=o.parent;
  if(o && o.userData.zoneId){
    const zid=o.userData.zoneId;
    const rm=G.rooms[G.curRoom];
    const fDef=rm?.def?.furniture?.find(f=>f.id===zid);
    const grp=zoneGroups[zid];
    let localPt={x:0,y:0.5,z:0};
    if(grp){
      const lp=grp.worldToLocal(hits[0].point.clone());
      localPt={x:lp.x,y:lp.y,z:lp.z};
    }
    if(carriedItem){
      lookTarget={type:'zone',zoneId:zid,slotIdx:0,localPt};
    } else {
      const openable=['closet','cabinet','bathcabinet','fridge','shed','nightstand','counter','desk','bigdesk','stove','microwave','grill','wallcabinet'];
      if(openable.includes(fDef?.type)){
        lookTarget={type:'openable',zoneId:zid};
      } else {
        lookTarget={type:'zone',zoneId:zid};
      }
    }
  }
}

function updateVR(dt){
  if(!vrIsPresenting || !renderer.xr || !renderer.xr.isPresenting) return;

  // Locomotion from XR controller gamepads (thumbsticks)
  const session = renderer.xr.getSession && renderer.xr.getSession();
  if(!session || !camera) return;

  let mx=0, mz=0;
  // Head-forward direction for movement
  const xrCam = renderer.xr.getCamera ? renderer.xr.getCamera(camera) : camera;
  const euler = new THREE.Euler();
  euler.setFromQuaternion(xrCam.quaternion, 'YXZ');
  const hy = euler.y;
  const fwdX = -Math.sin(hy), fwdZ = -Math.cos(hy);
  const rgtX =  Math.cos(hy), rgtZ = -Math.sin(hy);

  for(const src of session.inputSources){
    if(!src.gamepad) continue;
    const axes = src.gamepad.axes || [];
    // Quest / standard: axes 2,3 = thumbstick (0,1 sometimes also)
    let sx=0, sy=0;
    if(axes.length >= 4){
      sx = Math.abs(axes[2])>0.2 ? axes[2] : 0;
      sy = Math.abs(axes[3])>0.2 ? axes[3] : 0;
    }
    if(sx===0 && sy===0 && axes.length>=2){
      sx = Math.abs(axes[0])>0.2 ? axes[0] : 0;
      sy = Math.abs(axes[1])>0.2 ? axes[1] : 0;
    }
    // Left controller typically moves; right may also
    if(src.handedness === 'left' || src.handedness === 'none'){
      mx += (-sy)*fwdX + sx*rgtX;
      mz += (-sy)*fwdZ + sx*rgtZ;
    } else if(src.handedness === 'right'){
      // Right stick: snap turn
      if(Math.abs(sx) > 0.6){
        // subtle continuous turn
        yaw -= sx * 1.8 * dt;
      }
    }

    // Trigger / squeeze as interact (button 0 or 1)
    const btns = src.gamepad.buttons || [];
    if(btns[0] && btns[0].pressed && !src._vrTrig){
      src._vrTrig = true;
      // Find matching controller object
      const idx = src.handedness === 'right' ? 1 : 0;
      if(vrControllers[idx]) vrInteractFromController(vrControllers[idx]);
      else if(gameActive) onInteract();
    }
    if(btns[0] && !btns[0].pressed) src._vrTrig = false;
  }

  if((mx!==0||mz!==0) && gameActive){
    const len=Math.hypot(mx,mz)||1;
    const sp=SPEED*dt*0.9;
    camera.position.x += (mx/len)*sp;
    camera.position.z += (mz/len)*sp;
    // Clamp room
    if(G.rooms&&G.rooms[G.curRoom]){
      const rd=G.rooms[G.curRoom].def;
      const mg=0.55;
      const hx=rd.size.w/2-mg, hz=rd.size.d/2-mg;
      camera.position.x=Math.max(-hx, Math.min(hx, camera.position.x));
      camera.position.z=Math.max(-hz, Math.min(hz, camera.position.z));
    }
  }

  // Highlight laser when aiming at interactable
  vrControllers.forEach(ctrl=>{
    const tip = ctrl.getObjectByName('vr-tip');
    const ray = ctrl.getObjectByName('vr-ray');
    if(!tip) return;
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3(0,0,-1);
    ctrl.getWorldPosition(origin);
    direction.transformDirection(ctrl.matrixWorld);
    raycaster.set(origin, direction);
    raycaster.far = 3.5;
    const targets=[...boxMeshes.filter(Boolean),...Object.values(zoneMeshes)];
    const hits=raycaster.intersectObjects(targets,true);
    if(hits.length && hits[0].distance < 3.5){
      tip.material.color.setHex(0xffd24a);
      if(ray) ray.material.color.setHex(0xffd24a);
      tip.position.z = -Math.min(hits[0].distance, 2.5);
    } else {
      tip.material.color.setHex(0x88ccff);
      if(ray) ray.material.color.setHex(0x88ccff);
      tip.position.z = -2.5;
    }
  });
}

// ══════════════════════════════════════════════════════
//  SC-B03 + VR controls (HID mouse/keyboard + on-screen stick)
// ══════════════════════════════════════════════════════
let scLastX=null, scLastY=null;
let scMoveX=0, scMoveY=0;
let scMoveDecayTimer=null;
let vrStickActive=false;

function scSetWalk(x, y){
  scMoveX = Math.max(-1, Math.min(1, x));
  scMoveY = Math.max(-1, Math.min(1, y));
  walkInput.x = scMoveX;
  walkInput.y = scMoveY;
  window._shineconPad = { x: scMoveX, y: scMoveY };
  window._gpMove = { x: scMoveX, y: scMoveY };
}

function scRemoteInteract(){
  if(!gameActive) return;
  try{ onInteract(); }catch(e){ console.warn(e); }
}

function setupVRScreenControls(){
  const root = document.getElementById('vr-controls');
  const base = document.getElementById('vr-stick-base');
  const knob = document.getElementById('vr-stick-knob');
  const btn = document.getElementById('vr-action-btn');
  if(!root || !base || !knob){
    console.warn('VR controls missing in DOM');
    return;
  }

  root.classList.add('show');
  root.style.display = 'block';
  root.style.pointerEvents = 'none';
  base.style.pointerEvents = 'auto';
  if(btn) btn.style.pointerEvents = 'auto';

  const setKnob = (nx, ny)=>{
    knob.style.transform = `translate(${nx*36}px, ${ny*36}px)`;
  };
  const fromEvent = (e)=>{
    const r = base.getBoundingClientRect();
    const cx = r.left + r.width/2, cy = r.top + r.height/2;
    const t = (e.touches && e.touches[0]) || (e.changedTouches && e.changedTouches[0]) || e;
    if(!t || t.clientX===undefined) return;
    let dx = (t.clientX - cx) / (r.width*0.45);
    let dy = (t.clientY - cy) / (r.height*0.45);
    const mag = Math.hypot(dx, dy) || 1;
    if(mag > 1){ dx/=mag; dy/=mag; }
    scSetWalk(dx, dy);
    setKnob(dx, dy);
  };
  const endStick = (e)=>{
    vrStickActive=false;
    scSetWalk(0,0);
    setKnob(0,0);
  };

  const startStick = (e)=>{
    vrStickActive=true;
    e.preventDefault();
    e.stopPropagation();
    fromEvent(e);
  };
  const moveStick = (e)=>{
    if(!vrStickActive) return;
    e.preventDefault();
    e.stopPropagation();
    fromEvent(e);
  };

  // Bind once
  if(!base._vrBound){
    base._vrBound = true;
    base.addEventListener('touchstart', startStick, {passive:false});
    base.addEventListener('touchmove', moveStick, {passive:false});
    base.addEventListener('touchend', endStick, {passive:false});
    base.addEventListener('touchcancel', endStick, {passive:false});
    base.addEventListener('mousedown', startStick);
    window.addEventListener('mousemove', (e)=>{ if(vrStickActive) moveStick(e); });
    window.addEventListener('mouseup', endStick);
  }

  if(btn && !btn._vrBound){
    btn._vrBound = true;
    const fire = (e)=>{ e.preventDefault(); e.stopPropagation(); scRemoteInteract(); };
    btn.addEventListener('click', fire);
    btn.addEventListener('touchstart', fire, {passive:false});
  }
}

function hideVRScreenControls(){
  const root = document.getElementById('vr-controls');
  if(root) root.classList.remove('show');
  scSetWalk(0,0);
}

function setupShineconHID(){
  if(window._scHIDBound) return;
  window._scHIDBound = true;

  // SC-B03 = Bluetooth mouse + keyboard on most phones
  const onMove = (e)=>{
    if(!mobileVR || !gameActive) return;
    if(vrStickActive) return; // on-screen stick has priority
    let dx = e.movementX, dy = e.movementY;
    if(dx===undefined || (dx===0 && dy===0 && e.clientX!=null)){
      if(scLastX!=null){
        dx = e.clientX - scLastX;
        dy = e.clientY - scLastY;
      } else { dx=0; dy=0; }
    }
    if(e.clientX!=null){ scLastX=e.clientX; scLastY=e.clientY; }
    if(dx||dy){
      // accumulate
      scMoveX = Math.max(-1, Math.min(1, scMoveX + dx*0.05));
      scMoveY = Math.max(-1, Math.min(1, scMoveY + dy*0.05));
      scSetWalk(scMoveX, scMoveY);
      clearTimeout(scMoveDecayTimer);
      scMoveDecayTimer = setTimeout(()=>{ scSetWalk(0,0); }, 200);
    }
  };

  const onDown = (e)=>{
    if(!mobileVR || !gameActive) return;
    // Ignore clicks on the on-screen stick/button (they have their own handlers)
    const t = e.target;
    if(t && (t.id==='vr-stick-base'||t.id==='vr-stick-knob'||t.id==='vr-action-btn'||t.closest?.('#vr-controls'))) return;
    if(e.button===0 || e.type==='click' || e.type==='pointerdown'){
      // Don't steal if clicking UI
      scRemoteInteract();
    }
  };

  const onKey = (e)=>{
    if(!mobileVR || !gameActive) return;
    const c=e.code||'', k=e.key||'';
    // Confirmation / A
    if(c==='Enter'||c==='NumpadEnter'||c==='Space'||k==='Enter'||k===' '||
       c==='MediaPlayPause'||c==='AudioVolumeUp'||c==='AudioVolumeDown'||
       k==='a'||k==='A'||c==='KeyA'||e.keyCode===13||e.keyCode===32){
      e.preventDefault();
      scRemoteInteract();
      return;
    }
    if(k==='x'||k==='X'||c==='KeyX'){ if(carriedItem) rotateCarriedItem(-Math.PI/4); else scRemoteInteract(); return; }
    if(k==='b'||k==='B'||k==='y'||k==='Y'||c==='KeyB'||c==='KeyY'){
      if(carriedItem) rotateCarriedItem(Math.PI/4); else scRemoteInteract(); return;
    }
    if(c==='ArrowUp'){ keys['ArrowUp']=true; e.preventDefault(); }
    if(c==='ArrowDown'){ keys['ArrowDown']=true; e.preventDefault(); }
    if(c==='ArrowLeft'){ keys['ArrowLeft']=true; e.preventDefault(); }
    if(c==='ArrowRight'){ keys['ArrowRight']=true; e.preventDefault(); }
  };
  const onKeyUp = (e)=>{
    const c=e.code||'';
    if(c==='ArrowUp') keys['ArrowUp']=false;
    if(c==='ArrowDown') keys['ArrowDown']=false;
    if(c==='ArrowLeft') keys['ArrowLeft']=false;
    if(c==='ArrowRight') keys['ArrowRight']=false;
  };

  // Capture phase — must receive events even in fullscreen
  document.addEventListener('pointermove', onMove, true);
  document.addEventListener('mousemove', onMove, true);
  document.addEventListener('pointerdown', onDown, true);
  document.addEventListener('mousedown', onDown, true);
  document.addEventListener('click', onDown, true);
  document.addEventListener('keydown', onKey, true);
  document.addEventListener('keyup', onKeyUp, true);
  // Some Android remotes fire these
  document.addEventListener('keypress', onKey, true);
}

function teardownShineconHID(){
  hideVRScreenControls();
  scLastX=null; scLastY=null; scSetWalk(0,0);
}

function updateShineconVR(dt){
  if(!mobileVR || !gameActive) return;

  // Poll gamepad every frame (in case SC-B03 appears as gamepad on some ROMs)
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for(let i=0;i<pads.length;i++){
    const gp = pads[i];
    if(!gp || !gp.connected) continue;
    gamepadIndex = i;
    const axes = gp.axes||[];
    let mx=0, my=0;
    for(const [ai,aj] of [[0,1],[2,3],[1,0]]){
      const x=Number(axes[ai]||0), y=Number(axes[aj]||0);
      if(Math.abs(x)>0.08||Math.abs(y)>0.08){ mx=x; my=y; break; }
    }
    if(mx||my) scSetWalk(mx*1.4, my*1.4);
    for(let b=0;b<(gp.buttons||[]).length;b++){
      if(gpJustPressed(gp,b)){
        scRemoteInteract();
        break;
      }
    }
    break;
  }

  // Keep applying HID stick values into movement
  if(scMoveX||scMoveY){
    window._gpMove = { x: scMoveX, y: scMoveY };
    window._shineconPad = { x: scMoveX, y: scMoveY };
  }
}

function updateGamepad(dt){
  // DualShock / PS4 (DGP-2016), Xbox, Shinecon SC-B03, generic
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  let gp = null;
  for(let i=0;i<pads.length;i++){
    if(pads[i] && pads[i].connected){ gp=pads[i]; gamepadIndex=i; break; }
  }

  if(!gp){
    if(window._shineconPad){
      window._gpMove = { x: window._shineconPad.x||0, y: window._shineconPad.y||0 };
    }
    return;
  }

  const a = gp.axes || [];
  const n = a.length;
  const nb = (gp.buttons||[]).length;
  const id = (gp.id || '').toLowerCase();

  // Detect controller family
  const isPS = id.includes('dualshock') || id.includes('dualsense') ||
               id.includes('playstation') || id.includes('wireless controller') ||
               id.includes('dgp-') || id.includes('054c') || // Sony vendor
               id.includes('saves') || id.includes('ps4') || id.includes('ps5');
  // SC-B03 + any small Bluetooth VR remote
  const isShinecon = !isPS && (
    id.includes('shine') || id.includes('sc-b') || id.includes('b03') ||
    id.includes('vr remote') || id.includes('cardboard') ||
    id.includes('remote') || id.includes('hid') ||
    (n<=4 && nb<=16) ||
    (mobileVR && n<=6) // in Shinecon VR mode, prefer remote mapping
  );
  const isConsole = isPS || id.includes('xbox') || id.includes('xinput') || (!isShinecon && n>=4 && nb>=12);

  function axisRaw(i){
    if(i<0 || i>=n) return 0;
    const v = Number(a[i]);
    if(isNaN(v)) return 0;
    // Touchpad on SC-B03 is less precise — smaller deadzone in VR
    const dead = (mobileVR || isShinecon) ? 0.12 : GP_DEAD;
    return Math.abs(v) < dead ? 0 : Math.max(-1, Math.min(1, v));
  }

  // —— STICKS ——
  // Standard (PS4/Xbox): 0,1 left · 2,3 right
  let lx = axisRaw(0), ly = axisRaw(1);
  let rx = axisRaw(2), ry = axisRaw(3);
  // Some browsers map DS4 right stick to 2,5
  if(isConsole && rx===0 && ry===0 && n>=6){
    if(axisRaw(2)||axisRaw(5)){ rx=axisRaw(2); ry=axisRaw(5); }
  }
  // Shinecon SC-B03: touchpad = walk (axes 0,1 or 2,3)
  if(isShinecon || mobileVR){
    rx=0; ry=0;
    if(lx===0 && ly===0){
      if(n>=4){ lx=axisRaw(2); ly=axisRaw(3); }
      if(lx===0 && ly===0 && n>=2){ lx=axisRaw(0); ly=axisRaw(1); }
    }
  }

  // —— LOOK (right stick) — always on console pads ——
  if(!mobileVR && isConsole && (rx||ry)){
    const lookSp = GP_LOOK_SPEED * (isPS ? 1.15 : 1);
    yaw   -= rx * lookSp * dt;
    pitch -= ry * lookSp * dt;
    pitch  = Math.max(-1.4, Math.min(1.4, pitch));
  }

  if(camera && !mobileVR){
    camera.rotation.order='YXZ';
    camera.rotation.y=yaw;
    camera.rotation.x=pitch;
    camera.rotation.z=0;
  }

  // —— MOVE (left stick + D-pad) ——
  // In mobile VR, on-screen stick / SC-B03 owns walkInput — don't zero it
  if(!mobileVR){
    window._gpMove = { x: lx, y: ly };
    if(gpPressed(gp,12)) window._gpMove.y = -1;
    if(gpPressed(gp,13)) window._gpMove.y =  1;
    if(gpPressed(gp,14)) window._gpMove.x = -1;
    if(gpPressed(gp,15)) window._gpMove.x =  1;
    if(lx||ly){ walkInput.x=lx; walkInput.y=ly; }
    else if(!keys['KeyW']&&!keys['KeyA']&&!keys['KeyS']&&!keys['KeyD']&&
            !keys['ArrowUp']&&!keys['ArrowDown']&&!keys['ArrowLeft']&&!keys['ArrowRight']){
      // only clear if no keys held
      if(Math.abs(walkInput.x)<0.05 && Math.abs(walkInput.y)<0.05){
        walkInput.x=0; walkInput.y=0;
      }
    }
  } else if(lx||ly){
    // VR: only apply if gamepad actually has stick deflection
    scSetWalk(lx, ly);
  }

  // —— BUTTONS ——
  // PS4: 0=✕ Cross, 1=○ Circle, 2=□ Square, 3=△ Triangle
  //      4=L1, 5=R1, 6=L2, 7=R2, 8=Share, 9=Options
  // Xbox: 0=A, 1=B, 2=X, 3=Y
  if(isConsole){
    // Cross / A → interact
    if(gpJustPressed(gp,0) && gameActive) onInteract();
    // Circle / B → interact alternate
    if(gpJustPressed(gp,1) && gameActive) onInteract();
    // Square / X → rotate item left
    if(gpJustPressed(gp,2) && carriedItem) rotateCarriedItem(-Math.PI/4);
    // Triangle / Y → rotate item right
    if(gpJustPressed(gp,3) && carriedItem) rotateCarriedItem(Math.PI/4);
    // L1 / R1 rotate
    if(gpJustPressed(gp,4) && carriedItem) rotateCarriedItem(-Math.PI/4);
    if(gpJustPressed(gp,5) && carriedItem) rotateCarriedItem(Math.PI/4);
    // Options / Start → tip
    if(gpJustPressed(gp,9) || gpJustPressed(gp,8)){
      notify(isPS
        ? '🎮 PS4: Stick Esq=andar | Dir=olhar | ✕=interagir | □/△=girar'
        : '🎮 Stick Esq=andar | Dir=olhar | A=interagir | X/Y=girar','good');
    }
    // Touchpad click on DS4 is often button 17
    if(gpJustPressed(gp,17) && gameActive) onInteract();
  } else if(isShinecon || mobileVR){
    // SC-B03 (box labels):
    //  1/2/3 confirmation (touchpad click) → INTERACT
    //  6 A → INTERACT
    //  7 X → rotate left
    //  8 B → rotate right
    //  9 Y → rotate right
    // Firmware button indices vary; map broadly so confirmation always works in VR
    let confirmed = false;
    // Confirmation + A (interact)
    for(const b of [0,1,2,3,4,5,6]){
      if(gpJustPressed(gp,b) && gameActive){
        onInteract();
        confirmed = true;
        break;
      }
    }
    // X rotate
    if((gpJustPressed(gp,7)||gpJustPressed(gp,3)||gpJustPressed(gp,9)) && carriedItem){
      rotateCarriedItem(-Math.PI/4);
    }
    // B / Y rotate
    if((gpJustPressed(gp,8)||gpJustPressed(gp,5)||gpJustPressed(gp,10)||gpJustPressed(gp,1)) && carriedItem){
      rotateCarriedItem(Math.PI/4);
    }
    // Last resort: any button in VR = interact
    if(!confirmed && mobileVR && gameActive){
      const blen = (gp.buttons||[]).length;
      for(let b=0;b<blen;b++){
        if(gpJustPressed(gp,b)){ onInteract(); break; }
      }
    }
  } else {
    // Generic fallback
    if(gpJustPressed(gp,0) && gameActive) onInteract();
    if(gpJustPressed(gp,1) && gameActive) onInteract();
    if(gpJustPressed(gp,2) && carriedItem) rotateCarriedItem(-Math.PI/4);
    if(gpJustPressed(gp,3) && carriedItem) rotateCarriedItem(Math.PI/4);
    // Any remaining face button as confirm
    for(const b of [4,5,6,7,8,9]){
      if(gpJustPressed(gp,b) && gameActive){ onInteract(); break; }
    }
  }
}

function updateMovement(dt){
  if(!camera) return;
  // Look
  if(!mobileVR){
    camera.rotation.order='YXZ';
    camera.rotation.y=yaw;
    camera.rotation.x=pitch;
    camera.rotation.z=0;
  } else {
    // yaw/pitch already set by gyro
    camera.rotation.order='YXZ';
    camera.rotation.y=yaw;
    camera.rotation.x=pitch;
    camera.rotation.z=0;
  }
  if(!gameActive) return;

  const sin=Math.sin(yaw), cos=Math.cos(yaw);
  const fwdX=-sin, fwdZ=-cos;
  const rgtX= cos, rgtZ=-sin;

  // Merge all input sources into walkInput (do not zero stick while held)
  let ix = walkInput.x || 0;
  let iy = walkInput.y || 0;

  if(keys['KeyW']||keys['ArrowUp'])    iy -= 1;
  if(keys['KeyS']||keys['ArrowDown'])  iy += 1;
  if(keys['KeyA']||keys['ArrowLeft'])  ix -= 1;
  if(keys['KeyD']||keys['ArrowRight']) ix += 1;

  if(window._gpMove){
    if(Math.abs(window._gpMove.x)>0.05) ix += window._gpMove.x;
    if(Math.abs(window._gpMove.y)>0.05) iy += window._gpMove.y;
  }
  if(window._shineconPad){
    if(Math.abs(window._shineconPad.x)>0.05) ix += window._shineconPad.x;
    if(Math.abs(window._shineconPad.y)>0.05) iy += window._shineconPad.y;
  }

  // Clamp input
  ix = Math.max(-1.5, Math.min(1.5, ix));
  iy = Math.max(-1.5, Math.min(1.5, iy));

  let mx = (-iy)*fwdX + ix*rgtX;
  let mz = (-iy)*fwdZ + ix*rgtZ;

  if(mx!==0 || mz!==0){
    const len=Math.hypot(mx,mz)||1;
    const sp=SPEED*dt*(mobileVR?1.15:1);
    camera.position.x += (mx/len)*sp;
    camera.position.z += (mz/len)*sp;
  }

  if(G.rooms&&G.rooms[G.curRoom]){
    const rd=G.rooms[G.curRoom].def;
    const mg=0.5;
    const hx=rd.size.w/2-mg, hz=rd.size.d/2-mg;
    camera.position.x=Math.max(-hx, Math.min(hx, camera.position.x));
    camera.position.z=Math.max(-hz, Math.min(hz, camera.position.z));
    checkDoorExit(rd);
  }
  camera.position.y=1.6;
}

// The exit door of every indoor room sits on the right wall (x=w/2-.03),
// centered at z=3.0 — see the buildDoor(...) call in buildRoom. Walking
// into that doorway advances to the next room if it's been unlocked.
function checkDoorExit(rd){
  if(doorTransitioning||rd.outdoor)return;
  const doorX=rd.size.w/2-.03, doorZ=3.0;
  const nearDoor=camera.position.x>rd.size.w/2-1.05 && Math.abs(camera.position.z-doorZ)<0.65;
  if(!nearDoor)return;
  const nextIdx=G.curRoom+1;
  const next=G.rooms[nextIdx];
  if(next&&next.unlocked){
    doorTransitioning=true;
    notify('🚪 Saindo pela porta...','good');
    setTimeout(()=>{
      switchRoom(nextIdx);
      setTimeout(()=>{doorTransitioning=false;},700);
    },550);
  }else if(next&&!next.unlocked){
    const now=Date.now();
    if(now-lastLockedDoorNotify>2500){
      lastLockedDoorNotify=now;
      notify('🔒 Organize mais este cômodo para destrancar a porta','danger');
    }
  }
}

// ══════════════════════════════════════════════════════
//  RAYCASTING
// ══════════════════════════════════════════════════════
function clearHoveredGhost(){
  if(hoveredGhost){hoveredGhost.scale.set(1,1,1);hoveredGhost=null;}
}

function updateLookTarget(){
  raycaster.setFromCamera(new THREE.Vector2(0,0),camera);
  // Include placed item meshes so player can pick a specific one
  const placedTargets=[];
  if(sceneRoot){
    sceneRoot.traverse(o=>{
      if(o.userData && o.userData.isPlacedItem && o.userData.itemId) placedTargets.push(o);
    });
  }
  const targets=[...boxMeshes.filter(Boolean),...Object.values(zoneMeshes),...placedTargets];
  const hits=raycaster.intersectObjects(targets,true);
  const hint=document.getElementById('interact-hint');
  const ht=document.getElementById('hint-text');
  const xh=document.getElementById('crosshair');
  xh.className='';

  if(hits.length&&hits[0].distance<3.8){
    // Prefer placed item if present in hits
    let obj=hits[0].object;
    for(const h of hits){
      if(h.distance>3.8)break;
      let o=h.object;
      while(o && !(o.userData && o.userData.isPlacedItem && o.userData.itemId)) o=o.parent;
      if(o && o.userData && o.userData.isPlacedItem){ obj=o; break; }
      if(h.object.userData && h.object.userData.isBox){ obj=h.object; break; }
    }
    if(obj.userData && obj.userData.isPlacedItem && obj.userData.itemId && !carriedItem){
      clearHoveredGhost();
      lookTarget={type:'placed', itemId:obj.userData.itemId, zoneId:obj.userData.zoneId};
      const room=G.rooms[G.curRoom];
      const pl=room?.placed?.[obj.userData.itemId];
      ht.textContent=`Pegar ${pl?.item?.e||''} ${pl?.item?.n||'item'}`;
      hint.classList.add('show');
      xh.className='hot';
      return;
    }
    if(obj.userData.isBox){
      clearHoveredGhost();
      const bi=obj.userData.boxIdx;
      lookTarget={type:'box',boxIdx:bi};
      const bd=G.rooms[G.curRoom].boxes[bi];
      if(!carriedItem&&bd&&bd.items.length>0){
        hint.classList.add('show');
        ht.textContent=`Abrir caixa ${bi+1} (${bd.items.length} item${bd.items.length>1?'s':''})`;
        xh.classList.add('hot');
      }else{hint.classList.remove('show');}
    }else if(obj.userData.zoneId){
      const zid=obj.userData.zoneId;
      const rm=G.rooms[G.curRoom];
      const fDef=rm.def.furniture.find(f=>f.id===zid);
      const zLabel=fDef?.label||zid;
      const grp=zoneGroups[zid];
      let localPt={x:0,y:surfaceY(fDef||{}),z:0};
      if(grp && fDef){
        // Ray from camera through crosshair (screen center)
        const origin=camera.position.clone();
        const dir=new THREE.Vector3(); camera.getWorldDirection(dir);
        const elev=fDef.elevY||0;
        const multi=['shelf','bookcase','closet','cabinet','bathcabinet','wallcabinet','fridge','counter'];
        const isMulti=multi.includes(fDef.type);
        const isOpen=!!zoneOpen[zid] || fDef.type==='shelf' || fDef.type==='bookcase';
        // Candidate Y planes in LOCAL space
        let planes;
        if(isMulti && isOpen){
          planes=shelfLevels(fDef);
        } else {
          planes=[surfaceY(fDef)];
        }
        // Pick plane whose ray intersection is closest to camera AND inside XZ bounds
        const hw=(fDef.size?.w||1)*0.49, hd=(fDef.size?.d||1)*0.49;
        let best=null, bestDist=Infinity;
        planes.forEach(localY=>{
          // World Y of this plane
          const worldY=elev+localY;
          if(Math.abs(dir.y)<0.0001) return;
          const t=(worldY-origin.y)/dir.y;
          if(t<=0.05 || t>6) return;
          const worldPt=origin.clone().addScaledVector(dir, t);
          const lp=grp.worldToLocal(worldPt.clone());
          if(Math.abs(lp.x)<=hw+0.05 && Math.abs(lp.z)<=hd+0.05){
            if(t<bestDist){
              bestDist=t;
              best={x:Math.max(-hw,Math.min(hw,lp.x)), y:localY+0.02, z:Math.max(-hd,Math.min(hd,lp.z))};
            }
          }
        });
        if(best){
          localPt=best;
        } else {
          // Fallback: project hit point XZ onto top surface
          const lp=grp.worldToLocal(hits[0].point.clone());
          localPt={
            x:Math.max(-hw,Math.min(hw,lp.x)),
            y:isMulti&&isOpen?snapToShelf(fDef,lp.y,true):surfaceY(fDef)+0.02,
            z:Math.max(-hd,Math.min(hd,lp.z))
          };
        }
      }
      if(carriedItem){
        clearHoveredGhost();
        lookTarget={type:'zone',zoneId:zid,slotIdx:0,localPt:{x:localPt.x,y:localPt.y,z:localPt.z}};
        hint.classList.add('show');
        ht.textContent=`Colocar aqui → ${zLabel}`;
        xh.classList.add('hot');
      }else{
        clearHoveredGhost();
        const openable=['closet','cabinet','bathcabinet','fridge','shed','nightstand','counter','desk','bigdesk','stove','microwave','grill','wallcabinet'];
        if(openable.includes(fDef?.type)){
          lookTarget={type:'openable',zoneId:zid};
          const isOpen=!!zoneOpen[zid];
          hint.classList.add('show');ht.textContent=isOpen?`Fechar: ${zLabel}`:`Abrir: ${zLabel}`;xh.classList.add('hot');
        }else{
          lookTarget={type:'zone',zoneId:zid};
          const ph=Object.values(rm.placed).filter(p=>p.zone===zid);
          if(ph.length>0){
            hint.classList.add('show');ht.textContent=`Mover item de: ${zLabel}`;xh.classList.add('move');
          }else{hint.classList.remove('show');}
        }
      }
    }
  }else{clearHoveredGhost();lookTarget=null;hint.classList.remove('show');}
}

// ══════════════════════════════════════════════════════
//  INTERACTION
// ══════════════════════════════════════════════════════
function onInteract(){
  if(!lookTarget)return;
  const room=G.rooms[G.curRoom];

  if(lookTarget.type==='placed'&&!carriedItem){
    const id=lookTarget.itemId;
    const pl=room.placed[id];
    if(!pl)return;
    const item=pl.item;
    const zid=pl.zone;
    delete room.placed[id];
    // refund points roughly
    if(pl.pts){room.score=Math.max(0,(room.score||0)-pl.pts);G.score=Math.max(0,G.score-pl.pts);G.placed=Math.max(0,G.placed-1);}
    arrangeSlot(zid,room);
    carriedItem=item;
    carriedRotY=pl.rotY||0;
    showCarryCard(item);showGhosts(item);updateHandMesh();
    updateUI();
    notify(`📦 Pegou ${item.e} ${item.n}`,'');
    saveProgressToAccount();
    return;
  }

  if(lookTarget.type==='openable'&&!carriedItem){
    const zid=lookTarget.zoneId;
    zoneOpen[zid]=!zoneOpen[zid];
    animateDoors(zid, zoneOpen[zid]);
    const fDef=room.def.furniture.find(f=>f.id===zid);
    notify(zoneOpen[zid]?`🚪 ${fDef?.label||zid} aberto`:`🚪 ${fDef?.label||zid} fechado`,'');
    return;
  }

  if(lookTarget.type==='box'&&!carriedItem){
    const bi=lookTarget.boxIdx;
    const bd=room.boxes[bi];
    if(!bd||bd.items.length===0)return;
    const anim=boxOpenAnims[bi];
    if(!anim||anim.opening||anim.done){
      if(anim?.done)pickItemFromBox(bi,room);
      return;
    }
    anim.opening=true;
    anim.callback=()=>pickItemFromBox(bi,room);
    spawnBoxDust(bi);
  }

  else if(lookTarget.type==='zone'&&carriedItem){
    const zid=lookTarget.zoneId;
    const zone=room.def.furniture.find(f=>f.id===zid);
    const item=carriedItem;
    const occupied=Object.values(room.placed).filter(p=>p.zone===zid).map(p=>p.slotIdx);
    let si=lookTarget.slotIdx!==undefined?lookTarget.slotIdx:0;
    if(zone?.slots&&occupied.includes(si)){
      si=0;
      for(let i=0;i<zone.slots.length;i++){if(!occupied.includes(i)){si=i;break;}}
    }
    let localOffset=null, inside=false;
    if(lookTarget.localPt){
      // Use EXACT aim point — do not re-snap or override
      const halfW=(zone?.size?.w||1)*0.49, halfD=(zone?.size?.d||1)*0.49;
      const lx=Math.max(-halfW, Math.min(halfW, lookTarget.localPt.x));
      const lz=Math.max(-halfD, Math.min(halfD, lookTarget.localPt.z));
      const ly=lookTarget.localPt.y;
      const openTypes=['closet','cabinet','bathcabinet','fridge','shed','nightstand','counter','desk','bigdesk','stove','microwave','wallcabinet'];
      const multi=['shelf','bookcase'];
      if(multi.includes(zone.type)){
        inside=false;
      } else if(zoneOpen[zid] && openTypes.includes(zone.type) && ly < surfaceY(zone)-0.05){
        inside=true;
      } else {
        inside=false;
      }
      localOffset={x:lx, y:ly, z:lz};
    }else{
      localOffset={x:0, y:surfaceY(zone)+0.02, z:0};
    }
    const pts=calcScore(item,zid);
    const perfect=zid===item.bz,good=zid===item.az;
    room.placed[item.id]={item,zone:zid,slotIdx:si,pts,localOffset,inside,rotY:carriedRotY||0};
    room.score+=pts;G.score+=pts;G.placed++;
    startPlacementAnim(item,zid,si,room);
    setTimeout(()=>arrangeSlot(zid,room),ANIM_DURATION*800);
    addLog(item.e,item.n,pts,perfect,false);
    checkUnlock();updateUI();
    spawnParticles(perfect);
    carriedItem=null;carriedRotY=0;clearHandMesh();hideCarryCard();hideGhosts();
    saveProgressToAccount();
    const zLabel=zone?.label||zid;
    const slotLabel=inside?'Dentro':(zone?.slots?.[si]?.l||'');
    if(perfect)notify(`✨ Perfeito! ${item.n} → ${zLabel}${slotLabel?' — '+slotLabel:''} +${pts}pts`,'perfect');
    else if(good)notify(`👍 Bom lugar! ${item.n} → ${zLabel} +${pts}pts`,'good');
    else notify(`📦 ${item.n} → ${zLabel} +${pts}pts`,'');
    carriedItem=null;hideCarryCard();hideGhosts();checkVictory();
  }

  else if(lookTarget.type==='zone'&&!carriedItem){
    const zid=lookTarget.zoneId;
    const ph=Object.values(room.placed).filter(p=>p.zone===zid);
    if(ph.length===0)return;
    const toMove=ph[ph.length-1];
    G.score-=toMove.pts;room.score-=toMove.pts;G.placed--;
    delete room.placed[toMove.item.id];
    arrangeSlot(zid,room);
    carriedItem=toMove.item;
    showCarryCard(toMove.item);showGhosts(toMove.item);updateUI();
    notify(`🔄 ${toMove.item.n} retirado — coloque em outro lugar`,'');
    addLog(toMove.item.e,toMove.item.n,0,false,true);
  }
}


function clearHandMesh(){
  if(handMesh){
    if(handMesh.parent) handMesh.parent.remove(handMesh);
    handMesh=null;
  }
}
function makeHandViewmodel(side){
  // side: 1 = right, -1 = left
  const g = new THREE.Group();
  const skin = new THREE.MeshStandardMaterial({color:0xe8b898, roughness:0.75, metalness:0.05});
  const nail = new THREE.MeshStandardMaterial({color:0xf0d0c0, roughness:0.6});
  // Palm
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.035, 0.11), skin);
  palm.position.set(0, 0, 0); g.add(palm);
  // Fingers (4)
  for(let i=0;i<4;i++){
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.022, 0.055), skin);
    f.position.set((-0.03 + i*0.022)*side, 0.005, -0.075);
    f.rotation.x = -0.35;
    g.add(f);
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.018, 0.03), skin);
    tip.position.set((-0.03 + i*0.022)*side, 0.0, -0.11);
    tip.rotation.x = -0.55;
    g.add(tip);
  }
  // Thumb
  const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.025, 0.05), skin);
  thumb.position.set(0.055*side, 0.01, -0.02);
  thumb.rotation.y = -0.6*side;
  thumb.rotation.x = -0.3;
  g.add(thumb);
  // Wrist
  const wrist = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.06), skin);
  wrist.position.set(0, -0.01, 0.07); g.add(wrist);
  // Sleeve cuff
  const sleeve = new THREE.Mesh(
    new THREE.BoxGeometry(0.085, 0.05, 0.07),
    new THREE.MeshStandardMaterial({color:0x3a4a5c, roughness:0.85})
  );
  sleeve.position.set(0, -0.015, 0.12); g.add(sleeve);
  g.scale.set(side, 1, 1);
  return g;
}
function rotateCarriedItem(delta){
  carriedRotY = (carriedRotY + delta + Math.PI*2) % (Math.PI*2);
  if(handMesh){
    handMesh.traverse(o=>{
      if(o.userData && o.userData.isCarriedItem) o.rotation.y = carriedRotY;
    });
  }
}
function updateHandMesh(){
  clearHandMesh();
  if(!carriedItem || !camera) return;
  const root = new THREE.Group();
  // Right hand (main holding)
  const right = makeHandViewmodel(1);
  right.position.set(0.22, -0.32, -0.55);
  right.rotation.set(0.55, 0.25, -0.35);
  root.add(right);
  // Left hand (support)
  const left = makeHandViewmodel(-1);
  left.position.set(-0.12, -0.34, -0.58);
  left.rotation.set(0.5, -0.2, 0.4);
  root.add(left);
  // Item between hands
  const item = makeItemMesh(carriedItem);
  item.scale.setScalar(0.5);
  item.rotation.y = carriedRotY;
  item.position.set(0.06, -0.22, -0.52);
  item.rotation.x = 0.2;
  item.userData.isCarriedItem = true;
  root.add(item);
  camera.add(root);
  handMesh = root;
}

function pickItemFromBox(bi,room){
  const bd=room.boxes[bi];
  if(!bd||bd.items.length===0)return;
  const item=bd.items.shift();
  carriedItem=item;carriedRotY=0;
  showCarryCard(item);showGhosts(item);updateHandMesh();
  updateBoxGrid(G.curRoom);
  const bg=boxGroups[bi];
  if(bg){bg.traverse(c=>{if(c.userData.isArrowGrp)c.visible=bd.items.length>0;});}
  // Remove one preview mesh from interior
  const anim=boxOpenAnims[bi];
  if(anim?.interior && anim.interior.children.length){
    anim.interior.remove(anim.interior.children[anim.interior.children.length-1]);
  }
}

// ══════════════════════════════════════════════════════
//  BOX OPEN ANIMATION
// ══════════════════════════════════════════════════════
function animateDoors(zid, open){
  const doors=zoneDoorMeshes[zid];
  if(!doors)return;
  const ang = doors.openAngle||1.7;
  const isDrawer = doors.mode==='drawer';
  const isDrop = doors.mode==='drop';
  ['left','right'].forEach(side=>{
    const d=doors[side];
    if(!d)return;
    if(isDrawer){
      if(d.userData.baseZ===undefined) d.userData.baseZ = d.position.z;
      const dir = d.userData.slideDir!==undefined ? d.userData.slideDir : 1;
      d.userData.targetZ = d.userData.baseZ + (open ? dir*0.48 : 0);
      d.userData.animMode = 'drawer';
    }else if(isDrop){
      // drop = oven (down) or grill lid (up)
      if(d.userData.liftUp){
        d.userData.targetRotX = open ? -1.15 : 0; // open upward
      }else{
        d.userData.targetRotX = open ? 1.35 : 0; // oven opens down
      }
      d.userData.animMode = 'drop';
    }else{
      const dir = side==='left' ? -1 : 1;
      d.userData.targetRotY = open ? dir*ang : 0;
      d.userData.animMode = 'swing';
      if(open) d.rotation.y = dir * 0.4;
      else d.rotation.y = dir * (Math.abs(d.rotation.y)>0.05 ? d.rotation.y*0.5 : 0);
    }
    d.userData.animating = true;
  });
}
function updateDoorAnims(dt){
  Object.values(zoneDoorMeshes).forEach(doors=>{
    ['left','right'].forEach(side=>{
      const d=doors[side];
      if(!d||!d.userData.animating)return;
      if(d.userData.animMode==='drawer'){
        const target=d.userData.targetZ||0;
        const cur=d.position.z;
        const next=cur+(target-cur)*Math.min(1,dt*10);
        d.position.z=next;
        if(Math.abs(next-target)<0.005){d.position.z=target;d.userData.animating=false;}
      }else if(d.userData.animMode==='drop'){
        const target=d.userData.targetRotX||0;
        const cur=d.rotation.x;
        const next=cur+(target-cur)*Math.min(1,dt*9);
        d.rotation.x=next;
        if(Math.abs(next-target)<0.01){d.rotation.x=target;d.userData.animating=false;}
      }else{
        const target=d.userData.targetRotY||0;
        const cur=d.rotation.y;
        const next=cur+(target-cur)*Math.min(1,dt*10);
        d.rotation.y=next;
        if(Math.abs(next-target)<0.01){d.rotation.y=target;d.userData.animating=false;}
      }
    });
  });
}

function updateBoxAnims(dt){
  Object.entries(boxOpenAnims).forEach(([bi,a])=>{
    if(!a.opening||a.done)return;
    a.t+=dt;const prog=Math.min(1,a.t/.85);
    const ease=1-Math.pow(1-prog,3);
    // 4 independent flaps fold outward with stagger
    if(a.flaps && a.flaps.length){
      a.flaps.forEach((f,i)=>{
        const delay=i*0.08;
        const p=Math.max(0, Math.min(1, (prog-delay)/(1-delay*0.5)));
        const e=1-Math.pow(1-p,3);
        const ang=e*1.65*f.dir;
        if(f.axis==='x') f.g.rotation.x=ang;
        else f.g.rotation.z=ang;
      });
    } else if(a.flapMesh){
      a.flapMesh.rotation.x=-ease*1.55;
      a.flapMesh.position.y=ease*0.05;
    }
    if(a.sideFlaps){
      a.sideFlaps.forEach((sf,i)=>{
        sf.rotation.z = (i===0?1:-1) * ease * 1.2;
      });
    }
    if(prog>0.15 && a.interior) a.interior.visible=true;
    if(a.opening && boxGroups[bi]){
      boxGroups[bi].traverse(c=>{
        if(c.userData.isArrowGrp) c.visible = false;
      });
    }
    if(prog>=1&&!a.done){
      a.done=true;
      if(a.interior) a.interior.visible=true;
      if(a.callback)a.callback();
    }
  });
  const t=Date.now()*.0018;
  Object.values(slotGhosts).forEach(gs=>gs.forEach(g=>{
    if(!g.visible)return;
    g.children.forEach(c=>{
      if(c.userData.isArrow)c.position.y=.1+Math.sin(t)*.022;
      if(c.material&&c.material.opacity!==undefined)c.material.opacity=(.6+Math.sin(t+1)*.25)*g.children[0]?.material?.opacity||1;
    });
  }));
}

function spawnBoxDust(bi){
  const bg=boxGroups[bi];if(!bg)return;
  const wp=new THREE.Vector3();bg.getWorldPosition(wp);
  wp.project(camera);
  const sx=(wp.x*.5+.5)*innerWidth,sy=(-wp.y*.5+.5)*innerHeight;
  for(let i=0;i<6;i++){
    const p=document.createElement('div');
    p.textContent=['💨','✨','☁️','🌟'][i%4];
    p.style.cssText=`position:fixed;left:${sx}px;top:${sy}px;font-size:14px;pointer-events:none;z-index:300;--dx:${(Math.random()*80-40)}px;--dy:${(-40-Math.random()*40)}px;`;
    p.className='anim-particle';
    document.getElementById('anim-overlay').appendChild(p);
    setTimeout(()=>p.remove(),1100);
  }
}

// ══════════════════════════════════════════════════════
//  CARRY CARD & BOX GRID
// ══════════════════════════════════════════════════════
function showCarryCard(item){
  document.getElementById('carry-emoji').textContent=item.e;
  document.getElementById('carry-name').textContent=item.n;
  document.getElementById('carry-hint').textContent=`Ideal: ${item.h} · [R] girar`;
  const sl=document.getElementById('carry-slots');sl.innerHTML='';
  G.rooms[G.curRoom].def.furniture.forEach(f=>{
    if(f.type==='floor')return;
    const best=f.id===item.bz,good=f.id===item.az;
    if(best||good){
      const b=document.createElement('span');b.className='sb'+(best?' best':'');
      b.textContent=(best?'⭐ ':'👍 ')+f.label;sl.appendChild(b);
    }
  });
  document.getElementById('carry-card').classList.add('show');
}
function hideCarryCard(){document.getElementById('carry-card').classList.remove('show');clearHandMesh();}

function updateBoxGrid(ri){
  const room=G.rooms[ri];
  const grid=document.getElementById('bc-grid');grid.innerHTML='';
  room.boxes.forEach((bd,i)=>{
    const dot=document.createElement('div');
    const state=bd.items.length===0?'empty':boxOpenAnims[i]?.done?'open':'closed';
    dot.className='bc-dot '+state;
    dot.textContent=state==='empty'?'✓':state==='open'?'📭':'📦';
    grid.appendChild(dot);
  });
}

// ══════════════════════════════════════════════════════
//  ROOM / UI
// ══════════════════════════════════════════════════════
function switchRoom(ri){
  if(!G.rooms[ri].unlocked)return;
  G.curRoom=ri;carriedItem=null;hideCarryCard();hideGhosts();
  buildRoom(ri);
  const _rd=G.rooms[arguments[0]]?.def||G.rooms[G.curRoom]?.def; if(_rd) setTimeout(()=>sayRoomIntro(_rd.id),700);
  const spawnYaw=G.rooms[ri].def.outdoor?0:Math.PI;
  camera.position.set(0,1.6,G.rooms[ri].def.outdoor?4.5:4);yaw=spawnYaw;pitch=0;
  renderPills();updateUI();
}

function applyAdminFreeMap(){
  // Unlock every room + yard, free travel
  G.rooms.forEach(r=>{ r.unlocked=true; });
  G.yardUnlocked=true;
  G.houseDone=true;
  // Ensure yard room exists
  if(!G.rooms.find(r=>r.def.id==='yard')){
    const yardDef=ROOMS.find(r=>r.id==='yard');
    if(yardDef){
      G.rooms.push({def:yardDef,boxes:[],placed:{},score:0,unlocked:true});
      // still need box assignment for yard items
      const yardRoom=G.rooms[G.rooms.length-1];
      if(typeof distributeItems==='function'){
        // fallback: put all yard items in one box
      }
      const items=[...(yardDef.items||[])];
      const nBox=Math.max(1,(yardDef.boxPositions||[]).length);
      yardRoom.boxes=Array.from({length:nBox},()=>({items:[]}));
      items.forEach((it,i)=>yardRoom.boxes[i%nBox].items.push(it));
    }
  } else {
    G.rooms.forEach(r=>{ if(r.def.id==='yard') r.unlocked=true; });
  }
}

function checkUnlock(){
  G.rooms.forEach((r,i)=>{
    if(i===0)return;
    const prev=G.rooms[i-1];
    if(!r.unlocked&&Object.keys(prev.placed).length>=Math.ceil(prev.def.items.length*.5)){
      r.unlocked=true;notify(`🔓 ${r.def.name} desbloqueado!`,'good');renderPills();
    }
  });
  // House-complete check → unlock yard
  if(!G.yardUnlocked && housePlacedCount()>=houseTotal()){
    G.houseDone=true;
    unlockYard();
  }
}
function unlockYard(){
  if(G.yardUnlocked)return;
  G.yardUnlocked=true;
  const yardDef=ROOMS.find(r=>r.id==='yard');
  G.rooms.push({def:yardDef,boxes:[],placed:{},score:0,unlocked:true});
  G.total=activeRoomDefs().reduce((s,r)=>s+r.items.length,0);
  renderPills();updateUI();
  notify('🏡 Casa toda organizada! Quintal desbloqueado!','perfect');
  sayRandomLine(false,'Ufa, a casa tá pronta! Hora do quintal 🌿');
}
function checkVictory(){if(G.placed>=G.total)setTimeout(()=>showVictory(false),800);}

// ══════════════════════════════════════════════════════
//  TIMER / VISIT MODE
// ══════════════════════════════════════════════════════
let timerInterval=null;
function startTimer(){
  if(G.mode!=='visit')return;
  document.getElementById('timer-wrap').classList.add('show');
  clearInterval(timerInterval);
  timerInterval=setInterval(()=>{
    if(!gameActive||G.visitArrived)return;
    G.timeLeft--;
    updateTimerUI();
    if(G.timeLeft===30)notify('⏰ A visita chega em 30 segundos!','danger');
    if(G.timeLeft===10){notify('🚨 10 segundos!!','danger');sayRandomLine(true);}
    if(G.timeLeft<=0){
      G.timeLeft=0;updateTimerUI();
      triggerVisitArrival();
    }
  },1000);
}
function stopTimer(){clearInterval(timerInterval);timerInterval=null;}
function updateTimerUI(){
  const m=Math.floor(Math.max(0,G.timeLeft)/60),s=Math.max(0,G.timeLeft)%60;
  document.getElementById('timer-val').textContent=`${m}:${String(s).padStart(2,'0')}`;
  const wrap=document.getElementById('timer-wrap');
  if(G.timeLeft<=30&&G.mode==='visit')wrap.classList.add('warn');else wrap.classList.remove('warn');
}
function triggerVisitArrival(){
  if(G.visitArrived)return;
  G.visitArrived=true;
  stopTimer();
  const banner=document.getElementById('visit-banner');
  banner.classList.add('on');
  sayRandomLine(false,VISIT_ARRIVED_LINES[Math.floor(Math.random()*VISIT_ARRIVED_LINES.length)]);
  setTimeout(()=>banner.classList.remove('on'),3200);
  setTimeout(()=>showVictory(true),1600);
}

// ══════════════════════════════════════════════════════
//  SPEECH BUBBLE (random player lines)
// ══════════════════════════════════════════════════════
let speechTimer=null,speechHideTimer=null;
function sayRandomLine(urgent,forceLine){
  const pool=urgent?VISIT_LINES:IDLE_LINES;
  const line=forceLine||pool[Math.floor(Math.random()*pool.length)];
  const el=document.getElementById('speech');
  el.textContent=line;
  el.classList.add('on');
  clearTimeout(speechHideTimer);
  speechHideTimer=setTimeout(()=>el.classList.remove('on'),2400);
}
function scheduleSpeech(){
  clearTimeout(speechTimer);
  const delay=9000+Math.random()*9000;
  speechTimer=setTimeout(()=>{
    if(gameActive&&!G.visitArrived){
      const urgent=G.mode==='visit'&&G.timeLeft<=45&&G.timeLeft>0;
      sayRandomLine(urgent);
    }
    scheduleSpeech();
  },delay);
}

// ══════════════════════════════════════════════════════
//  VICTORY / LEADERBOARD SCREEN
// ══════════════════════════════════════════════════════
function maxPossibleScore(){
  return activeRoomDefs().reduce((s,r)=>s+r.items.reduce((ss,i)=>ss+i.bp,0),0);
}
async function showVictory(byVisit){
  gameActive=false;
  if(document.pointerLockElement)document.exitPointerLock();
  saveProgressToAccount();
  const rank=submitRankEntry();
  const maxPts=maxPossibleScore();
  const pct=Math.round(G.score/maxPts*100);
  const grade=pct>=90?'⭐⭐⭐':pct>=70?'⭐⭐':pct>=45?'⭐':'💔';
  const el=Math.round((Date.now()-G.startTime)/1000);
  const m=Math.floor(el/60),s=el%60;

  document.getElementById('v-title').textContent=byVisit?'🚪 A visita chegou!':'🏠 Casa Organizada!';
  document.getElementById('v-sub').textContent=byVisit?'Vamos ver como ficou a casa no tempo que deu...':(G.yardUnlocked?'Você desempacotou a casa inteira, quintal incluso!':'Você desempacotou tudo com sucesso');
  document.getElementById('v-score').textContent=G.score+' pts';
  document.getElementById('v-grade').textContent=grade;
  let bd='';
  G.rooms.forEach(r=>{bd+=`<div class="vrow"><span class="vk">${r.def.name}</span><span class="vv">${r.score} pts</span></div>`;});
  bd+=`<div class="vrow vbdr"><span class="vk">Precisão</span><span class="vv">${pct}%</span></div>`;
  bd+=`<div class="vrow"><span class="vk">Tempo</span><span class="vv">${m}:${String(s).padStart(2,'0')}</span></div>`;
  bd+=`<div class="vrow"><span class="vk">Modo</span><span class="vv">${G.mode==='visit'?'⏰ Visita Chegando':'🧘 Zen'}</span></div>`;
  document.getElementById('v-bd').innerHTML=bd;
  document.getElementById('btn-next').style.display=(!byVisit&&!G.yardUnlocked)?'none':'inline-block';
  document.getElementById('btn-next').textContent=byVisit?'Ver ranking':'Continuar';
  document.getElementById('victory').classList.add('on');

  // Save to leaderboard
  const entry={name:G.playerName||'Jogador',score:G.score,mode:G.mode,pct,ts:Date.now()};
  const result=await lbSave(entry);
  const rowsEl=document.getElementById('v-board-rows');
  const countEl=document.getElementById('v-board-count');
  const statusEl=document.getElementById('v-save-status');
  const idx=result.entries.findIndex(e=>e.ts===entry.ts&&e.score===entry.score&&e.name===entry.name);
  renderBoard(rowsEl,countEl,result.entries,idx);
  if(statusEl){
    statusEl.textContent=result.saved?'✅ Pontuação salva no ranking':'💾 Salvo neste dispositivo (ranking online indisponível agora)';
  }
}
function renderPills(){
  const el=document.getElementById('room-pills');el.innerHTML='';
  G.rooms.forEach((r,i)=>{
    const b=document.createElement('button');
    b.className='pill'+(i===G.curRoom?' active':'')+(r.unlocked?'':' locked');
    b.style.pointerEvents='auto';b.style.cursor=r.unlocked?'pointer':'default';
    b.textContent=(r.def.outdoor?'🌿 ':'')+r.def.name;
    if(r.unlocked)b.onclick=()=>switchRoom(i);
    el.appendChild(b);
  });
}
function updateUI(){
  document.getElementById('score-val').textContent=G.score;
  const pct=Math.round(G.placed/G.total*100);
  document.getElementById('prog-fill').style.width=pct+'%';
  document.getElementById('prog-pct').textContent=pct+'%';
}
function addLog(e,n,pts,perfect,moved){
  const el=document.getElementById('log');
  const d=document.createElement('div');
  d.className='lrow'+(perfect?' perf':moved?' moved':'');
  d.innerHTML=`<span class="le">${e}</span><span class="ln">${n}</span><span class="lp">${moved?'↩':'+'+(pts||'?')}</span>`;
  el.insertBefore(d,el.firstChild);
  while(el.children.length>7)el.removeChild(el.lastChild);
}
let ntTimer;
function notify(msg,type){
  const el=document.getElementById('notif');
  el.textContent=msg;el.className='on'+(type?' '+type:'');
  clearTimeout(ntTimer);ntTimer=setTimeout(()=>el.classList.remove('on'),2600);
}
function spawnParticles(perfect){
  const icons=perfect?['✨','⭐','💫','🎉','🌟']:['👍','✓'];
  const cx=innerWidth/2,cy=innerHeight/2;
  icons.forEach((ic,i)=>{
    const p=document.createElement('div');p.textContent=ic;
    p.style.cssText=`position:fixed;left:${cx}px;top:${cy}px;font-size:${perfect?22:16}px;pointer-events:none;z-index:400;opacity:1;transform:translateX(-50%) translateY(-50%);transition:transform 1s ease-out,opacity 1s ease-out;`;
    document.body.appendChild(p);
    requestAnimationFrame(()=>{
      const dx=(Math.random()*160-80),dy=-90-Math.random()*70;
      p.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(0.2)`;
      p.style.opacity='0';
    });
    setTimeout(()=>p.remove(),1050);
  });
}

// ══════════════════════════════════════════════════════
//  MAIN LOOP
// ══════════════════════════════════════════════════════
function animate(){
  const dt=Math.min(clock.getDelta(),.05);
  // If XR flag stuck but not actually presenting, clear it
  if(vrIsPresenting && !mobileVR && !(renderer.xr && renderer.xr.isPresenting)){
    vrIsPresenting = false;
  }
  updateVR(dt);
  updateGamepad(dt);
  if(mobileVR){
    applyMobileVROrientation();
    updateShineconVR(dt); // SC-B03: andar + interagir
    updateMovement(dt);
  } else if(!(renderer.xr && renderer.xr.isPresenting)){
    updateMovement(dt);
  }
  updateLookTarget();
  updateBoxAnims(dt);
  updatePlacementAnims(dt);
  updateDoorAnims(dt);
  updateDayCycle(dt);
  if(mobileVR){
    renderMobileStereo();
  } else {
    renderer.setScissorTest(false);
    renderer.render(scene,camera);
  }
}
function startRenderLoop(){
  // setAnimationLoop works for both desktop and WebXR
  if(renderer && renderer.setAnimationLoop){
    renderer.setAnimationLoop(animate);
  } else {
    const loop=()=>{ requestAnimationFrame(loop); animate(); };
    loop();
  }
}

// ══════════════════════════════════════════════════════
//  BOOT
// ══════════════════════════════════════════════════════
function webglOk(){try{const c=document.createElement('canvas');return!!(window.WebGLRenderingContext&&(c.getContext('webgl')||c.getContext('experimental-webgl')));}catch(e){return false;}}
function fatalErr(msg){document.getElementById('loading').innerHTML=`<div style="max-width:400px;text-align:center;padding:24px;line-height:1.7"><div style="font-size:36px;margin-bottom:12px">⚠️</div><div style="font-weight:800;font-size:16px;margin-bottom:10px">Não foi possível carregar</div><div style="color:rgba(255,255,255,.55);font-size:13px">${msg}</div></div>`;}

let gameBooted=false;
function boot(){
  if(typeof THREE==='undefined'){fatalErr('Three.js não pôde ser carregado.');return;}
  if(!webglOk()){fatalErr('Seu dispositivo não suporta WebGL.');return;}
  try{
    document.getElementById('loading').style.display='none';
    initThree();setupControls();
    refreshEntryBoard();
    initMusic();
    gameBooted=true;
  }catch(err){console.error(err);fatalErr('Erro inesperado: '+(err?.message||err));}
}

// ── Entry screen wiring ──
let chosenMode='zen';
document.querySelectorAll('.mode-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.mode-btn').forEach(b=>b.classList.remove('sel'));
    btn.classList.add('sel');chosenMode=btn.dataset.mode;
  });
});
const nameInput=document.getElementById('name-input');
const continueBtn=document.getElementById('entry-continue');
function validateName(){
  const n=nameInput.value.trim().length>0;
  const p=(document.getElementById('pass-input')?.value||'').trim().length>=3;
  continueBtn.disabled=!(n&&p);
}
nameInput.addEventListener('input',validateName);
document.getElementById('pass-input')?.addEventListener('input',validateName);
nameInput.addEventListener('keydown',e=>{if(e.key==='Enter'&&!continueBtn.disabled)continueBtn.click();});
continueBtn.addEventListener('click',()=>{
  const name=nameInput.value.trim().slice(0,16);
  const pass=(document.getElementById('pass-input')?.value||'').trim();
  const auth=authLoginOrRegister(name, pass);
  const msg=document.getElementById('auth-msg');
  if(!auth.ok){
    if(msg) msg.textContent=auth.msg;
    return;
  }
  if(msg) msg.textContent=auth.isAdmin
    ? '🛠️ Modo ADMIN ativo — mapa livre'
    : (auth.isNew?'Conta criada!':'Bem-vindo de volta, '+auth.name+'!');
  G.playerName=auth.name;
  G.isAdmin=!!auth.isAdmin;
  G.mode=chosenMode;
  G.timeLimitSec=300;
  G._loadSaved=!!auth.data?.progress && !auth.isAdmin;
  document.getElementById('entry').classList.add('hidden');
  document.getElementById('overlay').classList.remove('hidden');
  document.getElementById('logo').textContent=(G.isAdmin?'🛠️ ADMIN · ':'')+G.playerName+' 🏠';
  // Show rank preview
  const rank=getRankList();
  if(rank.length){
    console.log('Rank:', rank.slice(0,5));
  }
});

document.getElementById('start-btn').addEventListener('click',()=>{
  if(!gameBooted)return;
  document.getElementById('overlay').classList.add('hidden');
  initGame();
  if(G._loadSaved){
    const ok=loadProgressFromAccount();
    if(ok) notify('💾 Progresso carregado','');
    G._loadSaved=false;
  }
  if(G.isAdmin){
    applyAdminFreeMap();
    notify('🛠️ ADMIN — todos os cômodos liberados','good');
  }
  buildRoom(0);renderPills();updateUI();
  setTimeout(()=>sayRandomLine(false, STORY.blurb.slice(0,120)+'…'), 800);
  if(!animate.__running){animate.__running=true;startRenderLoop();}
  gameActive=true;tryLock();
  renderer.domElement.focus();
  startTimer();
  scheduleSpeech();
  tryStartMusic();
});
document.getElementById('btn-restart').addEventListener('click',()=>{
  document.getElementById('victory').classList.remove('on');
  document.getElementById('visit-banner').classList.remove('on');
  stopTimer();clearTimeout(speechTimer);
  gameActive=false;G.visitArrived=false;
  initGame();buildRoom(0);renderPills();updateUI();
  setTimeout(()=>sayRandomLine(false, STORY.blurb.slice(0,120)+'…'), 800);
  camera.position.set(0,1.6,4);yaw=Math.PI;pitch=0;
  document.getElementById('overlay').classList.remove('hidden');
});
document.getElementById('btn-next').addEventListener('click',()=>{
  document.getElementById('victory').classList.remove('on');
  document.getElementById('entry').classList.remove('hidden');
  refreshEntryBoard();
});
addEventListener('load',boot);
