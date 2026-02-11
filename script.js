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
const $cuerpo=document.body;

const $hora=document.querySelector(".hour");
const $minuto=document.querySelector(".minute");
const $segundo=document.querySelector(".second");

const $horaDigital=document.querySelector("#digital-time");
const $fechaDigital=document.querySelector("#digital-date");

const $selectZona=document.querySelector("#zona");
const $bandera=document.querySelector("#bandera-actual");

const $climaIcono=document.querySelector("#weather-icon");
const $climaTemp=document.querySelector("#weather-temp");
const $climaDesc=document.querySelector("#weather-desc");

const $selectCiudad=document.querySelector("#ciudad");

const $btnModo=document.querySelector(".mode-switch");
const $botonesTema=document.querySelectorAll(".theme-btn");

const guardar=(k,v)=>localStorage.setItem(k,v);
const leer=k=>localStorage.getItem(k);

/* ================= ZONAS ================= */

const ZONAS=[
{nombre:"España (Madrid)",zona:"Europe/Madrid",bandera:"🇪🇸"},
{nombre:"Colombia (Bogotá)",zona:"America/Bogota",bandera:"🇨🇴"},
{nombre:"Alemania (Berlín)",zona:"Europe/Berlin",bandera:"🇩🇪"},
{nombre:"México",zona:"America/Mexico_City",bandera:"🇲🇽"},
{nombre:"Argentina",zona:"America/Argentina/Buenos_Aires",bandera:"🇦🇷"},
{nombre:"Japón",zona:"Asia/Tokyo",bandera:"🇯🇵"}
];

let zonaActiva="Europe/Madrid";
let rafId=null;

/* ================= CLIMA POR ZONA (PAÍSES) ================= */

const CLIMA_POR_ZONA={
"Europe/Madrid":{lat:40.4168,lon:-3.7038,ciudad:"Madrid"},
"America/Bogota":{lat:4.7110,lon:-74.0721,ciudad:"Bogotá"},
"Europe/Berlin":{lat:52.5200,lon:13.4050,ciudad:"Berlín"},
"America/Mexico_City":{lat:19.4326,lon:-99.1332,ciudad:"CDMX"},
"America/Argentina/Buenos_Aires":{lat:-34.6037,lon:-58.3816,ciudad:"Buenos Aires"},
"Asia/Tokyo":{lat:35.6762,lon:139.6503,ciudad:"Tokio"}
};

/* ================= CIUDADES (ES/CO/DE) ================= */

const CIUDADES_CLIMA=[
{id:"medellin",nombre:"Medellín",lat:6.2442,lon:-75.5812,zona:"America/Bogota"},

{id:"madrid",nombre:"Madrid",lat:40.4168,lon:-3.7038,zona:"Europe/Madrid"},
{id:"granada",nombre:"Granada",lat:37.1882,lon:-3.6067,zona:"Europe/Madrid"},

{id:"berlin",nombre:"Berlín",lat:52.5200,lon:13.4050,zona:"Europe/Berlin"},
{id:"munich",nombre:"Múnich",lat:48.1351,lon:11.5820,zona:"Europe/Berlin"},
];

let ciudadActiva="madrid";

/* Zonas que sí usan selector de ciudad */
const ZONAS_CON_CIUDAD=new Set(["Europe/Madrid","America/Bogota","Europe/Berlin"]);

/* ================= UI ================= */

function poblarZonas(){
$selectZona.innerHTML=ZONAS.map(z=>`<option value="${z.zona}">${z.nombre}</option>`).join("");
}

function poblarCiudades(){
if(!$selectCiudad)return;
$selectCiudad.innerHTML=CIUDADES_CLIMA.map(c=>`<option value="${c.id}">${c.nombre}</option>`).join("");
}

function actualizarBandera(){
const z=ZONAS.find(x=>x.zona===zonaActiva);
if(z)$bandera.textContent=z.bandera;
}

function aplicarZona(z,forzarSelect=true){
zonaActiva=z;
guardar("zona",zonaActiva);
if(forzarSelect&&$selectZona)$selectZona.value=zonaActiva;
actualizarBandera();
actualizarEstadoSelectorCiudad();
}

function aplicarCiudad(id,forzarSelect=true){
ciudadActiva=id;
guardar("ciudad",ciudadActiva);
if(forzarSelect&&$selectCiudad)$selectCiudad.value=ciudadActiva;
}

function actualizarEstadoSelectorCiudad(){
if(!$selectCiudad)return;
const usaCiudad=ZONAS_CON_CIUDAD.has(zonaActiva);
$selectCiudad.disabled=!usaCiudad;
$selectCiudad.style.opacity=usaCiudad?"1":"0.5";
$selectCiudad.style.pointerEvents=usaCiudad?"auto":"none";
}

/* ================= TIEMPO (POR ZONA) ================= */

function horaZona(){
const p=new Intl.DateTimeFormat("es-ES",{
timeZone:zonaActiva,
hour:"2-digit",minute:"2-digit",second:"2-digit",
hourCycle:"h23"
}).formatToParts(new Date());

const get=t=>Number(p.find(x=>x.type===t)?.value||0);
return{h:get("hour"),m:get("minute"),s:get("second")};
}

/* ================= RELOJ TIPO ROLEX (SWEEP) ================= */

