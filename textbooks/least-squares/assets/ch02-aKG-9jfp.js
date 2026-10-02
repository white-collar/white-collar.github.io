import{n as e,r as t,t as n}from"./common-DcWhnavj.js";import{a as r,c as i,d as a,f as o,i as s,l as c,n as l,o as u,r as d,t as f,u as p}from"./plot-BqFxNYwL.js";import{s as m}from"./linalg-Q8j_e_NO.js";e(),n(),o({criteria:{py:`import numpy as np

x = np.array([1.0, 2.0, 3.0])
y = np.array([1.0, 2.0, 2.0])

# Чотири кандидати на «функцію якості» прямої y = a + b·x.
def residuals(a, b):
    return y - (a + b * x)

criteria = {
    "Σ r":     lambda r: r.sum(),
    "Σ |r|":   lambda r: np.abs(r).sum(),
    "max |r|": lambda r: np.abs(r).max(),
    "Σ r²":    lambda r: (r ** 2).sum(),
}

lines = {"y = x": (0, 1), "y = 2": (2, 0), "y = 0.5 + 0.5x": (0.5, 0.5),
         "y = 2/3 + 0.5x": (2 / 3, 0.5)}
for name, (a, b) in lines.items():
    r = residuals(a, b)
    values = ", ".join(f"{k} = {f(r):.3f}" for k, f in criteria.items())
    print(f"{name:15s} → {values}")

# «Навчання» перебором: пробуємо всі (a, b) на сітці й беремо найкращу пару.
# Найпримітивніший спосіб оптимізації — але працює для будь-якого критерію.
A, B = np.meshgrid(np.linspace(-1, 3, 401), np.linspace(-1, 2, 301))
R = y[:, None, None] - (A + B * x[:, None, None])   # нев'язки для всіх пар одразу
for name, loss in [("Σ |r|", np.abs(R).sum(0)), ("max |r|", np.abs(R).max(0)),
                   ("Σ r²", (R ** 2).sum(0))]:
    i = np.unravel_index(loss.argmin(), loss.shape)
    print(f"мінімум {name:8s}: a = {A[i]:.2f}, b = {B[i]:.2f}, значення {loss[i]:.3f}")
`,js:`const x = [1, 2, 3];
const y = [1, 2, 2];

// Чотири кандидати на «функцію якості» прямої y = a + b·x.
const residuals = (a, b) => x.map((xi, i) => y[i] - (a + b * xi));
const criteria = {
  "Σ r": (r) => r.reduce((s, v) => s + v, 0),
  "Σ |r|": (r) => r.reduce((s, v) => s + Math.abs(v), 0),
  "max |r|": (r) => Math.max(...r.map(Math.abs)),
  "Σ r²": (r) => r.reduce((s, v) => s + v * v, 0),
};

const lines = { "y = x": [0, 1], "y = 2": [2, 0], "y = 0.5 + 0.5x": [0.5, 0.5],
                "y = 2/3 + 0.5x": [2 / 3, 0.5] };
for (const [name, [a, b]] of Object.entries(lines)) {
  const r = residuals(a, b);
  const values = Object.entries(criteria).map(([k, f]) => \`\${k} = \${f(r).toFixed(3)}\`);
  console.log(name.padEnd(15), "→", values.join(", "));
}

// «Навчання» перебором: пробуємо всі (a, b) на сітці й беремо найкращу пару.
// Найпримітивніший спосіб оптимізації — але працює для будь-якого критерію.
for (const name of ["Σ |r|", "max |r|", "Σ r²"]) {
  let best = { loss: Infinity };
  for (let a = -1; a <= 3; a += 0.01) {
    for (let b = -1; b <= 2; b += 0.01) {
      const loss = criteria[name](residuals(a, b));
      if (loss < best.loss - 1e-12) best = { a, b, loss };
    }
  }
  console.log(\`мінімум \${name.padEnd(8)}: a = \${best.a.toFixed(2)}, b = \${best.b.toFixed(2)},\`,
              \`значення \${best.loss.toFixed(3)}\`);
}
`},estimates:{py:`import numpy as np

# Три виміри довжини з розділу 1 (м) та той самий набір із промахом.
for l in [np.array([10.02, 10.05, 9.98]), np.array([10.02, 10.05, 10.20])]:
    print("виміри:", l)
    # Кожен критерій має «свою» найкращу оцінку:
    print(f"  Σ v²   → середнє            {l.mean():.4f}")
    print(f"  Σ |v|  → медіана            {np.median(l):.4f}")
    print(f"  max|v| → середина розмаху   {(l.min() + l.max()) / 2:.4f}")
`,js:`// Три виміри довжини з розділу 1 (м) та той самий набір із промахом.
for (const l of [[10.02, 10.05, 9.98], [10.02, 10.05, 10.2]]) {
  const sorted = [...l].sort((p, q) => p - q);
  const n = sorted.length;
  const mean = l.reduce((s, v) => s + v, 0) / n;
  const median = n % 2 ? sorted[(n - 1) / 2] : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
  const midrange = (sorted[0] + sorted[n - 1]) / 2;

  console.log("виміри:", l);
  // Кожен критерій має «свою» найкращу оцінку:
  console.log("  Σ v²   → середнє           ", mean.toFixed(4));
  console.log("  Σ |v|  → медіана           ", median.toFixed(4));
  console.log("  max|v| → середина розмаху  ", midrange.toFixed(4));
}
`}});function h(e,t=document){let n=t.querySelector(e);if(!n)throw Error(`Не знайдено ${e}`);return n}function g(e,t){return s(e,t).replace(`−`,`-`).replace(`,`,`{,}`)}var _=(e,{a:t,b:n})=>e.map(e=>e.y-(t+n*e.x)),v={sum:e=>Math.abs(e.reduce((e,t)=>e+t,0)),abs:e=>e.reduce((e,t)=>e+Math.abs(t),0),max:e=>Math.max(...e.map(Math.abs)),sq:e=>e.reduce((e,t)=>e+t*t,0)};function y(e){let t=e.length,n=e.reduce((e,t)=>e+t.x,0)/t,r=e.reduce((e,t)=>e+t.y,0)/t,i=e.reduce((e,t)=>e+(t.x-n)**2,0);if(i<1e-12)return null;let a=e.reduce((e,t)=>e+(t.x-n)*(t.y-r),0)/i;return{a:r-a*n,b:a}}function b(e){let t=null,n=1/0;for(let r=0;r<e.length;r++)for(let i=r+1;i<e.length;i++){let a=m(e[r],e[i]);if(!a)continue;let o=v.abs(_(e,a));o<n-1e-12&&([t,n]=[a,o])}return t}function x(e){let t=null,n=1/0,r=e.length;for(let i=0;i<r;i++)for(let a=i+1;a<r;a++)for(let o=a+1;o<r;o++){let[r,s,c]=[e[i],e[a],e[o]].sort((e,t)=>e.x-t.x);if(c.x-r.x<1e-12)continue;let l=(c.y-r.y)/(c.x-r.x),u=(r.y+s.y-l*(r.x+s.x))/2,d=v.max(_(e,{a:u,b:l}));d<n-1e-12&&([t,n]=[{a:u,b:l},d])}return t}function S(){let e=h(`#w-criteria`),n={three:[{x:1,y:1},{x:2,y:2},{x:3,y:2}],six:[{x:.5,y:.9},{x:1.5,y:1.5},{x:2.5,y:1.7},{x:3.5,y:2.5},{x:4.5,y:2.7},{x:5.5,y:3.4}],outlier:[{x:.5,y:.9},{x:1.5,y:1.5},{x:2.5,y:1.7},{x:3.5,y:2.5},{x:4.5,y:.1},{x:5.5,y:3.4}]},o=[0,6],m=h(`.plot`,e),S=r(m),C=S?[-.6,4]:[-.5,3.8],w=d(m,{width:S?420:600,height:S?330:440,x:o,y:C,margin:{top:16,right:16,bottom:31,left:36},xTicks:[0,1,2,3,4,5,6],yTicks:[0,1,2,3],xLabel:`x`,yLabel:`y`,ariaLabel:`Точки, пряма та нев'язки, зображені відповідно до обраного критерію`}),{sx:T,sy:E,svg:D,layer:O}=w,k=a(`g`,{},O),A={abs:a(`line`,{stroke:`var(--warn)`,"stroke-width":2,"stroke-dasharray":`7 5`},k),max:a(`line`,{stroke:`var(--ml)`,"stroke-width":2,"stroke-dasharray":`2 4`,"stroke-linecap":`round`},k),sq:a(`line`,{stroke:`var(--good)`,"stroke-width":2,"stroke-dasharray":`12 4 2 4`},k)},j=a(`g`,{},O),ee=a(`line`,{class:`fit-line`},O),M=a(`g`,{},D);a(`circle`,{r:6,fill:`none`,stroke:`var(--accent)`,"stroke-width":2},M),a(`path`,{d:`M-10,0 H10 M0,-10 V10`,stroke:`var(--accent)`,"stroke-width":1.5},M);let te=a(`text`,{x:10,y:20,class:`plot-label`,style:`fill: var(--accent)`},M);te.textContent=`центр ваги`;let N=a(`g`,{},D),P=a(`g`,{},D),F=h(`input[name="a"]`,e),I=h(`input[name="b"]`,e),ne=h(`output[for="crit-a"]`,e),re=h(`output[for="crit-b"]`,e),ie=h(`[data-out="eq"]`,e),L=h(`[data-out="table"]`,e),ae=h(`[data-out="status"]`,e),R=h(`[data-action="best"]`,e),z=h(`input[name="ghosts"]`,e),oe=h(`[data-out="legend"]`,e),B=[...e.querySelectorAll(`[data-crit]`)],V=[...e.querySelectorAll(`[data-preset]`)],H=[],U=`three`,W=`sq`,G=.2,K=.8,q=[],se={sum:`\\left|\\sum r_i\\right|`,abs:`\\sum |r_i|`,max:`\\max |r_i|`,sq:`\\sum r_i^2`},ce={sum:`<b>Сума нев'язок.</b> Плюси й мінуси взаємно гасяться: нуль дає <i>будь-яка</i> пряма, що проходить через центр ваги точок. Натисніть «↻ Обертати навколо центру ваги» — пряма обертатиметься, а сума лишатиметься нулем. Як критерій це не працює.`,abs:`<b>Сума модулів (L1).</b> Знаки вже не заважають, і мінімум існує. Але функція має «злами», де похідна не визначена, тож формули для мінімуму немає — лише перебір чи ітерації. Оптимальна пряма проходить точно через дві точки.`,max:`<b>Найбільша нев'язка (мінімакс, L∞).</b> Дбає лише про найгіршу точку, решта на результат не впливають. Тому одна погана точка тягне за собою всю пряму.`,sq:`<b>Сума квадратів (L2).</b> Кожна нев'язка — площа квадрата, тож велика нев'язка «коштує» непропорційно дорожче: 2 → 4, а 3 → 9. Функція гладка, і мінімум дає проста формула.`};function J(e){return e===`abs`?b(H):e===`max`?x(H):y(H)}function Y(){P.replaceChildren(),q=H.map((e,t)=>{let n=a(`g`,{class:`draggable`,tabindex:0,role:`button`,"aria-label":`Точка ${t+1}`},P);return a(`circle`,{r:18,class:`drag-halo`},n),a(`circle`,{r:6.5,class:`data-point`},n),u(n,D,(e,n)=>{H[t].x=l(p(w.ix(e),.1),o[0]+.1,o[1]-.1),H[t].y=l(p(w.iy(n),.1),C[0]+.1,C[1]-.1),Z()}),n.addEventListener(`keydown`,e=>{let n={ArrowLeft:[-.1,0],ArrowRight:[.1,0],ArrowUp:[0,.1],ArrowDown:[0,-.1]}[e.key];n&&(e.preventDefault(),H[t].x=l(+(H[t].x+n[0]).toFixed(1),o[0]+.1,o[1]-.1),H[t].y=l(+(H[t].y+n[1]).toFixed(1),C[0]+.1,C[1]-.1),Z())}),n})}function X(e,t){c(e,{x1:T(o[0]),y1:E(t.a+t.b*o[0]),x2:T(o[1]),y2:E(t.a+t.b*o[1])})}function Z(){X(ee,{a:G,b:K});let e=_(H,{a:G,b:K}),n=Math.max(...e.map(Math.abs));j.replaceChildren(),N.replaceChildren(),H.forEach((t,r)=>{let o=G+K*t.x,c=T(t.x),[u,d]=[E(t.y),E(o)],f=Math.abs(e[r])<.005,p=i(e[r],1.2),m=2.5,h=s(e[r],2,!0),g=`4 3`;if(W===`sum`)p=e[r]>=0?`var(--accent)`:`var(--warn)`;else if(W===`abs`)h=s(Math.abs(e[r]),2);else if(W===`max`){let t=Math.abs(Math.abs(e[r])-n)<1e-9;p=t?`var(--bad)`:`var(--axis)`,m=t?4:1.5,g=t?``:`3 3`,h=t?`max ${s(Math.abs(e[r]),2)}`:``}else{let t=Math.abs(d-u);a(`rect`,{x:c,y:Math.min(u,d),width:t,height:t,fill:p,"fill-opacity":.22,stroke:p,"stroke-width":1.2},j),h=s(e[r]*e[r],2)}if(f||a(`line`,{x1:c,x2:c,y1:u,y2:d,stroke:p,"stroke-width":m,"stroke-dasharray":g},j),!f&&h){let e=a(`text`,{x:c-6,y:l((u+d)/2+4,14,w.opts.height-36),"text-anchor":`end`,class:`residual-label`,style:`fill: ${p}`},N);e.textContent=h}q[r]?.setAttribute(`transform`,`translate(${c},${u})`)});let r=H.length,o=H.reduce((e,t)=>e+t.x,0)/r,c=H.reduce((e,t)=>e+t.y,0)/r;M.setAttribute(`transform`,`translate(${T(o)},${E(c)})`),M.setAttribute(`visibility`,W===`sum`?`visible`:`hidden`),k.setAttribute(`visibility`,z.checked?`visible`:`hidden`),oe.hidden=!z.checked;for(let e of[`abs`,`max`,`sq`]){let t=J(e);t&&X(A[e],t)}F.value=String(G),I.value=String(K),ne.textContent=s(G,2),re.textContent=s(K,2),t(ie,`y = ${g(G,2)} ${K<0?`-`:`+`} ${g(Math.abs(K),2)}\\,x`),L.innerHTML=`<thead><tr><th>Критерій</th><th>Зараз</th><th>Мінімум</th></tr></thead><tbody>`+[`sum`,`abs`,`max`,`sq`].map(t=>{let n=v[t](e),r=t===`sum`?null:J(t),i=t===`sum`?`0 (∞ прямих)`:r?s(v[t](_(H,r)),3):`—`;return`<tr${t===W?` class="current"`:``}><td data-tex="${se[t]}"></td><td class="num">${s(n,3)}</td><td class="num">${i}</td></tr>`}).join(``)+`</tbody>`,L.querySelectorAll(`[data-tex]`).forEach(e=>t(e,e.dataset.tex)),B.forEach(e=>e.setAttribute(`aria-selected`,String(e.dataset.crit===W))),V.forEach(e=>e.classList.toggle(`active`,e.dataset.preset===U)),ae.innerHTML=ce[W],R.textContent=W===`sum`?`↻ Обертати навколо центру ваги`:`Знайти найкращу пряму за цим критерієм`}function Q(e){let[t,n]=[G,K];f(600,r=>{G=t+(e.a-t)*r,K=n+(e.b-n)*r,Z()})}function $(e){U=e,H=n[e].map(e=>({...e})),Y(),Z()}F.addEventListener(`input`,()=>{G=Number(F.value),Z()}),I.addEventListener(`input`,()=>{K=Number(I.value),Z()}),z.addEventListener(`change`,Z),B.forEach(e=>e.addEventListener(`click`,()=>{W=e.dataset.crit,Z()})),V.forEach(e=>e.addEventListener(`click`,()=>$(e.dataset.preset))),R.addEventListener(`click`,()=>{if(W!==`sum`){let e=J(W);e&&Q(e);return}let e=H.length,t=H.reduce((e,t)=>e+t.x,0)/e,n=H.reduce((e,t)=>e+t.y,0)/e,r=K;Q({a:n-r*t,b:r}),setTimeout(()=>{f(3200,e=>{K=r+.9*Math.sin(2*Math.PI*e),G=n-K*t,Z()})},650)}),$(`three`)}function C(){let e=h(`#w-1d`),t={three:[10.02,10.05,9.98],four:[10.02,10.05,9.98,10.04],blunder:[10.02,10.05,10.2]},n=h(`.plot`,e),i=h(`[data-out="x"]`,e),o=h(`[data-out="values"]`,e),f=[...e.querySelectorAll(`[data-preset]`)],m=[{key:`sq`,title:`Σ v²  (мм²)  → мінімум: середнє`,color:`var(--good)`,f:(e,t)=>t.reduce((t,n)=>t+((e-n)*1e3)**2,0),slope:(e,t)=>t.reduce((t,n)=>t+2*(e-n)*1e3,0),best:e=>[e.reduce((e,t)=>e+t,0)/e.length],bestName:`середнє`,unit:`мм²`},{key:`abs`,title:`Σ |v|  (мм)  → мінімум: медіана`,color:`var(--warn)`,f:(e,t)=>t.reduce((t,n)=>t+Math.abs(e-n)*1e3,0),slope:(e,t)=>t.reduce((t,n)=>t+Math.sign(e-n),0),best:e=>{let t=[...e].sort((e,t)=>e-t),n=t.length;return n%2?[t[(n-1)/2]]:[t[n/2-1],t[n/2]]},bestName:`медіана`,unit:`мм`},{key:`max`,title:`max |v|  (мм)  → мінімум: середина розмаху`,color:`var(--ml)`,f:(e,t)=>Math.max(...t.map(t=>Math.abs(e-t)*1e3)),slope:(e,t)=>{let n=(Math.min(...t)+Math.max(...t))/2;return e<n?-1:+(e>n)},best:e=>[(Math.min(...e)+Math.max(...e))/2],bestName:`середина розмаху`,unit:`мм`}],g=[],_=10,v=[];function y(e){g=t[e],f.forEach(t=>t.classList.toggle(`active`,t.dataset.preset===e)),n.replaceChildren();let i=Math.min(...g)-.025,o=Math.max(...g)+.025;_=l(_,i,o);let s=o-i>.15?.04:.02,c=[];for(let e=Math.ceil(i/s)*s;e<=o+1e-9;e+=s)c.push(+e.toFixed(2));let h=r(n);v=m.map((e,t)=>{let r=Array.from({length:241},(e,t)=>i+(o-i)*t/240),s=r.map(t=>e.f(t,g)),f=Math.max(...s)*1.12,v=t===m.length-1,y=d(n,{width:h?420:640,height:v?150:124,x:[i,o],y:[0,f],margin:{top:22,right:14,bottom:v?30:4,left:14},xTicks:v?c:[],xLabel:v?`м`:void 0,ariaLabel:e.title}),{sx:x,sy:S,layer:C,svg:w}=y;w.style.marginBottom=v?`0`:`2px`;let T=a(`text`,{x:16,y:15,class:`plot-label`,style:`fill: ${e.color}; font-weight: 600`},w);T.textContent=e.title,g.forEach(e=>a(`path`,{d:`M${x(e)},${S(0)} l-5,8 h10 z`,fill:`var(--point)`,transform:`translate(0,-8)`},C)),a(`path`,{d:`M`+r.map((e,t)=>`${x(e).toFixed(1)},${S(s[t]).toFixed(1)}`).join(`L`),fill:`none`,stroke:e.color,"stroke-width":2.5},C);let E=e.best(g),D=e.f(E[0],g);E.length===2&&a(`line`,{x1:x(E[0]),x2:x(E[1]),y1:S(D),y2:S(D),stroke:e.color,"stroke-width":7,"stroke-linecap":`round`,opacity:.45},C),a(`circle`,{cx:x(E[0]),cy:S(D),r:5,fill:`var(--surface)`,stroke:e.color,"stroke-width":2.5},C);let O=a(`line`,{y1:S(f),y2:S(0),stroke:`var(--accent)`,"stroke-width":1.5,"stroke-dasharray":`4 3`},C),k=a(`circle`,{r:5.5,fill:`var(--accent)`},C),A=a(`rect`,{x:0,y:0,width:y.opts.width,height:y.opts.height,fill:`transparent`,class:`draggable`},w),j=e=>{_=l(p(y.ix(e),5e-4),i,o),b()};return u(A,w,j),A.addEventListener(`pointerdown`,e=>{let t=w.getScreenCTM();t&&j(new DOMPoint(e.clientX,e.clientY).matrixTransform(t.inverse()).x)}),{plot:y,marker:k,cursor:O,curve:e}}),b()}function b(){i.textContent=`${s(_,4)} м`;let e=[];for(let{plot:t,marker:n,cursor:r,curve:i}of v){let a=i.f(_,g);c(r,{x1:t.sx(_),x2:t.sx(_)}),c(n,{cx:t.sx(_),cy:t.sy(a)});let o=i.best(g).map(e=>s(e,4)).join(` … `),l=i.slope(_,g);e.push(`<tr><td style="color:${i.color};font-weight:600">${i.key===`sq`?`Σ v²`:i.key===`abs`?`Σ |v|`:`max |v|`}</td><td class="num">${s(a,1)} ${i.unit}</td><td class="num">${s(l,(i.key,0),!0)}</td><td class="num">${o}</td></tr>`)}o.innerHTML=`<thead><tr><th>Критерій</th><th>Значення</th><th>Нахил</th><th>Найкраща оцінка, м</th></tr></thead><tbody>${e.join(``)}</tbody>`}f.forEach(e=>e.addEventListener(`click`,()=>y(e.dataset.preset))),y(`three`)}function w(){let e=h(`#w-lvl2`),t=[...e.querySelectorAll(`input[type="range"]`)],n=[...e.querySelectorAll(`output`)],r=h(`[data-out="table"]`,e),i=h(`[data-out="status"]`,e),o=a(`svg`,{viewBox:`0 0 420 210`,role:`img`,"aria-label":`Виправлення чотирьох ходів у міліметрах`});h(`.plot`,e).appendChild(o);let u=[-8,4],d=e=>20+(u[1]-l(e,u[0],u[1]))/(u[1]-u[0])*160;for(let e=u[0];e<=u[1];e+=2){a(`line`,{x1:40,x2:410,y1:d(e),y2:d(e),stroke:`var(--grid)`},o);let t=a(`text`,{x:34,y:d(e)+4,"text-anchor":`end`,class:`plot-label`},o);t.textContent=s(e,0)}a(`line`,{x1:40,x2:410,y1:d(0),y2:d(0),stroke:`var(--axis)`,"stroke-width":1.5},o);let p=[0,1,2,3].map(e=>{let t=60+e*90,n=a(`rect`,{x:t,width:60,rx:3},o),r=a(`text`,{x:t+30,"text-anchor":`middle`,class:`residual-label`},o),i=a(`text`,{x:t+30,y:202,"text-anchor":`middle`,class:`plot-label`},o);return i.textContent=e===3?`v₄ (з умови)`:`v${`₁₂₃`[e]}`,{rect:n,val:r}}),m={last:[0,0,0],equal:[-1.75,-1.75,-1.75],length:[-1.4,-2.1,-1.05]};function g(){let e=t.map(e=>Number(e.value));e.push(-7-e.reduce((e,t)=>e+t,0)),e.forEach((e,t)=>{t<3&&(n[t].textContent=s(e,2,!0));let r=t===3?`var(--muted)`:`var(--accent)`,i=d(0),a=d(e);c(p[t].rect,{y:Math.min(i,a),height:Math.max(1,Math.abs(a-i)),fill:r,opacity:t===3?.55:.8}),c(p[t].val,{y:e<0?Math.max(i,a)+15:Math.min(i,a)-5,style:`fill: ${r}`}),p[t].val.textContent=s(e,2,!0)});let a=e.reduce((e,t)=>e+t*t,0),o=e.reduce((e,t)=>e+Math.abs(t),0),l=Math.max(...e.map(Math.abs));r.innerHTML=`<thead><tr><th>Критерій</th><th>Зараз</th><th>Мінімум</th></tr></thead><tbody>
      <tr><td>Σ v², мм²</td><td class="num">${s(a,2)}</td><td class="num">12,25</td></tr>
      <tr><td>Σ |v|, мм</td><td class="num">${s(o,2)}</td><td class="num">7,00</td></tr>
      <tr><td>max |v|, мм</td><td class="num">${s(l,2)}</td><td class="num">1,75</td></tr></tbody>`,Math.abs(a-12.25)<.02?(i.className=`status success`,i.innerHTML=`<b>Мінімум суми квадратів:</b> нев'язку розподілено порівну, по −1,75 мм на кожен хід. Жоден інший розподіл не дає меншої суми квадратів.`):e.some(e=>e>.001)?(i.className=`status warn`,i.innerHTML=`Одне з виправлень має «неправильний» знак. Хід усе одно замикається, але сума модулів уже більша за 7: ми додали зайву помилку, щоб потім її компенсувати.`):(i.className=`status info`,i.innerHTML=`Хід замкнено: сума виправлень −7 мм. Зверніть увагу, що <b>Σ |v| = 7</b> для <i>будь-якого</i> розподілу з однаковими знаками. Критерій L1 не бачить різниці між «порівну» та «все на один хід». А сума квадратів бачить.`)}t.forEach(e=>e.addEventListener(`input`,g)),e.querySelectorAll(`[data-preset]`).forEach(e=>e.addEventListener(`click`,()=>{let n=m[e.dataset.preset],r=t.map(e=>Number(e.value));f(450,e=>{t.forEach((t,i)=>t.value=String(r[i]+(n[i]-r[i])*e)),g()})})),g()}S(),C(),w();