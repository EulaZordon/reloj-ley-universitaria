lucide.createIcons();

const upload = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const status = document.getElementById('status');
const mainContainer = document.getElementById('mainContainer'); // Referencia al contenedor

let imgUsuario = null;
let scale = 1.0;
let posX = 400; 
let posY = 440; 
let isDragging = false;
let startX, startY;
let initialPinchDistance = null;

const marco = new Image();
marco.src = 'marco.png';

marco.onload = () => { 
    if (status) status.innerText = ""; 
    drawAll(); 
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
    ctx.drawImage(marco, 0, 0, canvas.width, canvas.height);
}


function getCoordinates(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
    };
}

function getDistance(t1, t2) {
    return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
}

function handleStart(e) {
    if (!imgUsuario) return;
    
    if (e.target === canvas) {
        if (e.touches && e.touches.length === 2) {
            isDragging = false;
            initialPinchDistance = getDistance(e.touches[0], e.touches[1]);
        } else {
            isDragging = true;
            const coords = getCoordinates(e);
            startX = coords.x;
            startY = coords.y;
        }
    }
}

function handleMove(e) {
    if (!imgUsuario || (!isDragging && !initialPinchDistance)) return;

    if (e.cancelable) e.preventDefault();

    if (e.touches && e.touches.length === 2) {
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        if (initialPinchDistance) {
            const zoomFactor = currentDistance / initialPinchDistance;
            scale *= zoomFactor;
            initialPinchDistance = currentDistance;
            drawAll();
        }
    } else if (isDragging) {
        const coords = getCoordinates(e);
        posX += (coords.x - startX);
        posY += (coords.y - startY);
        startX = coords.x;
        startY = coords.y;
        drawAll();
    }
}

function handleEnd() {
    isDragging = false;
    initialPinchDistance = null;
}

canvas.addEventListener('touchstart', handleStart, { passive: false });
window.addEventListener('touchmove', handleMove, { passive: false });
window.addEventListener('touchend', handleEnd);

canvas.addEventListener('mousedown', handleStart);
window.addEventListener('mousemove', handleMove);
window.addEventListener('mouseup', handleEnd);

canvas.addEventListener('wheel', (e) => {
    if (!imgUsuario) return;
    e.preventDefault();
    if (e.deltaY < 0) scale *= 1.05;
    else scale /= 1.05;
    drawAll();
}, { passive: false });


upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        imgUsuario = new Image();
        imgUsuario.onload = () => {
            const minSize = 720;
            scale = Math.max(minSize / imgUsuario.width, minSize / imgUsuario.height);
            posX = 400;
            posY = 440;
            
            drawAll();
            
            canvas.style.display = 'block';
            downloadBtn.style.display = 'flex';
            downloadBtn.classList.add('btn-descarga-flotante');
            
            if (mainContainer) {
                mainContainer.classList.add('padding-bottom-extra');
            }
            
            setTimeout(() => {
                canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        };
        imgUsuario.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

downloadBtn.addEventListener('click', () => {
    try {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `avatar-unahur-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        alert("Error al descargar. Si estás en iPhone, mantené presionada la imagen para guardarla.");
    }
});