function actualizarRelojRolex(){
const ahora=new Date();

// digital (zona activa)
$horaDigital.textContent=new Intl.DateTimeFormat("es-ES",{
timeZone:zonaActiva,timeStyle:"medium"
}).format(ahora);

$fechaDigital.textContent=new Intl.DateTimeFormat("es-ES",{
timeZone:zonaActiva,dateStyle:"full"
}).format(ahora);

// h/m/s en zona + ms reales
const {h,m,s}=horaZona();
const ms=ahora.getMilliseconds();

// sweep continuo
const sCont=s + ms/1000;
const mCont=m + sCont/60;
const hCont=(h%12) + mCont/60;

$segundo.style.transform=`rotate(${sCont*6}deg)`;
$minuto.style.transform=`rotate(${mCont*6}deg)`;
$hora.style.transform=`rotate(${hCont*30}deg)`;

rafId=requestAnimationFrame(actualizarRelojRolex);
}

/* ================= CLIMA ================= */

function iconoClima(code){
if(code===0)return["☀️","Despejado"];
if([1,2].includes(code))return["🌤️","Parcial"];
if(code===3)return["☁️","Nublado"];
if([45,48].includes(code))return["🌫️","Niebla"];
if([51,53,55].includes(code))return["🌦️","Llovizna"];
if([61,63,65].includes(code))return["🌧️","Lluvia"];
if([71,73,75].includes(code))return["❄️","Nieve"];
if([95,96,99].includes(code))return["⛈️","Tormenta"];
return["⛅","Clima"];
}

function pintarClimaError(){
$climaIcono.textContent="⛅";
$climaTemp.textContent="--°C";
$climaDesc.textContent="Clima no disponible";
}

async function obtenerClimaPorCoords(lat,lon){
const r=await fetch(
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code&timezone=auto`
);
const d=await r.json();
return{
temp:d.current.temperature_2m,
feels:d.current.apparent_temperature,
wind:d.current.wind_speed_10m,
code:d.current.weather_code
};
}

async function actualizarClima(){
try{
let lat,lon,nombre;

if(ZONAS_CON_CIUDAD.has(zonaActiva)){
const c=CIUDADES_CLIMA.find(x=>x.id===ciudadActiva);
if(!c){pintarClimaError();return;}
lat=c.lat;lon=c.lon;nombre=c.nombre;
}else{
const info=CLIMA_POR_ZONA[zonaActiva];
if(!info){pintarClimaError();return;}
lat=info.lat;lon=info.lon;nombre=info.ciudad;
}

const {temp,feels,wind,code}=await obtenerClimaPorCoords(lat,lon);
const [ico,text]=iconoClima(code);

$climaIcono.textContent=ico;
$climaTemp.textContent=Math.round(temp)+"°C";
$climaDesc.textContent=`${text} • ${nombre} • Viento ${Math.round(wind)} km/h • Sensación ${Math.round(feels)}°C`;

}catch{
pintarClimaError();
}
}

function iniciarClima(){
actualizarClima();
setInterval(actualizarClima,600000);
}

/* ================= TEMA ================= */

function aplicarTema(t){
$cuerpo.dataset.theme=t;
guardar("tema",t);
$botonesTema.forEach(b=>b.classList.toggle("is-active",b.dataset.theme===t));
}

function iniciarTema(){
aplicarTema(leer("tema")||"ocean");
$botonesTema.forEach(b=>b.onclick=()=>aplicarTema(b.dataset.theme));
}

/* ================= DARK MODE ================= */

function aplicarModo(x){
$cuerpo.classList.toggle("dark",x);
$btnModo.textContent=x?"Modo claro":"Modo oscuro";
guardar("modo",x?"oscuro":"claro");
}

function iniciarModo(){
aplicarModo(leer("modo")==="oscuro");
$btnModo.onclick=()=>aplicarModo(!$cuerpo.classList.contains("dark"));
}

/* ================= INIT SELECTS ================= */

function iniciarZona(){
poblarZonas();
aplicarZona(leer("zona")||"Europe/Madrid",true);

$selectZona.addEventListener("change",e=>{
aplicarZona(e.target.value,true);

if(ZONAS_CON_CIUDAD.has(zonaActiva)){

if(zonaActiva==="Europe/Madrid"){
const last=leer("ciudad");
const esES=last==="madrid"||last==="granada";
aplicarCiudad(esES?last:"madrid",true);
}

if(zonaActiva==="America/Bogota"){
aplicarCiudad("medellin",true);
}

if(zonaActiva==="Europe/Berlin"){
const last=leer("ciudad");
const esDE=last==="berlin"||last==="munich";
aplicarCiudad(esDE?last:"berlin",true);
}

}

actualizarClima();
});
}

function iniciarCiudadesClima(){
poblarCiudades();
aplicarCiudad(leer("ciudad")||"madrid",true);
actualizarEstadoSelectorCiudad();

if(!$selectCiudad)return;

$selectCiudad.addEventListener("change",e=>{
aplicarCiudad(e.target.value,true);

const c=CIUDADES_CLIMA.find(x=>x.id===ciudadActiva);
if(c)aplicarZona(c.zona,true);

actualizarClima();
});
}

/* ================= APP ================= */

function iniciarApp(){
iniciarTema();
iniciarModo();

iniciarZona();
iniciarCiudadesClima();

// ✅ reloj tipo Rolex (sweep)
if(rafId)cancelAnimationFrame(rafId);
rafId=requestAnimationFrame(actualizarRelojRolex);

iniciarClima();
}

iniciarApp();
