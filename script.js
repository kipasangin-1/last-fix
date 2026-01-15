const musicPage = document.getElementById("musicPage");
const puzzlePage = document.getElementById("puzzlePage");
const contentPage = document.getElementById("contentPage");

const letterPage = document.getElementById("letterPage");
const toLetterBtn = document.getElementById("toLetterBtn");
const letterEl = document.getElementById("letter");

const bgm = document.getElementById("bgm");
const continueBtn = document.getElementById("continueBtn");

const puzzle = document.getElementById("puzzle");
const status = document.getElementById("status");

const winModal = document.getElementById("winModal");
const stayBtn = document.getElementById("stayBtn");
const nextBtn = document.getElementById("nextBtn");

function setBg(name) {
  document.body.style.backgroundImage = `url("assets/bg/${name}")`;
}

const tracks = {
  song1: "assets/audio/song1.mp3",
  song2: "assets/audio/song2.mp3",
  song3: "assets/audio/song3.mp3",
};

const size = 4;
const pieceSize = 80;
const total = size * size;

const isTouch =
  window.matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;

let dragged = null;
let hasMoved = false;
let modalShown = false;

const stage = document.getElementById("stage");
const captionEl = document.getElementById("caption");
const counterEl = document.getElementById("counter");
const prevBtn = document.getElementById("prevBtn");
const nextBtn2 = document.getElementById("nextBtn2");

function duckBgm(isDucking) {
  if (!bgm) return;
  bgm.volume = isDucking ? 0.1 : 0.35;
}
function resumeBgm() {
  if (!bgm) return;

  try {
    if (bgm.paused) bgm.play();
  } catch {}
}

(function init() {
  setBg("music.jpg");

  if (winModal) {
    winModal.classList.add("hidden");
    winModal.style.display = "none";
  }

  if (musicPage) musicPage.classList.remove("hidden");
  if (puzzlePage) puzzlePage.classList.add("hidden");
  if (contentPage) contentPage.classList.add("hidden");

  if (puzzle) puzzle.innerHTML = "";
  if (status) status.textContent = "";

  if (toLetterBtn) toLetterBtn.classList.add("hidden");
})();

document.querySelectorAll(".music-btn").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const key = btn.dataset.track;
    const src = tracks[key];
    if (!src) return;

    document
      .querySelectorAll(".music-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    bgm.src = src;
    bgm.volume = 0.35;

    try {
      await bgm.play();
    } catch {}

    if (continueBtn) continueBtn.disabled = false;
  });
});

if (continueBtn) {
  continueBtn.addEventListener("click", () => {
    if (musicPage) musicPage.classList.add("hidden");
    if (puzzlePage) puzzlePage.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });

    setBg("puzzle.jpg");
    initPuzzle();
  });
}

