// Configuración de APIs
const CONFIG = {
    IMGBB_API_KEY: '52caeb3987a1d3e1407627928b18c14e',
    OCR_API_KEY: 'helloworld',
    GEMINI_API_KEY: 'AIzaSyCa362tZsWj38073XyGaMTmKC0YKc-W0I8'
};

// Función para convertir canvas a blob
async function canvasToBlob(canvas) {
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
}

// Función para subir imagen a ImgBB
async function uploadToImgBB(blob) {
    const formData = new FormData();
    formData.append('image', blob);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${CONFIG.IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
    });
    
    const result = await response.json();
    if (!result.success) {
        throw new Error('Error al subir la imagen a ImgBB');
    }
    return result.data.url;
}

// Función para procesar OCR
async function performOCR(imageUrl) {
    const ocrUrl = `https://api.ocr.space/parse/imageurl?apikey=${CONFIG.OCR_API_KEY}&url=${encodeURIComponent(imageUrl)}&OCREngine=2`;
    const response = await fetch(ocrUrl);
    const result = await response.json();
    
    if (!result.ParsedResults || result.ParsedResults.length === 0) {
        throw new Error('OCR no pudo extraer texto de la imagen');
    }
    return result.ParsedResults[0].ParsedText;
}

// Función para procesar texto con Gemini
async function processWithGemini(text) {
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
    const prompt = {
        contents: [{
            parts: [{
                text: `Del siguiente texto, extrae TODOS los códigos de barras numéricos (números de 12-14 dígitos). Devuelve solo los números separados por comas, sin ningún otro texto. Ejemplo de respuesta correcta: "123456789012,123456789013". Si no hay códigos válidos, devuelve una cadena vacía:\n\n${text}`
            }]
        }]
    };

    const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt)
    });

    const result = await response.json();
    if (!result.candidates || !result.candidates[0]) {
        throw new Error('No se pudo procesar el texto con Gemini');
    }
    return result.candidates[0].content.parts[0].text;
}

// Función para generar códigos QR
function generateQRCodes(validCodes) {
    const qrcodeContainer = document.getElementById('qrcode');
    const qrTextContainer = document.getElementById('qr-text');
    
    if (!qrcodeContainer || !qrTextContainer) {
        throw new Error('No se encontraron los contenedores para los códigos QR');
    }

    qrcodeContainer.innerHTML = '';
    qrTextContainer.innerHTML = '';

    validCodes.forEach((code, index) => {
        const qrContainer = document.createElement('div');
        qrContainer.className = 'qr-item';
        qrContainer.style.marginBottom = '20px';
        
        const qrDiv = document.createElement('div');
        qrDiv.id = `qrcode-${index}`;
        qrContainer.appendChild(qrDiv);
        
        const textDiv = document.createElement('div');
        textDiv.className = 'qr-text';
        textDiv.textContent = code;
        qrContainer.appendChild(textDiv);
        
        qrcodeContainer.appendChild(qrContainer);
        
        new QRCode(qrDiv, {
            text: code,
            width: 128,
            height: 128,
            colorDark: "#000000",
            colorLight: "#FFFFFF",
            correctLevel: QRCode.CorrectLevel.H
        });
    });
}

// Función principal de procesamiento
async function processImage(canvas) {
    try {
        console.log('Iniciando procesamiento de imagen...');
        
        if (!canvas) {
            throw new Error('No se proporcionó un canvas válido');
        }

        // Convertir canvas a blob
        console.log('Convirtiendo canvas a blob...');
        const blob = await canvasToBlob(canvas);
        
        // Subir imagen a ImgBB
        console.log('Subiendo imagen a ImgBB...');
        const imageUrl = await uploadToImgBB(blob);
        console.log('Imagen subida:', imageUrl);
        
        // Procesar OCR
        console.log('Procesando OCR...');
        const text = await performOCR(imageUrl);
        console.log('Texto OCR detectado:', text);
        
        // Procesar con Gemini
        console.log('Procesando con Gemini...');
        const geminiResponse = await processWithGemini(text);
        console.log('Respuesta de Gemini:', geminiResponse);
        
        // Validar y procesar códigos
        const detectedCodes = geminiResponse.trim().split(',');
        const validCodes = detectedCodes.filter(code => /^\d{12,14}$/.test(code.trim()));
        
        if (validCodes.length === 0) {
            throw new Error('No se encontraron códigos de barras válidos');
        }

        // Ocultar canvas y generar códigos QR
        canvas.style.display = 'none';
        generateQRCodes(validCodes);
        startCountdown();
        
        console.log('Procesamiento completado con éxito');

    } catch (error) {
        console.error('Error en processImage:', error);
        alert(`Error: ${error.message}`);
    }
}
