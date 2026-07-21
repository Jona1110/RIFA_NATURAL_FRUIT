// REEMPLAZA ESTA URL CON LA QUE GENERASTE EN GOOGLE APPS SCRIPT
const SHEET_URL = "https://script.google.com/macros/s/AKfycbzwdhiRr-TX_U0yXAgQqpfHhM-aSAxaFooWS-1SYYNVjauEVjrZHsFbJO3Rjzzc1Afd/exec"; 

let participants = [];
let currentPrizeIndex = 0; // 0 = 3er lugar, 1 = 2do lugar, 2 = 1er lugar
let attempt = 1; // 1 y 2 son eliminados, 3 es ganador (Para cada premio)

// Configuración de los 3 premios
const prizes = [
    { title: "🥉 3ER LUGAR", amount: "$200 MXN", theme: "theme-bronce", hex: "#cd7f32" },
    { title: "🥈 2DO LUGAR", amount: "$300 MXN", theme: "theme-plata", hex: "#c0c0c0" },
    { title: "🥇 1ER LUGAR", amount: "$500 MXN", theme: "theme-oro", hex: "#c5a065" }
];

const btn = document.getElementById('draw-btn');
const nameEl = document.getElementById('current-name');
const folioEl = document.getElementById('current-folio');
const msgEl = document.getElementById('message-bar');
const prizeLabelEl = document.getElementById('current-prize-label');
const attemptEl = document.getElementById('attempt');

// Elementos visuales dinámicos
const mainScreen = document.querySelector('.main-screen');
const folioBox = document.querySelector('.folio-box');

// Cargar participantes
async function loadParticipants() {
    try {
        const response = await fetch(SHEET_URL);
        participants = await response.json();
        
        // Necesitamos al menos 9 participantes (3 premios x 3 intentos)
        if(participants.length >= 9) {
            msgEl.innerText = `SISTEMA LISTO - ${participants.length} PARTICIPANTES REGISTRADOS`;
            btn.disabled = false;
            updateUIPendingDraw();
        } else {
            msgEl.innerText = `ERROR: SOLO HAY ${participants.length} PARTICIPANTES`;
            alert("Se requieren al menos 9 participantes en el Excel para descartar 2 y premiar 1 en tres rondas distintas.");
        }
    } catch (error) {
        msgEl.innerText = "ERROR DE CONEXIÓN CON GOOGLE SHEETS";
        console.error(error);
    }
}

// Prepara los textos antes de girar
function updateUIPendingDraw() {
    if(currentPrizeIndex < 3) {
        const currentPrize = prizes[currentPrizeIndex];
        prizeLabelEl.innerText = `${currentPrize.title} (${currentPrize.amount})`;
        attemptEl.innerText = attempt;
        
        if(attempt < 3) {
            btn.querySelector('.text').innerText = `EXTRAER BOLETO DESCARTADO #${attempt}`;
            msgEl.style.backgroundColor = "var(--color-rosa)";
            folioBox.style.backgroundColor = "var(--color-rosa)";
            mainScreen.style.borderColor = "var(--color-rosa)";
        } else {
            btn.querySelector('.text').innerText = `¡SORTEAR GANADOR DEL ${currentPrize.title}!`;
            msgEl.style.backgroundColor = currentPrize.hex;
            folioBox.style.backgroundColor = currentPrize.hex;
            mainScreen.style.borderColor = currentPrize.hex;
        }
    }
}

function startRaffle() {
    if (participants.length < 1) return alert("Ya no hay más participantes.");

    const currentPrize = prizes[currentPrizeIndex];
    
    btn.disabled = true;
    nameEl.style.color = "#ffffff";
    document.getElementById('winner-tag').classList.add('hidden');
    
    if(attempt < 3) {
        msgEl.innerText = `EXTRAYENDO BOLETO DESCARTADO #${attempt} PARA EL ${currentPrize.title}...`;
    } else {
        msgEl.innerText = `¡GIRANDO TÓMBOLA POR EL GANADOR DEL ${currentPrize.title}!`;
    }
    
    msgEl.style.color = "#ffffff";

    let duration = 5000; 
    let start = Date.now();
    
    function spin() {
        let elapsed = Date.now() - start;
        let progress = elapsed / duration;

        const random = participants[Math.floor(Math.random() * participants.length)];
        nameEl.innerText = random[1];
        folioEl.innerText = random[0];

        if (progress < 1) {
            let delay = 50 + (Math.pow(progress, 4) * 450);
            setTimeout(spin, delay);
        } else {
            resolve();
        }
    }
    spin();
}

