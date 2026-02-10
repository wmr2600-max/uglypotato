const $ = (id) => document.getElementById(id);

function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

function deepMerge(base, patch){
  if(!patch) return base;
  const out = Array.isArray(base) ? [...base] : { ...base };
  for(const k of Object.keys(patch)){
    const bv = base?.[k];
    const pv = patch[k];
    if(pv && typeof pv === "object" && !Array.isArray(pv) && bv && typeof bv === "object" && !Array.isArray(bv)){
      out[k] = deepMerge(bv, pv);
    } else out[k] = pv;
  }
  return out;
}

// local draft
function loadDraft(){
  try{
    const raw = localStorage.getItem("MMDL_DRAFT_V1");
    return raw ? JSON.parse(raw) : null;
  }catch{ return null; }
}
function saveDraft(patch){
  localStorage.setItem("MMDL_DRAFT_V1", JSON.stringify(patch));
}
function clearDraft(){
  localStorage.removeItem("MMDL_DRAFT_V1");
}

const HTML_DRAFT_KEY = "MMDL_HTML_DRAFT_V1";
function loadHtmlDraft(){
  try{ return localStorage.getItem(HTML_DRAFT_KEY); }catch{ return null; }
}
function saveHtmlDraft(html){
  try{ localStorage.setItem(HTML_DRAFT_KEY, html); }catch{}
}
function clearHtmlDraft(){
  try{ localStorage.removeItem(HTML_DRAFT_KEY); }catch{}
}

let PATCH = loadDraft() || null;
let SITE_VIEW = deepMerge(window.SITE, PATCH);


// hero media slider
let mediaIdx = 0;
let mediaTimer = null;
let mediaPlaying = true;

function applyHeroSlide(){
  const slide = $("heroSlide");
  const cap = $("mediaCaption");
  if(!slide || !cap) return;
  const slides = (SITE_VIEW.hero?.mediaSlides || []);
  if(!slides.length){
    slide.classList.add("placeholder");
    slide.style.backgroundImage = "";
    cap.textContent = "";
    return;
  }
  mediaIdx = (mediaIdx + slides.length) % slides.length;
  const it = slides[mediaIdx] || {};
  const src = it.src || "";
  if(src){
    slide.classList.remove("placeholder");
    slide.style.backgroundImage = `url("${src.replace(/"/g,'&quot;')}")`;
  }else{
    slide.classList.add("placeholder");
    slide.style.backgroundImage = "";
  }
  cap.textContent = it.caption || "";
}

function startMediaAuto(){
  stopMediaAuto();
  if(!mediaPlaying) return;
  mediaTimer = setInterval(()=>{ mediaIdx++; applyHeroSlide(); }, 4500);
}
function stopMediaAuto(){
  if(mediaTimer){ clearInterval(mediaTimer); mediaTimer = null; }
}

function bindMediaControls(){
  const prev = $("mediaPrev");
  const next = $("mediaNext");
  const play = $("mediaPlay");
  if(prev) prev.onclick = ()=>{ mediaIdx--; applyHeroSlide(); startMediaAuto(); };
  if(next) next.onclick = ()=>{ mediaIdx++; applyHeroSlide(); startMediaAuto(); };
  if(play){ play.textContent = mediaPlaying ? "⏸" : "⏵"; play.onclick = ()=>{
    mediaPlaying = !mediaPlaying;
    play.textContent = mediaPlaying ? "⏸" : "⏵";
    startMediaAuto();
  }; }
}


// path utils
function getByPath(obj, path){
  return path.split(".").reduce((o,k)=> (o ? o[k] : undefined), obj);
}
function setByPath(obj, path, value){
  const keys = path.split(".");
  const last = keys.pop();
  let cur = obj;
  for(const k of keys){
    if(!cur[k] || typeof cur[k] !== "object") cur[k] = {};
    cur = cur[k];
  }
  cur[last] = value;
}

// render blocks
function renderNav(){
  const nav = $("nav");
  nav.innerHTML = SITE_VIEW.nav.map(x => `<a class="navlink" href="${esc(x.href)}">${esc(x.label)}</a>`).join("");
}

function btnClass(style){
  if(style === "primary") return "btn primary";
  if(style === "ghost") return "btn ghost";
  return "btn";
}

function renderHero(){
  $("heroActions").innerHTML = (SITE_VIEW.hero.buttons||[])
    .map(b => `<a class="${btnClass(b.style)}" href="${esc(b.href)}">${esc(b.label)}</a>`)
    .join("");

  $("heroStats").innerHTML = (SITE_VIEW.hero.stats||[])
    .map(s => `<div class="stat"><div class="k">${esc(s.k)}</div><div class="v">${esc(s.v)}</div></div>`)
    .join("");
}


