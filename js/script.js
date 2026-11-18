(function(){
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.getElementById('nav'), wa = document.getElementById('waFloat');

  document.getElementById('toggle').addEventListener('click',()=>nav.classList.toggle('open'));
  document.querySelectorAll('#menu a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
  document.getElementById('toTop').addEventListener('click',()=>window.scrollTo({top:0,behavior:reduce?'auto':'smooth'}));
  document.getElementById('ano').textContent = new Date().getFullYear();

  // Revelação ao rolar
  const io = new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} }),{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // Parallax + estados de scroll
  const px=[...document.querySelectorAll('[data-parallax]')];
  const links=[...document.querySelectorAll('#menu a[href^="#"]')];
  const secs=links.map(a=>document.querySelector(a.getAttribute('href')));
  let tick=false;
  function update(){
    const y=scrollY, vh=innerHeight;
    nav.classList.toggle('scrolled',y>40);
    wa.classList.toggle('show',y>vh*.6);
    let cur=0; secs.forEach((s,i)=>{ if(s && s.getBoundingClientRect().top<vh*.4) cur=i; });
    links.forEach((a,i)=>a.classList.toggle('active',i===cur));
    if(!reduce) px.forEach(el=>{
      const s=parseFloat(el.dataset.parallax), r=el.parentElement.getBoundingClientRect();
      if(r.bottom<-250||r.top>vh+250) return;
      el.style.transform=`translate3d(0,${(-(r.top+r.height/2-vh/2)*s).toFixed(1)}px,0)`;
    });
    tick=false;
  }
  addEventListener('scroll',()=>{ if(!tick){ requestAnimationFrame(update); tick=true; } },{passive:true});
  addEventListener('resize',update); update();

  // Gotejamento de chocolate
  (function(){
    const svg=document.getElementById('drips'); let rnd=11; const r=()=>(rnd=(rnd*9301+49297)%233280)/233280;
    let g='<g filter="url(#goo)" fill="#3e261d"><rect x="-20" y="0" width="1480" height="46"/>', x=12;
    while(x<1430){ const w=20+r()*26,h=26+r()*82,du=4+r()*5,dl=-r()*6;
      g+=`<rect class="dr" x="${x.toFixed(0)}" y="20" width="${w.toFixed(0)}" height="${h.toFixed(0)}" rx="${(w/2).toFixed(0)}" style="animation-duration:${du.toFixed(1)}s;animation-delay:${dl.toFixed(1)}s"/>`;
      x+=w+14+r()*40; }
    svg.insertAdjacentHTML('beforeend',g+'</g>');
  })();

  // Cards do topo: brilho que segue o mouse + inclinação 3D
  document.querySelectorAll('.acard').forEach(c=>{
    c.addEventListener('pointermove',e=>{
      if(e.pointerType!=='mouse') return;
      const b=c.getBoundingClientRect(), x=e.clientX-b.left, y=e.clientY-b.top;
      c.style.setProperty('--mx',x+'px'); c.style.setProperty('--my',y+'px');
      const rx=((y/b.height)-.5)*-8, ry=((x/b.width)-.5)*8;
      c.style.transform=`perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    c.addEventListener('pointerleave',()=>{c.style.transform='';});
  });

  // Cena do cookie (animada pelo scroll)
  const scene=document.getElementById('scene'), cookie=document.getElementById('cookie'), ring=document.getElementById('ring'), sceneCta=document.getElementById('sceneCta');
  const calls=[...document.querySelectorAll('.callout')], crumbBox=document.getElementById('crumbs');
  const ccols=['#c98f52','#e4b97e','#3e261d','#6b4434','#8e1a2e','#d9a86c'];
  const crumbs=[...Array(16)].map((_,k)=>{
    const el=document.createElement('i'), a=(k/16)*Math.PI*2+Math.random()*.5, sz=6+Math.random()*12;
    el.className='crumb'; el.style.width=sz+'px'; el.style.height=sz*(.7+Math.random()*.3)+'px'; el.style.background=ccols[k%ccols.length];
    crumbBox.appendChild(el); return {el,a,d:200+Math.random()*190,rot:Math.random()*540};
  });
  function sceneUpdate(){
    const r=scene.getBoundingClientRect(), vh=innerHeight;
    if(r.bottom<-50||r.top>vh+50) return;
    const p=Math.min(1,Math.max(0,-r.top/(r.height-vh)));
    cookie.style.transform=`translate3d(0,${((.5-p)*70).toFixed(1)}px,0) rotate(${(-40+p*400).toFixed(1)}deg) scale(${(.78+.32*Math.sin(Math.PI*p)).toFixed(3)})`;
    ring.style.transform=`rotate(${(-p*230).toFixed(1)}deg)`;
    const idx=p<.1?-1:p<.37?0:p<.64?1:p<.92?2:-1;
    calls.forEach((c,i)=>c.classList.toggle('on',i===idx));
    sceneCta.classList.toggle('on',p>.9);
    const o=Math.min(1,p*4)*(1-Math.max(0,(p-.85)*6)), e=1-Math.pow(1-p,2);
    const scale=innerWidth<700?.55:1;
    crumbs.forEach(c=>{
      const x=Math.cos(c.a)*c.d*e*scale, y=Math.sin(c.a)*c.d*e*scale+p*p*50;
      c.el.style.transform=`translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${(c.rot*p).toFixed(0)}deg)`; c.el.style.opacity=o.toFixed(2);
    });
  }
  if(!reduce){ addEventListener('scroll',()=>requestAnimationFrame(sceneUpdate),{passive:true}); addEventListener('resize',sceneUpdate); sceneUpdate(); }

  // Carrossel
  const track=document.getElementById('track'), n=track.children.length;
  let i=0, timer;
  const vis=()=>innerWidth>1020?3:(innerWidth>640?2:1);
  function go(k){
    const max=n-vis(); i=k>max?0:(k<0?max:k);
    const w=track.children[0].getBoundingClientRect().width;
    track.style.transform=`translateX(-${i*w}px)`;
  }
  const play=()=>{ clearInterval(timer); if(!reduce) timer=setInterval(()=>go(i+1),3800); };
  document.getElementById('next').onclick=()=>{go(i+1);play();};
  document.getElementById('prev').onclick=()=>{go(i-1);play();};
  addEventListener('resize',()=>go(0)); go(0); play();

  // Aberto / fechado (horário de Brasília)
  const st=document.getElementById('status');
  const now=new Date(Date.now()+(new Date().getTimezoneOffset()-180)*60000);
  const d=now.getDay(), m=now.getHours()*60+now.getMinutes();
  if(!(d!==2 && m>=690 && m<1140)){
    st.classList.add('closed');
    st.querySelector('span').textContent=(d===2||(d===1&&m>=1140))?'Fechado · reabrimos quarta às 11h30':(m<690?'Abrimos hoje às 11h30':'Fechado agora · abrimos amanhã 11h30');
  }
})();
