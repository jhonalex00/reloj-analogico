/**
 * Reloj Analógico + Lectura Digital
 * - Temas (Ocean/Sunset/Forest) guardados en localStorage
 * - Modo oscuro guardado en localStorage
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

  // Soporte teclado (Enter o Espacio)
  $btnModo.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      alternarModoOscuro();
    }
  });
}

/* =========================
   5) Reloj (analógico + digital)
========================= */
function gradosManecillas(fecha) {
  const segundos = fecha.getSeconds();
  const minutos = fecha.getMinutes();
  const horas = fecha.getHours() % 12;

  const gradosSeg = (segundos / 60) * 360;
  const gradosMin = ((minutos + segundos / 60) / 60) * 360;
  const gradosHora = ((horas + minutos / 60) / 12) * 360;

  return { gradosHora, gradosMin, gradosSeg };
}

function pintarAnalogo({ gradosHora, gradosMin, gradosSeg }) {
  $manecillaSegundo.style.transform = `rotate(${gradosSeg}deg)`;
  $manecillaMinuto.style.transform = `rotate(${gradosMin}deg)`;
  $manecillaHora.style.transform = `rotate(${gradosHora}deg)`;
}

function pintarDigital(fecha) {
  if ($horaDigital) {
    $horaDigital.textContent = new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(fecha);
  }

  if ($fechaDigital) {
    $fechaDigital.textContent = new Intl.DateTimeFormat("es-ES", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(fecha);
  }
}

function actualizarReloj() {
  const ahora = new Date();
  const grados = gradosManecillas(ahora);
  pintarAnalogo(grados);
  pintarDigital(ahora);
}

function iniciarReloj() {
  actualizarReloj();
  setInterval(actualizarReloj, 1000);
}

/* =========================
   6) Arranque
========================= */
function iniciarApp() {
  iniciarTema();
  iniciarModoOscuro();
  iniciarReloj();
}

iniciarApp();
