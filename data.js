const SITE_DEFAULT = {
  ownerEdit: {
    enabled: true,         // ✏️ 버튼 보이게
    passcode: "1234",      // ✅ 꼭 바꿔
  },

  brand: { title: "MMDL", subtitle: "Mechanics • Materials • Data Lab" },
  footer: { left: "© MMDL", right: "Built on GitHub Pages" },

  nav: [
    { label: "Home", href: "#home" },
    { label: "News", href: "#news" },
    { label: "Research", href: "#research" },
    { label: "Members", href: "#members" },
    { label: "Publications", href: "#pubs" },
    { label: "Contact", href: "#contact" },
  ],

  hero: {
    chip: "Hanbat National University",
    kicker: "공과대학 · 신소재공학과",
    title: "Mechanics-driven Design for Advanced Materials",
    intro: "여기에 Google Sites HOME 소개 문장을 그대로 붙여넣으면 됩니다.",
    mediaSlides: [
      {
        src: "",
        caption: "대표 이미지/슬라이드 (여기에 이미지 URL을 넣으면 자동 표시됩니다)",
      },
      {
        src: "",
        caption: "연구 이미지/장비/실험 사진 등을 넣어주세요",
      },
    ],
    buttons: [
      { label: "Research", href: "#research", style: "primary" },
      { label: "Publications", href: "#pubs", style: "default" },
      { label: "Contact", href: "#contact", style: "ghost" },
    ],
    stats: [
      { k: "Themes", v: "4+" },
      { k: "Methods", v: "FE · ML · Exp." },
      { k: "Focus", v: "Reliability" },
    ],
  },

  news: {
    title: "News",
    desc: "최근 업데이트 / 공지",
    items: [
      { date: "2026-02-10", title: "홈페이지 업데이트", text: "News 섹션을 추가하고 첫 화면 레이아웃을 개선했습니다.", href: "" },
      { date: "2026-01-20", title: "연구 진행", text: "프로젝트/논문/수상/학회 등 최신 소식을 여기에 기록하세요.", href: "" },
      { date: "2025-12-01", title: "모집", text: "학부연구생/대학원생 모집 공지를 여기에 추가할 수 있습니다.", href: "" },
    ],
  },

  research: {
    title: "Research Themes",
    desc: "아이콘을 누르면 촤라르르 펼쳐지는 섹션(아코디언) 예시",
    themes: [
      { icon: "", title: "Theme 1 (예: Solid-state Joining / FSP)", body: ["내용을 여기에"], bullets: ["키워드 1","키워드 2"] },
      { icon: "", title: "Theme 2 (예: Corrosion / SCC)", body: ["내용을 여기에"], bullets: [] },
      { icon: "", title: "Theme 3 (예: Multiphysics Modeling)", body: ["내용을 여기에"], bullets: ["FE","ML","PINN"] },
      { icon: "", title: "Theme 4 (예: Microstructure & Reliability)", body: ["내용을 여기에"], bullets: [] },
    ],
    highlights: [
      { title: "Highlight 1", text: "대표 연구/성과 한 줄 요약", href: "#pubs", linkLabel: "See publications →" },
      { title: "Highlight 2", text: "대표 연구/성과 한 줄 요약", href: "#contact", linkLabel: "Contact →" },
      { title: "Highlight 3", text: "대표 연구/성과 한 줄 요약", href: "#members", linkLabel: "Members →" },
    ],
  },

  members: {
    title: "Members",
    desc: "프로필 카드(사진은 나중에)",
    people: [
      { avatar: "P", name: "Professor Name", meta: "PI · Materials & Mechanics" },
      { avatar: "S", name: "Student Name", meta: "FE · ML · Experiments" },
      { avatar: "S", name: "Student Name", meta: "Corrosion · SCC" },
    ],
  },

  pubs: {
    title: "Publications",
    desc: "연도별 펼침(아코디언)",
    years: [
      { year: "2026", items: ["Paper title… Journal, Year"] },
      { year: "2025", items: ["Paper title… Journal, Year"] },
    ],
  },

  contact: {
    title: "Contact",
    desc: "주소/메일/연락처",
    items: [
      { label: "Email", value: "your@mail.com", href: "mailto:your@mail.com" },
      { label: "Office", value: "Hanbat National University, …" },
      { label: "Phone", value: "+82-…" },
    ],
  },
};

// Export JSON 붙여넣으면 “모든 사람에게” 반영되는 패치
const SITE_OVERRIDES = null;

// ---------- do not edit ----------
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
window.SITE = deepMerge(SITE_DEFAULT, SITE_OVERRIDES);