function resolve() {
    const currentPrize = prizes[currentPrizeIndex];
    
    // Saca al seleccionado del arreglo para que no vuelva a salir
    const idx = Math.floor(Math.random() * participants.length);
    const selected = participants.splice(idx, 1)[0];

    nameEl.innerText = selected[1];
    folioEl.innerText = selected[0];

    if (attempt < 3) {
        // ES UN DESCARTADO
        document.getElementById('eliminated-name').innerText = selected[1];
        document.getElementById('eliminated-folio-txt').innerText = `FOLIO IDENTIFICADO: ${selected[0]}`;
        
        setTimeout(() => {
            document.getElementById('eliminated-overlay').classList.remove('overlay-hidden');
        }, 1000);
        
    } else {
        // ES EL GANADOR DE ESTA RONDA
        nameEl.style.color = currentPrize.hex;
        nameEl.style.textShadow = `0 0 30px ${currentPrize.hex}`;
        msgEl.innerText = `¡GANADOR DEL ${currentPrize.title} ENCONTRADO!`;
        msgEl.style.color = "#002b22"; // Texto oscuro para contrastar con el fondo claro del premio

        launchCelebration(currentPrize.hex);

        setTimeout(() => {
            const modalBox = document.getElementById('modal-box');
            
            // Limpiar clases anteriores y aplicar la nueva (bronce, plata, oro)
            modalBox.classList.remove('theme-bronce', 'theme-plata', 'theme-oro');
            modalBox.classList.add(currentPrize.theme);
            
            // Llenar datos
            document.getElementById('modal-header').innerText = `¡GANADOR DEL ${currentPrize.title}!`;
            document.getElementById('winner-prize-txt').innerText = currentPrize.amount;
            document.getElementById('winner-name').innerText = selected[1];
            document.getElementById('winner-folio-txt').innerText = `FOLIO: ${selected[0]}`;
            
            // Si es el último premio (1er lugar), cambiar el texto del botón
            if(currentPrizeIndex === 2) {
                document.getElementById('next-prize-btn').innerText = "FINALIZAR GRAN RIFA";
            }
            
            document.getElementById('winner-overlay').classList.remove('overlay-hidden');
        }, 1500); 
    }
}

// Cerrar Modal de Descartados
function closeEliminatedOverlay() {
    document.getElementById('eliminated-overlay').classList.add('overlay-hidden');
    attempt++; // Avanzamos al intento 2, o al 3 (Ganador)
    btn.disabled = false;
    updateUIPendingDraw();
}

// Cerrar Modal de Ganadores
function closeWinnerOverlay() {
    document.getElementById('winner-overlay').classList.add('overlay-hidden');
    
    currentPrizeIndex++; // Avanzamos de premio (ej. de 3er a 2do lugar)
    attempt = 1; // Reiniciamos los intentos para el nuevo premio
    
    if (currentPrizeIndex < 3) {
        btn.disabled = false;
        updateUIPendingDraw();
    } else {
        // Fin absoluto del sorteo
        btn.disabled = true;
        btn.querySelector('.text').innerText = "SORTEO FINALIZADO";
        msgEl.innerText = "¡GRACIAS POR PARTICIPAR EN LA RIFA DE NATURAL FRUIT!";
        msgEl.style.backgroundColor = "var(--color-dorado)";
        msgEl.style.color = "#002b22";
        mainScreen.style.borderColor = "var(--color-dorado)";
        prizeLabelEl.innerText = "¡TODOS LOS PREMIOS ENTREGADOS!";
        attemptEl.innerText = "-";
    }
}

function launchCelebration(prizeColorHex) {
    const end = Date.now() + 5000;
    const colors = [prizeColorHex, '#ffffff', '#004d3d']; 

    (function frame() {
        confetti({ particleCount: 6, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: colors, zIndex: 10000 });
        confetti({ particleCount: 6, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: colors, zIndex: 10000 });
        if (Date.now() < end) requestAnimationFrame(frame);
    }());
}

// Iniciar
document.addEventListener('DOMContentLoaded', loadParticipants);
btn.addEventListener('click', startRaffle);