function makeTiles() {
  const tiles = [];
  for (let i = 0; i < total; i++) {
    const x = (i % size) * pieceSize;
    const y = Math.floor(i / size) * pieceSize;
    tiles.push({ id: i, pos: `-${x}px -${y}px` });
  }
  return tiles;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isSolvedIds(ids) {
  return ids.every((id, idx) => id === idx);
}

function initPuzzle() {
  if (!puzzle) return;
  if (puzzle.children.length > 0) return;

  dragged = null;
  hasMoved = false;
  modalShown = false;
  if (status) status.textContent = "";

  const correct = makeTiles();
  let shuffled = shuffle([...correct]);

  let guard = 0;
  while (isSolvedIds(shuffled.map((t) => t.id)) && guard < 80) {
    shuffled = shuffle([...correct]);
    guard++;
  }

  shuffled.forEach((tile) => {
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.draggable = !isTouch;
    piece.style.backgroundPosition = tile.pos;
    piece.dataset.tileId = String(tile.id);
    puzzle.appendChild(piece);
  });

  let selected = null;

  function swapPieces(a, b) {
    if (!a || !b || a === b) return;

    hasMoved = true;

    const tmpBg = a.style.backgroundPosition;
    a.style.backgroundPosition = b.style.backgroundPosition;
    b.style.backgroundPosition = tmpBg;

    const tmpId = a.dataset.tileId;
    a.dataset.tileId = b.dataset.tileId;
    b.dataset.tileId = tmpId;

    a.classList.remove("active");
    b.classList.remove("active");
    selected = null;

    checkWin();
  }

  document.querySelectorAll(".piece").forEach((p) => {
    // Desktop drag-drop
    p.addEventListener("dragstart", () => (dragged = p));
    p.addEventListener("dragover", (e) => e.preventDefault());
    p.addEventListener("drop", function () {
      if (!dragged || dragged === this) return;
      swapPieces(dragged, this);
    });

    p.addEventListener("pointerdown", (e) => {
      if (isTouch) e.preventDefault();

      if (!selected) {
        selected = p;
        p.classList.add("active");
      } else {
        swapPieces(selected, p);
      }
    });
  });
}

function checkWin() {
  if (!hasMoved || modalShown) return;

  const pieces = document.querySelectorAll(".piece");
  const solved = [...pieces].every(
    (p, idx) => Number(p.dataset.tileId) === idx
  );

  if (solved) {
    modalShown = true;
    if (status) status.textContent = "Udah lengkap.";
    showModal();
  } else {
    if (status) status.textContent = "";
  }
}

function showModal() {
  if (!winModal) return;
  winModal.classList.remove("hidden");
  winModal.style.display = "grid";
  document.querySelectorAll(".piece").forEach((p) => (p.draggable = false));
}

let teased = false;

if (stayBtn) {
  stayBtn.addEventListener("click", () => {
    const modalText = document.getElementById("modalText");
    if (!modalText) return;

    if (!teased) {
      modalText.textContent = "ah dah lanjut aja";
      modalText.style.animation = "pop 300ms ease";
      teased = true;
    }
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    if (winModal) {
      winModal.classList.add("hidden");
      winModal.style.display = "none";
    }

    if (puzzlePage) puzzlePage.classList.add("hidden");
    if (contentPage) contentPage.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });

    setBg("content.jpg");
    initCarouselIfNeeded();
  });
}

const captions = {
  p01: "WKWKWKWKKWWK ANAK SIAPA INI KEK ANAK ILANG",
  p02: "ni keknya first time kita nobar, sblm ada huru hara si kuning",
  p03: "ko nyari paperbag aja lama kali cok, pdhl paperbag diy kek gitu semua isinya",
  p04: "monying",
  p05: "p bukber",
  p06: "cie",
  p07: "sengaja milih yg burem",
  p08: "",
  p09: "asik nonton aja kerja kita dulu",
  p10: "nanti bs naik mobil sendiri”, cmn kapan lg bs tartig kek gini",
  p11: "wkwkwkwkwk formasi apa ini",
  p12: "hujan",
  p13: "bahkan setelah aku ngeliat galeriku, kln dl kek ga pernah lepas sama si nopal” itu",
  p14: "last ngehias kelas…",
  p15: "telor",
  p16: "makan",
  p17: "WKWKWKKWKW INI SENDAL YG BUAT BERANTEM ITU?",
  p18: "maling",
  p19: "imut",
  p20: "aku lupa ini siapa aja, kek pepes ikan kln",
  p21: "muka kita kek org bener smw disini",
  p22: "last latian...",
  p23: "WKWKWKWKWKWKWKWK dah tepar capek keliling”, rupanya jadinya ga beli disitu jg",
  p24: "p",
  p25: "mokel ko",
  p26: "gacor kali kita",
  p27: "last bukber",
  p28: "disini makin terasa kali dah mau lulusnya",
  p29: "WKWKWKKWWKKWKW",
  p30: "ko bangke, kita ga ada fotbar bangke",
  p31: "keknya separah”nya aku jatuh ga pernah sampe kek gini",
  p32: "apapun dilakukan kecuali belajar utbk",
  p33: "masyaAllah inilah potret org yg sering wudhu",
  p34: "d day utbk, bisa kali kita 3 barengan 1 hari ya",
  p35: "eh ini last kita main berdua ga si",
  p36: "habede sel",
  p37: "imut kln",
  p38: "",

  v01: "WKWKWKWKWKWKKW INI KEKNYA NANGIS KRN DITINGGAL GA SI KO",
  v02: "sor kali goyang kln",
  v03: "no komen",
  v04: "omak sor kali",
  v05: "....",
  v06: "we ini pake kamera siapa jir",
  v07: "sejujurnya ini vibesnya sedih kali, tapi ini malas ngecutnya, ko skip aja kalau kelamaan",
  v08: "",
  v09: "p mikhol",
  v10: "sedih",
  v11: "ini makin sedih...",
  v12: ".....",
  v13: "aku lupa ini ngetawain apa",
};

