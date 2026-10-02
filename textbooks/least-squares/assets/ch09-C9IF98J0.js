import{n as e,t}from"./common-DcWhnavj.js";import{a as n,d as r,f as i,i as a,l as o,n as s,o as c,r as l}from"./plot-BqFxNYwL.js";import{c as u,i as d,n as f,u as p}from"./linalg-Q8j_e_NO.js";e(),t(),i({statistics:{py:`import numpy as np

rng = np.random.default_rng(0)
n, M = 9, 20000                     # 9 вимірів в експерименті, 20 000 експериментів

# Три види шуму з однаковим стандартним відхиленням 1.
noises = {
    "Гаусс":    lambda size: rng.normal(0, 1, size),
    "Лаплас":   lambda size: rng.laplace(0, 1 / np.sqrt(2), size),
    "рівномірний": lambda size: rng.uniform(-np.sqrt(3), np.sqrt(3), size),
}
for name, noise in noises.items():
    e = noise((M, n))                                   # справжнє значення = 0
    est = {"середнє": e.mean(1), "медіана": np.median(e, 1),
           "середина розмаху": (e.min(1) + e.max(1)) / 2}
    spread = {k: v.std() for k, v in est.items()}
    best = min(spread, key=spread.get)
    print(f"{name:12s}", "  ".join(f"{k} {s:.3f}" for k, s in spread.items()), f" → найкраще: {best}")

# Точність параметрів прямої: теорія σ²(AᵀA)⁻¹ проти повторних експериментів.
x = np.linspace(0, 5, 12)
A = np.column_stack([np.ones_like(x), x])
sigma = 0.3
cov_theory = sigma**2 * np.linalg.inv(A.T @ A)
thetas = np.array([np.linalg.lstsq(A, 1 + 0.5 * x + rng.normal(0, sigma, x.size), rcond=None)[0]
                   for _ in range(5000)])
print("σ(a), σ(b) за формулою:   ", np.sqrt(np.diag(cov_theory)).round(4))
print("σ(a), σ(b) з експериментів:", thetas.std(0).round(4))
print("кореляція a і b:", np.corrcoef(thetas.T)[0, 1].round(3),
      " (формула:", (cov_theory[0, 1] / np.sqrt(cov_theory[0, 0] * cov_theory[1, 1])).round(3), ")")

# Незміщена оцінка σ²: ділимо на n − k, а не на n.
S = []
for _ in range(20000):
    y = 1 + 0.5 * x + rng.normal(0, sigma, x.size)
    th = np.linalg.lstsq(A, y, rcond=None)[0]
    S.append(((y - A @ th) ** 2).sum())
S = np.array(S)
print(f"σ² = {sigma**2:.4f};  середнє S/n = {np.mean(S / x.size):.4f},  середнє S/(n−k) = {np.mean(S / (x.size - 2)):.4f}")
`,js:`// 1) Центральна гранична теорема: сума багатьох дрібних похибок стає «дзвоном».
//    Кожна елементарна похибка рівномірна на [−1, 1] — зовсім не гауссова.
let seed = 42;
const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);

for (const k of [1, 2, 12]) {
  const sums = Array.from({ length: 20000 }, () => {
    let s = 0;
    for (let j = 0; j < k; j++) s += 2 * rand() - 1;
    return s / Math.sqrt(k / 3);         // нормуємо до стандартного відхилення 1
  });
  // Гістограма символами: частка значень у кожному інтервалі шириною 0.5.
  const bins = new Array(12).fill(0);
  sums.forEach((v) => { const b = Math.floor((v + 3) / 0.5); if (b >= 0 && b < 12) bins[b]++; });
  const max = Math.max(...bins);
  console.log(\`k = \${k}:  \` + bins.map((c) => "▁▂▃▄▅▆▇█"[Math.round((7 * c) / max)]).join(""));
}

// 2) Максимальна правдоподібність перебором: де найімовірніше справжнє значення?
const l = [10.02, 10.05, 9.98, 10.03, 10.30];   // останній вимір — промах
const logLik = {
  "Гаусс (→ Σ квадратів)": (x) => -l.reduce((s, li) => s + (li - x) ** 2, 0),
  "Лаплас (→ Σ модулів)": (x) => -l.reduce((s, li) => s + Math.abs(li - x), 0),
};
for (const [name, f] of Object.entries(logLik)) {
  let best = { x: 0, v: -Infinity };
  for (let x = 9.9; x <= 10.4; x += 0.0005) if (f(x) > best.v) best = { x, v: f(x) };
  console.log(\`\${name}: максимум правдоподібності в x = \${best.x.toFixed(3)}\`);
}
console.log("середнє =", (l.reduce((s, v) => s + v, 0) / l.length).toFixed(3), " медіана =", [...l].sort((a, b) => a - b)[2]);
`}});function m(e,t=document){let n=t.querySelector(e);if(!n)throw Error(`Не знайдено ${e}`);return n}function h(e,t){if(e===`gauss`)return()=>d(t);if(e===`laplace`){let e=1/Math.SQRT2;return()=>{let n=t()-.5;return-e*Math.sign(n)*Math.log(1-2*Math.abs(n))}}let n=Math.sqrt(3);return()=>(2*t()-1)*n}function g(e,t){if(e===`gauss`)return Math.exp(-t*t/2)/Math.sqrt(2*Math.PI);if(e===`laplace`){let e=1/Math.SQRT2;return Math.exp(-Math.abs(t)/e)/(2*e)}let n=Math.sqrt(3);return Math.abs(t)<=n?1/(2*n):0}var _=e=>{let t=e.reduce((e,t)=>e+t,0)/e.length;return Math.sqrt(e.reduce((e,n)=>e+(n-t)**2,0)/(e.length-1))};function v(e,t,n,i,a,o,s,c,l){let u=Array(o).fill(0),d=(a-i)/o;for(let e of n){let t=Math.floor((e-i)/d);t>=0&&t<o&&u[t]++}let f=Math.max(...u,1);u.forEach((n,a)=>{if(!n)return;let o=s+n/f*c;r(`rect`,{x:e.sx(i+a*d)+.5,width:Math.max(.5,e.sx(i+(a+1)*d)-e.sx(i+a*d)-1),y:e.sy(o),height:e.sy(s)-e.sy(o),fill:l,opacity:.7},t)})}function y(){let e=m(`#w-est`),t=m(`.plot`,e),i=m(`.plot-pdf`,e),o=m(`input[name="n"]`,e),s=m(`output[for="est-n"]`,e),c=[...e.querySelectorAll(`input[name="noise"]`)],u=m(`[data-out="table"]`,e),d=m(`[data-out="status"]`,e),f=n(t),y=[{name:`середнє (МНК, Σ квадратів)`,color:`var(--good)`,f:e=>e.reduce((e,t)=>e+t,0)/e.length},{name:`медіана (Σ модулів)`,color:`var(--warn)`,f:e=>{let t=[...e].sort((e,t)=>e-t),n=t.length;return n%2?t[(n-1)/2]:(t[n/2-1]+t[n/2])/2}},{name:`середина розмаху (max)`,color:`var(--ml)`,f:e=>(Math.min(...e)+Math.max(...e))/2}],b=l(i,{width:f?420:360,height:150,x:[-3.2,3.2],y:[0,.75],margin:{top:20,right:10,bottom:24,left:10},xTicks:[-3,-2,-1,0,1,2,3],ariaLabel:`Щільність розподілу похибки`}),x=r(`text`,{x:14,y:14,class:`plot-label`,style:`font-weight: 600`},b.svg);x.textContent=`Розподіл похибки одного виміру`;let S=r(`path`,{fill:`var(--accent)`,"fill-opacity":.15,stroke:`var(--accent)`,"stroke-width":2},b.layer),C=l(t,{width:f?420:600,height:330,x:[-1.6,1.6],y:[0,3],margin:{top:10,right:14,bottom:28,left:14},xTicks:[-1.5,-1,-.5,0,.5,1,1.5],ariaLabel:`Гістограми трьох оцінок за багатьох повторних експериментів`}),w=r(`g`,{},C.layer);r(`line`,{x1:C.sx(0),x2:C.sx(0),y1:C.sy(0),y2:C.sy(3),stroke:`var(--text)`,"stroke-dasharray":`4 3`},C.layer);let T=y.map((e,t)=>r(`text`,{x:C.sx(-1.55),y:C.sy(3-t)+16,class:`plot-label`,style:`fill: ${e.color}; font-weight: 600`},C.svg)),E=3;function D(){let e=c.find(e=>e.checked)?.value??`gauss`,t=Number(o.value);s.textContent=String(t);let n=Array.from({length:241},(e,t)=>-3.2+6.4*t/240);S.setAttribute(`d`,`M${b.sx(-3.2)},${b.sy(0)}`+n.map(t=>`L${b.sx(t).toFixed(1)},${b.sy(Math.min(g(e,t),.74)).toFixed(1)}`).join(``)+`L${b.sx(3.2)},${b.sy(0)}Z`);let r=h(e,p(E*131+t)),i=y.map(()=>[]);for(let e=0;e<2e3;e++){let e=Array.from({length:t},r);y.forEach((t,n)=>i[n].push(t.f(e)))}w.replaceChildren();let l=i.map(_),f=l.indexOf(Math.min(...l));i.forEach((e,t)=>{v(C,w,e,-1.6,1.6,64,2-t+.05,.75,y[t].color),T[t].textContent=`${y[t].name}: розкид ±${a(l[t],3)}${t===f?`  ★`:``}`}),u.innerHTML=`<thead><tr><th>Оцінка</th><th>Розкид</th><th>Відносно найкращої</th></tr></thead><tbody>${y.map((e,t)=>`<tr${t===f?` class="current"`:``}><td><i class="swatch" style="border-color:${e.color}"></i>${e.name}</td><td class="num">±${a(l[t],3)}</td><td class="num">×${a(l[t]/l[f],2)}</td></tr>`).join(``)}</tbody>`,d.className=`status info`,d.innerHTML={gauss:`За <b>гауссового</b> шуму найточніше середнє — оцінка МНК. Медіана помиляється приблизно на чверть більше: вона «викидає» частину інформації.`,laplace:`За шуму <b>Лапласа</b> (гостріший пік і товщі «хвости»: великі похибки трапляються помітно частіше, ніж у Гаусса) виграє медіана — оцінка суми модулів. Середнє страждає саме від цих великих похибок.`,uniform:`За <b>рівномірного</b> шуму (похибка ніколи не перевищує межу) виграє середина розмаху — оцінка мінімаксу. Тут крайні виміри найінформативніші.`}[e]}o.addEventListener(`input`,D),c.forEach(e=>e.addEventListener(`change`,D)),m(`[data-action="reroll"]`,e).addEventListener(`click`,()=>{E+=1,D()}),D()}function b(){let e=m(`#w-clt`),t=m(`.plot`,e),i=m(`input[name="k"]`,e),a=m(`output[for="clt-k"]`,e),o=l(t,{width:n(t)?420:600,height:260,x:[-4,4],y:[0,.6],margin:{top:12,right:14,bottom:28,left:14},xTicks:[-4,-3,-2,-1,0,1,2,3,4],ariaLabel:`Гістограма суми k рівномірних похибок і гауссова крива`}),s=r(`g`,{},o.layer),c=r(`path`,{fill:`none`,stroke:`var(--good)`,"stroke-width":2.5,"stroke-dasharray":`6 4`},o.layer),u=Array.from({length:201},(e,t)=>-4+8*t/200);c.setAttribute(`d`,`M`+u.map(e=>`${o.sx(e).toFixed(1)},${o.sy(g(`gauss`,e)).toFixed(1)}`).join(`L`));function d(){let e=Number(i.value);a.textContent=String(e);let t=p(17+e),n=2e4,c=.2,l=Array(40).fill(0);for(let r=0;r<n;r++){let n=0;for(let r=0;r<e;r++)n+=2*t()-1;let r=n/Math.sqrt(e/3),i=Math.floor((r+4)/c);i>=0&&i<40&&l[i]++}s.replaceChildren(),l.forEach((e,t)=>{let i=e/(n*c);r(`rect`,{x:o.sx(-4+t*c)+.5,width:o.sx(c)-o.sx(0)-1,y:o.sy(Math.min(i,.6)),height:o.sy(0)-o.sy(Math.min(i,.6)),fill:`var(--accent)`,opacity:.6},s)})}i.addEventListener(`input`,d),d()}function x(){let e=m(`#w-ellipse`),t=m(`.plot-map`,e),i=m(`.plot-zoom`,e),h=m(`[data-out="stats"]`,e),g=m(`[data-out="status"]`,e),_=[...e.querySelectorAll(`[data-preset]`)],v=n(t),y=[500,450],b={around:[[120,150],[880,180],[500,900]],oneside:[[420,60],[500,40],[580,60]],four:[[120,150],[880,180],[500,900],[150,780]]},x=`around`,S=b.around.map(e=>[...e]),C=l(t,{width:v?400:330,height:v?400:330,x:[0,1e3],y:[0,1e3],margin:{top:12,right:12,bottom:26,left:38},xTicks:[0,500,1e3],yTicks:[0,500,1e3],ariaLabel:`Карта: станції та визначувана точка`}),w=r(`g`,{},C.layer);r(`circle`,{cx:C.sx(y[0]),cy:C.sy(y[1]),r:6,fill:`var(--warn)`},C.layer);let T=r(`g`,{},C.svg),E=l(i,{width:400,height:400,x:[-9,9],y:[-9,9],margin:{top:12,right:12,bottom:26,left:30},xTicks:[-8,-4,0,4,8],yTicks:[-8,-4,0,4,8],ariaLabel:`Наближення біля точки: розв'язки повторних експериментів і еліпси похибок`}),D=r(`text`,{x:36,y:26,class:`plot-label`,style:`font-weight: 600`},E.svg);D.textContent=`Біля точки, метри`;let O=r(`g`,{},E.layer),k=r(`ellipse`,{fill:`none`,stroke:`var(--accent)`,"stroke-width":2.5},E.layer),A=r(`ellipse`,{fill:`none`,stroke:`var(--accent)`,"stroke-width":1.5,"stroke-dasharray":`6 4`},E.layer);function j(){T.replaceChildren(),S.forEach((e,t)=>{let n=r(`g`,{class:`draggable`,tabindex:0,role:`button`,"aria-label":`Станція ${t+1}`},T);r(`circle`,{r:16,class:`drag-halo`},n),r(`path`,{d:`M0,-10 L9,7 L-9,7 Z`,fill:`var(--accent)`,stroke:`var(--surface)`,"stroke-width":1.5},n),c(n,C.svg,(t,n)=>{e[0]=s(Math.round(C.ix(t)/10)*10,0,1e3),e[1]=s(Math.round(C.iy(n)/10)*10,0,1e3),N(!1)},()=>N(!0))})}function M(e){let t=[...y];for(let n=0;n<5;n++){let n=[],r=[];for(let i=0;i<S.length;i++){let[a,o]=S[i],s=Math.hypot(t[0]-a,t[1]-o);n.push([(t[0]-a)/s,(t[1]-o)/s]),r.push(e[i]-s)}let i=u(n,r);if(!i)return null;t=[t[0]+i[0],t[1]+i[1]]}return t}function N(e=!0){[...T.children].forEach((e,t)=>e.setAttribute(`transform`,`translate(${C.sx(S[t][0])},${C.sy(S[t][1])})`)),w.replaceChildren(),S.forEach(([e,t])=>r(`line`,{x1:C.sx(e),y1:C.sy(t),x2:C.sx(y[0]),y2:C.sy(y[1]),stroke:`var(--accent)`,"stroke-opacity":.4,"stroke-width":1.5},w));let t=0,n=0,i=0;for(let[e,r]of S){let a=Math.hypot(y[0]-e,y[1]-r),o=[(y[0]-e)/a,(y[1]-r)/a];t+=o[0]*o[0],n+=o[0]*o[1],i+=o[1]*o[1]}let c=t*i-n*n,l=[[1*i/c,-1*n/c],[-1*n/c,1*t/c]],{l1:u,l2:m,angle:v}=f(l),b=Math.sqrt(Math.max(u,0)),D=Math.sqrt(Math.max(m,0)),j=E.sx(1)-E.sx(0),N=-v*180/Math.PI,P=Math.sqrt(-2*Math.log(.05));o(k,{cx:E.sx(0),cy:E.sy(0),rx:b*j,ry:D*j,transform:`rotate(${N} ${E.sx(0)} ${E.sy(0)})`}),o(A,{cx:E.sx(0),cy:E.sy(0),rx:P*b*j,ry:P*D*j,transform:`rotate(${N} ${E.sx(0)} ${E.sy(0)})`});let F=Math.sqrt((t+i)/c),I=0,L=0,R=0;if(e){O.replaceChildren();let e=p(99),a=[[t/1,n/1],[n/1,i/1]];for(let t=0;t<400;t++){let t=M(S.map(([t,n])=>Math.hypot(y[0]-t,y[1]-n)+1*d(e)));if(!t)continue;R++;let n=t[0]-y[0],i=t[1]-y[1],o=n*(a[0][0]*n+a[0][1]*i)+i*(a[1][0]*n+a[1][1]*i);o<=1&&I++,o<=P*P&&L++,r(`circle`,{cx:E.sx(s(n,-9,9)),cy:E.sy(s(i,-9,9)),r:2.2,fill:`var(--warn)`,opacity:.55},O)}}else O.replaceChildren();h.innerHTML=`
      <tr><td>Півосі 1σ-еліпса</td><td class="num">${a(b,2)} м і ${a(D,2)} м</td></tr>
      <tr><td>Геометричний фактор (HDOP)</td><td class="num">${a(F,2)}</td></tr>
      ${e&&R?`<tr><td>У суцільному еліпсі (теорія 39 %)</td><td class="num">${a(100*I/R,1)} %</td></tr><tr><td>У пунктирному еліпсі (теорія 95 %)</td><td class="num">${a(100*L/R,1)} %</td></tr>`:``}`,_.forEach(e=>e.classList.toggle(`active`,e.dataset.preset===x)),g.className=F>3?`status warn`:`status info`,g.innerHTML=F>3?`Станції бачать точку майже з одного напрямку, тож їхні промені майже паралельні. Уздовж цього напрямку точку визначено добре, а впоперек — погано: еліпс витягнутий, похибка в <b>${a(F,1)}</b> раза більша за похибку однієї відстані.`:`Помаранчеві точки — 400 розв'язків тієї самої задачі з різним випадковим шумом. Еліпси порахувано заздалегідь формулою σ²(JᵀJ)⁻¹, жодного експерименту для цього не знадобилося.`}_.forEach(e=>e.addEventListener(`click`,()=>{x=e.dataset.preset,S=b[x].map(e=>[...e]),j(),N()})),j(),N()}y(),b(),x();