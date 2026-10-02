import{n as e,r as t,t as n}from"./common-DcWhnavj.js";import{a as r,d as i,f as a,i as o,l as s,n as c,r as l}from"./plot-BqFxNYwL.js";e(),n(),a({solvers:{py:`import numpy as np

# Пряма через 10 точок, але x — «роки» далеко від нуля (x ≈ 1 000 000).
# Справжні параметри: зсув у точці X0 дорівнює 2, нахил 0.5.
X0 = 1_000_000.0
t = np.arange(10.0)
x = X0 + t
y = 2 + 0.5 * t + 0.01 * np.array([1, -2, 0, 1, -1, 2, 0, -1, 1, -1])
A = np.column_stack([np.ones_like(x), x])

print(f"число обумовленості A:     {np.linalg.cond(A):.2e}")
print(f"число обумовленості AᵀA:   {np.linalg.cond(A.T @ A):.2e}  (≈ квадрат)")

# Еталон: центрована формула (без катастрофічного скорочення).
b_ref = ((t - t.mean()) * (y - y.mean())).sum() / ((t - t.mean()) ** 2).sum()

def report(name, theta):
    err = abs(theta[1] - b_ref) / abs(b_ref)
    print(f"{name:28s} b = {theta[1]:.10f}   відносна похибка {err:.1e}")

# 1) «Як у формулі»: обернена матриця нормальних рівнянь. Так робити не варто.
report("inv(AᵀA)·Aᵀy", np.linalg.inv(A.T @ A) @ A.T @ y)
# 2) Нормальні рівняння, але через розв'язок системи, без явного оберненого.
report("solve(AᵀA, Aᵀy)", np.linalg.solve(A.T @ A, A.T @ y))
# 3) QR-розклад: A = QR, тоді R·θ = Qᵀy.
Q, R = np.linalg.qr(A)
report("QR", np.linalg.solve(R, Q.T @ y))
# 4) SVD: так працює numpy.linalg.lstsq (і sklearn LinearRegression).
report("lstsq (SVD)", np.linalg.lstsq(A, y, rcond=None)[0])
# 5) Найкраще — прибрати причину: центрувати x.
Ac = np.column_stack([np.ones_like(t), t - t.mean()])
report("центровані x + lstsq", np.linalg.lstsq(Ac, y, rcond=None)[0])
`,js:`// МНК двома способами: нормальні рівняння (Холецький) і QR (відбиття Хаусхолдера).
// A — масив рядків n×k, y — масив довжини n.

function normalEquations(A, y) {
  const k = A[0].length;
  const N = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => A.reduce((s, r) => s + r[i] * r[j], 0)));
  const u = Array.from({ length: k }, (_, i) => A.reduce((s, r, m) => s + r[i] * y[m], 0));
  // Розклад Холецького N = L·Lᵀ, потім два трикутні розв'язки.
  const L = N.map((row) => row.map(() => 0));
  for (let i = 0; i < k; i++) {
    for (let j = 0; j <= i; j++) {
      let s = N[i][j];
      for (let p = 0; p < j; p++) s -= L[i][p] * L[j][p];
      L[i][j] = i === j ? Math.sqrt(s) : s / L[j][j];
    }
  }
  const z = [];
  for (let i = 0; i < k; i++) z[i] = (u[i] - L[i].slice(0, i).reduce((s, l, p) => s + l * z[p], 0)) / L[i][i];
  const theta = [];
  for (let i = k - 1; i >= 0; i--) {
    let s = z[i];
    for (let p = i + 1; p < k; p++) s -= L[p][i] * theta[p];
    theta[i] = s / L[i][i];
  }
  return theta;
}

function qrLeastSquares(A, y) {
  const n = A.length, k = A[0].length;
  const R = A.map((r) => [...r]);
  const b = [...y];
  for (let j = 0; j < k; j++) {
    // Відбиття, що обнуляє стовпець j нижче діагоналі.
    let norm = 0;
    for (let i = j; i < n; i++) norm += R[i][j] ** 2;
    norm = Math.sqrt(norm);
    const alpha = R[j][j] > 0 ? -norm : norm;
    const v = R.map((r, i) => (i < j ? 0 : r[j]));
    v[j] -= alpha;
    const vv = v.reduce((s, t) => s + t * t, 0);
    if (vv === 0) continue;
    const reflect = (col) => {
      const f = (2 * v.reduce((s, t, i) => s + t * col(i), 0)) / vv;
      return f;
    };
    for (let c = j; c < k; c++) {
      const f = reflect((i) => R[i][c]);
      for (let i = j; i < n; i++) R[i][c] -= f * v[i];
    }
    const f = reflect((i) => b[i]);
    for (let i = j; i < n; i++) b[i] -= f * v[i];
  }
  // Зворотний хід для верхньотрикутної R (перші k рядків).
  const theta = [];
  for (let i = k - 1; i >= 0; i--) {
    let s = b[i];
    for (let p = i + 1; p < k; p++) s -= R[i][p] * theta[p];
    theta[i] = s / R[i][i];
  }
  return theta;
}

// Дані: x ≈ 10 000 000 з кроком 0,37 (скажімо, координата в метрах).
const X0 = 1e7;
const noise = [1, -2, 0, 1, -1, 2, 0, -1, 1, -1];
const x = noise.map((_, i) => X0 + 0.37 * i);
const y = noise.map((e, i) => 2 + 0.5 * i + 0.01 * e);
const A = x.map((xi) => [1, xi]);

// Еталон — центрована формула (спершу віднімаємо середні).
const xm = x.reduce((s, v) => s + v, 0) / x.length;
const ym = y.reduce((s, v) => s + v, 0) / y.length;
const bRef = x.reduce((s, xi, i) => s + (xi - xm) * (y[i] - ym), 0) / x.reduce((s, xi) => s + (xi - xm) ** 2, 0);

for (const [name, solve] of [["нормальні рівняння", normalEquations], ["QR (Хаусхолдер)", qrLeastSquares]]) {
  const b = solve(A, y)[1];
  console.log(\`\${name.padEnd(20)} b = \${b.toFixed(10)}   похибка \${Math.abs(b - bRef).toExponential(1)}\`);
}
console.log("еталон (центровано)  b =", bRef.toFixed(10));
`}});function u(e,t=document){let n=t.querySelector(e);if(!n)throw Error(`Не знайдено ${e}`);return n}function d(e,t=3){let n=o(e,t);return n.includes(`,`)&&(n=n.replace(/0+$/,``).replace(/,$/,``)),n===`−0`&&(n=`0`),n.replace(`−`,`-`).replace(`,`,`{,}`)}function f(e,t=1){if(!Number.isFinite(e))return`—`;if(e===0)return`0`;let n=Math.floor(Math.log10(Math.abs(e)));if(n>=-2&&n<=4)return o(e,Math.max(0,t+2-Math.max(0,n)));let r=e/10**n,i=String(n).replace(`-`,`⁻`).replace(/\d/g,e=>`⁰¹²³⁴⁵⁶⁷⁸⁹`[Number(e)]);return`${o(r,t)}·10${i}`}var p=[1,-2,0,1,-1,2,0,-1,1,-1];function m(e,t){return{xs:p.map((n,r)=>t(e+.37*r)),ys:p.map((e,n)=>t(2+.5*n+.05*e))}}function h(e,t){let n=e.length,r=e.reduce((e,t)=>e+t,0)/n,i=t.reduce((e,t)=>e+t,0)/n,a=0,o=0;for(let s=0;s<n;s++)a+=(e[s]-r)*(t[s]-i),o+=(e[s]-r)**2;return a/o}function g(e,t,n){let r=0,i=0,a=0,o=0;for(let s=0;s<e.length;s++)r=n(r+e[s]),i=n(i+t[s]),a=n(a+n(e[s]*e[s])),o=n(o+n(e[s]*t[s]));let s=e.length;return n(n(n(s*o)-n(r*i))/n(n(s*a)-n(r*r)))}function _(e,t,n){let r=e.length,i=n(1/n(Math.sqrt(r))),a=0;for(let t of e)a=n(a+n(i*t));let o=e.map(e=>n(e-n(a*i))),s=0;for(let e of o)s=n(s+n(e*e));s=n(Math.sqrt(s));let c=o.map(e=>n(e/s)),l=0;for(let e of t)l=n(l+n(i*e));let u=t.map(e=>n(e-n(l*i))),d=0;for(let e=0;e<r;e++)d=n(d+n(c[e]*u[e]));return n(d/s)}function v(e,t,n){let r=e.length,i=0,a=0;for(let o=0;o<r;o++)i=n(i+e[o]),a=n(a+t[o]);let o=n(i/r),s=n(a/r),c=0,l=0;for(let i=0;i<r;i++){let r=n(e[i]-o);c=n(c+n(r*n(t[i]-s))),l=n(l+n(r*r))}return n(c/l)}function y(){let e=u(`#w-precision`),t=u(`.plot`,e),n=r(t),a=u(`input[name="offset"]`,e),d=u(`output[for="offset"]`,e),p=u(`[data-out="table"]`,e),y=u(`[data-out="status"]`,e),b=[...e.querySelectorAll(`input[name="prec"]`)],x=[{key:`ne`,name:`Нормальні рівняння`,color:`var(--warn)`,f:g},{key:`qr`,name:`QR`,color:`var(--accent)`,f:_},{key:`c`,name:`Центрування + формула`,color:`var(--good)`,f:v}],S=[0,8],C=[-17,1],w=l(t,{width:n?420:620,height:n?300:340,x:S,y:C,margin:{top:16,right:16,bottom:34,left:52},xTicks:[0,2,4,6,8],yTicks:[-16,-12,-8,-4,0],ariaLabel:`Відносна похибка нахилу залежно від віддаленості x від нуля для трьох алгоритмів`}),T=e=>`10${String(e).replace(`-`,`⁻`).replace(/\d/g,e=>`⁰¹²³⁴⁵⁶⁷⁸⁹`[Number(e)])}`;w.svg.querySelectorAll(`.plot-axis text`).forEach(e=>{let t=Number((e.textContent??``).replace(`−`,`-`));e.textContent=T(t)});let E=i(`text`,{x:w.opts.width-18,y:w.opts.height-40,"text-anchor":`end`,class:`plot-label`},w.svg);E.textContent=`X₀ (наскільки x далеко від нуля)`;let D=i(`text`,{x:58,y:28,class:`plot-label`},w.svg);D.textContent=`відносна похибка нахилу`;let O=i(`line`,{stroke:`var(--muted)`,"stroke-dasharray":`2 4`,x1:w.sx(S[0]),x2:w.sx(S[1])},w.layer),k=i(`text`,{x:w.sx(S[1])-6,"text-anchor":`end`,class:`plot-label`},w.layer),A=x.map(e=>i(`path`,{fill:`none`,stroke:e.color,"stroke-width":2.5},w.layer)),j=i(`line`,{stroke:`var(--text)`,"stroke-width":1,"stroke-dasharray":`4 3`,y1:w.sy(C[0]),y2:w.sy(C[1])},w.layer),M=x.map(e=>i(`circle`,{r:5,fill:e.color},w.layer)),N=()=>b.find(e=>e.checked)?.value??`32`,P=(e,t,n)=>{let{xs:r,ys:i}=m(e,n),a=h(r,i),o=t.f(r,i,n),s=Math.abs(o-a)/Math.abs(a);return{b:o,ref:a,e:Number.isFinite(s)?s:1/0}},F=e=>Number.isFinite(e)?c(Math.log10(Math.max(e,1e-17)),C[0],C[1]):C[1];function I(){let e=N()===`32`?Math.fround:e=>e,t=N()===`32`?2**-24:2**-53;s(O,{y1:w.sy(Math.log10(t)),y2:w.sy(Math.log10(t))}),s(k,{y:w.sy(Math.log10(t))-5}),k.textContent=`точність ${N()===`32`?`float32`:`float64`} ≈ ${f(t)}`,x.forEach((t,n)=>{let r=[];for(let n=0;n<=160;n++){let i=S[0]+(S[1]-S[0])*n/160,{e:a}=P(10**i,t,e);r.push(`${w.sx(i).toFixed(1)},${w.sy(F(a)).toFixed(1)}`)}A[n].setAttribute(`d`,`M`+r.join(`L`))})}function L(){let e=Number(a.value),t=Math.round(10**e),n=N()===`32`?Math.fround:e=>e;d.textContent=t.toLocaleString(`uk-UA`),s(j,{x1:w.sx(e),x2:w.sx(e)});let r=N()===`32`?7:16,i=x.map((i,a)=>{let{b:l,e:u}=P(t,i,n);s(M[a],{cx:w.sx(e),cy:w.sy(F(u))});let d=c(-Math.log10(Math.max(u,1e-17)),0,r);return`<tr><td><i class="swatch" style="border-color:${i.color}"></i>${i.name}</td><td class="num">${Number.isFinite(l)?o(l,6):`—`}</td><td class="num">${Number.isFinite(u)?f(u):`—`}</td><td class="num">${d<.5?`<b style="color:var(--bad)">0</b>`:o(d,0)}</td></tr>`});p.innerHTML=`<thead><tr><th>Спосіб</th><th>Нахил b</th><th>Похибка</th><th title="Скільки правильних десяткових цифр">Цифр</th></tr></thead><tbody>${i.join(``)}</tbody>`;let l=P(t,x[0],n).e,u=P(t,x[1],n).e,{xs:h}=m(t,n);h.some((e,t)=>t>0&&e<=h[t-1])?(y.className=`status warn`,y.innerHTML=`За такого X₀ ${N()===`32`?`float32`:`float64`} не може навіть записати сусідні x, що відрізняються на 0,37: вони злипаються. Тут не допоможе жоден алгоритм, дані зіпсовано ще до обчислень.`):l>.01&&u<.01?(y.className=`status warn`,y.innerHTML=`<b>Нормальні рівняння зламалися</b> (похибка ${Number.isFinite(l)?f(l):`нескінченна`}), а QR ще тримається (${f(u)}). Число обумовленості AᵀA — квадрат від обумовленості A, тож НР може губити вдвічі більше цифр.`):l>.01?(y.className=`status warn`,y.innerHTML=`Тепер не справляється і QR. Рятує лише центрування: воно прибирає саму причину поганої обумовленості.`):(y.className=`status info`,y.innerHTML=`Поки x близько до нуля, усі три способи дають майже однаковий результат. Збільшуйте X₀.`)}a.addEventListener(`input`,L),b.forEach(e=>e.addEventListener(`change`,()=>{I(),L()})),I(),L()}function b(e){let t=e.length,n=e[0].length,r=e.map(e=>[...e]),i=Array.from({length:n},(e,t)=>Array.from({length:n},(e,n)=>+(t===n)));for(let e=0;e<80;e++){let e=0;for(let a=0;a<n-1;a++)for(let o=a+1;o<n;o++){let s=0,c=0,l=0;for(let e=0;e<t;e++)s+=r[e][a]**2,c+=r[e][o]**2,l+=r[e][a]*r[e][o];let u=Math.sqrt(s*c);if(u===0||Math.abs(l)<=1e-15*u)continue;e=Math.max(e,Math.abs(l)/u);let d=(c-s)/(2*l),f=Math.sign(d||1)/(Math.abs(d)+Math.sqrt(1+d*d)),p=1/Math.sqrt(1+f*f),m=p*f;for(let e=0;e<t;e++){let[t,n]=[r[e][a],r[e][o]];r[e][a]=p*t-m*n,r[e][o]=m*t+p*n}for(let e=0;e<n;e++){let[t,n]=[i[e][a],i[e][o]];i[e][a]=p*t-m*n,i[e][o]=m*t+p*n}}if(e<1e-15)break}let a=Array.from({length:n},(e,t)=>Math.sqrt(r.reduce((e,n)=>e+n[t]**2,0))),o=a.map((e,t)=>t).sort((e,t)=>a[t]-a[e]);return{s:o.map(e=>a[e]),u:o.map(e=>r.map(t=>a[e]>0?t[e]/a[e]:0)),v:o.map(e=>i.map(t=>t[e]))}}function x(){let e=u(`#w-svd`),t=u(`input[name="delta"]`,e),n=u(`input[name="cut"]`,e),r=u(`output[for="delta"]`,e),a=u(`output[for="cut"]`,e),d=u(`[data-out="table"]`,e),p=u(`[data-out="status"]`,e),m=u(`.plot`,e),h=[0,1,2,3,4,5,6,7],g=[1,-1,1,-1,-1,1,-1,1],_=[.3,-.5,.8,.1,-.7,.4,-.2,-.3].map(e=>.1*e),v=l(m,{width:520,height:300,x:[.4,3.6],y:[-12,2],margin:{top:16,right:12,bottom:30,left:46},xTicks:[1,2,3],yTicks:[-12,-8,-4,0],ariaLabel:`Сингулярні числа матриці A в логарифмічному масштабі та поріг обрізання`});v.svg.querySelectorAll(`.plot-axis text`).forEach(e=>{let t=Number((e.textContent??``).replace(`−`,`-`));e.textContent=Number.isInteger(t)&&Math.abs(t)>=4||t===0?`10${String(t).replace(`-`,`⁻`).replace(/\d/g,e=>`⁰¹²³⁴⁵⁶⁷⁸⁹`[Number(e)])}`:`σ${`₁₂₃`[t-1]??``}`});let y=[0,1,2].map(()=>i(`rect`,{width:44,rx:3},v.layer)),x=[0,1,2].map(()=>i(`text`,{"text-anchor":`middle`,class:`residual-label`},v.svg)),S=i(`line`,{stroke:`var(--bad)`,"stroke-width":2,"stroke-dasharray":`6 4`,x1:v.sx(.4),x2:v.sx(3.6)},v.layer);function C(){let e=10**Number(t.value),i=10**Number(n.value);r.textContent=f(e),a.textContent=f(i);let l=h.map((t,n)=>t+e*g[n]),u=h.map((e,t)=>1+.5*e+.5*l[t]+_[t]),m=h.map((e,t)=>[1,e,l[t]]),{s:C,u:w,v:T}=b(m),E=v.sy(-12);C.forEach((e,t)=>{let n=c(Math.log10(e),-12,2),r=e/C[0]>i;s(y[t],{x:v.sx(t+1)-22,y:v.sy(n),height:Math.max(1,E-v.sy(n)),fill:r?`var(--accent)`:`var(--muted)`,opacity:r?.85:.4}),s(x[t],{x:v.sx(t+1),y:v.sy(n)-6,style:`fill: ${r?`var(--accent)`:`var(--muted)`}`}),x[t].textContent=f(e)});let D=c(Math.log10(C[0]*i),-12,2);s(S,{y1:v.sy(D),y2:v.sy(D)});let O=e=>{let t=[0,0,0];return C.forEach((n,r)=>{if(!e(r)||n===0)return;let i=w[r].reduce((e,t,n)=>e+t*u[n],0)/n;for(let e=0;e<3;e++)t[e]+=i*T[r][e]}),{th:t,S:m.map((e,n)=>u[n]-e.reduce((e,n,r)=>e+n*t[r],0)).reduce((e,t)=>e+t*t,0),norm:Math.hypot(...t)}},k=O(()=>!0),A=O(e=>C[e]/C[0]>i),j=C.filter(e=>e/C[0]>i).length,M=(e,t)=>`<tr><td>${e}</td>${t.th.map(e=>`<td class="num">${Math.abs(e)>1e4?f(e):o(e,3)}</td>`).join(``)}<td class="num">${o(t.S,3)}</td></tr>`;d.innerHTML=`<thead><tr><th></th><th>a</th><th>b₁</th><th>b₂</th><th>S</th></tr></thead><tbody>${M(`усі 3 σ`,k)}${M(`лише ${j} σ`,A)}</tbody>`;let N=C[0]/C[2];j===3?(p.className=`status info`,p.innerHTML=`Число обумовленості A: <b>${f(N)}</b>. ${Math.abs(k.th[1])>3?`Ознаки майже однакові, і повний розв'язок «розхитався»: b₁ і b₂ великі й протилежні за знаком, хоча S майже не менша. Підніміть поріг обрізання.`:`Стовпці достатньо різні, повний розв'язок стабільний.`}`):(p.className=`status success`,p.innerHTML=`Відкинули ${3-j} мал${3-j==1?`е`:`і`} сингулярн${3-j==1?`е число`:`і числа`}: параметри стали розумними (b₁ ≈ b₂), а S зросла лише на ${f(A.S-k.S)}. Це і є <b>розв'язок з найменшою нормою</b>: |θ| = ${o(A.norm,3)} замість ${f(k.norm)}.`)}t.addEventListener(`input`,C),n.addEventListener(`input`,C),C()}function S(){let e=document.querySelector(`#qr-check`);if(!e)return;let n=Math.sqrt(3),r=Math.sqrt(2),i=1/r/r,a=(5/n-2*n*i)/n;t(e,`b = \\frac{1/\\sqrt2}{\\sqrt2} = ${d(i,4)},\\qquad a = \\frac{5/\\sqrt3 - 2\\sqrt3\\cdot ${d(i,4)}}{\\sqrt3} = ${d(a,4)}`,!0)}y(),x(),S();