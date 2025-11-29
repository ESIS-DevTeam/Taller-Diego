/**
 * ========================================
 * UTILIDADES PARA CÓDIGOS DE BARRAS
 * ========================================
 * 
 * Este archivo contiene funciones para:
 * - Generar códigos de barras visuales usando JsBarcode
 * - Crear imágenes PNG descargables de códigos de barras
 * - Renderizar códigos en canvas/SVG
 */

/**
 * Genera un código de barras en formato SVG y lo renderiza en un elemento
 * 
 * @param {string} elementId - ID del elemento donde renderizar (canvas o svg)
 * @param {string} barcodeValue - Valor del código de barras (ej: "TALLER-00001-FIL")
 * @param {string} productName - Nombre del producto para mostrar debajo
 * @returns {boolean} true si se generó correctamente, false si hubo error
 * 
 * @example
 * generateBarcodeImage('barcode-canvas', 'TALLER-00001-FIL', 'Filtro de Aceite');
 */
export function generateBarcodeImage(elementId, barcodeValue, productName = '') {
    try {
        // Verificar que JsBarcode esté disponible
        if (typeof JsBarcode === 'undefined') {
            console.error('❌ JsBarcode no está cargado. Incluye el script en el HTML.');
            return false;
        }

        // Verificar que el código no esté vacío
        if (!barcodeValue || barcodeValue.trim() === '') {
            console.error('❌ Código de barras vacío');
            return false;
        }

        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`❌ Elemento con ID "${elementId}" no encontrado`);
            return false;
        }

        // Configuración del código de barras para visualización en modal
        const options = {
            format: 'CODE128',        // Formato compatible con la mayoría de escáneres
            width: 1.3,               // Ancho aumentado para mejor visibilidad
            height: 80,               // Altura aumentada
            displayValue: true,       // Mostrar el texto del código
            text: barcodeValue,       // Texto que aparece debajo
            fontSize: 14,             // Tamaño de fuente aumentado
            fontOptions: 'bold',      // Negrita para mejor legibilidad
            textAlign: 'center',      // Centrar el texto
            textMargin: 8,            // Margen entre barras y texto
            margin: 12,               // Margen para mejor espaciado
            background: '#ffffff',    // Fondo blanco
            lineColor: '#000000',     // Barras negras (mejor contraste)
            valid: (valid) => {       // Callback de validación
                if (!valid) {
                    console.error(`❌ Código "${barcodeValue}" no es válido para CODE128`);
                }
            }
        };

        // Generar el código de barras
        JsBarcode(element, barcodeValue, options);

        console.log(`✅ Código de barras generado: ${barcodeValue}`);
        return true;

    } catch (error) {
        console.error('❌ Error al generar código de barras:', error);
        return false;
    }
}

/**
 * Descarga el código de barras como imagen PNG
 * Convierte el SVG a Canvas y luego a PNG para mejor calidad de impresión
 * 
 * @param {string} barcodeValue - Valor del código de barras
 * @param {string} productName - Nombre del producto (usado en nombre del archivo)
 * @returns {Promise<boolean>} true si se descargó correctamente
 * 
 * @example
 * await downloadBarcodeImage('TALLER-00001-FIL', 'Filtro de Aceite');
 * // Descarga: filtro_aceite_TALLER-00001-FIL.png
 */
