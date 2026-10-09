/* ============================================================
   OVERLAY FOLLOW — muncul pas masuk website (gantinya overlay blacklist)
   Isinya ngajak follow Saluran WhatsApp & TikTok. Link-nya diambil dari
   SALURAN_LIST di main.js (jadi ganti link cukup di sana).
   ============================================================ */
const FOLLOW_SHOW_ON_LOAD = true;      // false = overlay gak muncul otomatis
const FOLLOW_ONCE_PER_SESSION = false; // true = cuma muncul sekali per sesi browser

(function(){
  const overlay = document.getElementById("followOverlay");
  const list = document.getElementById("followList");
  if(!overlay || !list) return;

  const wa = SALURAN_LIST.find(s => s.icon === "channel");
  const tt = SALURAN_LIST.find(s => s.icon === "tiktok");
  const items = [
    wa && { icon: "channel", title: "Saluran WhatsApp", desc: "Info produk baru, promo & kode promo", btn: "Gabung", link: wa.link },
    tt && { icon: "tiktok", title: "TikTok @cikhub_01", desc: "Konten, update & giveaway", btn: "Follow", link: tt.link }
  ].filter(Boolean);

  list.innerHTML = items.map(it => `
    <a class="follow-item" href="${it.link}" target="_blank" rel="noopener">
      <span class="saluran-icon follow-icon">${icons[it.icon]}</span>
      <span class="follow-item-text">
        <b>${it.title}</b>
        <small>${it.desc}</small>
      </span>
      <span class="btn btn-primary follow-btn">${it.btn}</span>
    </a>`).join("");

  function open(){ overlay.classList.add("open"); document.body.style.overflow = "hidden"; }
  function close(){
    overlay.classList.remove("open");
    if(!document.querySelector(".modal-overlay.open")) document.body.style.overflow = "";
  }
  document.getElementById("followClose").addEventListener("click", close);
  document.getElementById("followSkip").addEventListener("click", close);
  overlay.addEventListener("click", e=>{ if(e.target === overlay) close(); });
  document.addEventListener("keydown", e=>{ if(e.key === "Escape") close(); });

  if(FOLLOW_SHOW_ON_LOAD){
    let skip = false;
    if(FOLLOW_ONCE_PER_SESSION){
      try{ skip = sessionStorage.getItem("followSeen") === "1"; sessionStorage.setItem("followSeen","1"); }catch(e){}
    }
    if(!skip) open();
  }
})();
