
/* ---- Douyin covers (only with ?cover=wide|tall): episode art + road-sign hook, low centre ---- */
{const CV=new URLSearchParams(location.search).get('cover');
 if(CV){const W=CV==='wide'?1440:1080,H=CV==='wide'?1080:1440;for(const e of [document.documentElement,document.body]){e.style.width=W+'px';e.style.height=H+'px';}
  R.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();
  const cv=document.createElement('div');cv.id='cover';cv.className=CV;cv.innerHTML=`<div class="sign"><i style="left:26px;top:26px"></i><i style="right:26px;top:26px"></i><i style="left:26px;bottom:26px"></i><i style="right:26px;bottom:26px"></i>
   <div class="bar"></div><div class="l1">一脚轻刹车</div><div class="l2">堵停 <b>21</b> 辆车</div></div><div class="ser">VIBE知识大赏 · 《幽灵堵车》</div>`;document.body.appendChild(cv);
  window.coverAt=(T,cam,look)=>{window.renderAt(T);for(const b of BADGES){b.s.material.opacity=1;b.s.visible=true;b.s.scale.set(5.2,5.2,1);}
   camera.position.set(...cam);camera.lookAt(...look);R.render(S,camera);
   for(const id of ['chap','vms','km','card','sub','tb','flash','plaque','end','title','gauge'])if($(id))$(id).style.display='none';for(const o of LBS)o.el.style.display='none';};}}
