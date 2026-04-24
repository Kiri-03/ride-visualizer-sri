import { XMLParser } from 'fast-xml-parser';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

export interface FacturaDetalle {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  precioTotalSinImpuesto: number;
}

export interface SRIFactura {
  infoTributaria: {
    ruc: string;
    razonSocial: string;
    claveAcceso: string;
    dirMatriz: string;
    ambiente: string;
  };
  infoFactura: {
    fechaEmision: string;
    totalSinImpuestos: number;
    subtotal15: number;
    subtotal0: number;
    importeTotal: number;
    propina?: number;
  };
  detalles: FacturaDetalle[];
  visuals: {
    barcodeBase64: string;
    qrBase64: string;
  };
}

const generateBarcode = (text: string): string => {
  const canvas = document.createElement('canvas');
  JsBarcode(canvas, text, {
    format: 'CODE128',
    displayValue: false,
    height: 40,
    width: 1.5,
    margin: 0
  });
  return canvas.toDataURL('image/png');
};

export const parseSRIXML = async (file: File): Promise<SRIFactura> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        if (!text) throw new Error("No se pudo leer el archivo");

        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "@_",
          cdataPropName: "__cdata",
          parseTagValue: false,
        });

        let jsonObj = parser.parse(text);

        // SRI invoices often wrap the real XML in a <comprobante> CDATA node if authorized.
        if (jsonObj.autorizacion && jsonObj.autorizacion.comprobante) {
          const comprobanteCdata = jsonObj.autorizacion.comprobante;
          let innerXml = '';
          if (typeof comprobanteCdata === 'string') {
            innerXml = comprobanteCdata;
          } else if (comprobanteCdata.__cdata) {
            innerXml = comprobanteCdata.__cdata;
          } else {
             // Try to just stringify it if it parsed it as object incorrectly
             // but usually fast-xml-parser leaves CDATA as string if no specific tag is configured, or parses if we use cdataPropName
          }
          
          if (innerXml) {
              jsonObj = parser.parse(innerXml);
          }
        }

        const factura = jsonObj.factura;
        if (!factura) {
          throw new Error("El archivo no tiene una estructura válida de factura electrónica");
        }

        const infoTributaria = factura.infoTributaria || {};
        const infoFactura = factura.infoFactura || {};
        const detallesRaw = factura.detalles?.detalle || [];

        // Ensure detalles is an array
        const detallesArray = Array.isArray(detallesRaw) ? detallesRaw : [detallesRaw];

        const detalles: FacturaDetalle[] = detallesArray.map((d: any) => ({
          nombre: d.descripcion || 'Sin descripción',
          cantidad: parseFloat(d.cantidad || '0'),
          precioUnitario: parseFloat(d.precioUnitario || '0'),
          descuento: parseFloat(d.descuento || '0'),
          precioTotalSinImpuesto: parseFloat(d.precioTotalSinImpuesto || '0'),
        }));

        let subtotal15 = 0;
        let subtotal0 = 0;

        // Parse taxes
        const totalConImpuestos = infoFactura.totalConImpuestos?.totalImpuesto || [];
        const impuestosArray = Array.isArray(totalConImpuestos) ? totalConImpuestos : [totalConImpuestos];

        impuestosArray.forEach((imp: any) => {
          if (imp.codigo === '2') { // IVA
             if (imp.codigoPorcentaje === '4' || imp.codigoPorcentaje === '2') { // 15% o 12%
                subtotal15 += parseFloat(imp.baseImponible || '0');
             } else if (imp.codigoPorcentaje === '0') { // 0%
                subtotal0 += parseFloat(imp.baseImponible || '0');
             }
          }
        });

        const ruc = String(infoTributaria.ruc || '');
        const claveAcceso = String(infoTributaria.claveAcceso || '');
        const ambiente = infoTributaria.ambiente || '1';

        // Generar Visuales
        const barcodeBase64 = generateBarcode(claveAcceso);
        // URL SRI
        const sriUrl = `https://srienlinea.sri.gob.ec/sri-en-linea/qr/design/swrx?claveAcceso=${claveAcceso}`;
        
        resolve(QRCode.toDataURL(sriUrl, { errorCorrectionLevel: 'M', margin: 1 })
          .then((qrBase64) => {
            const result: SRIFactura = {
              infoTributaria: {
                ruc,
                razonSocial: infoTributaria.razonSocial || '',
                claveAcceso,
                dirMatriz: infoTributaria.dirMatriz || '',
                ambiente: String(ambiente),
              },
              infoFactura: {
                fechaEmision: infoFactura.fechaEmision || '',
                totalSinImpuestos: parseFloat(infoFactura.totalSinImpuestos || '0'),
                subtotal15,
                subtotal0,
                importeTotal: parseFloat(infoFactura.importeTotal || '0'),
                propina: parseFloat(infoFactura.propina || '0'),
              },
              detalles,
              visuals: {
                barcodeBase64,
                qrBase64,
              }
            };
            return result;
          })
        );
      } catch (error: any) {
        reject(new Error(error.message || "Error al parsear el archivo XML"));
      }
    };

    reader.onerror = () => reject(new Error("Error al leer el archivo"));
    reader.readAsText(file);
  });
};
