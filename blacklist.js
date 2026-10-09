/* CSS tambahan daftar blacklist (biar gak perlu ubah style.css) */
(function(){
  const st=document.createElement("style");
  st.textContent=`/* Blacklist: daftar tanpa scroll, tanpa bentuk bulat */
#blacklistListOverlay .bl-modal{overflow-y:visible;max-height:none;}
.bl-items{gap:8px;margin:12px 0;}
.bl-row{display:flex;align-items:center;gap:12px;border:2px solid var(--ink);border-radius:10px;padding:8px;background:var(--panel-2);}
.bl-thumb{width:132px;height:72px;flex-shrink:0;object-fit:cover;object-position:center top;border-radius:6px;background:#fff;border:2px solid var(--ink);}
.bl-row-body{min-width:0;}
.bl-row-body h4{font-size:14.5px;color:var(--red-text);line-height:1.25;word-break:break-word;}
.bl-row-body .bl-followers{font-size:11.5px;color:var(--muted);}
.bl-row-body p{font-size:12.5px;margin-top:3px;}
.bl-bukti-row{display:flex;gap:12px;align-items:flex-start;border:2px solid var(--ink);border-radius:10px;padding:8px;background:var(--panel-2);}
.bl-bukti-row img{width:44%;max-width:170px;flex-shrink:0;border-radius:6px;background:#fff;border:2px solid var(--ink);}
.bl-bukti-row h4{font-size:14px;margin-bottom:4px;}
.bl-bukti-row p{font-size:12.5px;color:var(--muted);}
@media (max-width:400px){ .bl-thumb{width:104px;height:58px;} }
`;
  document.head.appendChild(st);
})();

/* ============================================================
   BLACKLIST CHANNEL — CIK STORE
   Edit daftar di BLACKLIST_LIST. Tiap item:
   - nama      : nama channel
   - pengikut  : jumlah pengikut (teks bebas)
   - foto      : path foto di folder BLACKLISTIMG/
   - alasan    : penjelasan singkat (tulis yang bisa kamu buktikan)
   Pastikan tiap alasan punya bukti (screenshot/link) yang kamu simpan.
   ============================================================ */

const BLACKLIST_LIST = [
  {
    nama: "CAA STUDIO LITE",
    pengikut: "595 pengikut",
    foto: "BLACKLISTIMG/caa-studio-lite.png",
    alasan: "Bagiin script/asset paid jadi gratis tanpa izin."
  },
  {
    nama: "allzzskyy || COMMUNITY",
    pengikut: "1.175 pengikut",
    foto: "BLACKLISTIMG/allzzskyy-community.png",
    alasan: "Bagiin script/asset paid jadi gratis tanpa izin."
  }
];

const BLACKLIST_BUKTI = [
  { foto: "BLACKLISTIMG/bukti-post.png", caption: "Contoh postingan: script berbayar dibagikan/dijual ulang dengan sumber dari komunitas lain." }
];

(function(){
  const listOverlay = document.getElementById("blacklistListOverlay");
  if(!listOverlay) return;

  function esc(s){ return String(s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

  document.getElementById("blacklistItems").innerHTML = BLACKLIST_LIST.map(c=>`
    <li class="bl-row">
      <img class="bl-thumb" src="${esc(c.foto)}" alt="Channel ${esc(c.nama)}">
      <div class="bl-row-body">
        <h4>${esc(c.nama)}</h4>
        <span class="bl-followers">${esc(c.pengikut)}</span>
        <p>${esc(c.alasan)}</p>
      </div>
    </li>`).join("");

  document.getElementById("blacklistBukti").innerHTML = BLACKLIST_BUKTI.map(b=>`
    <img src="${esc(b.foto)}" alt="Bukti postingan">
    <div>
      <h4>Bukti postingan</h4>
      <p>${esc(b.caption)}</p>
    </div>`).join("");

  function open(el){ el.classList.add("open"); document.body.style.overflow = "hidden"; }
  function close(el){
    el.classList.remove("open");
    if(!document.querySelector(".modal-overlay.open")) document.body.style.overflow = "";
  }

  document.getElementById("blacklistListClose").addEventListener("click", ()=> close(listOverlay));
  listOverlay.addEventListener("click", e=>{ if(e.target === listOverlay) close(listOverlay); });
  document.addEventListener("keydown", e=>{ if(e.key === "Escape") close(listOverlay); });

  // navigasi blacklist (menu atas + bottom nav)
  ["navBlacklistBtn","blacklistNavBtn"].forEach(id=>{
    const b = document.getElementById(id);
    if(!b) return;
    b.addEventListener("click", ()=>{
      open(listOverlay);
      const pop = document.getElementById("infoPopover");
      if(pop) pop.classList.remove("open");
      if(id === "blacklistNavBtn"){
        document.querySelectorAll(".bn-item").forEach(i=>i.classList.remove("active"));
        b.classList.add("active");
      }
    });
  });
})();
