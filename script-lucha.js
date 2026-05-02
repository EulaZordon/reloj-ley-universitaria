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
    status.innerText = "Error: No se encuentra 'marco.png'. Verificá que el nombre sea idéntico (minúsculas/mayúsculas).";
};

function drawAll() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (imgUsuario) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(400, 440, 360, 0, Math.PI * 2); 
        ctx.clip();

        const drawW = imgUsuario.width * scale;
        const drawH = imgUsuario.height * scale;
        
        ctx.drawImage(imgUsuario, posX - drawW / 2, posY - drawH / 2, drawW, drawH);
        ctx.restore();
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(marco, 0, 0, canvas.width, canvas.height);
}

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
            
            // Forzamos la visibilidad eliminando la clase de Tailwind y cambiando el style
            canvas.style.display = 'block';
            downloadBtn.classList.remove('hidden'); 
            downloadBtn.style.display = 'flex';
        };
        imgUsuario.src = event.target.result;
    };
    reader.readAsDataURL(file);
});


canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    startX = (e.clientX - rect.left) * (canvas.width / rect.width);
    startY = (e.clientY - rect.top) * (canvas.height / rect.height);
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging || !imgUsuario) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const currentY = (e.clientY - rect.top) * (canvas.height / rect.height);
    
    posX += (currentX - startX);
    posY += (currentY - startY);
    startX = currentX;
    startY = currentY;
    drawAll();
});

window.addEventListener('mouseup', () => isDragging = false);

// Zoom con rueda
canvas.addEventListener('wheel', (e) => {
    if (!imgUsuario) return;
    e.preventDefault();
    if (e.deltaY < 0) scale *= 1.05;
    else scale /= 1.05;
    drawAll();
}, { passive: false });

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
        alert("No se pudo generar la imagen. Si estás en modo local, probá subiéndolo a GitHub.");
    }
});