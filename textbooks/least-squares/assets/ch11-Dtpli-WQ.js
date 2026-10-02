import{n as e,t}from"./common-DcWhnavj.js";import{a as n,d as r,f as i,i as a,r as o}from"./plot-BqFxNYwL.js";import{i as s,u as c}from"./linalg-Q8j_e_NO.js";e(),t(),i({summary:{py:`import numpy as np

def adjust(A, y, P=None, sigma_known=None):
    """Повне зрівнювання МНК: розв'язок, поправки, σ₀, точність і тест Баарди."""
    n, k = A.shape
    P = np.eye(n) if P is None else P
    W = np.sqrt(P)                                   # ваги → масштабуємо рядки
    theta, *_ = np.linalg.lstsq(W @ A, W @ y, rcond=None)
    v = A @ theta - y                                # поправки до вимірів
    r = n - k                                        # надлишкові виміри
    sigma0 = np.sqrt(v @ P @ v / r)
    Q = np.linalg.inv(A.T @ P @ A)
    sigma_theta = sigma0 * np.sqrt(np.diag(Q))
    s = sigma_known if sigma_known else sigma0
    Qvv = np.linalg.inv(P) - A @ Q @ A.T              # коваріація поправок (у частках σ²)
    w = v / (s * np.sqrt(np.diag(Qvv)))              # нормовані поправки (тест Баарди)
    return theta, v, sigma0, sigma_theta, w

# Приклад: пряма через 5 точок.
x = np.array([0, 1, 2, 3, 4.0]); y = np.array([1.1, 2.9, 5.2, 6.8, 9.0])
A = np.column_stack([np.ones_like(x), x])
theta, v, s0, st, w = adjust(A, y)
print("θ =", theta.round(3), " σθ =", st.round(3), " σ₀ =", round(s0, 3), " max|w| =", np.abs(w).max().round(2))

# Рекурсивний МНК: виміри надходять по одному, результат той самий, що й «пакетний».
theta_r = np.zeros(2); Pinv = np.eye(2) * 1e-9       # майже нульова апріорна інформація
b = np.zeros(2)
for xi, yi in zip(x, y):
    a = np.array([1, xi])
    Pinv += np.outer(a, a); b += a * yi              # накопичуємо AᵀA і Aᵀy
    theta_r = np.linalg.solve(Pinv, b)
print("рекурсивно:", theta_r.round(3))

# Фільтр Калмана в 1D: величина повільно змінюється (шум процесу q), виміри з шумом R.
rng = np.random.default_rng(1)
T = 120
truth = np.where(np.arange(T) < 60, 10.0, 12.0)      # стрибок на кроці 60 (скажімо, просідання)
z = truth + rng.normal(0, 1.0, T)
for q in [0.0, 0.01, 0.1]:
    xk, Pk, est = z[0], 1.0, [z[0]]                  # старт: перший вимір, дисперсія R
    for t in range(1, T):
        Pk += q                                      # прогноз: невизначеність зростає
        K = Pk / (Pk + 1.0)                          # коефіцієнт підсилення
        xk += K * (z[t] - xk)                        # уточнення за новим виміром
        Pk *= 1 - K
        est.append(xk)
    est = np.array(est)
    print(f"q = {q:<5}: RMSE до стрибка {np.sqrt(np.mean((est[:60] - truth[:60])**2)):.3f},"
          f" після {np.sqrt(np.mean((est[70:] - truth[70:])**2)):.3f}")
`,js:`// Повний конвеєр МНК на одній сторінці: розв'язок, поправки, σ₀, точність, тест Баарди.
// Невелика задача, тож вистачить нормальних рівнянь (для великих — QR, розділ 6).
function solve(M, b) {                            // метод Гаусса з вибором головного елемента
  const n = b.length, A = M.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    const p = A.reduce((best, row, r) => (r >= c && Math.abs(row[c]) > Math.abs(A[best][c]) ? r : best), c);
    [A[c], A[p]] = [A[p], A[c]];
    for (let r = 0; r < n; r++) if (r !== c) {
      const f = A[r][c] / A[c][c];
      for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k];
    }
  }
  return A.map((row, i) => row[n] / row[i]);
}
const inverse = (M) => M.map((_, j) => solve(M, M.map((__, i) => (i === j ? 1 : 0))));

function adjust(A, y, p = y.map(() => 1)) {
  const n = A.length, k = A[0].length;
  const N = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) =>
    A.reduce((s, row, r) => s + p[r] * row[i] * row[j], 0)));        // AᵀPA
  const u = Array.from({ length: k }, (_, i) => A.reduce((s, row, r) => s + p[r] * row[i] * y[r], 0));
  const theta = solve(N, u);
  const v = A.map((row, r) => row.reduce((s, a, j) => s + a * theta[j], 0) - y[r]);
  const sigma0 = Math.sqrt(v.reduce((s, vi, r) => s + p[r] * vi * vi, 0) / (n - k));
  const Q = inverse(N);                                               // симетрична, тож Q[j][j] — діагональ
  const sigmaTheta = Q.map((row, j) => sigma0 * Math.sqrt(row[j]));
  const w = A.map((row, r) => {                                       // qᵥᵥ = 1/p − aᵀQa
    const h = row.reduce((s, ai, i) => s + ai * row.reduce((t, aj, j) => t + Q[i][j] * aj, 0), 0);
    return v[r] / (sigma0 * Math.sqrt(1 / p[r] - h));
  });
  return { theta, v, sigma0, sigmaTheta, w };
}

const x = [0, 1, 2, 3, 4], y = [1.1, 2.9, 5.2, 6.8, 9.0];
const res = adjust(x.map((xi) => [1, xi]), y);
const f = (arr) => arr.map((t) => t.toFixed(3)).join(", ");
console.log("θ =", f(res.theta), " σθ =", f(res.sigmaTheta));
console.log("σ₀ =", res.sigma0.toFixed(3), " поправки:", f(res.v));
console.log("max |w| =", Math.max(...res.w.map(Math.abs)).toFixed(2), "(промах, якщо > 3,29)");

// Фільтр Калмана в 1D = рекурсивний МНК + «забування» старих вимірів (шум процесу q).
let seed = 20250;
const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const gauss = () => Math.sqrt(-2 * Math.log(rnd())) * Math.cos(2 * Math.PI * rnd());
const truth = Array.from({ length: 120 }, (_, t) => (t < 60 ? 10 : 12));
const z = truth.map((v) => v + gauss());                             // шум вимірів R = 1
for (const q of [0, 0.01, 0.1]) {
  let xk = z[0], P = 1;
  const est = z.map((zt, t) => {
    if (t === 0) return xk;                     // старт: перший вимір, дисперсія R
    P += q;                                     // прогноз: невизначеність зростає
    const K = P / (P + 1);                      // коефіцієнт підсилення
    xk += K * (zt - xk);                        // уточнення новим виміром
    P *= 1 - K;
    return xk;
  });
  const rmse = (a, b) => Math.sqrt(est.slice(a, b).reduce((s, e, i) => s + (e - truth[a + i]) ** 2, 0) / (b - a));
  console.log(\`q = \${q}: RMSE до стрибка \${rmse(0, 60).toFixed(3)}, після \${rmse(70, 120).toFixed(3)}\`);
}
`}});function l(e,t=document){let n=t.querySelector(e);if(!n)throw Error(`Не знайдено ${e}`);return n}var u={step:{truth:e=>e<60?10:12,calm:[0,60],change:[70,120],text:`стрибок на кроці 60`},drift:{truth:e=>e<40?10:10+3*(e-40)/80,calm:[0,40],change:[50,120],text:`повільний дрейф після кроку 40`},const:{truth:()=>10,calm:[0,120],change:null,text:`величина стала`}};function d(){let e=l(`#w-kalman`),t=l(`.plot-kalman`,e),i=l(`input[name="q"]`,e),d=l(`output[for="k-q"]`,e),f=l(`[data-out="status"]`,e),p=[...e.querySelectorAll(`[data-scenario]`)],m=n(t),h=o(t,{width:m?420:760,height:m?340:320,x:[0,120],y:[6,15],margin:{top:14,right:14,bottom:34,left:40},xTicks:m?[0,30,60,90,120]:[0,20,40,60,80,100,120],yTicks:[6,8,10,12,14],xLabel:`крок t`,ariaLabel:`Виміри, справжнє значення й оцінка фільтра Калмана`}),g=r(`path`,{fill:`var(--accent)`,"fill-opacity":.15,stroke:`none`},h.layer),_=r(`g`,{},h.layer),v=r(`path`,{fill:`none`,stroke:`var(--muted)`,"stroke-width":1.6,"stroke-dasharray":`6 4`},h.layer),y=r(`path`,{fill:`none`,stroke:`var(--accent)`,"stroke-width":2.4,"stroke-linejoin":`round`},h.layer),b=`step`,x=3,S=[],C=[],w=120,T=0,E=()=>Number(i.value)<=-4?0:10**Number(i.value);function D(){let e=c(x);C=Array.from({length:120},(e,t)=>u[b].truth(t)),S=C.map(t=>t+1*s(e)),_.replaceChildren(),S.forEach((e,t)=>{r(`circle`,{cx:h.sx(t),cy:h.sy(Math.max(6,Math.min(15,e))),r:m?2.6:2.4,fill:`var(--muted)`,"fill-opacity":.55,"data-t":t},_)}),v.setAttribute(`d`,C.map((e,t)=>`${t?`L`:`M`}${h.sx(t)},${h.sy(e)}`).join(``))}function O(e){let t=S[0],n=1,r=[t],i=[n],a=[1];for(let o=1;o<120;o++){n+=e;let s=n/(n+1);t+=s*(S[o]-t),n*=1-s,r.push(t),i.push(n),a.push(s)}return{est:r,vars:i,gains:a}}let k=e=>{let t=e%10,n=e%100>=11&&e%100<=14;return t===1&&!n?`${e} останній вимір`:t>=2&&t<=4&&!n?`${e} останні виміри`:`${e} останніх вимірів`},A=(e,[t,n])=>{let r=0;for(let i=t;i<n;i++)r+=(e[i]-C[i])**2;return Math.sqrt(r/(n-t))};function j(){let e=E();d.textContent=e===0?`0`:e>=.01?a(e,2):`${a(e*1e3,1)}·10⁻³`;let{est:t,vars:n,gains:r}=O(e),i=Math.max(1,w),o=e=>h.sy(Math.max(6,Math.min(15,e)));y.setAttribute(`d`,t.slice(0,i).map((e,t)=>`${t?`L`:`M`}${h.sx(t)},${o(e)}`).join(``));let s=t.slice(0,i).map((e,t)=>`${h.sx(t)},${o(e+2*Math.sqrt(n[t]))}`),c=t.slice(0,i).map((e,t)=>`${h.sx(t)},${o(e-2*Math.sqrt(n[t]))}`).reverse();if(g.setAttribute(`d`,`M${s.join(`L`)}L${c.join(`L`)}Z`),_.querySelectorAll(`circle`).forEach((e,t)=>e.setAttribute(`visibility`,t<i?`visible`:`hidden`)),w<120){f.className=`status info`,f.textContent=`Надійшло вимірів: ${w}. Оцінка ${a(t[i-1],2)}, коефіцієнт підсилення K = ${a(r[i-1],3)}.`;return}let l=u[b],p=r[119],m=[e===0?`q = 0: це рекурсивний МНК, тобто просто середнє всіх вимірів. Останній вимір має вагу K = 1/120 ≈ ${a(p,3)}.`:`Останній вимір має вагу K = ${a(p,3)}: фільтр «пам'ятає» приблизно ${k(Math.round(1/p))}.`,l.change?`Похибка оцінки (RMSE): на спокійній ділянці ${a(A(t,l.calm),3)}, після зміни ${a(A(t,l.change),3)}.`:`Похибка оцінки (RMSE): ${a(A(t,l.calm),3)}.`];f.textContent=m.join(` `);let v=l.change&&A(t,l.change)>.6;f.className=`status ${v?`warn`:`success`}`}function M(){T&&window.clearInterval(T),T=0}i.addEventListener(`input`,()=>{M(),w=120,j()}),p.forEach(e=>e.addEventListener(`click`,()=>{M(),b=e.dataset.scenario,p.forEach(t=>t.classList.toggle(`active`,t===e)),w=120,D(),j()})),e.querySelector(`[data-action="noise"]`)?.addEventListener(`click`,()=>{M(),x+=1,w=120,D(),j()}),e.querySelector(`[data-action="play"]`)?.addEventListener(`click`,()=>{M(),w=1,j(),T=window.setInterval(()=>{w+=1,j(),w>=120&&M()},45)}),D(),j()}var f=[{key:`base`,html:`Скласти модель, матрицю $A$ і вектор вимірів $\\mathbf y$. Перевірити, що вимірів більше, ніж невідомих: $r = n - k &gt; 0$ (<a href="./01-overdetermined.html">розділ 1</a>).`}],p=[{key:`nonlinear`,html:`<strong>Нелінійна модель</strong> → лінеаризувати й ітерувати: Гаусс — Ньютон, за проблем зі збіжністю — Левенберг — Марквардт (<a href="./08-geodesy.html">розділ 8</a>). Потрібне добре початкове наближення.`},{key:`weights`,html:`<strong>Різна точність</strong> → ваги $p_i = 1/\\sigma_i^2$, розв'язувати $A^\\mathsf{T}PA\\,\\boldsymbol\\theta = A^\\mathsf{T}P\\mathbf y$ або масштабувати рядки на $\\sqrt{p_i}$ (<a href="./08-geodesy.html">розділ 8</a>).`},{key:`illcond`,html:`<strong>Погана обумовленість або багато параметрів</strong> → центрувати й масштабувати ознаки, QR/SVD замість $(A^\\mathsf{T}A)^{-1}$ (<a href="./06-programming.html">розділ 6</a>); ridge з λ, підібраним на валідації (<a href="./07-beyond-lines.html">розділ 7</a>, <a href="./10-machine-learning.html">розділ 10</a>).`},{key:`stream`,html:`<strong>Дані надходять потоком або величина змінюється</strong> → рекурсивний МНК, фільтр Калмана (розділ 11.2).`},{key:`huge`,html:`<strong>Мільйони невідомих</strong> → розріджені матриці, ітераційні методи (CG, LSQR), Ceres / g2o / GTSAM (розділ 11.3); градієнтні методи, якщо навіть це задорого (<a href="./10-machine-learning.html">розділ 10</a>).`}],m={key:`solve`,html:`Розв'язати через <code>lstsq</code> (QR/SVD), а не через обернення $A^\\mathsf{T}A$ (<a href="./06-programming.html">розділ 6</a>).`},h=[{key:`outliers`,html:`<strong>Можливі промахи</strong> → після розв'язання тест Баарди: викидати найбільший $|w_i| &gt; 3{,}29$ по одному й перераховувати. Якщо промахів багато — Губер (IRLS) або RANSAC (<a href="./10-machine-learning.html">розділ 10</a>).`}],g=[{key:`check`,html:`Поправки $\\mathbf v$, $\\hat\\sigma_0 = \\sqrt{\\mathbf v^\\mathsf{T}P\\mathbf v / r}$, точність $\\sigma_0\\sqrt{Q_{jj}}$ і еліпси похибок (<a href="./09-statistics.html">розділ 9</a>). Подивитися на графік поправок: чи немає в них закономірності (<a href="./07-beyond-lines.html">розділ 7</a>).`}];function _(){let t=l(`#w-chooser`),n=[...t.querySelectorAll(`input[type="checkbox"]`)],r=l(`[data-out="recipe"]`,t);function i(){let t=new Set(n.filter(e=>e.checked).map(e=>e.name)),i=[...f];for(let e of p)t.has(e.key)&&i.push(e);i.push(m),t.has(`outliers`)&&i.push(...h),i.push(...g),r.innerHTML=i.map(e=>`<li class="${e.key===`base`||e.key===`solve`||e.key===`check`?``:`extra`}">${e.html}</li>`).join(``),e(r)}n.forEach(e=>e.addEventListener(`change`,i)),i()}function v(){let e=l(`#s-tasks-list`),t=l(`[data-out="progress"]`),n=[...e.querySelectorAll(`.quiz`)],r=new Set,i=()=>{t.textContent=`Розв'язано: ${r.size} з ${n.length}${r.size===n.length?` 🎉 Ви пройшли весь підручник!`:``}`,t.className=`status ${r.size===n.length?`success`:`info`}`};n.forEach((e,t)=>{let n=e.querySelector(`.feedback`);n&&new MutationObserver(()=>{n.classList.contains(`ok`)&&r.add(t),i()}).observe(n,{attributes:!0,attributeFilter:[`class`]})}),i()}_(),d(),v();