export async function downloadBarcodeImage(barcodeValue, productName = 'producto') {
    try {
        console.log(`📥 Iniciando descarga de código: ${barcodeValue}`);

        // Validaciones
        if (!barcodeValue || barcodeValue.trim() === '') {
            throw new Error('Código de barras vacío');
        }

        if (typeof JsBarcode === 'undefined') {
            throw new Error('JsBarcode no está cargado');
        }

        // Crear un canvas temporal para generar la imagen
        const tempCanvas = document.createElement('canvas');

        // Calcular ancho dinámicamente según la longitud del código
        // CODE128: cada carácter usa ~11 módulos, más caracteres de control
        const barcodeLength = barcodeValue.length;
        const barWidth = 2.5;  // Ancho por módulo
        const estimatedModules = (barcodeLength + 3) * 11; // +3 para start/stop/checksum
        const barcodeWidth = estimatedModules * barWidth;
        const lateralMargin = 40; // Márgenes laterales (20px cada lado)
        const canvasWidth = Math.ceil(barcodeWidth + lateralMargin);
        const canvasHeight = 150;

        tempCanvas.width = canvasWidth;
        tempCanvas.height = canvasHeight;

        // Generar el código de barras en el canvas temporal
        JsBarcode(tempCanvas, barcodeValue, {
            format: 'CODE128',
            width: barWidth,          // Ancho por módulo
            height: 90,               // Altura de las barras
            displayValue: true,       // Mostrar el código debajo
            fontSize: 16,             // Tamaño de fuente
            fontOptions: 'bold',
            textAlign: 'center',
            textMargin: 5,            // Margen entre barras y texto
            margin: 20,               // Margen uniforme reducido
            background: '#ffffff',
            lineColor: '#000000'
        });

        // Crear un canvas final con el nombre del producto
        const finalCanvas = document.createElement('canvas');
        const ctx = finalCanvas.getContext('2d');

        // Dimensiones finales con espacio reducido para nombre
        finalCanvas.width = canvasWidth;
        finalCanvas.height = canvasHeight + 30; // Espacio reducido para texto

        // Fondo blanco
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

        // Dibujar el código de barras centrado
        ctx.drawImage(tempCanvas, 0, 0);

        // Agregar nombre del producto debajo (si existe)
        if (productName && productName.trim() !== '') {
            ctx.fillStyle = '#2c3e50';
            ctx.font = 'bold 16px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Truncar nombre si es muy largo
            const maxLength = 40;
            const displayName = productName.length > maxLength
                ? productName.substring(0, maxLength) + '...'
                : productName;

            // Posicionar el texto con menos espacio
            ctx.fillText(displayName, canvasWidth / 2, canvasHeight + 18);
        }

        // Convertir canvas a Blob
        const blob = await new Promise((resolve, reject) => {
            finalCanvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('No se pudo convertir canvas a blob'));
                }
            }, 'image/png', 1.0); // Calidad máxima
        });

        // Crear nombre de archivo solo con nombre del producto
        const sanitizedName = productName
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // Eliminar acentos
            .replace(/[^a-zA-Z0-9\s]+/g, '') // Eliminar caracteres especiales
            .replace(/\s+/g, '_')            // Espacios a guiones bajos
            .replace(/^_+|_+$/g, '')         // Eliminar guiones al inicio/fin
            .toLowerCase()
            .substring(0, 40);                // Limitar longitud

        const fileName = `${sanitizedName || 'producto'}.png`;

        // Crear enlace de descarga
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;

        // Agregar al DOM temporalmente (necesario en algunos navegadores)
        document.body.appendChild(link);

        // Disparar descarga
        link.click();

        // Limpiar
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`✅ Imagen descargada: ${fileName}`);
        return true;

    } catch (error) {
        console.error('❌ Error al descargar código de barras:', error);

        // Notificar al usuario del error específico
        let errorMessage = 'Error al descargar código de barras';

        if (error.message.includes('JsBarcode')) {
            errorMessage = 'Librería JsBarcode no disponible';
        } else if (error.message.includes('vacío')) {
            errorMessage = 'El producto no tiene código de barras';
        } else if (error.message.includes('blob')) {
            errorMessage = 'Error al generar la imagen';
        }

        // Si hay una función de notificación disponible, usarla
        if (typeof showNotification !== 'undefined') {
            showNotification(errorMessage, 'error');
        } else {
            alert(errorMessage);
        }

        return false;
    }
}

/**
 * Verifica si el código de barras es válido para el formato CODE128
 * 
 * @param {string} barcodeValue - Código a validar
 * @returns {boolean} true si es válido
 * 
 * @example
 * isValidBarcode('TALLER-00001-FIL'); // true
 * isValidBarcode('');                  // false
 * isValidBarcode('español_ñ');         // false (CODE128 no soporta ñ)
 */
export function isValidBarcode(barcodeValue) {
    if (!barcodeValue || barcodeValue.trim() === '') {
        return false;
    }

    // CODE128 soporta ASCII de 0-127
    // No soporta caracteres especiales como ñ, tildes, etc.
    const validChars = /^[\x00-\x7F]+$/;

    if (!validChars.test(barcodeValue)) {
        console.warn(`⚠️ Código "${barcodeValue}" contiene caracteres no válidos para CODE128`);
        return false;
    }

    return true;
}

/**
 * Limpia y sanitiza un código de barras para asegurar compatibilidad
 * 
 * @param {string} barcodeValue - Código a limpiar
 * @returns {string} Código sanitizado
 * 
 * @example
 * sanitizeBarcode('TALLER-00001-FIL'); // 'TALLER-00001-FIL'
 * sanitizeBarcode('TALLER-ñoño');      // 'TALLER-nono'
 */
export function sanitizeBarcode(barcodeValue) {
    if (!barcodeValue) return '';

    return barcodeValue
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/ñ/g, 'n')
        .replace(/Ñ/g, 'N')
        .toUpperCase()
        .trim();
}

/**
 * Genera una vista previa del código de barras en un elemento específico
 * Versión simplificada para uso en modales/tooltips
 * 
 * @param {string} elementId - ID del elemento contenedor
 * @param {string} barcodeValue - Código de barras
 * @returns {boolean} true si se generó correctamente
 */
export function generateBarcodePreview(elementId, barcodeValue) {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`❌ Elemento "${elementId}" no encontrado`);
            return false;
        }

        if (!barcodeValue || barcodeValue.trim() === '') {
            element.innerHTML = '<p style="color: #999; text-align: center;">Sin código de barras</p>';
            return false;
        }

        // Verificar JsBarcode
        if (typeof JsBarcode === 'undefined') {
            element.innerHTML = '<p style="color: #999; text-align: center;">Librería no disponible</p>';
            return false;
        }

        // Crear SVG para la vista previa
        element.innerHTML = '<svg id="preview-barcode"></svg>';
        const svg = element.querySelector('svg');

        // Configuración simplificada para preview
        JsBarcode(svg, barcodeValue, {
            format: 'CODE128',
            width: 1.8,
            height: 50,
            displayValue: true,
            fontSize: 12,
            margin: 60,
            background: 'transparent',
            lineColor: '#000000'
        });

        return true;

    } catch (error) {
        console.error('❌ Error en preview:', error);
        return false;
    }
}
