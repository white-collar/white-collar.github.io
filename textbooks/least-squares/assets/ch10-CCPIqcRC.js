import{n as e,t}from"./common-DcWhnavj.js";import{a as n,d as r,f as i,i as a,l as o,n as s,o as c,r as l,u}from"./plot-BqFxNYwL.js";import{c as d,d as f,i as p,n as m,o as h,r as g,u as _}from"./linalg-Q8j_e_NO.js";e(),t(),i({ml:{py:`import numpy as np

rng = np.random.default_rng(0)
x = rng.uniform(-2, 2, 50)
y = 1 + 0.5 * x + rng.normal(0, 0.3, x.size)
A = np.column_stack([np.ones_like(x), x])
n = x.size

# 1) Аналітичний розв'язок — один «стрибок» на дно чаші.
theta_star = np.linalg.lstsq(A, y, rcond=None)[0]

# 2) Градієнтний спуск для MSE = |y − Aθ|²/n. Градієнт: −2Aᵀ(y − Aθ)/n.
L = 2 * np.linalg.eigvalsh(A.T @ A / n).max()      # найбільше власне число гессіана
for lr_factor in [0.5, 0.95, 1.05]:                    # частка від межі стійкості 2/L
    theta = np.zeros(2)
    for _ in range(200):
        theta -= lr_factor * (2 / L) * (-2 * A.T @ (y - A @ theta) / n)
    print(f"крок {lr_factor:.2f}·(2/L): θ = {np.round(theta, 4)}  (точно {np.round(theta_star, 4)})")

# 3) Стохастичний градієнтний спуск: градієнт по одному випадковому прикладу.
theta = np.zeros(2)
for epoch in range(30):
    for i in rng.permutation(n):
        theta -= 0.02 * (-2 * (y[i] - A[i] @ theta) * A[i])
print("SGD, 30 епох:", np.round(theta, 3))

# 4) Ridge: (AᵀA + λI)θ = Aᵀy. Штрафуємо все, крім вільного члена.
lam = 5.0
D = np.diag([0.0, 1.0])
print("ridge λ=5:", np.round(np.linalg.solve(A.T @ A + lam * D, A.T @ y), 4))

# 5) Промахи: Губер (IRLS), RANSAC і тест Баарди.
xo = np.linspace(0.5, 9.5, 15)
yo = 1 + 0.5 * xo + rng.normal(0, 0.2, xo.size)
yo[[10, 12]] += [3.0, 2.5]                            # два промахи
Ao = np.column_stack([np.ones_like(xo), xo])
ls = np.linalg.lstsq(Ao, yo, rcond=None)[0]

th, delta = ls.copy(), 0.4                            # Губер: ітеративно перезважений МНК
for _ in range(50):
    r = yo - Ao @ th
    w = np.where(np.abs(r) <= delta, 1.0, delta / np.abs(r))
    sw = np.sqrt(w)
    th = np.linalg.lstsq(Ao * sw[:, None], yo * sw, rcond=None)[0]

best, t = None, 0.5                                    # RANSAC: пари точок → найбільший консенсус
for _ in range(200):
    i, j = rng.choice(xo.size, 2, replace=False)
    b = (yo[j] - yo[i]) / (xo[j] - xo[i]); a = yo[i] - b * xo[i]
    inl = np.abs(yo - a - b * xo) < t
    if best is None or inl.sum() > best.sum():
        best = inl
rs = np.linalg.lstsq(Ao[best], yo[best], rcond=None)[0]
print("МНК:", np.round(ls, 3), " Губер:", np.round(th, 3), " RANSAC:", np.round(rs, 3), " (дані згенеровано з [1, 0.5] + шум)")

clean = np.ones(xo.size, bool); clean[[10, 12]] = False
print("МНК без промахів (еталон):", np.round(np.linalg.lstsq(Ao[clean], yo[clean], rcond=None)[0], 3))

# Тест Баарди (data snooping): нормовані нев'язки w = v / (σ·√(1 − hᵢᵢ)), σ = 0.2 відома заздалегідь.
# Промах «розмазується», тож виключаємо по одному найгіршому вимірові й повторюємо.
keep = np.ones(xo.size, bool)
while True:
    Ak, yk = Ao[keep], yo[keep]
    th = np.linalg.lstsq(Ak, yk, rcond=None)[0]
    h = np.diag(Ak @ np.linalg.inv(Ak.T @ Ak) @ Ak.T)
    w = (yk - Ak @ th) / (0.2 * np.sqrt(1 - h))
    idx = np.flatnonzero(keep)
    print(f"  понад 3,29: {np.sum(np.abs(w) > 3.29)} вимірів, найгірший №{idx[np.argmax(np.abs(w))]} (w = {w[np.argmax(np.abs(w))]:.1f})")
    if np.abs(w).max() <= 3.29:
        break
    keep[idx[np.argmax(np.abs(w))]] = False
print("виключено:", np.flatnonzero(~keep), " розв'язок:", np.round(th, 3))
`,js:`// Дані: пряма y = 1 + 0.5x з невеликим шумом і двома промахами.
const x = [0.5, 1.1, 1.8, 2.4, 3.1, 3.7, 4.4, 5.0, 5.6, 6.3, 6.9, 7.6, 8.2, 8.9, 9.5];
const y = x.map((xi, i) => 1 + 0.5 * xi + 0.15 * Math.sin(3 * i));
y[10] += 3.0; y[12] += 2.5;                       // промахи

// Зважений МНК для прямої (вага wᵢ): нормальні рівняння 2×2.
function wls(w) {
  let s = 0, sx = 0, sxx = 0, sy = 0, sxy = 0;
  x.forEach((xi, i) => { s += w[i]; sx += w[i] * xi; sxx += w[i] * xi * xi; sy += w[i] * y[i]; sxy += w[i] * xi * y[i]; });
  const det = s * sxx - sx * sx;
  return [(sy * sxx - sx * sxy) / det, (s * sxy - sx * sy) / det];
}
const fmt = ([a, b]) => \`a = \${a.toFixed(3)}, b = \${b.toFixed(3)}\`;

// 1) Звичайний МНК: промахи тягнуть пряму до себе.
console.log("МНК:     ", fmt(wls(x.map(() => 1))));

// 2) Губер через ітеративно перезважений МНК (IRLS): великим нев'язкам — менша вага.
let th = wls(x.map(() => 1));
const delta = 0.4;
for (let it = 0; it < 50; it++) {
  const w = x.map((xi, i) => { const r = Math.abs(y[i] - th[0] - th[1] * xi); return r <= delta ? 1 : delta / r; });
  th = wls(w);
}
console.log("Губер:   ", fmt(th));

// 3) RANSAC: перебираємо пари точок, шукаємо пряму з найбільшою «підтримкою».
let best = [];
for (let i = 0; i < x.length; i++) for (let j = i + 1; j < x.length; j++) {
  const b = (y[j] - y[i]) / (x[j] - x[i]), a = y[i] - b * x[i];
  const inl = x.map((xi, k) => Math.abs(y[k] - a - b * xi) < 0.5);
  if (inl.filter(Boolean).length > best.filter(Boolean).length) best = inl;
}
console.log("RANSAC:  ", fmt(wls(best.map(Number))), " відкинуто точок:", best.filter((v) => !v).length);

// 4) Градієнтний спуск (без промахів): як крок навчання впливає на збіжність.
const yc = x.map((xi, i) => 1 + 0.5 * xi + 0.15 * Math.sin(3 * i));
const n = x.length, sxx = x.reduce((s, v) => s + v * v, 0), sx = x.reduce((s, v) => s + v, 0);
const Lmax = (2 / n) * ((n + sxx) / 2 + Math.hypot((n - sxx) / 2, sx));   // λ_max гессіана MSE
for (const f of [0.5, 0.95, 1.05]) {
  let [a, b] = [0, 0];
  const lr = (f * 2) / Lmax;
  for (let it = 0; it < 2000; it++) {
    let ga = 0, gb = 0;
    x.forEach((xi, i) => { const r = yc[i] - a - b * xi; ga -= (2 / n) * r; gb -= (2 / n) * r * xi; });
    a -= lr * ga; b -= lr * gb;
  }
  console.log(\`GD, крок \${f}·(2/L): a = \${a.toPrecision(4)}, b = \${b.toPrecision(4)}\`);
}
`}});function v(e,t=document){let n=t.querySelector(e);if(!n)throw Error(`Не знайдено ${e}`);return n}var y=[.02,.08,.18,.32,.5,.72,.98,1.28,1.62];function b(e,t,n=5){let r=(t-e)/n,i=10**Math.floor(Math.log10(r)),a=[1,2,2.5,5,10].map(e=>e*i).find(e=>e>=r)??r,o=[];for(let n=Math.ceil(e/a)*a;n<=t+1e-9;n+=a)o.push(+n.toFixed(6));return o}var x=e=>Math.sqrt(e.reduce((e,t)=>e+t*t,0)/e.length);function S(){let e=v(`#w-gd`),t=v(`.plot-map`,e),i=v(`.plot-loss`,e),c=v(`input[name="lr"]`,e),u=v(`output[for="gd-lr"]`,e),d=[...e.querySelectorAll(`input[name="method"]`)],x=v(`input[name="std"]`,e),S=v(`[data-out="status"]`,e),C=v(`[data-out="iter"]`,e),w=n(t),T=_(21),E=Array.from({length:40},()=>{let e=10*T();return{x:e,y:1+.5*e+.4*p(T)}}),D=E.length,O=E.reduce((e,t)=>e+t.x,0)/D,k=Math.sqrt(E.reduce((e,t)=>e+(t.x-O)**2,0)/D),A=[],j,M,N,P=[0,0],F=[0,0],I=[],L=[],R=[0,0],z=0,B=1,V=0,H=_(5),U=e=>g(h(A),e[0],e[1])/D,W=l(i,{width:w?420:380,height:220,x:[0,200],y:[-8,2],margin:{top:22,right:12,bottom:28,left:44},xTicks:[0,50,100,150,200],yTicks:[-8,-6,-4,-2,0,2],ariaLabel:`Надлишкова помилка залежно від номера кроку`});W.svg.querySelectorAll(`.plot-axis text`).forEach((e,t,n)=>{t>=n.length-6&&(e.textContent=`10${String(Number((e.textContent??``).replace(`−`,`-`))).replace(`-`,`⁻`).replace(/\d/g,e=>`⁰¹²³⁴⁵⁶⁷⁸⁹`[Number(e)])}`)});let G=r(`text`,{x:50,y:14,class:`plot-label`,style:`font-weight: 600`},W.svg);G.textContent=`MSE − MSE* (наскільки далеко від дна)`;let K=r(`path`,{fill:`none`,stroke:`var(--warn)`,"stroke-width":2},W.layer);function q(){Z();let e=x.checked;A=E.map(t=>({x:e?(t.x-O)/k:t.x,y:t.y}));let n=h(A);R=f(n.M,n.v),z=U(R),B=2*m(n.M).l1/D;let i=n.M[0][0]*n.M[1][1]-n.M[0][1]**2,a=1.5*D,o=1.15*Math.sqrt(a*n.M[1][1]/i),s=1.15*Math.sqrt(a*n.M[0][0]/i),c=[R[0]-o,R[0]+o],u=[R[1]-s,R[1]+s];t.replaceChildren(),j=l(t,{width:w?420:460,height:w?360:400,x:c,y:u,margin:{top:14,right:14,bottom:30,left:44},xTicks:b(c[0],c[1]),yTicks:b(u[0],u[1]),xLabel:e?`c`:`a`,yLabel:`b`,ariaLabel:`Лінії рівня функції втрат і шлях спуску`});let d=j.sx(1)-j.sx(0),p=j.sy(1)-j.sy(0),g=r(`g`,{transform:`matrix(${d},0,0,${p},${j.sx(0)},${j.sy(0)})`},j.layer),{l1:_,l2:v,angle:S}=m(n.M);for(let e=y.length-1;e>=0;e--){let t=y[e]*D;r(`ellipse`,{cx:0,cy:0,rx:Math.sqrt(t/_),ry:Math.sqrt(t/v),transform:`translate(${R[0]},${R[1]}) rotate(${S*180/Math.PI})`,fill:`var(--accent)`,"fill-opacity":.07,stroke:`var(--accent)`,"stroke-opacity":.4,"vector-effect":`non-scaling-stroke`},g)}r(`path`,{d:`M-7,-7 L7,7 M-7,7 L7,-7`,stroke:`var(--good)`,"stroke-width":3},j.layer).setAttribute(`transform`,`translate(${j.sx(R[0])},${j.sy(R[1])})`),M=r(`polyline`,{fill:`none`,stroke:`var(--warn)`,"stroke-width":1.8,"stroke-linejoin":`round`},j.layer),N=r(`circle`,{r:6,fill:`var(--warn)`,stroke:`var(--surface)`,"stroke-width":2},j.layer),F=[c[0]+.12*(c[1]-c[0]),u[0]+.88*(u[1]-u[0])],J()}function J(){Z(),P=[...F],I=[[...P]],L=[U(P)],H=_(5),X()}function Y(){let e=d.find(e=>e.checked)?.value??`gd`,t=Number(c.value)*2/B,n;n=e===`gd`?A.map((e,t)=>t):e===`mb`?Array.from({length:8},()=>Math.floor(H()*D)):[Math.floor(H()*D)];let r=0,i=0;for(let e of n){let t=A[e].y-P[0]-P[1]*A[e].x;r-=2*t/n.length,i-=2*t*A[e].x/n.length}P=[P[0]-t*r,P[1]-t*i],I.push([...P]),L.push(U(P))}function X(){let e=I.map(([e,t])=>`${j.sx(e).toFixed(1)},${j.sy(t).toFixed(1)}`);M.setAttribute(`points`,e.join(` `)),o(N,{cx:j.sx(P[0]),cy:j.sy(P[1])});let t=Math.max(200,L.length-1);K.setAttribute(`d`,`M`+L.map((e,n)=>{let r=Number.isFinite(e)?s(Math.log10(Math.max(e-z,1e-9)),-8,2):2;return`${(W.sx(0)+(W.sx(200)-W.sx(0))*n/t).toFixed(1)},${W.sy(r).toFixed(1)}`}).join(`L`)),u.textContent=`${a(Number(c.value),2)}·2/L`,C.textContent=`Кроків: ${I.length-1}, MSE = ${Number.isFinite(L[L.length-1])&&L[L.length-1]<1e6?a(L[L.length-1],4):`∞`} (мінімум ${a(z,4)})`;let n=L[L.length-1],r=d.find(e=>e.checked)?.value??`gd`;if(!Number.isFinite(n)||n>1e4)S.className=`status warn`,S.innerHTML=`<b>Розбіжність!</b> Крок більший за межу стійкості 2/L: кулька перестрибує дно щоразу далі. Зменшіть крок.`,Z();else if(I.length===1)S.className=`status`,S.innerHTML=`Натисніть «Крок» або «Запустити». Зелений хрестик — дно, яке нормальні рівняння знаходять одразу.`;else if(n-z<1e-6){S.className=`status success`;let e=L.findIndex(e=>e-z<1e-6);S.innerHTML=`Дно досягнуто за ${e} кроків (MSE відрізняється від мінімуму менш ніж на 10⁻⁶). Нормальні рівняння дали б ту саму відповідь одним «стрибком».`}else r!==`gd`&&I.length>60?(S.className=`status info`,S.innerHTML=`Стохастичний спуск не сідає точно на дно: кожен крок бачить лише частину даних і «тремтить» навколо мінімуму. Зате кроки в сотні разів дешевші — на мільйонах прикладів це вирішує все.`):!x.checked&&I.length>60?(S.className=`status info`,S.innerHTML=`Без стандартизації чаша — вузька долина: крок обмежений крутим напрямком, а вздовж долини кулька ледве повзе (розділ 3).`):(S.className=`status info`,S.innerHTML=`Крок ${I.length-1}: кожна ітерація — лише множення на матрицю, без розв'язання системи.`)}function Z(){V&&window.clearInterval(V),V=0}v(`[data-action="step"]`,e).addEventListener(`click`,()=>{Y(),X()}),v(`[data-action="run"]`,e).addEventListener(`click`,()=>{Z();let e=0;V=window.setInterval(()=>{for(let e=0;e<2;e++)Y();X(),e+=2,e>=200&&Z()},40)}),v(`[data-action="reset"]`,e).addEventListener(`click`,J),v(`[data-action="jump"]`,e).addEventListener(`click`,()=>{Z(),P=[...R],I.push([...P]),L.push(U(P)),X(),S.className=`status success`,S.innerHTML=`<b>Аналітичний розв'язок</b>: нормальні рівняння ставлять точку одразу на дно. Для двох параметрів це найкращий вибір, для мільйона — неможливий.`}),c.addEventListener(`input`,()=>X()),d.forEach(e=>e.addEventListener(`change`,J)),x.addEventListener(`change`,q),q()}function C(){let e=v(`#w-ridge`),t=v(`.plot`,e),i=v(`.plot-err`,e),c=v(`.plot-coef`,e),u=v(`input[name="lam"]`,e),f=v(`output[for="ridge-lam"]`,e),m=v(`[data-out="stats"]`,e),h=n(t),g=e=>Math.sin(3*e),y=e=>2*e/3-1,b=_(7919),S=Array.from({length:12},(e,t)=>.1+2.8*t/11+(b()-.5)*.2),C=S.map(e=>g(e)+.25*p(b)),w=Array.from({length:80},()=>.1+2.8*b()),T=w.map(e=>g(e)+.25*p(b)),E=e=>Array.from({length:10},(t,n)=>y(e)**n);function D(e){let t=S.map(E),n=[...C];for(let r=1;r<=9;r++)t.push(Array.from({length:10},(t,n)=>n===r?Math.sqrt(e):0)),n.push(0);return d(t,n)??Array(10).fill(0)}let O=(e,t)=>E(t).reduce((t,n,r)=>t+n*e[r],0),k=l(t,{width:h?420:520,height:h?300:320,x:[0,3],y:[-2.2,2.2],margin:{top:14,right:12,bottom:28,left:32},xTicks:[0,1,2,3],yTicks:[-2,-1,0,1,2],ariaLabel:`Дані й многочлен 9-го степеня з гребеневою регуляризацією`}),A=r(`path`,{fill:`none`,stroke:`var(--good)`,"stroke-width":2,"stroke-dasharray":`6 5`},k.layer);w.forEach((e,t)=>r(`circle`,{cx:k.sx(e),cy:k.sy(s(T[t],-2.1,2.1)),r:2.8,fill:`none`,stroke:`var(--warn)`,"stroke-width":1.2,opacity:.7},k.layer));let j=r(`path`,{class:`fit-line`},k.layer);S.forEach((e,t)=>r(`circle`,{cx:k.sx(e),cy:k.sy(C[t]),r:5.5,class:`data-point`},k.layer));let M=e=>{let t=``;for(let n=0;n<=300;n++){let r=3*n/300,i=s(e(r),-3,3);t+=`${n?`L`:`M`}${k.sx(r).toFixed(1)},${k.sy(i).toFixed(1)}`}return t};A.setAttribute(`d`,M(g));let N=[-8,2],P=Array.from({length:61},(e,t)=>N[0]+(N[1]-N[0])*t/60),F=P.map(e=>{let t=D(10**e);return{tr:x(S.map((e,n)=>C[n]-O(t,e))),va:x(w.map((e,n)=>T[n]-O(t,e)))}}),I=l(i,{width:h?420:360,height:200,x:N,y:[0,.8],margin:{top:22,right:12,bottom:28,left:38},xTicks:[-8,-6,-4,-2,0,2],yTicks:[0,.2,.4,.6,.8],ariaLabel:`Помилка залежно від сили регуляризації`});I.svg.querySelectorAll(`.plot-axis text`).forEach((e,t)=>{t<6&&(e.textContent=`10${(e.textContent??``).replace(`−`,`⁻`).replace(/\d/g,e=>`⁰¹²³⁴⁵⁶⁷⁸⁹`[Number(e)])}`)});let L=r(`text`,{x:44,y:14,class:`plot-label`,style:`font-weight: 600`},I.svg);L.textContent=`RMSE залежно від λ`;let R=e=>`M`+F.map((t,n)=>`${I.sx(P[n]).toFixed(1)},${I.sy(s(t[e],0,.8)).toFixed(1)}`).join(`L`);r(`path`,{d:R(`tr`),fill:`none`,stroke:`var(--accent)`,"stroke-width":2.5},I.layer),r(`path`,{d:R(`va`),fill:`none`,stroke:`var(--warn)`,"stroke-width":2.5},I.layer);let z=r(`line`,{stroke:`var(--text)`,"stroke-dasharray":`4 3`,y1:I.sy(0),y2:I.sy(.8)},I.layer),B=l(c,{width:h?420:360,height:170,x:[-.6,9.6],y:[-3,4],margin:{top:22,right:12,bottom:26,left:38},xTicks:[0,1,2,3,4,5,6,7,8,9],yTicks:[-2,0,2,4],ariaLabel:`Модулі коефіцієнтів многочлена в логарифмічній шкалі`});B.svg.querySelectorAll(`.plot-axis text`).forEach((e,t,n)=>{t>=n.length-4&&(e.textContent=`10${(e.textContent??``).replace(`−`,`⁻`).replace(/\d/g,e=>`⁰¹²³⁴⁵⁶⁷⁸⁹`[Number(e)])}`)});let V=r(`text`,{x:44,y:14,class:`plot-label`,style:`font-weight: 600`},B.svg);V.textContent=`|θⱼ| — модулі коефіцієнтів при uʲ`;let H=Array.from({length:10},()=>r(`rect`,{width:18,rx:2,fill:`var(--accent)`,opacity:.8},B.layer));function U(){let e=Number(u.value),t=10**e;f.textContent=`10${String(e).replace(`-`,`⁻`).replace(/\d/g,e=>`⁰¹²³⁴⁵⁶⁷⁸⁹`[Number(e)])}`;let n=D(t);j.setAttribute(`d`,M(e=>O(n,e))),o(z,{x1:I.sx(e),x2:I.sx(e)}),n.forEach((e,t)=>{let n=s(Math.log10(Math.max(Math.abs(e),.001)),-3,4);o(H[t],{x:B.sx(t)-9,y:B.sy(n),height:Math.max(1,B.sy(-3)-B.sy(n))})});let r=x(S.map((e,t)=>C[t]-O(n,e))),i=x(w.map((e,t)=>T[t]-O(n,e))),c=P[F.reduce((e,t,n)=>t.va<F[e].va?n:e,0)];m.innerHTML=`<tr><td><i class="swatch" style="border-color:var(--accent)"></i>RMSE навчання</td><td class="num">${a(r,3)}</td></tr>
      <tr><td><i class="swatch" style="border-color:var(--warn)"></i>RMSE нові дані</td><td class="num">${i>5?`&gt; 5`:a(i,3)}</td></tr>
      <tr><td>|θ| (довжина вектора параметрів)</td><td class="num">${Math.hypot(...n)>1e4?Math.hypot(...n).toExponential(1):a(Math.hypot(...n),1)}</td></tr>
      <tr><td>найкраще λ на нових даних</td><td class="num">≈ 10${String(Math.round(c)).replace(`-`,`⁻`).replace(/\d/g,e=>`⁰¹²³⁴⁵⁶⁷⁸⁹`[Number(e)])}</td></tr>`}u.addEventListener(`input`,U),U()}function w(){let e=v(`#w-robust`),t=v(`.plot`,e),i=v(`input[name="delta"]`,e),f=v(`output[for="rob-delta"]`,e),m=v(`input[name="thr"]`,e),g=v(`output[for="rob-thr"]`,e),y=v(`[data-out="table"]`,e),b=v(`[data-out="status"]`,e),x=v(`[data-out="baarda"]`,e),S=[...e.querySelectorAll(`[data-preset]`)],C=n(t),w=.2,T=[0,10],E=[0,8],D=(()=>{let e=_(33);return Array.from({length:15},(t,n)=>{let r=.5+9*n/14;return{x:+r.toFixed(2),y:+(1+.5*r+w*p(e)).toFixed(2)}})})(),O={clean:()=>D.map(e=>({...e})),two:()=>D.map((e,t)=>({x:e.x,y:t===10?e.y+3:t===12?e.y+2.5:e.y})),leverage:()=>D.map((e,t)=>t===14?{x:9.5,y:1.2}:{...e})},k=`two`,A=O.two(),j=[],M=l(t,{width:C?420:560,height:C?320:380,x:T,y:E,margin:{top:14,right:14,bottom:30,left:32},xTicks:[0,2,4,6,8,10],yTicks:[0,2,4,6,8],xLabel:`x`,yLabel:`y`,ariaLabel:`Точки з промахами та прямі різних методів`}),N=[{key:`ls`,name:`МНК`,color:`var(--bad)`,dash:``},{key:`huber`,name:`Губер`,color:`var(--accent)`,dash:``},{key:`l1`,name:`L1 (модулі)`,color:`var(--warn)`,dash:`8 5`},{key:`ransac`,name:`RANSAC`,color:`var(--good)`,dash:`3 4`}],P=N.map(e=>r(`line`,{stroke:e.color,"stroke-width":2.5,"stroke-dasharray":e.dash},M.layer)),F=r(`polygon`,{fill:`var(--good)`,"fill-opacity":.08},M.layer),I=r(`g`,{},M.svg),L=r(`g`,{},M.svg),R=e=>{let t=A.map((t,n)=>[Math.sqrt(e[n]),Math.sqrt(e[n])*t.x]),n=A.map((t,n)=>Math.sqrt(e[n])*t.y),r=d(t,n);return r?[r[0],r[1]]:[0,0]},z=e=>A.map(t=>t.y-e[0]-e[1]*t.x);function B(e){let t=R(A.map(()=>1));for(let n=0;n<60;n++)t=R(z(t).map(e));return t}function V(e){let t=_(8),n=A.map(()=>!0),r=-1;for(let i=0;i<150;i++){let i=Math.floor(t()*A.length),a=Math.floor(t()*A.length);if(a===i&&(a=(a+1)%A.length),Math.abs(A[a].x-A[i].x)<1e-9)continue;let o=(A[a].y-A[i].y)/(A[a].x-A[i].x),s=A[i].y-o*A[i].x,c=A.map(t=>Math.abs(t.y-s-o*t.x)<e),l=c.filter(Boolean).length;l>r&&([n,r]=[c,l])}return{t:R(n.map(e=>e?1:1e-12)),inl:n}}function H(){L.replaceChildren(),A.forEach((e,t)=>{let n=r(`g`,{class:`draggable`,tabindex:0,role:`button`,"aria-label":`Точка ${t+1}`},L);r(`circle`,{r:15,class:`drag-halo`},n),r(`circle`,{r:5.5,class:`data-point`},n),c(n,M.svg,(e,n)=>{A[t].x=s(u(M.ix(e),.05),T[0]+.1,T[1]-.1),A[t].y=s(u(M.iy(n),.05),E[0]+.1,E[1]-.1),j=[],x.innerHTML=``,U()})})}function U(){let e=Number(i.value),t=Number(m.value);f.textContent=a(e,2),g.textContent=a(t,2);let n=R(A.map(()=>1)),s=B(t=>Math.abs(t)<=e?1:e/Math.abs(t)),c=B(e=>1/Math.max(Math.abs(e),1e-4)),l=V(t),u=[n,s,c,l.t];u.forEach((e,t)=>o(P[t],{x1:M.sx(T[0]),y1:M.sy(e[0]+e[1]*T[0]),x2:M.sx(T[1]),y2:M.sy(e[0]+e[1]*T[1])}));let[d,p]=l.t;F.setAttribute(`points`,[[T[0],d+p*T[0]-t],[T[1],d+p*T[1]-t],[T[1],d+p*T[1]+t],[T[0],d+p*T[0]+t]].map(([e,t])=>`${M.sx(e)},${M.sy(t)}`).join(` `)),[...L.children].forEach((e,t)=>e.setAttribute(`transform`,`translate(${M.sx(A[t].x)},${M.sy(A[t].y)})`)),I.replaceChildren(),A.forEach((e,t)=>{l.inl[t]||r(`circle`,{cx:M.sx(e.x),cy:M.sy(e.y),r:10,fill:`none`,stroke:`var(--good)`,"stroke-width":1.5,"stroke-dasharray":`3 2`},I),j.includes(t)&&r(`path`,{d:`M${M.sx(e.x)-9},${M.sy(e.y)-9} l18,18 m0,-18 l-18,18`,stroke:`var(--bad)`,"stroke-width":2.5},I)}),y.innerHTML=`<thead><tr><th>Метод</th><th>a</th><th>b</th></tr></thead><tbody>${N.map((e,t)=>`<tr><td><i class="swatch" style="border-color:${e.color}; border-top-style:${e.dash?`dashed`:`solid`}"></i>${e.name}</td><td class="num">${a(u[t][0],3)}</td><td class="num">${a(u[t][1],3)}</td></tr>`).join(``)}</tbody>`,S.forEach(e=>e.classList.toggle(`active`,e.dataset.preset===k));let h=Math.abs(n[1]-l.t[1]);b.className=h>.05?`status warn`:`status info`,b.innerHTML=h>.05?`Червона пряма МНК відхилилася: кожен промах «тягне» її з силою, пропорційною своїй нев'язці. Губер і L1 обмежують цю силу, а RANSAC просто не бере промахи до уваги (обведені кружечки).`:`Промахів немає — усі методи дають майже ту саму пряму. МНК тут найточніший (розділ 9).`}function W(){j=[];let e=[];for(let t=0;t<6;t++){let n=A.map((e,t)=>!j.includes(t)).map((e,t)=>e?t:-1).filter(e=>e>=0),r=n.map(e=>[1,A[e].x]),i=n.map(e=>A[e].y),o=d(r,i),s=h(n.map(e=>A[e])),c=s.M[0][0]*s.M[1][1]-s.M[0][1]**2,l=n.map(e=>{let t=A[e].x,n=(s.M[1][1]-2*s.M[0][1]*t+s.M[0][0]*t*t)/c;return(A[e].y-o[0]-o[1]*t)/(w*Math.sqrt(Math.max(1-n,1e-9)))}),u=l.filter(e=>Math.abs(e)>3.29).length,f=l.reduce((e,t,n)=>Math.abs(t)>Math.abs(l[e])?n:e,0);if(u===0){e.push(`Крок ${t+1}: усі |w| ≤ 3,29 — промахів більше немає.`);break}e.push(`Крок ${t+1}: понад 3,29 — <b>${u}</b> вимір(и), найгірший — точка ${n[f]+1} (w = ${a(l[f],1)}). Виключаємо.`),j.push(n[f])}x.innerHTML=`<ol class="baarda">${e.map(e=>`<li>${e}</li>`).join(``)}</ol>`,U()}i.addEventListener(`input`,U),m.addEventListener(`input`,U),S.forEach(e=>e.addEventListener(`click`,()=>{k=e.dataset.preset,A=O[k](),j=[],x.innerHTML=``,H(),U()})),v(`[data-action="baarda"]`,e).addEventListener(`click`,W),H(),U()}S(),C(),w();