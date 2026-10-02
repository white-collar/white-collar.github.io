import{n as e,r as t,t as n}from"./common-DcWhnavj.js";import{a as r,d as i,f as a,i as o,l as s,n as c,o as l,r as u,u as d}from"./plot-BqFxNYwL.js";import{c as f,i as p,u as m}from"./linalg-Q8j_e_NO.js";e(),n(),a({models:{py:`import numpy as np

rng = np.random.default_rng(1)

# 1) Будь-яка модель, лінійна за параметрами: стовпці A — «базисні функції» від x.
#    Станція GNSS: висота = зсув + швидкість·t + річне коливання (sin і cos).
t = np.arange(0, 3.01, 1 / 12)                       # 3 роки щомісяця
up = 2 + 3.0 * t + 4 * np.sin(2 * np.pi * t) + 2 * np.cos(2 * np.pi * t) + rng.normal(0, 1.5, t.size)
A = np.column_stack([np.ones_like(t), t, np.sin(2 * np.pi * t), np.cos(2 * np.pi * t)])
theta = np.linalg.lstsq(A, up, rcond=None)[0]
amp = np.hypot(theta[2], theta[3])
print(f"швидкість {theta[1]:.2f} мм/рік, амплітуда річного коливання {amp:.2f} мм")

# 2) Коло через точки: x² + y² = 2x₀·x + 2y₀·y + c — лінійно за (x₀, y₀, c).
phi = np.linspace(0.3, 2.2, 7)
px = 3 + 2.5 * np.cos(phi) + rng.normal(0, 0.05, phi.size)
py = 2 + 2.5 * np.sin(phi) + rng.normal(0, 0.05, phi.size)
x0, y0, c = np.linalg.lstsq(np.column_stack([2 * px, 2 * py, np.ones_like(px)]), px**2 + py**2, rcond=None)[0]
print(f"коло: центр ({x0:.3f}; {y0:.3f}), радіус {np.sqrt(c + x0**2 + y0**2):.3f}")

# 3) Перенавчання: многочлени різних степенів, помилка на навчальних і на нових даних.
f = lambda x: np.sin(3 * x)
x_tr = np.linspace(0.1, 2.9, 12) + rng.uniform(-0.1, 0.1, 12)   # 12 точок для навчання
y_tr = f(x_tr) + rng.normal(0, 0.25, 12)
x_va = rng.uniform(0.1, 2.9, 200)                                # нові дані для перевірки
y_va = f(x_va) + rng.normal(0, 0.25, 200)
u = lambda x: 2 * x / 3 - 1                           # масштабуємо x у [−1, 1]
rmse = lambda r: np.sqrt(np.mean(r ** 2))
for deg in [0, 1, 2, 4, 6, 8, 10, 11]:
    V = np.vander(u(x_tr), deg + 1)
    w = np.linalg.lstsq(V, y_tr, rcond=None)[0]
    tr = rmse(y_tr - V @ w)
    va = rmse(y_va - np.vander(u(x_va), deg + 1) @ w)
    print(f"степінь {deg:2d}: RMSE навчання {tr:.3f}, RMSE на нових даних {va:.3f}")

# Те саме «по-машинному»:
#   from sklearn.pipeline import make_pipeline
#   from sklearn.preprocessing import PolynomialFeatures
#   from sklearn.linear_model import LinearRegression
#   model = make_pipeline(PolynomialFeatures(5), LinearRegression()).fit(x_tr[:, None], y_tr)
`,js:`// Загальний рецепт: обираємо базисні функції φⱼ(x), складаємо A[i][j] = φⱼ(xᵢ)
// і розв'язуємо звичайний МНК. Тут — через нормальні рівняння (задачі маленькі й добре обумовлені).
function fit(basis, xs, ys) {
  const A = xs.map((x) => basis.map((phi) => phi(x)));
  const k = basis.length;
  const N = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => A.reduce((s, r) => s + r[i] * r[j], 0)));
  const u = Array.from({ length: k }, (_, i) => A.reduce((s, r, m) => s + r[i] * ys[m], 0));
  // Метод Гаусса для N·θ = u.
  const M = N.map((row, i) => [...row, u[i]]);
  for (let c = 0; c < k; c++) {
    for (let i = c + 1; i < k; i++) {
      const f = M[i][c] / M[c][c];
      for (let j = c; j <= k; j++) M[i][j] -= f * M[c][j];
    }
  }
  const th = new Array(k).fill(0);
  for (let i = k - 1; i >= 0; i--) {
    let s = M[i][k];
    for (let j = i + 1; j < k; j++) s -= M[i][j] * th[j];
    th[i] = s / M[i][i];
  }
  return th;
}
const r3 = (arr) => arr.map((v) => +v.toFixed(3));

// 1) Парабола: траєкторія м'яча h(t) = h₀ + v₀·t − (g/2)·t².
const t = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8];
const h = [1.02, 2.63, 3.83, 4.66, 5.03, 5.06, 4.63, 3.84, 2.66, 1.13];
const [h0, v0, c] = fit([() => 1, (x) => x, (x) => x * x], t, h);
console.log("h₀, v₀ =", r3([h0, v0]), "  g =", +(-2 * c).toFixed(2), "м/с²");

// 2) Експонента y = a·e^(b·x) нелінійна за b, але ln y = ln a + b·x — вже пряма.
const x = [0, 1, 2, 3, 4, 5];
const y = [10.1, 6.0, 3.7, 2.2, 1.35, 0.82];
const [lnA, b] = fit([() => 1, (s) => s], x, y.map(Math.log));
console.log("a =", +Math.exp(lnA).toFixed(3), " b =", +b.toFixed(3), " (період напіврозпаду", +(Math.log(2) / -b).toFixed(2), ")");

// 3) Синусоїда з невідомою фазою: A·sin(x + φ) = P·sin x + Q·cos x — лінійно за P, Q.
const xs = [0, 1, 2, 3, 4, 5, 6];
const ys = xs.map((s, i) => 2 * Math.sin(s + 0.7) + [0.05, -0.1, 0.02, 0.08, -0.04, 0.03, -0.06][i]);
const [P, Q] = fit([Math.sin, Math.cos], xs, ys);
console.log("амплітуда =", +Math.hypot(P, Q).toFixed(3), " фаза =", +Math.atan2(Q, P).toFixed(3));
`}});function h(e,t=document){let n=t.querySelector(e);if(!n)throw Error(`Не знайдено ${e}`);return n}function g(e,t=3){let n=o(e,t);return n.includes(`,`)&&(n=n.replace(/0+$/,``).replace(/,$/,``)),n===`−0`&&(n=`0`),n.replace(`−`,`-`).replace(`,`,`{,}`)}var _=e=>Math.sqrt(e.reduce((e,t)=>e+t*t,0)/e.length);function v(e,t,n,r,i=300){let[a,o]=e.opts.y,s=(o-a)*2,c=``,l=!1;for(let u=0;u<=i;u++){let d=n+(r-n)*u/i,f=t(d);if(!Number.isFinite(f)||f<a-s||f>o+s){l=!1;continue}c+=`${l?`L`:`M`}${e.sx(d).toFixed(1)},${e.sy(f).toFixed(1)}`,l=!0}return c}var y=[{key:`1`,label:`1`,tex:`1`,f:()=>1},{key:`t`,label:`t`,tex:`t`,f:e=>e},{key:`t2`,label:`t²`,tex:`t^2`,f:e=>e*e},{key:`t3`,label:`t³`,tex:`t^3`,f:e=>e*e*e},{key:`sin`,label:`sin 2πt`,tex:`\\sin 2\\pi t`,f:e=>Math.sin(2*Math.PI*e)},{key:`cos`,label:`cos 2πt`,tex:`\\cos 2\\pi t`,f:e=>Math.cos(2*Math.PI*e)}];function b(){let e=h(`#w-basis`),n=h(`.plot`,e),a=[...e.querySelectorAll(`input[name="basis"]`)],s=[...e.querySelectorAll(`[data-preset]`)],c=h(`[data-out="eq"]`,e),l=h(`[data-out="A"]`,e),d=h(`[data-out="stats"]`,e),b=h(`[data-out="status"]`,e),x=m(11),S=(()=>{let e=Array.from({length:13},(e,t)=>t*.15);return{name:`ball`,t:e,y:e.map(e=>1+9*e-4.9*e*e+.15*p(x)),X:[0,1.9],Y:[0,6],xLabel:`t, с`,yLabel:`h, м`,start:[`1`,`t`],note:`Висота кинутого вгору м'яча. Фізика каже: h = h₀ + v₀t − gt²/2. Додайте t².`}})(),C={ball:S,gnss:(()=>{let e=Array.from({length:37},(e,t)=>t/12);return{name:`gnss`,t:e,y:e.map(e=>2+3*e+4*Math.sin(2*Math.PI*e)+2*Math.cos(2*Math.PI*e)+1.5*p(x)),X:[0,3],Y:[-6,18],xLabel:`t, роки`,yLabel:`мм`,start:[`1`,`t`],note:`Вертикальне зміщення станції GNSS за три роки. Крім повільного тренду є річний цикл (температура, сніг, ґрунтові води). Додайте sin і cos.`}})()},w=S,T,E,D;function O(){n.replaceChildren();let e=r(n),t=w.name===`ball`?.5:1,o=[];for(let e=w.X[0];e<=w.X[1]+1e-9;e+=t)o.push(+e.toFixed(2));let c=[],l=w.name===`ball`?1:6;for(let e=w.Y[0];e<=w.Y[1]+1e-9;e+=l)c.push(e);T=u(n,{width:e?420:560,height:e?300:340,x:w.X,y:w.Y,margin:{top:16,right:14,bottom:30,left:38},xTicks:o,yTicks:c,xLabel:w.xLabel,yLabel:w.yLabel,ariaLabel:`Дані та підібрана модель`}),E=i(`path`,{class:`fit-line`},T.layer),D=i(`g`,{},T.layer),w.t.forEach((e,t)=>i(`circle`,{cx:T.sx(e),cy:T.sy(w.y[t]),r:4.5,class:`data-point`},D)),a.forEach(e=>e.checked=w.start.includes(e.value)),s.forEach(e=>e.classList.toggle(`active`,e.dataset.preset===w.name)),b.dataset.note=w.note,k()}function k(){let e=y.filter(e=>a.find(t=>t.value===e.key)?.checked);if(e.length===0){E.setAttribute(`d`,``),c.textContent=``,l.textContent=``,d.textContent=``,b.className=`status warn`,b.textContent=`Оберіть хоча б одну базисну функцію.`;return}let n=w.t.map(t=>e.map(e=>e.f(t))),r=f(n,w.y);if(!r){b.className=`status warn`,b.textContent=`Стовпці матриці A лінійно залежні — такий набір функцій неможливо розділити.`;return}let i=t=>e.reduce((e,n,i)=>e+r[i]*n.f(t),0);E.setAttribute(`d`,v(T,i,w.X[0],w.X[1]));let s=w.t.map((e,t)=>w.y[t]-i(e)),u=w.y.reduce((e,t)=>e+t,0)/w.y.length,p=w.y.reduce((e,t)=>e+(t-u)**2,0),m=s.reduce((e,t)=>e+t*t,0);t(c,`y = `+e.map((e,t)=>{let n=r[t];return`${t===0?n<0?`-`:``:n<0?` - `:` + `}${g(Math.abs(n),3)}${e.key===`1`?``:`\\,`+e.tex}`}).join(``),!0),l.innerHTML=`<thead><tr>${e.map(e=>`<th>${e.label}</th>`).join(``)}</tr></thead><tbody>`+n.slice(0,4).map(e=>`<tr>${e.map(e=>`<td class="num">${o(e,2)}</td>`).join(``)}</tr>`).join(``)+`<tr>${e.map(()=>`<td>⋮</td>`).join(``)}</tr></tbody>`,d.innerHTML=`<tr><td>Параметрів k</td><td class="num">${e.length}</td></tr><tr><td>RMSE нев'язок</td><td class="num">${o(_(s),3)}</td></tr><tr><td>R²</td><td class="num">${o(1-m/p,4)}</td></tr>`;let h=b.dataset.note??``;if(w.name===`ball`&&e.some(e=>e.key===`t2`)){let t=r[e.findIndex(e=>e.key===`t2`)];h=`Коефіцієнт при t² дорівнює ${o(t,2)}, тож g ≈ ${o(-2*t,2)} м/с². Фізичну константу знайдено звичайним МНК.`}if(w.name===`gnss`&&e.some(e=>e.key===`sin`)&&e.some(e=>e.key===`cos`)){let t=r[e.findIndex(e=>e.key===`sin`)],n=r[e.findIndex(e=>e.key===`cos`)],i=e.some(e=>e.key===`t`)?r[e.findIndex(e=>e.key===`t`)]:NaN;h=`Річний цикл: амплітуда ${o(Math.hypot(t,n),2)} мм.${Number.isFinite(i)?` Швидкість підняття ${o(i,2)} мм/рік — саме заради неї станцію й спостерігають.`:``}`}b.className=`status info`,b.textContent=h}a.forEach(e=>e.addEventListener(`change`,k)),s.forEach(e=>e.addEventListener(`click`,()=>{w=C[e.dataset.preset],O()})),O()}function x(){let e=h(`#w-circle`),n=h(`.plot`,e),a=h(`[data-out="status"]`,e),v=h(`[data-out="eq"]`,e),y=[-.5,6.5],b=[-1.5,5.5],x=r(n),S=u(n,{width:x?400:460,height:x?400:460,x:y,y:b,margin:{top:14,right:14,bottom:28,left:30},xTicks:[0,1,2,3,4,5,6],yTicks:[-1,0,1,2,3,4,5],ariaLabel:`Точки, виміряні вздовж дуги, та підібране коло`}),C=i(`circle`,{fill:`none`,stroke:`var(--line)`,"stroke-width":2.5},S.layer),w=i(`g`,{},S.layer);i(`path`,{d:`M-7,0 H7 M0,-7 V7`,stroke:`var(--good)`,"stroke-width":2.5},w);let T=i(`line`,{stroke:`var(--good)`,"stroke-dasharray":`5 4`,"stroke-width":1.5},S.layer),E=i(`g`,{},S.layer),D=i(`g`,{},S.svg),O=m(5),k=Array.from({length:7},(e,t)=>{let n=.2+t*2.2/6;return{x:+(3+2.5*Math.cos(n)+.08*p(O)).toFixed(2),y:+(1.8+2.5*Math.sin(n)+.08*p(O)).toFixed(2)}});k.forEach((e,t)=>{let n=i(`g`,{class:`draggable`,tabindex:0,role:`button`,"aria-label":`Точка ${t+1}`},D);i(`circle`,{r:16,class:`drag-halo`},n),i(`circle`,{r:6,class:`data-point`},n);let r=(e,n)=>{k[t].x=c(e,y[0]+.1,y[1]-.1),k[t].y=c(n,b[0]+.1,b[1]-.1),A()};l(n,S.svg,(e,t)=>r(d(S.ix(e),.05),d(S.iy(t),.05))),n.addEventListener(`keydown`,e=>{let n={ArrowLeft:[-.05,0],ArrowRight:[.05,0],ArrowUp:[0,.05],ArrowDown:[0,-.05]}[e.key];n&&(e.preventDefault(),r(k[t].x+n[0],k[t].y+n[1]))})});function A(){let e=k.map(e=>[2*e.x,2*e.y,1]),n=k.map(e=>e.x*e.x+e.y*e.y),r=f(e,n);if([...D.children].forEach((e,t)=>e.setAttribute(`transform`,`translate(${S.sx(k[t].x)},${S.sy(k[t].y)})`)),E.replaceChildren(),!r||r[2]+r[0]**2+r[1]**2<=0){C.setAttribute(`r`,`0`),a.className=`status warn`,a.textContent=`Точки лежать на прямій: коло нескінченного радіуса. Вигніть дугу.`;return}let[c,l,u]=r,d=Math.sqrt(u+c*c+l*l),p=S.sx(1)-S.sx(0);s(C,{cx:S.sx(c),cy:S.sy(l),r:d*p}),w.setAttribute(`transform`,`translate(${S.sx(c)},${S.sy(l)})`),s(T,{x1:S.sx(c),y1:S.sy(l),x2:S.sx(c+d),y2:S.sy(l)});let m=k.map(e=>Math.hypot(e.x-c,e.y-l)-d);k.forEach(e=>{let t=Math.atan2(e.y-l,e.x-c);i(`line`,{x1:S.sx(e.x),y1:S.sy(e.y),x2:S.sx(c+d*Math.cos(t)),y2:S.sy(l+d*Math.sin(t)),stroke:`var(--bad)`,"stroke-width":2},E)});let h=v.clientWidth<560,y=`x_0 = ${g(c,3)},\\quad y_0 = ${g(l,3)}`,b=`R = \\sqrt{c + x_0^2 + y_0^2} = ${g(d,3)}`;t(v,h?`\\begin{gathered}${y}\\\\${b}\\end{gathered}`:`${y},\\quad ${b}`,!0),a.className=`status info`,a.innerHTML=`Середнє радіальне відхилення точок від кола: <b class="num">${o(_(m)*1e3,0)} мм</b> (якщо одиниці — метри). Тягніть точки: коло перераховується одним МНК на кожен рух.`}A()}function S(){let e=h(`#w-overfit`),t=h(`.plot`,e),n=h(`.plot-err`,e),a=h(`input[name="deg"]`,e),l=h(`output[for="deg"]`,e),d=h(`input[name="truth"]`,e),g=h(`[data-out="status"]`,e),y=h(`[data-out="stats"]`,e),b=r(t),x=e=>Math.sin(3*e),S=e=>2*e/3-1,C=[0,3],w=u(t,{width:b?420:560,height:b?300:340,x:C,y:[-2.2,2.2],margin:{top:16,right:14,bottom:30,left:34},xTicks:[0,1,2,3],yTicks:[-2,-1,0,1,2],xLabel:`x`,yLabel:`y`,ariaLabel:`Навчальні точки, нові точки, справжня залежність і многочлен`}),T=i(`path`,{fill:`none`,stroke:`var(--good)`,"stroke-width":2,"stroke-dasharray":`6 5`},w.layer),E=i(`g`,{},w.layer),D=i(`path`,{class:`fit-line`},w.layer),O=i(`g`,{},w.layer),k=u(n,{width:b?420:380,height:b?240:260,x:[-.5,11.5],y:[0,1],margin:{top:22,right:12,bottom:30,left:38},xTicks:[0,1,3,5,7,9,11],yTicks:[0,.25,.5,.75,1],ariaLabel:`Помилка на навчальних і на нових даних залежно від степеня многочлена`}),A=i(`text`,{x:44,y:14,class:`plot-label`,style:`font-weight: 600`},k.svg);A.textContent=`RMSE залежно від степеня`;let j=i(`path`,{fill:`none`,stroke:`var(--accent)`,"stroke-width":2.5},k.layer),M=i(`path`,{fill:`none`,stroke:`var(--warn)`,"stroke-width":2.5},k.layer),N=i(`line`,{stroke:`var(--text)`,"stroke-dasharray":`4 3`,y1:k.sy(0),y2:k.sy(1)},k.layer),P=i(`circle`,{r:5,fill:`var(--accent)`},k.layer),F=i(`circle`,{r:5,fill:`var(--warn)`},k.layer),I=1,L=[],R=[],z=[],B=[],V=[],H=(e,t)=>Array.from({length:t+1},(t,n)=>S(e)**n),U=(e,t)=>e.reduce((e,n,r)=>e+n*S(t)**r,0);function W(){let e=m(I*7919);L=Array.from({length:12},(t,n)=>.1+2.8*n/11+(e()-.5)*.2),R=L.map(t=>x(t)+.25*p(e)),z=Array.from({length:80},()=>.1+2.8*e()),B=z.map(t=>x(t)+.25*p(e)),V=[];for(let e=0;e<=11;e++){let t=f(L.map(t=>H(t,e)),R)??Array(e+1).fill(0);V.push({w:t,tr:_(L.map((e,n)=>R[n]-U(t,e))),va:_(z.map((e,n)=>B[n]-U(t,e)))})}O.replaceChildren(),E.replaceChildren(),L.forEach((e,t)=>i(`circle`,{cx:w.sx(e),cy:w.sy(R[t]),r:5.5,class:`data-point`},O)),z.forEach((e,t)=>i(`circle`,{cx:w.sx(e),cy:w.sy(c(B[t],-2.1,2.1)),r:3,fill:`none`,stroke:`var(--warn)`,"stroke-width":1.3,opacity:.8},E));let t=e=>k.sy(c(e,0,1));j.setAttribute(`d`,`M`+V.map((e,n)=>`${k.sx(n)},${t(e.tr)}`).join(`L`)),M.setAttribute(`d`,`M`+V.map((e,n)=>`${k.sx(n)},${t(e.va)}`).join(`L`)),T.setAttribute(`d`,v(w,x,C[0],C[1])),G()}function G(){let e=Number(a.value);l.textContent=String(e);let t=V[e];D.setAttribute(`d`,v(w,e=>U(t.w,e),C[0],C[1],500)),T.setAttribute(`visibility`,d.checked?`visible`:`hidden`),s(N,{x1:k.sx(e),x2:k.sx(e)}),s(P,{cx:k.sx(e),cy:k.sy(c(t.tr,0,1))}),s(F,{cx:k.sx(e),cy:k.sy(c(t.va,0,1))}),y.innerHTML=`<tr><td><i class="swatch" style="border-color:var(--accent)"></i>RMSE на навчальних (12 точок)</td><td class="num">${o(t.tr,3)}</td></tr><tr><td><i class="swatch" style="border-color:var(--warn)"></i>RMSE на нових (80 точок)</td><td class="num">${t.va>5?`&gt; 5`:o(t.va,3)}</td></tr>`;let n=V.reduce((e,t,n)=>t.va<V[e].va?n:e,0);e<=2?(g.className=`status warn`,g.innerHTML=`<b>Недонавчання.</b> Модель занадто проста: вона не може зігнутися так, як дані. Помилка велика скрізь — і на навчальних точках, і на нових.`):e===11?(g.className=`status warn`,g.innerHTML=`<b>Інтерполяція.</b> 12 параметрів на 12 точок: крива проходить точно через кожну, помилка навчання — нуль. Але між точками й біля країв вона робить дикі стрибки, і на нових даних провалюється.`):t.va>V[n].va*1.35?(g.className=`status warn`,g.innerHTML=`<b>Перенавчання.</b> Помилка на навчальних даних ще менша, ніж за степеня ${n}, але на нових — більша. Модель почала «запам'ятовувати» шум.`):(g.className=`status success`,g.innerHTML=`<b>Вдалий баланс.</b> Найменша помилка на нових даних цього разу — за степеня ${n}. Модель вловлює форму залежності, але не шум.`)}a.addEventListener(`input`,G),d.addEventListener(`change`,G),h(`[data-action="reroll"]`,e).addEventListener(`click`,()=>{I+=1,W()}),W()}b(),x(),S();