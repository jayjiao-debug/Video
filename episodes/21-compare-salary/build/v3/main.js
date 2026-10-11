import {T3 as THREE,thermal} from './thermal.js';
import {U} from './util.js';const {pr,eio,eo,lerp,cl}=U;
import {makeHook} from './s_hook.js';
import {makeLab} from './s_lab.js';
import {makeWall} from './s_wall.js';
import {makeWorlds} from './s_worlds.js';
import {makeStreet} from './s_street.js';
import {makeEnd} from './s_end.js';
THREE.ColorManagement.enabled=false;
const $=id=>document.getElementById(id);
const R=new THREE.WebGLRenderer({antialias:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});R.setPixelRatio(1);R.setSize(1920,1080);R.outputColorSpace=THREE.LinearSRGBColorSpace;R.autoClear=false;$('gl').appendChild(R.domElement);
const TH=thermal(R);
let SC=[];
const LINES=[[0,4.4,'你拿到人生第一份实习工资：[4000]'],[4.4,8.5,'开心了[整整三天]'],[8.5,12.5,'然后室友说：他的是[6000]'],[12.5,16.4,'你的4000，突然就[不香了]'],
 [20.6,24.7,'别怪自己。连[猴子]都这样'],[24.7,28.7,'科学家让卷尾猴，用小石子换[黄瓜]'],[28.7,32.8,'两只都换到黄瓜：[95%]照常交换'],[32.8,36.8,'可旁边那只，同样干活，换到[葡萄]'],[36.8,40.9,'这只就不干了：掉到[60%]'],[40.9,44.9,'旁边那只[啥也不干]就拿葡萄：只剩[20%]'],[44.9,48.9,'不是黄瓜变难吃了，是[旁边有葡萄]'],
 [48.98,53.0,'人呢？哈佛问过257个人一道题'],[53.0,57.0,'A世界：你年入5万，别人[2.5万]'],[57.0,61.1,'B世界：你年入10万，别人[20万]'],[61.1,65.1,'B多挣一倍，可[48%]的人选了A'],[65.2,69.2,'换成假期呢？[85%]的人只要自己多'],[69.2,73.2,'原来我们，偏偏在[钱]上最爱比'],
 [73.2,77.2,'2008年，一家报纸把加州大学的工资[放上了网]'],[77.2,81.3,'研究者提醒一部分员工：[可以去查同事]'],[81.4,85.4,'低于中位数的人：满意度[下降]'],[85.4,89.5,'而且[更想跳槽]'],[89.5,93.5,'高于中位数的人呢？[并没有更开心]'],[93.5,97.6,'比较这笔账，只有[比输的人]在痛'],
 [97.6,101.6,'还有研究发现：自己收入不变，[邻居]挣得越多'],[101.6,105.7,'人就[越不快乐]'],
 [105.7,109.7,'所以觉得穷，不一定是[钱少]'],[109.7,113.8,'是你身边，总有一颗[葡萄]'],[113.8,117.8,'比较是天性，但[跟谁比]，你能选'],[117.8,121.9,'跟去年的自己比，你[多了4000]'],[121.9,125.4,'你最常拿自己，跟[谁]比？']];
window.LINES=LINES;
window.renderAt=function(T){const s=SC.find(s=>T>=s.w[0]&&T<s.w[1])||SC[SC.length-1];const m=s.m;m.update(T);const P=m.params(T);R.clear();TH.render(m.scene,m.cam,P);
 $('hud').innerHTML=m.hud?m.hud(T,P):'';
 const L=LINES.find(l=>T>=l[0]&&T<l[1]);$('sub').innerHTML=L&&T<125.4?'<span>'+L[2].replace(/\[(.+?)\]/g,'<b>$1</b>')+'</span>':'';
 $('end').style.opacity=pr(T,125.4,126.4);};
await document.fonts.load('900 60px "Noto Sans CJK SC"');await document.fonts.load('900 60px "Noto Serif CJK SC"');await document.fonts.ready;
SC=[{w:[0,20.633],m:makeHook()},{w:[20.633,48.98],m:makeLab()},{w:[48.98,73.27],m:makeWorlds()},{w:[73.27,97.57],m:makeWall()},{w:[97.57,105.67],m:makeStreet()},{w:[105.67,130],m:makeEnd()}];window.SC=SC;
window.renderAt(0);window.READY=true;
