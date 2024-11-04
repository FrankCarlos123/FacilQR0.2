let video = document.getElementById('camera');
let canvas = document.getElementById('canvas');
let capturedImage = document.getElementById('captured-image');
let countdown;

// Iniciar la cámara
async function startCamera() {
    try {
        console.log('Iniciando cámara...');
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        });
        
        video.srcObject = stream;
        video.style.display = 'block';
        canvas.style.display = 'none';
        capturedImage.style.display = 'none';
        
        // Capturar imagen automáticamente después de 2 segundos
        setTimeout(captureImage, 2000);
        
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('Error al acceder a la cámara. Por favor, permite el acceso a la cámara e intenta de nuevo.');
    }
}

// Capturar imagen
function captureImage() {
    try {
        console.log('Capturando imagen...');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Detener el stream de video
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        
        // Mostrar la imagen capturada
        video.style.display = 'none';
        canvas.style.display = 'block';
        
        // Procesar la imagen
        processImage(canvas);
        
    } catch (error) {
        console.error('Error al capturar imagen:', error);
        alert('Error al capturar la imagen. Por favor, intenta de nuevo.');
    }
}

// Función para limpiar todo
function clearAll() {
    console.log('Limpiando...');
    
    // Detener el video si está activo
    if (video.srcObject) {
        const stream = video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
    }
    
    // Limpiar countdown si existe
    if (countdown) {
        clearInterval(countdown);
    }
    
    // Restablecer elementos visuales
    video.style.display = 'none';
    video.srcObject = null;
    canvas.style.display = 'none';
    capturedImage.style.display = 'none';
    
    // Limpiar contenedores de QR
    document.getElementById('qrcode').innerHTML = '';
    document.getElementById('qr-text').innerHTML = '';
    document.getElementById('countdown').innerHTML = '';
}

// Función para el contador
function startCountdown() {
    let timeLeft = 30;
    const countdownElement = document.getElementById('countdown');
    
    if (countdown) {
        clearInterval(countdown);
    }
    
    countdown = setInterval(() => {
        countdownElement.textContent = `Tiempo restante: ${timeLeft} segundos`;
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            clearAll();
        }
        
        timeLeft--;
    }, 1000);
}

// Asegurarse de que los elementos están cargados
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página cargada, inicializando elementos...');
    video = document.getElementById('camera');
    canvas = document.getElementById('canvas');
    capturedImage = document.getElementById('captured-image');
});
