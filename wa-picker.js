/* ============================================================
   PILIH NOMOR WHATSAPP — muncul tiap user mau Chat / Order / Buy / Top Up
   - Semua link wa.me di web otomatis dicegat, user disuruh pilih Nomor 1 atau Nomor 2
   - User WAJIB isi nama dulu (biar nomornya di-save sama owner), nama ikut masuk ke pesan
   - Ganti / tambah nomor cukup edit WA_NUMBERS di bawah (format internasional tanpa + / spasi / 0 depan)
   ============================================================ */
const WA_NUMBERS = [
  { label: "Nomor Owner 1", code: "+62", num: "6283148944126" },
  { label: "Nomor Owner 2", code: "+84", num: "84565781833" }
];

(function(){
  var NAME_KEY = "cik_buyer_name";
  var pendingText = "";
  var overlay, input, errEl;

  function readName(){ try{ return localStorage.getItem(NAME_KEY) || ""; }catch(e){ return ""; } }
  function saveName(v){ try{ localStorage.setItem(NAME_KEY, v); }catch(e){} }

  function injectCss(){
    var st = document.createElement("style");
    st.textContent =
      "#waPickOverlay{z-index:140;}" +
      "#waPickOverlay .wa-sub{font-size:12.5px;color:var(--muted);line-height:1.45;margin:2px 36px 14px 0;}" +
      "#waPickOverlay .wa-label{display:block;font-size:12px;font-weight:800;margin:0 0 6px;}" +
      "#waPickOverlay .wa-input{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:12px;border:var(--bw) solid var(--ink);" +
        "background:var(--surface);color:var(--ink);font:600 14px Inter,system-ui,sans-serif;outline:none;}" +
      "#waPickOverlay .wa-input.bad{border-color:#ff3b57;animation:waShake .3s;}" +
      "#waPickOverlay .wa-err{min-height:16px;font-size:11.5px;color:#ff5a73;margin:6px 0 10px;font-weight:600;}" +
      "#waPickOverlay .wa-list{display:flex;flex-direction:column;gap:10px;margin-bottom:12px;}" +
      "#waPickOverlay .wa-opt{width:100%;text-align:left;font:inherit;color:inherit;cursor:pointer;}" +
      "#waPickOverlay .wa-opt .follow-item-text b{font-family:'JetBrains Mono',monospace;}" +
      "@keyframes waShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}";
    document.head.appendChild(st);
  }

  function build(){
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.id = "waPickOverlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    var modal = document.createElement("div");
    modal.className = "modal follow-modal";

    var close = document.createElement("button");
    close.className = "modal-close"; close.type = "button"; close.textContent = "✕"; close.setAttribute("aria-label", "Tutup");
    close.addEventListener("click", hide);

    var h = document.createElement("h3"); h.textContent = "Pilih nomor WhatsApp";
    var sub = document.createElement("p"); sub.className = "wa-sub";
    sub.textContent = "Pilih salah satu nomor owner buat lanjut chat / order / top up. Isi nama dulu ya biar nomormu di-save sama owner.";

    var lab = document.createElement("label"); lab.className = "wa-label"; lab.htmlFor = "waPickName"; lab.textContent = "Nama kamu (wajib)";
    input = document.createElement("input");
    input.id = "waPickName"; input.className = "wa-input"; input.type = "text"; input.maxLength = 40;
    input.placeholder = "Contoh: CikRorw"; input.autocomplete = "name";
    input.addEventListener("input", function(){ input.classList.remove("bad"); errEl.textContent = ""; });
    errEl = document.createElement("div"); errEl.className = "wa-err";

    var list = document.createElement("div"); list.className = "wa-list";
    WA_NUMBERS.forEach(function(n){
      var b = document.createElement("button");
      b.type = "button"; b.className = "follow-item wa-opt";

      var txt = document.createElement("span"); txt.className = "follow-item-text";
      var t1 = document.createElement("b"); t1.textContent = n.label + " ( " + n.code + " )";
      var t2 = document.createElement("small"); t2.textContent = "+" + n.num;
      txt.appendChild(t1); txt.appendChild(t2);

      var go = document.createElement("span"); go.className = "btn btn-primary follow-btn"; go.textContent = "Chat";

      b.appendChild(txt); b.appendChild(go);
      b.addEventListener("click", function(){ choose(n); });
      list.appendChild(b);
    });

    var skip = document.createElement("button");
    skip.type = "button"; skip.className = "btn btn-ghost follow-skip"; skip.textContent = "Batal";
    skip.addEventListener("click", hide);

    modal.appendChild(close); modal.appendChild(h); modal.appendChild(sub);
    modal.appendChild(lab); modal.appendChild(input); modal.appendChild(errEl);
    modal.appendChild(list); modal.appendChild(skip);
    overlay.appendChild(modal);
    overlay.addEventListener("click", function(e){ if(e.target === overlay) hide(); });
    document.body.appendChild(overlay);
  }

  function show(text){
    if(!overlay){ injectCss(); build(); }
    pendingText = text || "";
    input.value = readName();
    input.classList.remove("bad"); errEl.textContent = "";
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    if(!input.value) setTimeout(function(){ try{ input.focus(); }catch(e){} }, 60);
  }
  function hide(){
    if(!overlay) return;
    overlay.classList.remove("open");
    if(!document.querySelector(".modal-overlay.open")) document.body.style.overflow = "";
  }

  function choose(n){
    var name = (input.value || "").replace(/\s+/g, " ").trim();
    if(!name){
      input.classList.add("bad");
      errEl.textContent = "Isi nama dulu ya, wajib biar owner bisa save nomormu.";
      try{ input.focus(); }catch(e){}
      return;
    }
    saveName(name);
    var msg = "Nama saya: " + name + (pendingText ? "\n\n" + pendingText : "");
    var url = "https://wa.me/" + n.num + "?text=" + encodeURIComponent(msg);
    hide();
    window.open(url, "_blank", "noopener");
  }

  // Cegat SEMUA klik ke link wa.me (tombol Chat Owner, Order, Beli, Top Up, dll)
  document.addEventListener("click", function(e){
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if(!a) return;
    var u;
    try{ u = new URL(a.href, location.href); }catch(err){ return; }
    if(u.hostname !== "wa.me") return;
    e.preventDefault();
    show(u.searchParams.get("text") || "");
  }, true);

  document.addEventListener("keydown", function(e){
    if(e.key === "Escape" && overlay && overlay.classList.contains("open")) hide();
  });

  window.CIKWA = { open: show };
})();
