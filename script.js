// Lista de participantes
const CANON_NAMES = [
  "Emili Marcel Cabrera Flores","Dulce Naomy Calderón Gonzalez","Jennifer Estefanía Chajón Barrios",
  "Enrique Cifuentes Bauer","Santiago Del Río Méndez","Carlos Rafael Fernández Valdés",
  "Martin Figueroa Tavares","Esteban Renato Fratta Torres","María Fernanda Garcia Barrios","Julian García Fernández de la Torre",
  "Andrea Michelle Lacota Martínez","Maria Amalia Leclair Rodriguez",
  "Fátima Anaí López Castellanos","Maria Andrea Marinelli Toruño","Ana Lucía Morales Paiz","Ana Lucía Muñoz Turcios",
  "Martin Leonardo Rivera Grajeda","José Mariano Rodríguez Rios","Ximena Santizo Murúa","Isabel Siliézar Rodas","Jeanne Marie Wheelock"
];

// Ejemplos inventados de cumplidos correctos e incorrectos
const TASKS = {
  "Decir elogio": [
    {ejemplo:"Me gusta cómo te esforzaste en la presentación, se nota tu dedicación.", respuesta:"Correcto"},
    {ejemplo:"Se nota que practicaste; ese avance en la resolución fue evidente.", respuesta:"Correcto"},
    {ejemplo:"Admiro tu persistencia al completar la tarea a pesar de las dificultades.", respuesta:"Correcto"},
    {ejemplo:"Wow, para ser tú, estuvo bien.", respuesta:"Incorrecto"},
    {ejemplo:"Al menos tú sí hiciste algo decente.", respuesta:"Incorrecto"},
    {ejemplo:"Eres increíble, aunque no entendí nada de lo que hiciste.", respuesta:"Incorrecto"},
    {ejemplo:"Me gusta tus zapatos, ¿Dónde los compraste?", respuesta:"Correcto"}, 
    {ejemplo:"Al menos hiciste algo bien este año", respuesta:"Incorrecto"},
  ],
  "Adivinar el cumplido": [
    {opciones:["Está bien","No está bien"], instrucciones:"Elige si el cumplido es apropiado y escribe por qué."}
  ]
};

// Función para normalizar nombres (sin tildes ni mayúsculas)
function normalizar(s){
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim();
}

// Mapa para buscar nombres normalizados
const normalizedMap = CANON_NAMES.reduce((acc,name)=>{
  acc[normalizar(name)] = name;
  return acc;
},{});  

// Función para generar semilla reproducible
function xfnv1a(str){
  for(var i=0,h=2166136261>>>0;i<str.length;i++) 
    h=Math.imul(h^str.charCodeAt(i),16777619);
  return function(){
    h+=h<<13; h^=h>>>7; h+=h<<3; h^=h>>>17;
    return (h>>>0);
  };
}

function mulberry32(a){
  return function(){
    var t=a+=0x6D2B79F5;
    t=Math.imul(t^(t>>>15),t|1);
    t^=t+Math.imul(t^t>>>7,t|61);
    return ((t^t>>>14)>>>0)/4294967296;
  };
}

