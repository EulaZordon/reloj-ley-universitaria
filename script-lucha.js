lucide.createIcons();

const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const status = document.getElementById('status');

let imgUsuario = null;
let scale = 1.0;
let posX = 400; 
let posY = 420; 
let isDragging = false;
let startX, startY;

const marco = new Image();
marco.src = 'marco.png';

marco.onload = () => { 
    status.innerText = ""; 
    drawAll(); 
};

marco.onerror = () => {
    status.innerText = "Error: No se encuentra 'marco.png'. Verificá que el nombre sea idéntico.";
};

function drawAll() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Fondo blanco
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (imgUsuario) {
        ctx.save();
        // Máscara circular para la foto
        ctx.beginPath();
        ctx.arc(400, 440, 360, 0, Math.PI * 2); 
        ctx.clip();

        const drawW = imgUsuario.width * scale;
        const drawH = imgUsuario.height * scale;
        
        ctx.drawImage(imgUsuario, posX - drawW / 2, posY - drawH / 2, drawW, drawH);
        ctx.restore();
    }

    // Dibujar el marco encima
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(marco, 0, 0, canvas.width, canvas.height);
}

// --- LÓGICA DE INTERACCIÓN (MOUSE & TOUCH) ---

function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    // Detecta si es evento táctil o de mouse
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

function handleStart(e) {
    if (!imgUsuario) return;
    isDragging = true;
    const coords = getCoordinates(e);
    startX = coords.x;
    startY = coords.y;
}

function handleMove(e) {
    if (!isDragging || !imgUsuario) return;

    // IMPORTANTE: Evita el scroll en móviles mientras arrastrás
    if (e.cancelable) e.preventDefault();

    const coords = getCoordinates(e);
    
    posX += (coords.x - startX);
    posY += (coords.y - startY);
    
    startX = coords.x;
    startY = coords.y;
    drawAll();
}

function handleEnd() {
    isDragging = false;
}

// Listeners para Mouse
canvas.addEventListener('mousedown', handleStart);
window.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);

// Listeners para Touch (Celulares)
canvas.addEventListener('touchstart', handleStart, { passive: false });
window.addEventListener('touchmove', handleMove, { passive: false });
window.addEventListener('touchend', handleEnd);

// Zoom con rueda (PC)
canvas.addEventListener('wheel', (e) => {
    if (!imgUsuario) return;
    e.preventDefault();
    if (e.deltaY < 0) scale *= 1.05;
    else scale /= 1.05;
    drawAll();
}, { passive: false });

// Carga de imagen
upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        imgUsuario = new Image();
        imgUsuario.onload = () => {
            const minSize = 600;
            scale = Math.max(minSize / imgUsuario.width, minSize / imgUsuario.height);
            posX = 400;
            posY = 420;
            
            drawAll();
            
            canvas.style.display = 'block';
            downloadBtn.classList.remove('hidden'); 
            downloadBtn.style.display = 'flex';
        };
        imgUsuario.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// Descarga
downloadBtn.addEventListener('click', (e) => {
    try {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `avatar-unahur-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        console.error("Error en la descarga:", err);
        alert("No se pudo generar la imagen. Si estás en modo local (abriendo el archivo .html directamente), probá subiendo los archivos a un servidor o GitHub Pages.");
    }
});