function pad2(n) {
  return String(n).padStart(2, "0");
}

function photo(n) {
  const key = `p${pad2(n)}`;
  return {
    type: "image",
    src: `assets/media/${key}.jpg`,
    caption: captions[key] || "",
  };
}

function video(n) {
  const key = `v${pad2(n)}`;
  return {
    type: "video",
    src: `assets/media/${key}.mp4`,
    caption: captions[key] || "",
  };
}

function photoRange(a, b) {
  const arr = [];
  for (let i = a; i <= b; i++) arr.push(photo(i));
  return arr;
}

function videoRange(a, b) {
  const arr = [];
  for (let i = a; i <= b; i++) arr.push(video(i));
  return arr;
}

const slides = [
  ...photoRange(1, 4),
  video(1),

  ...photoRange(5, 8),
  video(2),

  ...photoRange(9, 11),
  video(3),

  video(4),

  ...photoRange(12, 14),

  ...videoRange(5, 9),

  ...photoRange(15, 22),
  video(10),

  ...photoRange(23, 24),
  video(11),

  ...photoRange(25, 29),
  video(12),

  ...photoRange(30, 31),
  video(13),

  ...photoRange(32, 38),
];

let current = 0;

function updateNextButtonVisibility() {
  if (!toLetterBtn) return;
  const isLast = current === slides.length - 1;
  if (isLast) toLetterBtn.classList.remove("hidden");
  else toLetterBtn.classList.add("hidden");
}

function updateArrowButtons() {
  if (prevBtn) prevBtn.disabled = current === 0;
  if (nextBtn2) nextBtn2.disabled = current === slides.length - 1;
}

function stopAnyVideo() {
  if (!stage) return;
  const v = stage.querySelector("video");
  if (v) {
    v.pause();
    v.currentTime = 0;
  }
}

function renderSlide(i) {
  if (!stage) return;

  stopAnyVideo();
  stage.innerHTML = "";

  const s = slides[i];
  let el;

  if (s.type === "video") {
    el = document.createElement("video");
    el.src = s.src;
    el.controls = true;
    el.playsInline = true;
    el.preload = "metadata";
    el.setAttribute("playsinline", "");
    el.setAttribute("webkit-playsinline", "");

    el.addEventListener("play", () => duckBgm(true));
    el.addEventListener("pause", () => {
      duckBgm(false);
      resumeBgm();
    });
    el.addEventListener("ended", () => {
      duckBgm(false);
      resumeBgm();
    });
  } else if (s.type === "image") {
    el = document.createElement("img");
    el.src = s.src;
    el.alt = "";
    el.loading = "lazy";
    el.draggable = false;
    el.style.maxWidth = "100%";
    el.style.maxHeight = "100%";
    el.style.objectFit = "contain";
    el.addEventListener("error", () =>
      console.error("Gagal load image:", s.src)
    );
  }

  if (el) stage.appendChild(el);

  if (captionEl) captionEl.textContent = s.caption || "";
  if (counterEl) counterEl.textContent = `${i + 1} / ${slides.length}`;

  updateNextButtonVisibility();
  updateArrowButtons();
}

