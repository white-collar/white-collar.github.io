import{n as e,r as t,t as n}from"./common-DcWhnavj.js";import{a as r,c as i,d as a,f as o,i as s,l as c,n as l,o as u,r as d,t as f,u as p}from"./plot-BqFxNYwL.js";import{d as m,o as h}from"./linalg-Q8j_e_NO.js";e(),n(),o({normal:{py:`import numpy as np

x = np.array([1.0, 2.0, 3.0])
y = np.array([1.0, 2.0, 2.0])
n = len(x)

# Таблиця сум — як рахували вручну: x, y, x², xy.
Sx, Sy, Sxx, Sxy = x.sum(), y.sum(), (x * x).sum(), (x * y).sum()
print(f"n = {n}, Σx = {Sx:g}, Σy = {Sy:g}, Σx² = {Sxx:g}, Σxy = {Sxy:g}")

# Нормальні рівняння:  n·a + Σx·b = Σy
#                     Σx·a + Σx²·b = Σxy
N = np.array([[n, Sx], [Sx, Sxx]])
u = np.array([Sy, Sxy])
a, b = np.linalg.solve(N, u)
print(f"з нормальних рівнянь: a = {a:.4f}, b = {b:.4f}")

# Те саме «шкільними» формулами через центровані дані.
b2 = ((x - x.mean()) * (y - y.mean())).sum() / ((x - x.mean()) ** 2).sum()
a2 = y.mean() - b2 * x.mean()
print(f"через центровані суми: a = {a2:.4f}, b = {b2:.4f}")

# Дві умови рівноваги на дні чаші: Σr = 0 і Σx·r = 0.
r = y - (a + b * x)
print(f"нев'язки {np.round(r, 4)}, Σr = {r.sum():.2e}, Σx·r = {(x * r).sum():.2e}")

# Матричний запис того самого: AᵀA·θ = Aᵀy. Так працює для будь-якої кількості параметрів.
A = np.column_stack([np.ones(n), x])
print("AᵀA =", (A.T @ A).tolist(), " Aᵀy =", (A.T @ y).tolist())
print("θ =", np.linalg.solve(A.T @ A, A.T @ y), " polyfit:", np.polyfit(x, y, 1)[::-1])
`,js:`// Розв'язок системи N·θ = u методом Гаусса (з вибором головного елемента).
function gaussSolve(N, u) {
  const k = u.length;
  const M = N.map((row, i) => [...row, u[i]]);        // розширена матриця
  for (let c = 0; c < k; c++) {
    let p = c;
    for (let i = c + 1; i < k; i++) if (Math.abs(M[i][c]) > Math.abs(M[p][c])) p = i;
    [M[c], M[p]] = [M[p], M[c]];
    for (let i = c + 1; i < k; i++) {
      const f = M[i][c] / M[c][c];
      for (let j = c; j <= k; j++) M[i][j] -= f * M[c][j];
    }
  }
  const theta = new Array(k).fill(0);                  // зворотний хід
  for (let i = k - 1; i >= 0; i--) {
    let s = M[i][k];
    for (let j = i + 1; j < k; j++) s -= M[i][j] * theta[j];
    theta[i] = s / M[i][i];
  }
  return theta;
}

// Нормальні рівняння для довільної матриці A (n×k): (AᵀA)·θ = Aᵀy.
function leastSquares(A, y) {
  const k = A[0].length;
  const N = Array.from({ length: k }, (_, i) =>
    Array.from({ length: k }, (_, j) => A.reduce((s, row) => s + row[i] * row[j], 0)));
  const u = Array.from({ length: k }, (_, i) => A.reduce((s, row, r) => s + row[i] * y[r], 0));
  return { N, u, theta: gaussSolve(N, u) };
}

// 1) Пряма через три точки: рядки A — (1, xᵢ).
const x = [1, 2, 3], y = [1, 2, 2];
const line = leastSquares(x.map((xi) => [1, xi]), y);
console.log("AᵀA =", line.N, " Aᵀy =", line.u);
console.log("a, b =", line.theta.map((v) => +v.toFixed(4)));

// 2) Нівелірна мережа: Rp (100 м) → B → C → Rp. Невідомі: висоти B і C.
//    Рівняння: H_B − 100 = 1.203;  H_C − H_B = 0.402;  H_C − 100 = 1.611
const A = [[1, 0], [-1, 1], [0, 1]];
const l = [100 + 1.203, 0.402, 100 + 1.611];
const net = leastSquares(A, l);
console.log("AᵀA =", net.N, " Aᵀl =", net.u.map((v) => +v.toFixed(3)));
const [HB, HC] = net.theta;
const v = A.map((row, i) => +((row[0] * HB + row[1] * HC - l[i]) * 1000).toFixed(2));
console.log(\`H_B = \${HB.toFixed(4)} м, H_C = \${HC.toFixed(4)} м, виправлення v =\`, v, "мм");
`}});function g(e,t=document){let n=t.querySelector(e);if(!n)throw Error(`Не знайдено ${e}`);return n}function _(e,t=2){let n=s(e,t);return n.includes(`,`)&&(n=n.replace(/0+$/,``).replace(/,$/,``)),n===`−0`&&(n=`0`),n.replace(`−`,`-`).replace(`,`,`{,}`)}var v=(e,t=2)=>_(e,t).replace(`{,}`,`,`).replace(`-`,`−`),y=(e,t=2)=>e<0?`- ${_(-e,t)}`:`+ ${_(e,t)}`,b=(e,t=2)=>e<0?`(${_(e,t)})`:_(e,t);function x(e){let n=g(`#w-normal`),o={three:[{x:1,y:1},{x:2,y:2},{x:3,y:2}],five:[{x:.5,y:.6},{x:1.5,y:1.7},{x:2.5,y:1.8},{x:3.5,y:2.9},{x:5,y:3.2}]},v=[0,6],b=[-1,4],x=g(`.plot`,n),S=r(x),C=d(x,{width:S?420:520,height:S?320:380,x:v,y:b,margin:{top:16,right:14,bottom:30,left:34},xTicks:[0,1,2,3,4,5,6],yTicks:[-1,0,1,2,3,4],xLabel:`x`,yLabel:`y`,ariaLabel:`Точки, пряма та нев'язки`}),w=a(`g`,{},C.svg);a(`circle`,{r:6,fill:`none`,stroke:`var(--good)`,"stroke-width":2},w),a(`path`,{d:`M-10,0 H10 M0,-10 V10`,stroke:`var(--good)`,"stroke-width":1.5},w);let T=a(`line`,{class:`fit-line`},C.layer),E=a(`g`,{},C.layer),D=a(`g`,{},C.svg),O=d(g(`.plot-res`,n),{width:S?420:520,height:170,x:v,y:[-1.5,1.5],margin:{top:22,right:14,bottom:26,left:34},xTicks:[0,1,2,3,4,5,6],yTicks:[-1,0,1],ariaLabel:`Графік нев'язок: нев'язки проти x`}),k=a(`text`,{x:40,y:14,class:`plot-label`,style:`font-weight: 600`},O.svg);k.textContent=`Нев'язки rᵢ проти xᵢ і їхній «тренд»`;let A=a(`line`,{stroke:`var(--warn)`,"stroke-width":2,"stroke-dasharray":`6 4`},O.layer),j=a(`g`,{},O.layer),M=g(`input[name="a"]`,n),N=g(`input[name="b"]`,n),P=g(`output[for="n-a"]`,n),F=g(`output[for="n-b"]`,n),I=g(`[data-out="eq"]`,n),L=[g(`[data-gauge="0"]`,n),g(`[data-gauge="1"]`,n)],R=g(`[data-out="status"]`,n),z=[...n.querySelectorAll(`[data-preset]`)],B=[],V=`three`,H=.3,U=.8;function W(){D.replaceChildren(),B.forEach((e,t)=>{let n=a(`g`,{class:`draggable`,tabindex:0,role:`button`,"aria-label":`Точка ${t+1}`},D);a(`circle`,{r:18,class:`drag-halo`},n),a(`circle`,{r:6.5,class:`data-point`},n);let r=(e,n)=>{B[t].x=l(e,v[0]+.1,v[1]-.1),B[t].y=l(n,b[0]+.1,b[1]-.1),K()};u(n,C.svg,(e,t)=>r(p(C.ix(e),.1),p(C.iy(t),.1))),n.addEventListener(`keydown`,e=>{let n={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]}[e.key];n&&(e.preventDefault(),r(+(B[t].x+n[0]).toFixed(1),+(B[t].y+n[1]).toFixed(1)))})})}function G(e,t,n){let r=l(t/n,-1,1),i=g(`.gauge-bar`,e);i.style.left=r<0?`${50+50*r}%`:`50%`,i.style.width=`${Math.abs(50*r)}%`,i.style.background=Math.abs(t)<.005?`var(--good)`:`var(--warn)`,g(`.gauge-value`,e).textContent=s(t,3,!0)}function K(){let n=B.map(e=>e.y-(H+U*e.x));c(T,{x1:C.sx(v[0]),y1:C.sy(H+U*v[0]),x2:C.sx(v[1]),y2:C.sy(H+U*v[1])}),E.replaceChildren(),j.replaceChildren(),B.forEach((e,t)=>{let r=i(n[t],1.2);Math.abs(n[t])>.004&&a(`line`,{class:`residual`,x1:C.sx(e.x),x2:C.sx(e.x),y1:C.sy(e.y),y2:C.sy(H+U*e.x),stroke:r},E),D.children[t]?.setAttribute(`transform`,`translate(${C.sx(e.x)},${C.sy(e.y)})`);let o=l(n[t],-1.45,1.45);a(`line`,{x1:O.sx(e.x),x2:O.sx(e.x),y1:O.sy(0),y2:O.sy(o),stroke:r,"stroke-width":2},j),a(`circle`,{cx:O.sx(e.x),cy:O.sy(o),r:5,fill:r},j)});let r=h(B.map((e,t)=>({x:e.x,y:n[t]}))),o=m(r.M,r.v)??[0,0];c(A,{x1:O.sx(v[0]),y1:O.sy(o[0]+o[1]*v[0]),x2:O.sx(v[1]),y2:O.sy(o[0]+o[1]*v[1])});let u=B.length,d=B.reduce((e,t)=>e+t.x,0)/u,f=B.reduce((e,t)=>e+t.y,0)/u;w.setAttribute(`transform`,`translate(${C.sx(d)},${C.sy(f)})`);let p=n.reduce((e,t)=>e+t,0),g=B.reduce((e,t,r)=>e+t.x*n[r],0);G(L[0],p,3),G(L[1],g,8),M.value=String(H),N.value=String(U),P.textContent=s(H,2),F.textContent=s(U,2),t(I,`y = ${_(H,3)} ${y(U,3)}\\,x`);let b=Math.abs(p)<.005;b&&Math.abs(g)<.005?(R.className=`status success`,R.innerHTML=`<b>Обидві умови виконано — це дно чаші.</b> Пряма проходить через центр ваги (зелений хрестик), а в графіку нев'язок не лишилося жодного нахилу.`):b?(R.className=`status info`,R.innerHTML=`Σr = 0: пряма проходить через центр ваги. Але нев'язки ще мають «тренд» уздовж x — пряму можна повернути навколо центру ваги й зменшити S.`):(R.className=`status`,R.innerHTML=`Змінюйте a і b, доки обидва індикатори не стануть нулем. Або натисніть кнопку — вона розв'яже нормальні рівняння.`),z.forEach(e=>e.classList.toggle(`active`,e.dataset.preset===V)),e.forEach(e=>e(B))}function q(e){V=e,B=o[e].map(e=>({...e})),W(),K()}M.addEventListener(`input`,()=>{H=Number(M.value),K()}),N.addEventListener(`input`,()=>{U=Number(N.value),K()}),z.forEach(e=>e.addEventListener(`click`,()=>q(e.dataset.preset))),g(`[data-action="solve"]`,n).addEventListener(`click`,()=>{let e=h(B),t=m(e.M,e.v);if(!t)return;let[n,r]=[H,U];f(700,e=>{H=n+(t[0]-n)*e,U=r+(t[1]-r)*e,K()})}),g(`[data-action="centroid"]`,n).addEventListener(`click`,()=>{let e=B.length,t=B.reduce((e,t)=>e+t.x,0)/e,n=B.reduce((e,t)=>e+t.y,0)/e,r=H;f(500,e=>{H=r+(n-U*t-r)*e,K()})}),q(`three`)}function S(){let e=g(`#w-sums`),n=g(`[data-out="table"]`,e),r=g(`[data-out="eqs"]`,e);return e=>{let i=e.map((e,t)=>`<tr><td>${t+1}</td><td class="num">${v(e.x,1)}</td><td class="num">${v(e.y,1)}</td><td class="num">${v(e.x*e.x)}</td><td class="num">${v(e.x*e.y)}</td></tr>`).join(``),a=h(e),[o,s,c,l,u]=[a.M[0][0],a.M[0][1],a.M[1][1],a.v[0],a.v[1]];n.innerHTML=`<thead><tr><th>i</th><th>xᵢ</th><th>yᵢ</th><th>xᵢ²</th><th>xᵢ·yᵢ</th></tr></thead><tbody>${i}</tbody>
      <tfoot><tr><th>Σ</th><th class="num">${v(s)}</th><th class="num">${v(l)}</th><th class="num">${v(c)}</th><th class="num">${v(u)}</th></tr></tfoot>`;let d=m(a.M,a.v);t(r,`\\begin{cases} ${_(o)}\\,a ${y(s)}\\,b = ${_(l)} \\\\ ${_(s)}\\,a ${y(c)}\\,b = ${_(u)} \\end{cases}`+(d?`\\quad\\Longrightarrow\\quad a = ${_(d[0],4)},\\; b = ${_(d[1],4)}`:`\\quad\\text{(система вироджена)}`),!0)}}function C(){let e=g(`#w-steps`),n=g(`[data-out="steps"]`,e),r=g(`[data-out="counter"]`,e),i=g(`[data-action="prev"]`,e),a=g(`[data-action="next"]`,e),o=g(`[data-action="all"]`,e),s=1,c=[];function l(){let e=h(c),[t,n,r,i,a]=[e.M[0][0],e.M[0][1],e.M[1][1],e.v[0],e.v[1]],o=c.slice(0,3),s=c.length>3?` + \\ldots`:``,l=e=>Math.abs(Math.abs(e)-1)<1e-9?``:_(Math.abs(e),1)+`\\,`,u=(e,t)=>`${t?b(e.x,1)+`\\cdot`:``}(${_(e.y,1)} - a ${e.x<0?`+`:`-`} ${l(e.x)}b)`,d=t*r-n*n,f=m(e.M,e.v),p=n/t,g=i/t,v=c.reduce((e,t)=>e+(t.x-p)*(t.y-g),0),x=c.reduce((e,t)=>e+(t.x-p)**2,0);return[{title:`Функція, яку мінімізуємо`,general:`S(a, b) = \\sum_{i=1}^{n} \\bigl(y_i - a - b\\,x_i\\bigr)^2`,numbers:`S(a, b) = ${o.map(e=>u(e,!1)+`^2`).join(`¦`)}${s}`,text:`Звичайна сума квадратів нев'язок з розділів 2–3.`},{title:`Нахил уздовж a дорівнює нулю`,general:`\\frac{\\partial S}{\\partial a} = -2\\sum \\bigl(y_i - a - b\\,x_i\\bigr) = 0 §\\Longleftrightarrow\\; \\sum r_i = 0`,numbers:`${o.map(e=>u(e,!1)).join(`¦`)}${s} = 0`,text:`Похідна квадрата: 2·(вираз)·(похідна виразу), а похідна від (yᵢ − a − b·xᵢ) по a дорівнює −1. Множник −2 на нуль не впливає, тож умова проста: сума нев'язок дорівнює нулю.`},{title:`Нахил уздовж b дорівнює нулю`,general:`\\frac{\\partial S}{\\partial b} = -2\\sum x_i\\bigl(y_i - a - b\\,x_i\\bigr) = 0 §\\Longleftrightarrow\\; \\sum x_i\\, r_i = 0`,numbers:`${o.map(e=>u(e,!0)).join(`¦`)}${s} = 0`,text:`Тепер похідна виразу по b дорівнює −xᵢ, тож кожна нев'язка множиться на свій xᵢ. Умова: зважена сума нев'язок Σ xᵢ·rᵢ дорівнює нулю.`},{title:`Розкриваємо дужки: нормальні рівняння`,general:`\\begin{cases} n\\,a + \\bigl(\\sum x_i\\bigr)\\,b = \\sum y_i \\\\ \\bigl(\\sum x_i\\bigr)\\,a + \\bigl(\\sum x_i^2\\bigr)\\,b = \\sum x_i y_i \\end{cases}`,numbers:`\\begin{cases} ${_(t)}\\,a ${y(n)}\\,b = ${_(i)} \\\\ ${_(n)}\\,a ${y(r)}\\,b = ${_(a)} \\end{cases}`,text:`Дві лінійні умови перетворилися на систему двох лінійних рівнянь з двома невідомими. Її коефіцієнти — ті самі п'ять сум з таблиці вище.`},{title:`Розв'язуємо систему`,general:`b = \\frac{n\\sum x_i y_i - \\sum x_i \\sum y_i}{n\\sum x_i^2 - \\bigl(\\sum x_i\\bigr)^2} § a = \\frac{\\sum y_i - b\\sum x_i}{n}`,numbers:f?`b = \\frac{${_(t)}\\cdot ${b(a)} - ${b(n)}\\cdot ${b(i)}}{${_(t)}\\cdot ${b(r)} - ${b(n)}^2} = \\frac{${_(t*a-n*i,3)}}{${_(d,3)}} = ${_(f[1],4)} § a = \\frac{${_(i)} - ${b(f[1],4)}\\cdot ${b(n)}}{${_(t)}} = ${_(f[0],4)}`:`\\text{знаменник дорівнює нулю: усі } x_i \\text{ однакові}`,text:`Друге рівняння множимо на n, перше на Σx і віднімаємо: a зникає, лишається рівняння лише для b. Потім a знаходимо з першого рівняння.`},{title:`Та сама відповідь «по-людськи»`,general:`b = \\frac{\\sum (x_i - \\bar x)(y_i - \\bar y)}{\\sum (x_i - \\bar x)^2} § a = \\bar y - b\\,\\bar x`,numbers:f?`\\bar x = ${_(p,3)},\\; \\bar y = ${_(g,3)} § b = \\frac{${_(v,3)}}{${_(x,3)}} = ${_(f[1],4)} § a = ${_(g,3)} - ${b(f[1],4)}\\cdot ${b(p,3)} = ${_(f[0],4)}`:`\\text{—}`,text:`Нахил дорівнює «спільному розкиду» x і y, поділеному на розкид x. Зсув підбирається так, щоб пряма пройшла через центр ваги (x̄; ȳ). Саме цю пару формул дає будь-який підручник статистики.`}]}function u(e){return n.clientWidth<560?e.includes(`§`)?`\\begin{gathered}${e.split(`§`).map(e=>u(e)).join(`\\\\`)}\\end{gathered}`:e.includes(`¦`)?`\\begin{aligned}&${e.split(`¦`).join(`\\\\ &+ `)}\\end{aligned}`:e:e.replaceAll(`§`,`\\qquad `).replaceAll(`¦`,` + `)}function d(){let e=l();n.replaceChildren(),e.slice(0,s).forEach((e,r)=>{let i=document.createElement(`li`);i.className=`step`,i.innerHTML=`<div class="step-title"><span class="step-n">${r+1}</span>${e.title}</div><div class="step-general"></div><div class="step-numbers"></div><p class="step-text">${e.text}</p>`,t(g(`.step-general`,i),u(e.general),!0),t(g(`.step-numbers`,i),u(e.numbers),!0),n.appendChild(i)}),r.textContent=`Крок ${s} з ${e.length}`,i.disabled=s<=1,a.disabled=s>=e.length,o.disabled=s>=e.length}return i.addEventListener(`click`,()=>{s=Math.max(1,s-1),d()}),a.addEventListener(`click`,()=>{s+=1,d(),n.lastElementChild?.scrollIntoView({block:`nearest`,behavior:`smooth`})}),o.addEventListener(`click`,()=>{s=6,d()}),e=>{c=e,d()}}function w(){let e=g(`#w-net`),n=[...e.querySelectorAll(`input[type="number"]`)],r=g(`[data-out="mat"]`,e),i=g(`[data-out="sol"]`,e);function a(){let e=n.map(e=>Number(e.value.replace(`,`,`.`)));if(e.some(e=>!Number.isFinite(e)))return;let a=[[1,0],[-1,1],[0,1]],o=[100+e[0],e[1],100+e[2]],c=[[2,-1],[-1,2]],l=[o[0]-o[1],o[1]+o[2]],u=m(c,l),d=a.map((e,t)=>e[0]*u[0]+e[1]*u[1]-o[t]),f=e[0]+e[1]-e[2],p=r.clientWidth<560;t(r,(p?`\\begin{gathered}`:``)+`A = \\begin{pmatrix} 1 & 0 \\\\ -1 & 1 \\\\ 0 & 1 \\end{pmatrix},\\quad
       \\mathbf l = \\begin{pmatrix} ${_(o[0],3)} \\\\ ${_(o[1],3)} \\\\ ${_(o[2],3)} \\end{pmatrix}${r.clientWidth<560?`\\\\[4pt]`:`,\\quad`}
       A^\\mathsf{T}A = \\begin{pmatrix} 2 & -1 \\\\ -1 & 2 \\end{pmatrix},\\quad
       A^\\mathsf{T}\\mathbf l = \\begin{pmatrix} ${_(l[0],3)} \\\\ ${_(l[1],3)} \\end{pmatrix}`+(p?`\\end{gathered}`:``),!0),i.innerHTML=`
      <p>Нев'язка трикутника: h₁ + h₂ − h₃ = <b class="num">${s(f*1e3,1,!0)} мм</b>.</p>
      <p>Розв'язок нормальних рівнянь: <b class="num">H<sub>B</sub> = ${s(u[0],4)} м</b>, <b class="num">H<sub>C</sub> = ${s(u[1],4)} м</b>.</p>
      <p>Поправки до виміряних перевищень: <span class="num">${d.map(e=>s(e*1e3,1,!0)).join(` · `)}</span> мм.
      Нев'язку розподілено порівну між трьома ходами, як і обіцяв розділ 2.</p>`}n.forEach(e=>e.addEventListener(`input`,a)),a()}x([S(),C()]),w();