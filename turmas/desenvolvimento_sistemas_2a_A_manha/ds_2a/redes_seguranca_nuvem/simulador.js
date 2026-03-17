document.addEventListener('DOMContentLoaded',()=>{
 const rede=document.getElementById('rede');
 const svg=document.getElementById('cabos');
 const consoleBox=document.getElementById('console');
 let devices=[],links=[],mode='move',origem=null;
 let count={internet:0,firewall:0,switch:0,pc:0,server:0};
 const log=t=>{consoleBox.textContent+='
'+t;consoleBox.scrollTop=consoleBox.scrollHeight};
 const center=d=>({x:d.offsetLeft+d.offsetWidth/2,y:d.offsetTop+d.offsetHeight/2});
 document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>addDev(b.dataset.add));
 document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.mode;origem=null;log('> modo: '+mode)});
 document.getElementById('reset').onclick=resetAll;
 function addDev(type){count[type]++;const d=document.createElement('div');d.className='dispositivo '+type;d.textContent=type.toUpperCase()+count[type];d.style.left=Math.random()*1200+'px';d.style.top=Math.random()*450+'px';d.onclick=()=>clickDev(d);drag(d);rede.appendChild(d);devices.push(d);log('> '+d.textContent+' adicionado')}
 function clickDev(d){if(mode==='delete'){remDev(d);return}if(mode==='link'){if(!origem){origem=d;d.classList.add('selected')}else if(origem!==d){link(origem,d);origem.classList.remove('selected');origem=null}}}
 function link(a,b){const l=document.createElementNS('http://www.w3.org/2000/svg','line');update(l,a,b);l.setAttribute('stroke','#000');l.setAttribute('stroke-width','2');l.onclick=e=>{e.stopPropagation();if(mode==='delete')remLink(l)};svg.appendChild(l);links.push({a,b,l});log('> ligação '+a.textContent+' <-> '+b.textContent)}
 function update(l,a,b){const p1=center(a),p2=center(b);l.setAttribute('x1',p1.x);l.setAttribute('y1',p1.y);l.setAttribute('x2',p2.x);l.setAttribute('y2',p2.y)}
 function remDev(d){links=links.filter(x=>{if(x.a===d||x.b===d){x.l.remove();return false}return true});devices=devices.filter(x=>x!==d);d.remove();log('> '+d.textContent+' removido')}
 function remLink(l){links=links.filter(x=>{if(x.l===l){l.remove();return false}return true});log('> ligação removida')}
 function drag(d){let ox,oy;d.onmousedown=e=>{if(mode!=='move')return;ox=e.offsetX;oy=e.offsetY;document.onmousemove=m=>{d.style.left=(m.pageX-rede.offsetLeft-ox)+'px';d.style.top=(m.pageY-rede.offsetTop-oy)+'px';links.forEach(x=>update(x.l,x.a,x.b))};document.onmouseup=()=>document.onmousemove=null}}
 function resetAll(){svg.innerHTML='';devices.forEach(d=>d.remove());devices=[];links=[];origem=null;consoleBox.textContent='> console iniciado...'}
});