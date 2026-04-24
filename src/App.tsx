import { useState } from 'react';
import { Dropzone } from './components/Dropzone';
import { RideDocument } from './components/RideDocument';
import { parseSRIXML, type SRIFactura } from './services/xmlParser';
import { FileText, X, ChevronLeft, ChevronRight, Loader2, AlertCircle, Download } from 'lucide-react';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [facturas, setFacturas] = useState<SRIFactura[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFilesAccepted = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  };

  const handleVisualizar = async (index?: number) => {
    if (files.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    setIsModalOpen(true);
    
    try {
      const filesToProcess = index !== undefined ? [files[index]] : files;
      const parsedFacturas: SRIFactura[] = [];
      for (const file of filesToProcess) {
        try {
          const parsed = await parseSRIXML(file);
          parsedFacturas.push(parsed);
        } catch (err: any) {
          throw new Error(`El archivo ${file.name} no tiene una estructura válida de factura electrónica. Detalles: ${err.message}`);
        }
      }
      setFacturas(parsedFacturas);
      setCurrentIndex(0);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportAll = async () => {
    if (facturas.length === 0) return;
    setIsExporting(true);
    try {
      const zip = new JSZip();
      for (let i = 0; i < facturas.length; i++) {
        const factura = facturas[i];
        const doc = <RideDocument factura={factura} />;
        const asPdf = pdf(doc);
        const blob = await asPdf.toBlob();
        const baseFilename = `${factura.infoTributaria.ruc}-${factura.infoTributaria.claveAcceso}`;
        // Prevent collisions if user uploaded copies of the same XML
        const filename = `${baseFilename}${i > 0 ? `_(${i})` : ''}.pdf`;
        zip.file(filename, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'Facturas_RIDE.zip');
    } catch (err) {
      console.error('Error exportando ZIP:', err);
      alert('Hubo un error al generar el archivo ZIP. Revisa la consola para más detalles.');
    } finally {
      setIsExporting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFacturas([]);
    setCurrentIndex(0);
    setError(null);
  };

  const handleNext = () => {
    if (currentIndex < facturas.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Visualizador RIDE
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Sube tus archivos XML del SRI (Ecuador) para visualizar de manera profesional y sencilla tus facturas y comprobantes electrónicos.
          </p>
        </div>

        {/* Main Card */}
        <div className="w-full bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 md:p-10 border border-gray-100">
          <Dropzone onFilesAccepted={handleFilesAccepted} onVisualizar={handleVisualizar} />
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-sm text-gray-400">
          Tus archivos se procesan localmente en tu navegador.
        </p>
      </div>

      {/* Full Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col">
          {/* Modal Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between shadow-md z-10">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-800">Visualizador de Facturas</h2>
              {facturas.length > 1 && !isLoading && !error && (
                <>
                  <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
                    <button 
                      onClick={handlePrev} 
                      disabled={currentIndex === 0}
                      className="p-1 rounded hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <span className="text-sm font-medium text-gray-600 px-2">
                      {currentIndex + 1} de {facturas.length}
                    </span>
                    <button 
                      onClick={handleNext}
                      disabled={currentIndex === facturas.length - 1}
                      className="p-1 rounded hover:bg-white disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-700" />
                    </button>
                  </div>
                  <button
                    onClick={handleExportAll}
                    disabled={isExporting}
                    className="ml-4 flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                    <span>{isExporting ? 'Comprimiendo...' : 'Descargar ZIP'}</span>
                  </button>
                </>
              )}
            </div>
            <button 
              onClick={closeModal}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 flex items-center justify-center relative bg-gray-900 overflow-hidden">
            {isLoading ? (
              <div className="flex flex-col items-center text-white">
                <Loader2 className="w-12 h-12 animate-spin mb-4 text-blue-400" />
                <p className="text-lg font-medium">Procesando documentos...</p>
              </div>
            ) : error ? (
              <div className="bg-white p-8 rounded-2xl max-w-lg text-center flex flex-col items-center">
                <div className="bg-red-100 p-3 rounded-full mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Error al procesar</h3>
                <p className="text-gray-600 mb-6">{error}</p>
                <button 
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : facturas.length > 0 ? (
              <PDFViewer width="100%" height="100%" className="border-none">
                <RideDocument factura={facturas[currentIndex]} />
              </PDFViewer>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