// Función para mezclar array con seed
function seededShuffle(array,seed){
  const a = array.slice();
  const hfn = xfnv1a(seed);
  const seedNum = hfn();
  const rand = mulberry32(seedNum);
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(rand()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

// Generar parejas/tríos
function generatePairs(seed){
  const order = seededShuffle(CANON_NAMES, seed);
  const pairs = [];
  for(let i=0;i<order.length;i+=2){
    if(i+1<order.length) pairs.push([order[i], order[i+1]]);
    else pairs.push([order[i]]);
  }
  // Si queda una sola persona en el último par, se hace trío
  if(pairs.length>=2 && pairs[pairs.length-1].length===1){
    const last = pairs.pop()[0];
    const prev = pairs.pop();
    pairs.push([prev[0], prev[1], last]);
  }
  return pairs;
}

// Obtener el par o trío del usuario
function getPair(name,pairs){
  for(const pair of pairs){
    if(pair.includes(name)) return pair;
  }
  return null;
}

// Generar roles aleatorios por usuario y seed
function getRole(name,seed){
  const rand = mulberry32(xfnv1a(name + seed)());
  return rand() < 0.5 ? "Decir elogio" : "Adivinar el cumplido";
}

// Botón Generar seed
document.getElementById("generateSeedBtn").addEventListener("click", ()=>{
  const randomSeed = 'seed' + Math.floor(Math.random()*1000000) + Date.now();
  document.getElementById("seedInput").value = randomSeed;
});

// Botón Revelar papel
document.getElementById("revealBtn").addEventListener("click", ()=> {
  const nameInput = document.getElementById("nameInput").value;
  const seedInput = document.getElementById("seedInput").value || "default2025";
  const normName = normalizar(nameInput);
  const realName = normalizedMap[normName];

  if(!realName){
    alert("Nombre no encontrado. Revisa la ortografía y elimina tildes si es necesario.");
    return;
  }

  const pairs = generatePairs(seedInput);
  const myPair = getPair(realName,pairs);
  const myRole = getRole(realName, seedInput);

  const resultArea = document.getElementById("resultArea");
  resultArea.innerHTML = "";

  const card = document.createElement("div"); 
  card.className = "result-card";

  const nameEl = document.createElement("div"); 
  nameEl.className="name"; 
  nameEl.textContent=realName;

  const roleEl = document.createElement("div"); 
  roleEl.className="meta"; 
  roleEl.innerHTML=`Rol: <span class="role-badge">${myRole}</span>`;

  card.appendChild(nameEl); 
  card.appendChild(roleEl);

  // Seleccionar ejemplo aleatorio
  const ejemplo = TASKS["Decir elogio"][Math.floor(Math.random()*TASKS["Decir elogio"].length)];

  if(myRole === "Decir elogio"){
    // Solo mostrar ejemplo y respuesta
    const caseEl = document.createElement("div"); 
    caseEl.className="case";
    caseEl.innerHTML=`<b>Ejemplo de cumplido:</b> ${ejemplo.ejemplo}<br><b>Respuesta correcta:</b> ${ejemplo.respuesta}`;
    card.appendChild(caseEl);
  } else if(myRole === "Adivinar el cumplido") {
    // Mostrar el ejemplo pero no la respuesta, dar opción de adivinar
    const caseEl = document.createElement("div"); 
    caseEl.className="case";
    caseEl.innerHTML = `<b>Ejemplo de cumplido:</b> ${ejemplo.ejemplo}<br><b>¿Está bien o no está bien?</b><br>`;

    const btnWell = document.createElement("button");
    btnWell.textContent = "Está bien"; 
    btnWell.style.marginRight = "6px";

    const btnWrong = document.createElement("button");
    btnWrong.textContent = "No está bien";

    const feedback = document.createElement("div"); 
    feedback.style.marginTop = "8px"; 
    feedback.style.color = "var(--accent-2)";

    // Solo aquí se verifica la respuesta
    btnWell.addEventListener("click", ()=> {
      feedback.textContent = ejemplo.respuesta === "Correcto" ? "¡Correcto! ✅" : "Incorrecto ❌";
    });

    btnWrong.addEventListener("click", ()=> {
      feedback.textContent = ejemplo.respuesta === "Incorrecto" ? "¡Correcto! ✅" : "Incorrecto ❌";
    });

    caseEl.appendChild(btnWell);
    caseEl.appendChild(btnWrong);
    caseEl.appendChild(feedback);

    card.appendChild(caseEl);
  }

  const pairEl = document.createElement("div"); 
  pairEl.className="meta";
  pairEl.innerHTML = `Pareja / Trío: ${myPair.filter(n=>n!==realName).join(", ")}`;
  card.appendChild(pairEl);

  resultArea.appendChild(card);
});
