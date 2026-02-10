/**
 * Reloj Analógico + Lectura Digital + Selector de zona horaria
 * - Temas guardados
 * - Modo oscuro guardado
 * - Zona horaria seleccionable y guardada
 * - Actualiza cada segundo
 */

/* =========================
   1) Selectores (DOM)
========================= */
const $cuerpo = document.body;

const $manecillaHora = document.querySelector(".hour");
const $manecillaMinuto = document.querySelector(".minute");
const $manecillaSegundo = document.querySelector(".second");

const $btnModo = document.querySelector(".mode-switch");

const $horaDigital = document.querySelector("#digital-time");
const $fechaDigital = document.querySelector("#digital-date");

const $botonesTema = document.querySelectorAll(".theme-btn");

/* Selector zona */
const $selectZona = document.querySelector("#zona");

/* =========================
   2) Utilidades
========================= */
const guardar = (clave, valor) => localStorage.setItem(clave, valor);
const leer = (clave) => localStorage.getItem(clave);

/* =========================
   3) Tema (guardado)
========================= */
function aplicarTema(nombreTema) {
  $cuerpo.dataset.theme = nombreTema;
  guardar("tema", nombreTema);

  $botonesTema.forEach((btn) => {
    const esActivo = btn.dataset.theme === nombreTema;
    btn.classList.toggle("is-active", esActivo);
  });
}

function iniciarTema() {
  const temaGuardado = leer("tema") || "ocean";
  aplicarTema(temaGuardado);

  $botonesTema.forEach((btn) => {
    btn.addEventListener("click", () => aplicarTema(btn.dataset.theme));
  });
}

/* =========================
   4) Modo oscuro (guardado)
========================= */
function aplicarModoOscuro(activado) {
  $cuerpo.classList.toggle("dark", activado);
  $btnModo.textContent = activado ? "Modo claro" : "Modo oscuro";
  guardar("modo", activado ? "oscuro" : "claro");
}

function alternarModoOscuro() {
  const estaOscuro = $cuerpo.classList.toggle("dark");
  aplicarModoOscuro(estaOscuro);
}

function iniciarModoOscuro() {
  const modoGuardado = leer("modo"); // "oscuro" | "claro" | null
  aplicarModoOscuro(modoGuardado === "oscuro");

  $btnModo.addEventListener("click", alternarModoOscuro);

  $btnModo.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      alternarModoOscuro();
    }
  });
}

/* =========================
   5) Zonas horarias (selector)
========================= */
const ZONAS = [
  { nombre: "España (Madrid)", zona: "Europe/Madrid" },
  { nombre: "Canarias", zona: "Atlantic/Canary" },
  { nombre: "Colombia (Bogotá)", zona: "America/Bogota" },
  { nombre: "México (CDMX)", zona: "America/Mexico_City" },
  { nombre: "Perú (Lima)", zona: "America/Lima" },
  { nombre: "Argentina (Buenos Aires)", zona: "America/Argentina/Buenos_Aires" },
  { nombre: "EE.UU. (New York)", zona: "America/New_York" },
  { nombre: "Japón (Tokio)", zona: "Asia/Tokyo" },
];

let zonaActiva = "Europe/Madrid";

function poblarSelectZonas() {
  if (!$selectZona) return;

  $selectZona.innerHTML = ZONAS.map(
    (z) => `<option value="${z.zona}">${z.nombre}</option>`
  ).join("");
}

function aplicarZona(zona) {
  zonaActiva = zona;
  guardar("zona", zona);

  if ($selectZona) {
    $selectZona.value = zona;
  }
}

function iniciarZonaHoraria() {
  poblarSelectZonas();

  const zonaGuardada = leer("zona");
  aplicarZona(zonaGuardada || "Europe/Madrid");

  if ($selectZona) {
    $selectZona.addEventListener("change", (e) => {
      aplicarZona(e.target.value);
      actualizarReloj(); // refresca al instante
    });
  }
}

/* =========================
   6) Reloj usando la zona seleccionada
========================= */

/**
 * OJO: para hacer analógico con otra zona horaria necesitamos:
 * - Hora (HH,mm,ss) de esa zona (con Intl)
 * - Convertirlo a grados de manecillas
 */
function obtenerPartesDeZona(zona) {
  const partes = new Intl.DateTimeFormat("es-ES", {
    timeZone: zona,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (tipo) => Number(partes.find((p) => p.type === tipo)?.value ?? 0);

  return {
    horas: get("hour"),
    minutos: get("minute"),
    segundos: get("second"),
  };
}

function gradosManecillasDesdePartes({ horas, minutos, segundos }) {
  const horas12 = horas % 12;

  const gradosSeg = (segundos / 60) * 360;
  const gradosMin = ((minutos + segundos / 60) / 60) * 360;
  const gradosHora = ((horas12 + minutos / 60) / 12) * 360;

  return { gradosHora, gradosMin, gradosSeg };
}

function pintarAnalogo({ gradosHora, gradosMin, gradosSeg }) {
  $manecillaSegundo.style.transform = `rotate(${gradosSeg}deg)`;
  $manecillaMinuto.style.transform = `rotate(${gradosMin}deg)`;
  $manecillaHora.style.transform = `rotate(${gradosHora}deg)`;
}

function pintarDigitalZona(zona) {
  const ahora = new Date();

  if ($horaDigital) {
    $horaDigital.textContent = new Intl.DateTimeFormat("es-ES", {
      timeZone: zona,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(ahora);
  }

  if ($fechaDigital) {
    $fechaDigital.textContent = new Intl.DateTimeFormat("es-ES", {
      timeZone: zona,
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(ahora);
  }
}

function actualizarReloj() {
  const partes = obtenerPartesDeZona(zonaActiva);
  const grados = gradosManecillasDesdePartes(partes);

  pintarAnalogo(grados);
  pintarDigitalZona(zonaActiva);
}

function iniciarReloj() {
  actualizarReloj();
  setInterval(actualizarReloj, 1000);
}

/* =========================
   7) Arranque
========================= */
function iniciarApp() {
  iniciarTema();
  iniciarModoOscuro();
  iniciarZonaHoraria();
  iniciarReloj();
}

iniciarApp();