function renderNews(){
  const root = $("newsGrid");
  if(!root) return;
  const items = (SITE_VIEW.news?.items || []).slice(0, 6);
  root.innerHTML = items.map((n) => `
    <article class="news-card">
      <div class="news-meta">
        <span class="news-date">${esc(n.date || "")}</span>
      </div>
      <h3 class="news-title">${esc(n.title || "")}</h3>
      <p class="news-text">${esc(n.text || "")}</p>
      ${n.href ? `<a class="news-link" href="${esc(n.href)}">Read more →</a>` : ``}
    </article>
  `).join("");
}




function renderThemes(){
  const root = $("themes");
  const themes = (SITE_VIEW.research.themes||[]);
  root.innerHTML = themes.map((t, idx) => {
    const body = Array.isArray(t.body) ? t.body : [];
    const summary = (t.summary ?? body[0] ?? "");
    const rest = body.length > 1 ? body.slice(1) : (t.summary ? body : []);
    return `
      <button class="acc-btn" aria-expanded="false" type="button" data-acc="${idx}">
        <span class="acc-title">${esc(t.title || "")}</span>
        ${summary ? `<span class="acc-sub">${esc(summary)}</span>` : ``}
        <span class="acc-caret">⌄</span>
      </button>
      <div class="acc-panel">
        <div>
          ${rest.map(p => `<p>${esc(p)}</p>`).join("")}
          ${(t.bullets && t.bullets.length) ? `<ul>${t.bullets.map(b => `<li>${esc(b)}</li>`).join("")}</ul>` : ""}
        </div>
      </div>
    `;
  }).join("");

  initAccordion(root);
}


function renderHighlights(){
  const root = $("highlights");
  root.innerHTML = (SITE_VIEW.research.highlights||[]).map(h => `
    <article class="card">
      <h3>${esc(h.title)}</h3>
      <p>${esc(h.text)}</p>
      <a href="${esc(h.href)}">${esc(h.linkLabel)}</a>
    </article>
  `).join("");
}

function renderMembers(){
  const root = $("membersGrid");
  root.innerHTML = (SITE_VIEW.members.people||[]).map(p => `
    <div class="person">
      <div class="avatar">${esc(p.avatar||"?")}</div>
      <div>
        <div class="name">${esc(p.name)}</div>
        <div class="meta">${esc(p.meta||"")}</div>
      </div>
    </div>
  `).join("");
}

function renderPubs(){
  const root = $("pubYears");
  root.innerHTML = (SITE_VIEW.pubs.years||[]).map(y => `
    <button class="acc-btn" aria-expanded="false" type="button">
      <span class="acc-icon">📌</span>
      <span class="acc-title">${esc(y.year)}</span>
      <span class="acc-caret">⌄</span>
    </button>
    <div class="acc-panel">
      <div>
        <ol>
          ${(y.items||[]).map(it => `<li>${esc(it)}</li>`).join("")}
        </ol>
      </div>
    </div>
  `).join("");

  initAccordion(root);
}

function renderContact(){
  const root = $("contactGrid");
  root.innerHTML = (SITE_VIEW.contact.items||[]).map(x => `
    <div class="contact">
      <div style="flex:1">
        <div class="c-label">${esc(x.label)}</div>
        <div class="c-value">${x.href ? `<a href="${esc(x.href)}">${esc(x.value)}</a>` : esc(x.value)}</div>
      </div>
    </div>
  `).join("");
}

function renderAll(){
  renderNav();
  renderHero();
  renderThemes();
  renderHighlights();
  renderMembers();
  renderPubs();
  renderContact();
  initMobileNav();
  // initEditSystem is called from boot()
}

// Accordion
function initAccordion(root){
  const btns = root.querySelectorAll(".acc-btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btns.forEach(b => {
        b.setAttribute("aria-expanded","false");
        const p = b.nextElementSibling;
        if(p && p.classList.contains("acc-panel")) p.style.maxHeight = "0px";
      });
      if(!expanded){
        btn.setAttribute("aria-expanded","true");
        const panel = btn.nextElementSibling;
        if(panel && panel.classList.contains("acc-panel")){
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      }
    });
  });
}

// Mobile nav
function initMobileNav(){
  const hamb = $("hamb");
  const nav = $("nav");
  if(!hamb || !nav) return;

  hamb.onclick = () => {
    const open = nav.classList.toggle("open");
    hamb.setAttribute("aria-expanded", open ? "true" : "false");
  };
  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      hamb.setAttribute("aria-expanded","false");
    });
  });
}

// --------- Live edit system ----------
let unlocked = false;

