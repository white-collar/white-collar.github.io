import{n as e,t}from"./common-DcWhnavj.js";import{a as n,d as r,f as i,i as a,l as o,n as s,o as c,r as l,s as u}from"./plot-BqFxNYwL.js";import{c as d}from"./linalg-Q8j_e_NO.js";e(),t(),i({geodesy:{py:`import numpy as np

# ---------- 1) Нівелірна мережа: зважений МНК ----------
# Відомі репери та невідомі пункти A, B, C.
known = {"Rp1": 100.000, "Rp2": 103.500}
unknown = ["A", "B", "C"]
# Лінії: звідки, куди, виміряне перевищення h (м), довжина ходу L (км).
lines = [("Rp1", "A", 1.215, 1.2), ("A", "B", 0.843, 0.9), ("B", "Rp2", 1.438, 1.5),
         ("Rp1", "C", 2.012, 1.4), ("C", "B", 0.052, 0.8), ("C", "Rp2", 1.487, 1.1),
         ("A", "C", 0.797, 1.0)]

n, k = len(lines), len(unknown)
A = np.zeros((n, k)); l = np.zeros(n); L = np.zeros(n)
for i, (fr, to, h, length) in enumerate(lines):
    # Рівняння: H_to − H_from = h. Відомі висоти переносимо в праву частину.
    l[i] = h + known.get(fr, 0) - known.get(to, 0)
    if to in unknown: A[i, unknown.index(to)] += 1
    if fr in unknown: A[i, unknown.index(fr)] -= 1
    L[i] = length

P = np.diag(1 / L)                        # вага ходу обернено пропорційна його довжині
N = A.T @ P @ A                           # зважені нормальні рівняння
H = np.linalg.solve(N, A.T @ P @ l)
v = A @ H - l                             # поправки до вимірів
r = n - k                                 # кількість надлишкових вимірів
sigma0 = np.sqrt(v @ P @ v / r)           # СКП одиниці ваги (на 1 км ходу)
sigma_H = sigma0 * np.sqrt(np.diag(np.linalg.inv(N)))
for name, h_, s in zip(unknown, H, sigma_H):
    print(f"H_{name} = {h_:.4f} м  ± {s * 1000:.1f} мм")
print("поправки, мм:", np.round(v * 1000, 1), f"  σ₀ = {sigma0 * 1000:.1f} мм/√км")

# ---------- 2) Трилатерація методом Гаусса — Ньютона ----------
stations = np.array([[0.0, 0.0], [1000.0, 0.0], [300.0, 900.0], [900.0, 800.0]])
true_p = np.array([420.0, 310.0])
rng = np.random.default_rng(3)
d = np.linalg.norm(stations - true_p, axis=1) + rng.normal(0, 0.02, 4)   # виміряні відстані, м

p = np.array([800.0, 700.0])              # грубе початкове наближення
for it in range(6):
    diff = p - stations
    d0 = np.linalg.norm(diff, axis=1)     # відстані від поточного наближення
    J = diff / d0[:, None]                # матриця Якобі: одиничні вектори від станцій
    dp = np.linalg.lstsq(J, d - d0, rcond=None)[0]   # звичайний лінійний МНК для поправки
    p = p + dp
    print(f"ітерація {it + 1}: x = {p[0]:.4f}, y = {p[1]:.4f}, |Δ| = {np.linalg.norm(dp):.2e} м")

# Те саме однією функцією (Левенберг — Марквардт):
#   from scipy.optimize import least_squares
#   least_squares(lambda q: np.linalg.norm(stations - q, axis=1) - d, x0=[800, 700]).x
`,js:`// 1) Зважений МНК для замкненого нівелірного ходу з розділу 1.
//    Нев'язка +7 мм, довжини ходів різні. Вага ходу p = 1/L (довгий хід міряють гірше).
const L = [0.8, 1.2, 0.6, 1.4];           // км
const w = 7;                               // мм
// Мінімум Σ pᵢvᵢ² за умови Σ vᵢ = −w дає vᵢ = −w · (1/pᵢ) / Σ(1/pⱼ) = −w · Lᵢ / ΣL.
const sumL = L.reduce((s, x) => s + x, 0);
console.log("поправки, мм:", L.map((Li) => +(-w * Li / sumL).toFixed(2)));
console.log("без ваг, мм: ", L.map(() => +(-w / L.length).toFixed(2)));

// 2) Трилатерація: точка за відстанями до чотирьох станцій (Гаусс — Ньютон).
const S = [[0, 0], [1000, 0], [300, 900], [900, 800]];
const d = [522.03, 657.63, 602.09, 685.91];   // виміряні відстані, м (точка ≈ (420; 310))
let p = [800, 700];                            // початкове наближення

for (let it = 1; it <= 6; it++) {
  // Лінеаризація: dᵢ(p + Δ) ≈ dᵢ(p) + uᵢ·Δ, де uᵢ — одиничний вектор від станції до точки.
  const rows = S.map(([sx, sy]) => {
    const dx = p[0] - sx, dy = p[1] - sy;
    const d0 = Math.hypot(dx, dy);
    return { u: [dx / d0, dy / d0], d0 };
  });
  // Нормальні рівняння 2×2 для поправки Δ: (JᵀJ)Δ = Jᵀ(d − d₀).
  let a = 0, b = 0, c = 0, e = 0, f = 0;
  rows.forEach(({ u, d0 }, i) => {
    const r = d[i] - d0;
    a += u[0] * u[0]; b += u[0] * u[1]; c += u[1] * u[1];
    e += u[0] * r;    f += u[1] * r;
  });
  const det = a * c - b * b;
  const dp = [(e * c - b * f) / det, (a * f - b * e) / det];
  p = [p[0] + dp[0], p[1] + dp[1]];
  console.log(\`ітерація \${it}: x = \${p[0].toFixed(3)}, y = \${p[1].toFixed(3)}, |Δ| = \${Math.hypot(...dp).toExponential(1)} м\`);
}
`}});function f(e,t=document){let n=t.querySelector(e);if(!n)throw Error(`Не знайдено ${e}`);return n}function p(e){let t=e.length,n=e.map((e,n)=>[...e,...Array.from({length:t},(e,t)=>+(n===t))]);for(let e=0;e<t;e++){let r=e;for(let i=e+1;i<t;i++)Math.abs(n[i][e])>Math.abs(n[r][e])&&(r=i);[n[e],n[r]]=[n[r],n[e]];let i=n[e][e];for(let r=0;r<2*t;r++)n[e][r]/=i;for(let r=0;r<t;r++){if(r===e)continue;let i=n[r][e];for(let a=0;a<2*t;a++)n[r][a]-=i*n[e][a]}}return n.map(e=>e.slice(t))}function m(){let e=f(`#w-weights`),t=[...e.querySelectorAll(`input[type="range"]`)],n=[...e.querySelectorAll(`output`)],i=f(`[data-out="table"]`,e),c=r(`svg`,{viewBox:`0 0 440 220`,role:`img`,"aria-label":`Поправки до ходів без ваг і з вагами`});f(`.plot`,e).appendChild(c);let l=[-5,.5],u=e=>20+(l[1]-s(e,l[0],l[1]))/(l[1]-l[0])*160;for(let e=-5;e<=0;e++){r(`line`,{x1:40,x2:430,y1:u(e),y2:u(e),stroke:e===0?`var(--axis)`:`var(--grid)`},c);let t=r(`text`,{x:34,y:u(e)+4,"text-anchor":`end`,class:`plot-label`},c);t.textContent=a(e,0)}let d=[0,1,2,3].map(e=>{let t=60+e*95;return{eq:r(`rect`,{x:t,width:32,rx:3,fill:`var(--muted)`,opacity:.45},c),wt:r(`rect`,{x:t+36,width:32,rx:3,fill:`var(--accent)`,opacity:.85},c),val:r(`text`,{x:t+52,"text-anchor":`middle`,class:`residual-label`,style:`fill: var(--accent)`},c),name:r(`text`,{x:t+34,y:212,"text-anchor":`middle`,class:`plot-label`},c)}}),p=r(`text`,{x:44,y:14,class:`plot-label`},c);p.textContent=`сірі — без ваг, сині — з вагами p = 1/L (мм)`;function m(){let e=t.map(e=>Number(e.value));e.forEach((e,t)=>n[t].textContent=`${a(e,1)} км`);let r=e.reduce((e,t)=>e+t,0),s=e.map(()=>-7/4),c=e.map(e=>-7*e/r);d.forEach((e,t)=>{o(e.eq,{y:u(0),height:u(s[t])-u(0)}),o(e.wt,{y:u(0),height:Math.max(1,u(c[t])-u(0))}),o(e.val,{y:u(c[t])+15}),e.val.textContent=a(c[t],2),e.name.textContent=`хід ${t+1}`});let l=(e,t)=>e.reduce((e,n,r)=>e+t[r]*n*n,0),f=e.map(()=>1),p=e.map(e=>1/e);i.innerHTML=`<thead><tr><th></th><th>Σ v²</th><th>Σ p·v²</th></tr></thead><tbody>
      <tr><td>без ваг (порівну)</td><td class="num">${a(l(s,f),2)}</td><td class="num">${a(l(s,p),2)}</td></tr>
      <tr><td>з вагами (пропорційно L)</td><td class="num">${a(l(c,f),2)}</td><td class="num"><b>${a(l(c,p),2)}</b></td></tr></tbody>`}t.forEach(e=>e.addEventListener(`input`,m)),m()}function h(){let e=f(`#w-levnet`),t=f(`.plot`,e),n=f(`[data-out="lines"]`,e),i=f(`[data-out="heights"]`,e),s=f(`[data-out="status"]`,e),c=f(`input[name="blunder"]`,e),l={Rp1:100,Rp2:103.5},u=[`A`,`B`,`C`],m={Rp1:[60,200],A:[190,60],B:[380,70],Rp2:[520,190],C:[300,250]},h=[{from:`Rp1`,to:`A`,h:1.215,L:1.2},{from:`A`,to:`B`,h:.843,L:.9},{from:`B`,to:`Rp2`,h:1.438,L:1.5},{from:`Rp1`,to:`C`,h:2.012,L:1.4},{from:`C`,to:`B`,h:.052,L:.8},{from:`C`,to:`Rp2`,h:1.487,L:1.1},{from:`A`,to:`C`,h:.797,L:1}],g=r(`svg`,{viewBox:`20 20 540 270`,role:`img`,"aria-label":`Схема нівелірної мережі: два репери, три пункти, сім ліній`});t.appendChild(g);let _=r(`defs`,{},g),v=r(`marker`,{id:`arr8`,viewBox:`0 0 10 10`,refX:9,refY:5,markerWidth:6,markerHeight:6,orient:`auto-start-reverse`},_);r(`path`,{d:`M0,0 L10,5 L0,10 z`,fill:`var(--muted)`},v);let y=h.map(e=>{let[t,n]=m[e.from],[i,a]=m[e.to],o=20/Math.hypot(i-t,a-n);return{line:r(`line`,{x1:t+(i-t)*o,y1:n+(a-n)*o,x2:i-(i-t)*o,y2:a-(a-n)*o,"stroke-width":3,"marker-end":`url(#arr8)`},g),label:r(`text`,{x:(t+i)/2,y:(n+a)/2-6,"text-anchor":`middle`,class:`residual-label`},g)}});Object.entries(m).forEach(([e,[t,n]])=>{let i=e in l;r(`circle`,{cx:t,cy:n,r:17,fill:i?`var(--accent)`:`var(--surface)`,stroke:`var(--accent)`,"stroke-width":2},g);let a=r(`text`,{x:t,y:n+5,"text-anchor":`middle`,class:`plot-label`,style:`font-weight: 700; font-size: 13px; fill: ${i?`#fff`:`var(--text)`}`},g);a.textContent=e}),n.innerHTML=h.map((e,t)=>`<tr><td>${t+1}</td><td>${e.from} → ${e.to}</td><td><input type="number" step="0.001" value="${e.h.toFixed(3)}" data-i="${t}" aria-label="Перевищення лінії ${t+1}, м" /></td><td class="num">${a(e.L,1)}</td><td class="num" data-v="${t}"></td></tr>`).join(``);let b=[...n.querySelectorAll(`input`)],x=[...n.querySelectorAll(`[data-v]`)];function S(){let e=h.map((e,t)=>Number(b[t].value.replace(`,`,`.`))+(c.checked&&t===4?.025:0));if(e.some(e=>!Number.isFinite(e)))return;let t=[],n=[],r=h.map(e=>1/Math.sqrt(e.L));h.forEach((i,a)=>{let o=u.map(e=>+(e===i.to)-(e===i.from)),s=e[a]+(l[i.from]??0)-(l[i.to]??0);t.push(o.map(e=>e*r[a])),n.push(s*r[a])});let f=d(t,n),m=h.map((t,n)=>{let r=u.map(e=>+(e===t.to)-(e===t.from)),i=e[n]+(l[t.from]??0)-(l[t.to]??0);return r.reduce((e,t,n)=>e+t*f[n],0)-i}),g=h.length-u.length,_=m.reduce((e,t,n)=>e+t*t/h[n].L,0),v=Math.sqrt(_/g),S=p(u.map((e,n)=>u.map((e,r)=>t.reduce((e,t)=>e+t[n]*t[r],0)))),C=m.map((e,t)=>Math.abs(e)/Math.sqrt(h[t].L)),w=C.indexOf(Math.max(...C));m.forEach((e,t)=>{let n=C[t]>.006;x[t].innerHTML=`<span style="color:${n?`var(--bad)`:`inherit`}">${a(e*1e3,1,!0)}</span>`;let r=C[t]>.006?`var(--bad)`:C[t]>.003?`var(--warn)`:`var(--good)`;o(y[t].line,{stroke:r}),y[t].label.textContent=`${a(e*1e3,1,!0)}`,y[t].label.setAttribute(`style`,`fill: ${r}`)}),i.innerHTML=u.map((e,t)=>`<tr><td>H<sub>${e}</sub></td><td class="num">${a(f[t],4)} м</td><td class="num">± ${a(v*Math.sqrt(S[t][t])*1e3,1)} мм</td></tr>`).join(``)+`<tr><td>σ₀</td><td class="num" colspan="2">${a(v*1e3,1)} мм на 1 км ходу (r = ${g})</td></tr>`,v*1e3>5?(s.className=`status warn`,s.innerHTML=`<b>σ₀ = ${a(v*1e3,1)} мм/√км — підозріло багато.</b> Найбільша нормована поправка — у лінії ${w+1} (${h[w].from} → ${h[w].to}). ${c.checked?`Там справді промах. Але зверніть увагу: помилку «розмазано» й на сусідні лінії — МНК намагається всім догодити. Як з цим боротися, розповімо в розділі 10.`:`Перевірте цей вимір.`}`):(s.className=`status success`,s.innerHTML=`Мережу зрівняно: σ₀ = ${a(v*1e3,1)} мм на 1 км — звичайна точність технічного нівелювання. Поправки малі й «рівномірні», промахів не видно.`)}b.forEach(e=>e.addEventListener(`input`,S)),c.addEventListener(`change`,S),S()}function g(){let e=f(`#w-gn`),t=f(`.plot`,e),i=f(`[data-out="iters"]`,e),o=f(`[data-out="status"]`,e),p=f(`input[name="truth"]`,e),m=[...e.querySelectorAll(`[data-preset]`)],h=n(t),g={good:[[80,80],[920,120],[300,900],[880,820]],line:[[100,520],[380,520],[650,520],[920,520]]},_=[420,310],v=[.6,-.4,.5,-.3],y=l(t,{width:h?400:480,height:h?400:480,x:[0,1e3],y:[0,1e3],margin:{top:14,right:14,bottom:28,left:40},xTicks:[0,250,500,750,1e3],yTicks:[0,250,500,750,1e3],ariaLabel:`Станції, кола виміряних відстаней, лінеаризація та шлях ітерацій`}),b=y.sx(1)-y.sx(0),x=r(`g`,{},y.layer),S=r(`g`,{},y.layer),C=r(`polyline`,{fill:`none`,stroke:`var(--warn)`,"stroke-width":2},y.layer),w=r(`g`,{},y.layer),T=r(`g`,{},y.layer);r(`circle`,{r:7,fill:`none`,stroke:`var(--good)`,"stroke-width":2.5},T);let E=r(`g`,{},y.svg),D=r(`g`,{class:`draggable`,tabindex:0,role:`button`,"aria-label":`Початкове наближення`},y.svg);r(`circle`,{r:18,class:`drag-halo`},D),r(`circle`,{r:7,fill:`var(--warn)`,stroke:`var(--surface)`,"stroke-width":2},D);let O=g.good.map(e=>[...e]),k=`good`,A=[820,660],j=[],M=()=>O.map(([e,t],n)=>Math.hypot(_[0]-e,_[1]-t)+v[n]),N=(e,t)=>O.reduce((n,[r,i],a)=>n+(t[a]-Math.hypot(e[0]-r,e[1]-i))**2,0);function P(e,t){let n=[],r=[];O.forEach(([i,a],o)=>{let s=Math.hypot(e[0]-i,e[1]-a);n.push([(e[0]-i)/s,(e[1]-a)/s]),r.push(t[o]-s)});let i=d(n,r);return i?[e[0]+i[0],e[1]+i[1]]:null}function F(){E.replaceChildren(),O.forEach((e,t)=>{let n=r(`g`,{class:`draggable`,tabindex:0,role:`button`,"aria-label":`Станція ${t+1}`},E);r(`circle`,{r:18,class:`drag-halo`},n),r(`path`,{d:`M0,-10 L9,7 L-9,7 Z`,fill:`var(--accent)`,stroke:`var(--surface)`,"stroke-width":1.5},n);let i=r(`text`,{x:12,y:-8,class:`plot-label`,style:`font-weight: 700`},n);i.textContent=`S${t+1}`,c(n,y.svg,(t,n)=>{e[0]=s(Math.round(y.ix(t)/10)*10,0,1e3),e[1]=s(Math.round(y.iy(n)/10)*10,0,1e3),j=[],I()})})}function I(){let e=M();x.replaceChildren(),O.forEach(([t,n],i)=>{r(`circle`,{cx:y.sx(t),cy:y.sy(n),r:e[i]*b,fill:`none`,stroke:`var(--accent)`,"stroke-opacity":.35,"stroke-width":1.5},x)}),[...E.children].forEach((e,t)=>e.setAttribute(`transform`,`translate(${y.sx(O[t][0])},${y.sy(O[t][1])})`));let t=j.length?j[j.length-1].p:A;S.replaceChildren(),O.forEach(([n,i],a)=>{let o=Math.hypot(t[0]-n,t[1]-i);if(o<1)return;let s=[(t[0]-n)/o,(t[1]-i)/o],c=[n+s[0]*e[a],i+s[1]*e[a]],l=[-s[1]*700,s[0]*700];r(`line`,{x1:y.sx(c[0]-l[0]),y1:y.sy(c[1]-l[1]),x2:y.sx(c[0]+l[0]),y2:y.sy(c[1]+l[1]),stroke:`var(--ml)`,"stroke-width":1.5,"stroke-dasharray":`6 5`,opacity:.8},S)});let n=[A,...j.map(e=>e.p)];C.setAttribute(`points`,n.map(([e,t])=>`${y.sx(e)},${y.sy(t)}`).join(` `)),w.replaceChildren(),j.forEach((e,t)=>{if(r(`circle`,{cx:y.sx(e.p[0]),cy:y.sy(e.p[1]),r:4,fill:`var(--warn)`},w),t<4){let n=r(`text`,{x:y.sx(e.p[0])+7,y:y.sy(e.p[1])-6,class:`plot-label`,style:`fill: var(--warn); font-weight: 700`},w);n.textContent=String(t+1)}}),D.setAttribute(`transform`,`translate(${y.sx(A[0])},${y.sy(A[1])})`),T.setAttribute(`transform`,`translate(${y.sx(_[0])},${y.sy(_[1])})`),T.setAttribute(`visibility`,p.checked?`visible`:`hidden`),i.innerHTML=`<tr><td>0</td><td class="num">${a(A[0],2)}</td><td class="num">${a(A[1],2)}</td><td class="num">${a(N(A,e),1)}</td><td>—</td></tr>`+j.map((e,t)=>`<tr><td>${t+1}</td><td class="num">${a(e.p[0],2)}</td><td class="num">${a(e.p[1],2)}</td><td class="num">${a(e.S,3)}</td><td class="num">${e.step<.001?e.step.toExponential(0):a(e.step,3)}</td></tr>`).join(``),m.forEach(e=>e.classList.toggle(`active`,e.dataset.preset===k));let s=j[j.length-1];if(!s)o.className=`status`,o.innerHTML=`Помаранчева точка — початкове наближення (його можна тягти). Фіолетові пунктири — кола відстаней, замінені дотичними прямими в околі поточної точки. Натисніть «Крок».`;else if(s.step<.001){let e=Math.hypot(s.p[0]-_[0],s.p[1]-_[1]);o.className=e>50?`status warn`:`status success`,o.innerHTML=e>50?`<b>Ітерації зійшлися — але не туди.</b> Станції стоять у ряд, і кола перетинаються у двох симетричних точках. Метод знайшов «дзеркальну» відповідь: вона так само добре узгоджується з вимірами. Потрібна краща геометрія або краще наближення.`:`<b>Зійшлося за ${j.length} ітерац${j.length<5?`ії`:`ій`}.</b> Кожен крок — звичайний лінійний МНК. Зверніть увагу на стовпчик |Δ|: кількість правильних цифр приблизно подвоюється на кожному кроці.`}else o.className=`status info`,o.innerHTML=`Крок ${j.length}: точка перемістилася на ${a(s.step,2)} м. Дотичні перебудовано в новій точці — знову лінійна задача.`}function L(){let e=M(),t=j.length?j[j.length-1].p:A,n=P(t,e);n&&(j.push({p:n,S:N(n,e),step:Math.hypot(n[0]-t[0],n[1]-t[1])}),I())}c(D,y.svg,(e,t)=>{A=[s(y.ix(e),0,1e3),s(y.iy(t),0,1e3)],j=[],I()}),y.svg.addEventListener(`dblclick`,e=>{let t=u(y.svg,e);A=[s(y.ix(t.x),0,1e3),s(y.iy(t.y),0,1e3)],j=[],I()}),f(`[data-action="step"]`,e).addEventListener(`click`,L),f(`[data-action="run"]`,e).addEventListener(`click`,()=>{let e=0,t=()=>{L(),e++;let n=j[j.length-1];e<10&&n&&n.step>1e-6&&setTimeout(t,350)};t()}),f(`[data-action="reset"]`,e).addEventListener(`click`,()=>{j=[],I()}),p.addEventListener(`change`,I),m.forEach(e=>e.addEventListener(`click`,()=>{k=e.dataset.preset,O=g[k].map(e=>[...e]),A=k===`line`?[520,820]:[820,660],j=[],F(),I()})),F(),I()}m(),h(),g();