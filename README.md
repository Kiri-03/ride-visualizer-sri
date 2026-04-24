# RIDE Visualizer (Ecuador SRI) 🇪🇨

Visualizador y generador de documentos RIDE (Representación Impresa de Documento Electrónico) para facturas, retenciones y notas de crédito emitidas por el SRI (Servicio de Rentas Internas) de Ecuador. 

Este proyecto está construido como una Single Page Application (SPA), lo que significa que **todo el procesamiento y la generación de PDFs se realiza localmente en el navegador**, garantizando un 100% de privacidad y seguridad de la información.

## ✨ Características

- 🔒 **100% Privado y Local:** Los archivos XML nunca se suben a ningún servidor.
- 🚀 **Arrastrar y Soltar:** Interfaz moderna y amigable para procesar archivos individualmente o por lotes.
- 🎨 **Clasificación Automática:** Detecta automáticamente si el XML es una Factura (Verde), Retención (Azul) o Nota de Crédito (Naranja).
- 📄 **Estándares del SRI:** El PDF generado cumple con las regulaciones de comprobantes electrónicos del SRI:
  - Generación de Código de Barras real (Code128).
  - Generación de Código QR con enlace oficial de verificación.
  - Leyendas reglamentarias y marcas de agua ("SIN VALIDEZ" para ambiente de pruebas).
- 📦 **Exportación Masiva:** Procesamiento en lote para descargar múltiples PDFs agrupados en un solo archivo `.zip`.

## 🛠️ Tecnologías Utilizadas

- **[React 19](https://react.dev/) & [Vite](https://vitejs.dev/):** Framework y empaquetador para una experiencia ágil.
- **[Tailwind CSS v4](https://tailwindcss.com/):** Para todo el diseño de la interfaz y estilos responsivos.
- **[@react-pdf/renderer](https://react-pdf.org/):** Para la creación y dibujo de los documentos PDF en el cliente.
- **[fast-xml-parser](https://github.com/NaturalIntelligence/fast-xml-parser):** Para la lectura ultra-rápida de la estructura XML de los comprobantes.
- **[qrcode](https://www.npmjs.com/package/qrcode) & [jsbarcode](https://lindell.me/JsBarcode/):** Para la generación de la metadata gráfica reglamentaria.
- **[jszip](https://stuk.github.io/jszip/):** Para el empaquetado de descargas masivas.

## 🚀 Instalación y Ejecución Local

1. Clona este repositorio o descarga el código fuente.
2. Instala las dependencias utilizando tu gestor de paquetes favorito:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
4. Abre tu navegador en la URL que indique la consola (usualmente `http://localhost:5173/`).

## 🧩 Integración en otros sistemas

La arquitectura del proyecto está pensada de forma modular. Si tienes un sistema más grande (ERP, Dashboard, etc.), puedes re-utilizar estas piezas clave:

- `src/services/xmlParser.ts`: Función pura que recibe un `File` y retorna la metadata (`SRIFactura`) lista con todos los montos calculados y los Base64 de las imágenes.
- `src/components/RideDocument.tsx`: Componente de UI puro de React-PDF que recibe la interface `SRIFactura` y renderiza el documento completo.

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **MIT**. Siéntete libre de usarlo, modificarlo o integrarlo en tus proyectos comerciales y personales. Consulta el archivo `LICENSE` para más detalles.