function initEditSystem(){
  const enabled = !!SITE_VIEW.ownerEdit?.enabled;
  $("editFab").style.display = enabled ? "block" : "none";
  if(!enabled) return;

  $("editFab").onclick = openDrawer;
  $("closeDrawer").onclick = closeDrawer;
  $("backdrop").onclick = closeDrawer;

  $("unlock").onclick = () => {
    const pass = $("pass").value;
    if(pass !== SITE_VIEW.ownerEdit.passcode){
      alert("Wrong passcode.");
      return;
    }
    unlocked = true;
    document.body.classList.add("editing-on");
    alert("Unlocked. 이제 페이지의 어떤 텍스트든 클릭해서 수정할 수 있어요.");
  };

  $("saveLocal").onclick = () => {
    // Save JSON patch + full HTML snapshot (so dynamic sections are preserved)
    saveDraft(PATCH || {});
    const main = getMain();
    if(main) saveHtmlDraft(main.innerHTML);
    alert("Saved to this browser.");
  };

  $("resetLocal").onclick = () => {
    if(confirm("Reset local edits?")){
      clearDraft();
      clearHtmlDraft();
      PATCH = null;
      SITE_VIEW = deepMerge(window.SITE, null);
      unlocked = false;
      document.body.classList.remove("editing-on");
      $("exportBox").value = "";
      closeDrawer();
      reloadTextFromSiteView();
      renderAll();
    }
  };

  $("exportJson").onclick = () => {
    $("exportBox").value = JSON.stringify(PATCH || {}, null, 2);
  };

  if($("exportHtml")){
    $("exportHtml").onclick = () => {
      const main = getMain();
      $("exportHtmlBox").value = main ? main.innerHTML : "";
    };
  }

  // click-to-edit
  document.querySelectorAll("[data-edit]").forEach(el => {
    el.addEventListener("click", (e) => {
      if(!unlocked) return;
      e.preventDefault();
      e.stopPropagation();
      makeEditable(el);
    });
  });

  // universal click-to-edit (ANY text on the page)
  document.addEventListener("click", (e) => {
    if(!unlocked) return;

    // Ignore clicks inside the editor drawer
    if(e.target && e.target.closest && e.target.closest("#drawer")) return;

    // Find a reasonable text element to edit
    let el = e.target;
    while(el && el !== document.body){
      const tag = (el.tagName || "").toUpperCase();

      if(tag && !["SCRIPT","STYLE"].includes(tag) && !el.matches("input,textarea,select,option") && !el.classList.contains("fab")){
        const txt = (el.textContent || "").replace(/\s+/g," ").trim();
        if(txt.length){
          // Prevent navigation when editing links/buttons
          if(tag === "A" || tag === "BUTTON") e.preventDefault();
          e.stopPropagation();

          // If it's an accordion caret/icon, skip to parent
          if(el.classList.contains("acc-caret") || el.classList.contains("acc-icon")){
            el = el.parentElement;
            continue;
          }

          editAnyElementText(el);
          return;
        }
      }
      el = el.parentElement;
    }
  }, true);

  // initial set
  reloadTextFromSiteView();
}

function reloadTextFromSiteView(){
  document.querySelectorAll("[data-edit]").forEach(el => {
    const path = el.getAttribute("data-edit");
    const val = getByPath(SITE_VIEW, path);
    if(typeof val === "string"){
      el.textContent = val;
    }
  });
}

function makeEditable(el){
  const path = el.getAttribute("data-edit");
  const current = getByPath(SITE_VIEW, path);
  const value = prompt(`Edit: ${path}`, current ?? "");
  if(value === null) return;

  // build patch
  PATCH = PATCH || {};
  setByPath(PATCH, path, value);

  // apply
  SITE_VIEW = deepMerge(window.SITE, PATCH);
  reloadTextFromSiteView();
}


// --------- Boot / hydration ----------
function getMain(){
  return document.querySelector("main");
}

function editAnyElementText(el){
  const current = el.textContent ?? "";
  const path = el.getAttribute && el.getAttribute("data-edit");
  const label = path ? `Edit: ${path}` : "Edit text";
  const value = prompt(label, current);
  if(value === null) return;

  // Update DOM text only (keeps links/hrefs/styles intact)
  el.textContent = value;

  // If it has a structured binding, also update PATCH so Export JSON still works for those fields
  if(path){
    PATCH = PATCH || {};
    setByPath(PATCH, path, value);
    SITE_VIEW = deepMerge(window.SITE, PATCH);
    reloadTextFromSiteView();
  }

  // Persist full-page snapshot (includes dynamic sections)
  const main = getMain();
  if(main) saveHtmlDraft(main.innerHTML);
}

function hydrateFromHtmlDraft(){
  const raw = loadHtmlDraft();
  if(!raw) return false;
  const main = getMain();
  if(!main) return false;

  main.innerHTML = raw;

  // Re-bind behaviors for restored DOM
  const themes = $("themes");
  if(themes) initAccordion(themes);
  const pubYears = $("pubYears");
  if(pubYears) initAccordion(pubYears);
  initMobileNav();
  bindMediaControls();
  startMediaAuto();
  initEditSystem();
  return true;
}

function boot(){
  // If a full HTML draft exists, prefer it (it includes dynamic sections too).
  const hydrated = hydrateFromHtmlDraft();
  if(!hydrated){
    renderAll();
    bindMediaControls();
    startMediaAuto();
    initEditSystem();
  }
}

function openDrawer(){
  $("drawer").classList.add("show");
  $("drawer").setAttribute("aria-hidden","false");
}
function closeDrawer(){
  $("drawer").classList.remove("show");
  $("drawer").setAttribute("aria-hidden","true");
}

boot();