function nextSlide() {
  if (current >= slides.length - 1) {
    current = slides.length - 1;
    renderSlide(current);
    return;
  }
  current++;
  renderSlide(current);
}

function prevSlide() {
  if (current <= 0) {
    current = 0;
    renderSlide(current);
    return;
  }
  current--;
  renderSlide(current);
}

function initCarouselIfNeeded() {
  if (!stage) return;
  if (stage.dataset.ready === "1") return;
  stage.dataset.ready = "1";

  if (prevBtn) prevBtn.addEventListener("click", prevSlide);
  if (nextBtn2) nextBtn2.addEventListener("click", nextSlide);

  document.addEventListener("keydown", (e) => {
    if (!contentPage || contentPage.classList.contains("hidden")) return;
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  });

  if (toLetterBtn) toLetterBtn.classList.add("hidden");

  renderSlide(current);
}

if (toLetterBtn) {
  toLetterBtn.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("BTN LANJUT KE LETTER KEKLIK");

    const carousel = contentPage?.querySelector(".carousel");
    const meta = contentPage?.querySelector(".meta");
    const divider = contentPage?.querySelector(".divider");

    if (carousel) carousel.classList.add("hidden");
    if (meta) meta.classList.add("hidden");
    if (divider) divider.classList.add("hidden");

    toLetterBtn.classList.add("hidden");

    if (letterPage) {
      letterPage.classList.remove("hidden");
      letterPage.style.display = "block";
      console.log("letterPage shown");
    } else {
      console.error("letterPage element ga ketemu (null)!");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const letterHTML = `
  <p>hai sel</p>

  <p>pas awal” kelas 10 aku ga pernah kepikiran kalau kita bakal jadi temen deket, ku kira aku bakal deket sama org repanda aja sampe tamat, dan kau jg bakal sama circlemu sampe tamat, trs tiba” pas kelas 11 udah ngalir gitu aja, aku lupa awal kita mulai deket karena apa, aku ingetnya yg kita pergi naik bus tayo itu sama dl ko pernah dah sesak kali mau kamar mandi trs minta temenin aku, tapi ko ga nutup pintu bangke, trs aku disitu kek “ni betolan rupanya aslinya anak ni semalu”in ini?”, habis tu aku ga inget tiba” udah deket aja kita.</p>

  <p>padahal dulu kita semua seseru itu ya sel? sering nonton bareng, tiap pulang sekolah kalau bisa selalu pergi dulu, pantang pulang sblm kena telpon, sering mabar, tawaf keliling sekolah, dll</p>

  <p>kenapa sekarang malah jadi gini ya sel, kyknya dulu kita semua sefomo itu sampe ga mau ketinggalan 1x pergi pun, pokoknya selagi bisa ikut main harus ikut terus, sekarang walaupun beberapa masih ttp main tapi vibesnya udah agak beda</p>

  <p>trs yg iyanya kalau ditarik akar masalahnya lucu kali sel, masa semuanya berantem cuman karena cowok doang sel? kenapa cuman karena cowok ya? tapi skrg udah ga bisa ngapa”in lagi cuman bisa nanya” doang, “gimana jadinya kalau semua lgsg diselesain pas itu juga” mungkin kita semua masih bisa ngusahain buat kumpul tiap ada waktu, bukan yg ada waktunya tapi udah ga pengen ngumpul lagi karena masa sma yg tadinya seseru itu buat dikenang malah jadi seburuk itu buat dikenang</p>

  <p>kau ga ada kangen sedikitpun kah sel? karena jujur aja aku kangen semuanya sel, kangen awal” masuk pas dulu masih pake masker, 17an, jamkos, kelas 11 pas lagi seru serunya, dumai, kelas 12 yg udah mulai sibuk ngejar ptn, yg makin sering pergi karena “we tahun depan kita udah ga bisa kek gini lagi”, bahkan dulu aku pernah kgn sama org safira karena dulu pernah deket, kyk kalau aja semuanya lgsg dibahas tanpa diem”an pasti ga bakal kek gini, kalau aja dulu ga mentingin ego doang pasti masih aman” aja at least sampe tamat</p>

  <p>sel aku ga ada niatan mau ngerusak liburan terakhir kita bisa balik ke medan, aku niatnya cuman mau ngelurusin aja sel, bahkan aku juga ngechat kawanku buat nanya alasan yg ternyata jawaban dia juga ga pernah ada dalam list kemungkinan” yg bakal dia sebutin</p>

  <p>cuman aku mikir sel, karena kalian bahas etika pertemanan, si abil tu ga ada masalah sama sekali sama zhua kan, tapi dia izin samaku sel pas diajak zhua pergi, padahal aku ga pernah minta itu bahkan aku fine” aja mau org ni temenan deket atau sering pergi juga aku ga masalah, tapi setelah ku jelasin dia ttp ga mau karena katanya dia ga terima kalau aku dijahatin sama kawanku itu, dan dia ga bisa nganggep kalau “ah dia ngelakuin itu ke si saka kok bukan ke aku”.<br>
  trs aku mikir, aku yg cuman ngejelasin ke kalian aja udah sakit hati karena balesannya, apalagi dia yg selama ini ngerasain ya sel? trs selama ini, setahun dia mendam itu semua sendirian karena ga mau ngerusak hubungan kita, aku masih tetap temenan sama kalian tanpa tau sama sekali apa yg udah kejadian, sedangkan dia jaga jarak sama kawanku itu karena aku, kan kek lucu kali gitu sel</p>

  <p>padahal niatnya aku ga ada sampe kyk gitu sel, aku ga ada niatan buat ngelakuin hal yang sama, buat jaga jarak sama kalian, ga ada sama sekali aku kepikiran kyk gitu sel, aku cuman mau ngelurusin aja, tapi setelah ku jelasin, aku paham kenapa abil sampe blg ga mau berurusan lagi</p>

  <p>aku ga tau kedepannya bakal gimana, aku cmn bisa bilang, kalau kau ada butuh apa” bilang ya, kalau kau ada mau cerita apapun itu juga bilang aja ya, aku masih disini kalau kau lagi butuh 2 itu</p>

  <p>aku tau selama kita temenan aku banyak salahnya, maaf ya sel, aku minta maaf atas semua kesalahan yg ku buat ntah itu sengaja ataupun ga sengaja, aku juga minta maaf kalau ketikanku ada yg salah, ntah itu yg kemaren ataupun yg skrg ini juga</p>

  <p>makasii banyak yaa sel, makasi karena udah nemenin aku pas aku lagi berantem sama kawanku, makasii banyak karena udah mau jadi temenku sel, makasii buat semua hal yg udah kau lakuin buat aku sel</p>

  <p>i just wanna say thank u and sorry for everything, see u next time sel👋🏻</p>

  <p>aku sengaja buat disini karena webnya bisa lgsg ku hapus pas dah ko baca😁</p>
`;

if (letterEl) letterEl.innerHTML = letterHTML;

console.log("Total slides:", slides.length);

if (letterEl) {
  letterEl.addEventListener("copy", (e) => e.preventDefault());
  letterEl.addEventListener("cut", (e) => e.preventDefault());
  letterEl.addEventListener("contextmenu", (e) => e.preventDefault());
}

document.addEventListener("visibilitychange", async () => {
  if (document.hidden) {
    if (bgm && !bgm.paused) bgm.pause();
  } else {
    try {
      if (bgm && bgm.src) await bgm.play();
    } catch (e) {}
  }
});
