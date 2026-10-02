import{n as e,r as t,t as n}from"./common-DcWhnavj.js";import{a as r,d as i,f as a,i as o,l as s,n as c,o as l,r as u,t as d,u as f}from"./plot-BqFxNYwL.js";import{d as p,o as m}from"./linalg-Q8j_e_NO.js";e(),n(),a({projection:{py:`import numpy as np

x = np.array([1.0, 2.0, 3.0])
y = np.array([1.0, 2.0, 2.0])
A = np.column_stack([np.ones_like(x), x])     # стовпці: 1 і x

# Проєкція y на площину стовпців A.
theta = np.linalg.solve(A.T @ A, A.T @ y)      # нормальні рівняння
y_hat = A @ theta                               # найближча точка площини
r = y - y_hat                                   # перпендикуляр
print("θ =", theta, " ŷ =", y_hat, " r =", r)

# Перпендикулярність: r ортогональний кожному стовпцю A (це і є нормальні рівняння).
print("Aᵀr =", A.T @ r)

# Теорема Піфагора: |y|² = |ŷ|² + |r|².
print(f"|y|² = {y @ y:.4f},  |ŷ|² + |r|² = {y_hat @ y_hat + r @ r:.4f}")

# Матриця проєкції («hat matrix»): ŷ = P·y.
P = A @ np.linalg.inv(A.T @ A) @ A.T
print("P·6 =\\n", np.round(6 * P, 6))
print("P² = P?", np.allclose(P @ P, P), "  Pᵀ = P?", np.allclose(P.T, P), "  слід P =", round(np.trace(P), 10))
print("важелі (діагональ P):", np.round(np.diag(P), 4))

# Коефіцієнт детермінації R² — частка «поясненого» розкиду.
ss_tot = ((y - y.mean()) ** 2).sum()
ss_res = r @ r
print(f"R² = 1 − {ss_res:.4f}/{ss_tot:.4f} = {1 - ss_res / ss_tot:.4f}",
      f"  (квадрат кореляції: {np.corrcoef(x, y)[0, 1] ** 2:.4f})")
`,js:`const dot = (u, v) => u.reduce((s, ui, i) => s + ui * v[i], 0);

// Проєкція вектора y на площину, натягнуту на стовпці u і v.
// Умова: залишок r = y − (a·u + b·v) перпендикулярний і до u, і до v.
function project(u, v, y) {
  const [uu, uv, vv] = [dot(u, u), dot(u, v), dot(v, v)];
  const [uy, vy] = [dot(u, y), dot(v, y)];
  const det = uu * vv - uv * uv;          // нормальні рівняння 2×2 за Крамером
  const a = (uy * vv - uv * vy) / det;
  const b = (uu * vy - uv * uy) / det;
  const yHat = u.map((ui, i) => a * ui + b * v[i]);
  const r = y.map((yi, i) => yi - yHat[i]);
  return { a, b, yHat, r };
}

const round = (arr) => arr.map((t) => +t.toFixed(4));

// 1) Пряма через три точки: стовпці A — одиниці та x.
const ones = [1, 1, 1], x = [1, 2, 3], y = [1, 2, 2];
const p = project(ones, x, y);
console.log("a, b =", round([p.a, p.b]), " ŷ =", round(p.yHat), " r =", round(p.r));
console.log("r·1 =", +dot(p.r, ones).toFixed(12), " r·x =", +dot(p.r, x).toFixed(12));
console.log("|y|² =", dot(y, y), " |ŷ|² + |r|² =", +(dot(p.yHat, p.yHat) + dot(p.r, p.r)).toFixed(10));

// 2) Нівелірна мережа з розділу 4, розв'язана «з іншого боку»:
//    проєктуємо вектор вимірів на напрямок умови c = (1, 1, −1).
const h = [1.203, 0.402, 1.611];                 // виміряні перевищення, м
const c = [1, 1, -1];                            // умова: h1 + h2 − h3 = 0
const w = dot(c, h);                             // нев'язка
const v = c.map((ci) => -(w / dot(c, c)) * ci);  // поправки — перпендикуляр до площини умови
console.log("нев'язка w =", +(w * 1000).toFixed(2), "мм,  поправки v =", round(v.map((t) => t * 1000)), "мм");
`}});function h(e,t=document){let n=t.querySelector(e);if(!n)throw Error(`Не знайдено ${e}`);return n}function g(e,t=3){let n=o(e,t);return n.includes(`,`)&&(n=n.replace(/0+$/,``).replace(/,$/,``)),n===`−0`&&(n=`0`),n.replace(`−`,`-`).replace(`,`,`{,}`)}var _=(e,t)=>e.reduce((e,n,r)=>e+n*t[r],0),v=(e,t)=>[e[0]+t[0],e[1]+t[1],e[2]+t[2]],y=(e,t)=>[e[0]-t[0],e[1]-t[1],e[2]-t[2]],b=(e,t)=>[e*t[0],e*t[1],e*t[2]],x=e=>Math.sqrt(_(e,e));function S(e){let n=h(`#w-proj`),a=h(`canvas`,n),S=a.getContext(`2d`),C=h(`input[name="a"]`,n),w=h(`input[name="b"]`,n),T=h(`output[for="p-a"]`,n),E=h(`output[for="p-b"]`,n),D=h(`[data-out="eq"]`,n),O=h(`[data-out="nums"]`,n),k=h(`[data-out="status"]`,n),A=h(`input[name="zoom"]`,n),j=[{x:1,y:1},{x:2,y:2},{x:3,y:2}],M=.2,N=.4,P=0,F=.8,I=!1,L=[0,4.5],R=[-.5,4.5],z=h(`.plot-data`,n),B=u(z,{width:r(z)?420:360,height:300,x:L,y:R,margin:{top:14,right:12,bottom:28,left:30},xTicks:[0,1,2,3,4],yTicks:[0,1,2,3,4],xLabel:`x`,yLabel:`y`,ariaLabel:`Простір даних: три точки й пряма`}),V=i(`line`,{class:`fit-line`},B.layer),H=i(`g`,{},B.layer),U=j.map((e,t)=>{let n=i(`g`,{class:`draggable`,tabindex:0,role:`button`,"aria-label":`Точка ${t+1}`},B.svg);i(`circle`,{r:18,class:`drag-halo`},n),i(`circle`,{r:6.5,class:`data-point`},n);let r=i(`text`,{x:-13,y:-10,"text-anchor":`middle`,class:`plot-label`,style:`font-weight: 700`},n);r.textContent=String(t+1);let a=(e,n)=>{j[t].x=c(e,.2,4.3),j[t].y=c(n,0,4.3),q()};return l(n,B.svg,(e,t)=>a(f(B.ix(e),.1),f(B.iy(t),.1))),n.addEventListener(`keydown`,e=>{let n={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]}[e.key];n&&(e.preventDefault(),a(+(j[t].x+n[0]).toFixed(1),+(j[t].y+n[1]).toFixed(1)))}),n}),W=e=>getComputedStyle(document.documentElement).getPropertyValue(e).trim();function G(){let e=[1,1,1],t=[j[0].x,j[1].x,j[2].x],n=[j[0].y,j[1].y,j[2].y],r=m(j),i=p(r.M,r.v);return{u:e,v:t,y:n,cur:v(b(M,e),b(N,t)),yHat:i?v(b(i[0],e),b(i[1],t)):null,opt:i}}function K(){let{u:e,v:t,y:n,cur:r,yHat:i}=G(),o=window.devicePixelRatio||1,s=a.clientWidth,c=a.clientHeight;(a.width!==Math.round(s*o)||a.height!==Math.round(c*o))&&(a.width=Math.round(s*o),a.height=Math.round(c*o)),S.setTransform(o,0,0,o,0,0),S.clearRect(0,0,s,c);let l=A.checked?[n,r,...i?[i]:[]]:[[0,0,0],n,r,e,t,...i?[i]:[]],u=b(1/l.length,l.reduce((e,t)=>v(e,t),[0,0,0])),d=Math.max(...l.map(e=>x(y(e,u))),A.checked?.35:1)*(A.checked?1.6:1),f=Math.min(s,c)*.4/d,p=e=>{let t=y(e,u),n=t[0]*Math.cos(P)-t[1]*Math.sin(P),r=t[0]*Math.sin(P)+t[1]*Math.cos(P);return[s/2+n*f,c/2+r*Math.sin(F)*f-t[2]*Math.cos(F)*f]},m=(e,t,n,r=1.5,i=[])=>{let[a,o]=p(e),[s,c]=p(t);S.strokeStyle=n,S.lineWidth=r,S.setLineDash(i),S.beginPath(),S.moveTo(a,o),S.lineTo(s,c),S.stroke(),S.setLineDash([])},h=(e,t,n,r=2.2)=>{m(e,t,n,r);let[i,a]=p(e),[o,s]=p(t),c=Math.atan2(s-a,o-i);S.fillStyle=n,S.beginPath(),S.moveTo(o,s),S.lineTo(o-10*Math.cos(c-.35),s-10*Math.sin(c-.35)),S.lineTo(o-10*Math.cos(c+.35),s-10*Math.sin(c+.35)),S.closePath(),S.fill()},g=(e,t,n,r=6,i=-6)=>{let[a,o]=p(e);S.fillStyle=n,S.font=`600 14px system-ui, sans-serif`,S.fillText(t,a+r,o+i)},C=(e,t,n=5)=>{let[r,i]=p(e);S.fillStyle=t,S.beginPath(),S.arc(r,i,n,0,2*Math.PI),S.fill()},w=W(`--axis`),T=[0,0,0],E=4.2;[[E,0,0],[0,E,0],[0,0,E]].forEach((e,t)=>{h(T,e,w,1.2),g(e,[`y₁`,`y₂`,`y₃`][t],W(`--muted`),4,4)});let D=W(`--accent`),O=b(1/x(e),e),k=y(t,b(_(t,O),O));if(!(x(k)<1e-6)){let e=b(1/x(k),k),t=b(.5,i??r),n=v(b(_(t,O),O),b(_(t,e),e)),a=Math.max(x(i??r)/2+1.2,2.2),o=(t,r)=>v(n,v(b(t*a,O),b(r*a,e))),s=[o(-1,-1),o(1,-1),o(1,1),o(-1,1)];S.fillStyle=D,S.globalAlpha=.1,S.beginPath(),s.forEach((e,t)=>{let[n,r]=p(e);t===0?S.moveTo(n,r):S.lineTo(n,r)}),S.closePath(),S.fill(),S.globalAlpha=.28;for(let e=-4;e<=4;e++)m(o(e/4,-1),o(e/4,1),D,1),m(o(-1,e/4),o(1,e/4),D,1);S.globalAlpha=1}h(T,e,W(`--ml`),2.5),g(e,`1`,W(`--ml`)),h(T,t,W(`--warn`),2.5),g(t,`x`,W(`--warn`)),i&&C(i,W(`--good`),4.5),h(T,r,D,2),C(r,D,5.5),g(r,`Aθ`,D,8,16);let j=W(`--text`);h(T,n,j,2.6),g(n,`y`,j),m(r,n,W(`--bad`),2.5,[6,4]),g(b(.5,v(r,n)),`r`,W(`--bad`),6,0);let M=y(n,r);if(i&&x(y(r,i))<.01&&x(M)>.05){let t=b(1/x(M),M),n=x(r)>1e-6?b(1/x(r),r):b(1/x(e),e),i=Math.min(.18,x(M)*.22),a=v(r,b(i,t)),o=v(v(r,b(i,t)),b(-i,n)),s=v(r,b(-i,n));m(a,o,W(`--bad`),1.5),m(o,s,W(`--bad`),1.5)}}function q(){let{u:n,v:r,y:a,cur:c,yHat:l,opt:u}=G();if(!I){let e=[n[1]*r[2]-n[2]*r[1],n[2]*r[0]-n[0]*r[2],n[0]*r[1]-n[1]*r[0]],t=b(1/(x(e)||1),e),i=1/0;for(let e=0;e<144;e++){let n=2*Math.PI*e/144,r=t[0]*Math.cos(n)-t[1]*Math.sin(n),a=t[0]*Math.sin(n)+t[1]*Math.cos(n),o=Math.hypot(r,a*Math.sin(F)-t[2]*Math.cos(F)),s=Math.abs(o-(A.checked?.97:.9))+.05*Math.abs(Math.sin(n+.8));s<i&&([i,P]=[s,n])}I=!0}let d=y(a,c);s(V,{x1:B.sx(L[0]),y1:B.sy(M+N*L[0]),x2:B.sx(L[1]),y2:B.sy(M+N*L[1])}),H.replaceChildren(),j.forEach((e,t)=>{let n=M+N*e.x;Math.abs(e.y-n)>.004&&i(`line`,{x1:B.sx(e.x),x2:B.sx(e.x),y1:B.sy(e.y),y2:B.sy(n),stroke:`var(--bad)`,"stroke-width":2,"stroke-dasharray":`4 3`},H),U[t].setAttribute(`transform`,`translate(${B.sx(e.x)},${B.sy(e.y)})`)}),C.value=String(M),w.value=String(N),T.textContent=o(M,2),E.textContent=o(N,2),t(D,(D.clientWidth<560?`\\begin{gathered}`:``)+`A\\boldsymbol\\theta = ${g(M,2)}\\begin{pmatrix}1\\\\1\\\\1\\end{pmatrix} ${N<0?`-`:`+`} ${g(Math.abs(N),2)}\\begin{pmatrix}${r.map(e=>g(e,1)).join(`\\\\`)}\\end{pmatrix} = \\begin{pmatrix}${c.map(e=>g(e,2)).join(`\\\\`)}\\end{pmatrix}${D.clientWidth<560?`\\\\[4pt]`:`,\\quad `}\\mathbf y = \\begin{pmatrix}${a.map(e=>g(e,1)).join(`\\\\`)}\\end{pmatrix}`+(D.clientWidth<560?`\\end{gathered}`:``),!0);let f=x(d),p=[[`Відстань |y − Aθ| = √S`,o(f,3)],[`r · 1 = Σ rᵢ`,o(_(d,n),3,!0)],[`r · x = Σ xᵢrᵢ`,o(_(d,r),3,!0)]];if(l){let e=x(y(a,l)),t=x(y(l,c));p.push([`Піфагор: |y − ŷ|² + |ŷ − Aθ|²`,`${o(e**2,3)} + ${o(t**2,3)} = ${o(f**2,3)}`])}O.innerHTML=p.map(([e,t])=>`<tr><td>${e}</td><td class="num">${t}</td></tr>`).join(``),u?x(y(c,l))<.01?(k.className=`status success`,k.innerHTML=x(d)<.01?`<b>y лежить у площині</b>: точки на одній прямій, нев'язка нульова.`:`<b>Це проєкція.</b> Червоний відрізок перпендикулярний площині: r · 1 = 0 і r · x = 0. Коротшого шляху від y до площини немає.`):(k.className=`status`,k.innerHTML=`Рухайте a і b: синя точка ковзає площиною. Червоний відрізок — нев'язка, його довжина дорівнює √S. Найкоротшим він стане, коли стане перпендикулярним площині.`):(k.className=`status warn`,k.innerHTML=`Усі x однакові: вектор x паралельний вектору 1, і «площина» сплющилась у пряму. Проєкція існує, але a і b визначити однозначно не можна.`),K(),e.forEach(e=>e(j))}C.addEventListener(`input`,()=>{M=Number(C.value),q()}),w.addEventListener(`input`,()=>{N=Number(w.value),q()}),h(`[data-action="project"]`,n).addEventListener(`click`,()=>{let{opt:e}=G();if(!e)return;let[t,n]=[M,N];A.checked||(A.checked=!0,I=!1),d(800,r=>{M=t+(e[0]-t)*r,N=n+(e[1]-n)*r,q()})});let J=null;a.addEventListener(`pointerdown`,e=>{J={x:e.clientX,y:e.clientY},a.setPointerCapture(e.pointerId)}),a.addEventListener(`pointermove`,e=>{J&&(P+=(e.clientX-J.x)*.01,F=c(F-(e.clientY-J.y)*.008,.1,1.55),J={x:e.clientX,y:e.clientY},K())}),a.addEventListener(`pointerup`,()=>J=null),a.addEventListener(`pointercancel`,()=>J=null),A.addEventListener(`change`,()=>{I=!1,q()}),window.addEventListener(`resize`,K),matchMedia(`(prefers-color-scheme: dark)`).addEventListener(`change`,K),q()}function C(){let e=h(`#w-hat`),n=h(`[data-out="P"]`,e),r=h(`[data-out="lev"]`,e),i=h(`[data-out="check"]`,e);return e=>{let a=m(e),s=a.M[0][0]*a.M[1][1]-a.M[0][1]**2;if(Math.abs(s)<1e-9){n.textContent=`Усі x однакові — матриця AᵀA вироджена.`,r.textContent=``,i.textContent=``;return}let l=[[a.M[1][1]/s,-a.M[0][1]/s],[-a.M[1][0]/s,a.M[0][0]/s]],u=e.map(e=>[1,e.x]),d=u.map(e=>u.map(t=>e[0]*(l[0][0]*t[0]+l[0][1]*t[1])+e[1]*(l[1][0]*t[0]+l[1][1]*t[1]))),f=e.map(e=>e.y),p=d.map(e=>_(e,f)),h=n.clientWidth<560,v=`P = \\begin{pmatrix}${d.map(e=>e.map(e=>g(e,3)).join(` & `)).join(`\\\\`)}\\end{pmatrix}`,y=`\\hat{\\mathbf y} = P\\mathbf y = \\begin{pmatrix}${p.map(e=>g(e,3)).join(`\\\\`)}\\end{pmatrix}`;t(n,h?`\\begin{gathered}${v}\\\\[6pt]${y}\\end{gathered}`:`${v},\\qquad ${y}`,!0);let b=d.map((e,t)=>e.map((n,r)=>_(e,d.map(e=>e[r]))-d[t][r])),x=Math.max(...b.flat().map(Math.abs)),S=d[0][0]+d[1][1]+d[2][2];r.innerHTML=d.map((t,n)=>`<div class="lev-row"><span>точка ${n+1} (x = ${o(e[n].x,1)})</span><div class="lev-track"><div class="lev-bar" style="width:${c(t[n],0,1)*100}%"></div></div><span class="num">${o(t[n],3)}</span></div>`).join(``),i.innerHTML=`Слід P (сума важелів) = <b class="num">${o(S,3)}</b> — рівно стільки, скільки параметрів. Перевірка P² = P: найбільше відхилення <span class="num">${x.toExponential(1)}</span>.`}}S([C()]);