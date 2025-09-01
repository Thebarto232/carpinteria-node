/**
 * Servicio para la generación de PDFs de facturas
 * Utiliza Puppeteer para generar PDFs desde HTML
 */

import puppeteer from 'puppeteer';
import { Factura } from '../models/Factura.js';

export class FacturaPDFService {
    /**
     * Genera un PDF de una factura
     * @param {number} idFactura - ID de la factura
     * @returns {Promise<Buffer>} - Buffer del PDF generado
     */
    static async generarPDF(idFactura) {
        try {
            // Obtener los datos completos de la factura
            const factura = await Factura.obtenerFacturaPorId(idFactura);
            
            if (!factura) {
                throw new Error('Factura no encontrada');
            }

            // Generar HTML de la factura
            const htmlContent = this.generarHTMLFactura(factura);

            // Crear PDF con Puppeteer
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });

            const page = await browser.newPage();
            await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

            // Configurar opciones del PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20mm',
                    right: '15mm',
                    bottom: '20mm',
                    left: '15mm'
                }
            });

            await browser.close();
            return pdfBuffer;

        } catch (error) {
            console.error('Error generando PDF de factura:', error);
            throw error;
        }
    }

    /**
     * Genera el HTML de la factura para convertir a PDF
     * @param {Object} factura - Datos de la factura
     * @returns {string} - HTML de la factura
     */
    static generarHTMLFactura(factura) {
        const fechaEmision = new Date(factura.fecha_emision).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const fechaVenta = new Date(factura.fecha_venta).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura #${factura.numero_factura}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
            line-height: 1.6;
        }
        
        .factura-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
        }
        
        .empresa-info {
            flex: 1;
        }
        
        .empresa-info h1 {
            color: #2563eb;
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: bold;
        }
        
        .empresa-info p {
            margin: 5px 0;
            color: #666;
        }
        
        .factura-info {
            text-align: right;
            flex: 1;
        }
        
        .factura-numero {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin: 0 0 10px 0;
        }
        
        .factura-fecha {
            color: #666;
            font-size: 14px;
        }
        
        .info-section {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        .cliente-info, .venta-info {
            flex: 1;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 0 10px;
        }
        
        .cliente-info:first-child {
            margin-left: 0;
        }
        
        .venta-info:last-child {
            margin-right: 0;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 5px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        
        .info-value {
            color: #6b7280;
        }
        
        .estado {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }
        
        .estado-emitida {
            background: #dbeafe;
            color: #1e40af;
        }
        
        .estado-pagada {
            background: #d1fae5;
            color: #065f46;
        }
        
        .estado-anulada {
            background: #fee2e2;
            color: #991b1b;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .items-table th {
            background: #2563eb;
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
        }
        
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        .items-table tr:nth-child(even) {
            background: #f9fafb;
        }
        
        .precio {
            text-align: right;
            font-weight: 600;
        }
        
        .total-section {
            margin-top: 30px;
            text-align: right;
        }
        
        .total-row {
            display: flex;
            justify-content: flex-end;
            margin-bottom: 10px;
        }
        
        .total-label {
            width: 200px;
            font-weight: 600;
            text-align: right;
            margin-right: 20px;
        }
        
        .total-value {
            width: 100px;
            text-align: right;
        }
        
        .total-final {
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
            border-top: 2px solid #2563eb;
            padding-top: 10px;
        }
        
        .footer {
            margin-top: 50px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        
        .no-items {
            text-align: center;
            color: #6b7280;
            font-style: italic;
            padding: 20px;
        }
    </style>
</head>
<body>
    <div class="factura-container">
        <!-- Header -->
        <div class="header">
            <div class="empresa-info">
                <h1>Sistema de Carpintería</h1>
                <p><strong>Dirección:</strong> Calle Principal #123</p>
                <p><strong>Teléfono:</strong> +57 123 456 7890</p>
                <p><strong>Email:</strong> info@carpinteria.com</p>
                <p><strong>NIT:</strong> 123.456.789-1</p>
            </div>
            <div class="factura-info">
                <div class="factura-numero">FACTURA #${factura.numero_factura}</div>
                <div class="factura-fecha">Fecha de Emisión: ${fechaEmision}</div>
                <div class="factura-fecha">Estado: <span class="estado estado-${factura.estado.toLowerCase()}">${factura.estado}</span></div>
            </div>
        </div>

        <!-- Información del Cliente y Venta -->
        <div class="info-section">
            <div class="cliente-info">
                <div class="section-title">Información del Cliente</div>
                <div class="info-row">
                    <span class="info-label">Nombre:</span>
                    <span class="info-value">${factura.nombre_usuario || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${factura.correo || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Teléfono:</span>
                    <span class="info-value">${factura.telefono || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Rol:</span>
                    <span class="info-value">${factura.nombre_rol || 'N/A'}</span>
                </div>
            </div>
            
            <div class="venta-info">
                <div class="section-title">Información de la Venta</div>
                <div class="info-row">
                    <span class="info-label">ID Venta:</span>
                    <span class="info-value">#${factura.id_venta}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Fecha de Venta:</span>
                    <span class="info-value">${fechaVenta}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Estado de Venta:</span>
                    <span class="info-value">${factura.estado_venta || 'N/A'}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Total de Venta:</span>
                    <span class="info-value">$${parseFloat(factura.total_venta || 0).toFixed(2)}</span>
                </div>
            </div>
        </div>

        <!-- Tabla de Items -->
        <div class="section-title">Detalle de Productos</div>
        ${factura.items && factura.items.length > 0 ? `
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th>Proveedor</th>
                        <th>Cantidad</th>
                        <th>Precio Unitario</th>
                        <th>Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    ${factura.items.map(item => `
                        <tr>
                            <td>
                                <strong>${item.nombre_producto}</strong>
                                ${item.producto_descripcion ? `<br><small style="color: #6b7280;">${item.producto_descripcion}</small>` : ''}
                            </td>
                            <td>${item.nombre_categoria || 'N/A'}</td>
                            <td>${item.nombre_proveedor || 'N/A'}</td>
                            <td>${item.cantidad}</td>
                            <td class="precio">$${parseFloat(item.precio_unitario).toFixed(2)}</td>
                            <td class="precio">$${parseFloat(item.subtotal).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : `
            <div class="no-items">No hay productos registrados en esta factura</div>
        `}

        <!-- Total -->
        <div class="total-section">
            <div class="total-row">
                <div class="total-label">Subtotal:</div>
                <div class="total-value">$${factura.items ? factura.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2) : '0.00'}</div>
            </div>
            <div class="total-row">
                <div class="total-label">IVA (19%):</div>
                <div class="total-value">$${factura.items ? (factura.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0) * 0.19).toFixed(2) : '0.00'}</div>
            </div>
            <div class="total-row total-final">
                <div class="total-label">Total:</div>
                <div class="total-value">$${parseFloat(factura.monto_total).toFixed(2)}</div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p>Esta es una factura generada automáticamente por el Sistema de Carpintería</p>
            <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')} - ${new Date().toLocaleTimeString('es-ES')}</p>
        </div>
    </div>
</body>
</html>`;
    }
}
