import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, FileType, X, Eye } from 'lucide-react';

interface DropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  onVisualizar?: (index?: number) => void;
}

export interface UploadedFileMeta {
  file: File;
  tipoDoc: 'Factura' | 'Retencion' | 'NotaCredito' | 'Desconocido';
}

export function Dropzone({ onFilesAccepted, onVisualizar }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileMeta[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = async (files: File[]) => {
    const xmlFiles = files.filter(
      (file) => file.type === 'text/xml' || file.name.toLowerCase().endsWith('.xml')
    );

    if (xmlFiles.length < files.length) {
      alert('Se ignoraron algunos archivos. Solo se permiten archivos .xml.');
    }

    if (xmlFiles.length > 0) {
      const processed: UploadedFileMeta[] = await Promise.all(
        xmlFiles.map(async (file) => {
          try {
            const text = await file.text();
            let tipoDoc: 'Factura' | 'Retencion' | 'NotaCredito' | 'Desconocido' = 'Desconocido';
            if (text.includes('<codDoc>01</codDoc>') || text.includes('<factura')) tipoDoc = 'Factura';
            else if (text.includes('<codDoc>07</codDoc>') || text.includes('<comprobanteRetencion')) tipoDoc = 'Retencion';
            else if (text.includes('<codDoc>04</codDoc>') || text.includes('<notaCredito')) tipoDoc = 'NotaCredito';
            return { file, tipoDoc };
          } catch (e) {
            return { file, tipoDoc: 'Desconocido' };
          }
        })
      );

      setUploadedFiles((prev) => {
        const newFiles = [...prev, ...processed];
        onFilesAccepted(newFiles.map(meta => meta.file));
        return newFiles;
      });
    }
  };

  const removeFile = (indexToRemove: number) => {
    setUploadedFiles((prev) => {
      const newFiles = prev.filter((_, index) => index !== indexToRemove);
      onFilesAccepted(newFiles.map(meta => meta.file));
      return newFiles;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getColorTheme = (tipo: string) => {
    switch (tipo) {
      case 'Factura': return { bg: 'bg-green-100', text: 'text-green-600', label: 'Factura' };
      case 'Retencion': return { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Retención' };
      case 'NotaCredito': return { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Nota C.' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Desconocido' };
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {uploadedFiles.length === 0 ? (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ease-in-out cursor-pointer flex flex-col items-center justify-center min-h-[300px]
            ${
              isDragging
                ? 'border-blue-600 bg-blue-50/50 shadow-inner'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".xml,text/xml"
            multiple
            onChange={handleFileChange}
          />
          <UploadCloud
            className={`w-16 h-16 mb-6 transition-colors duration-300 ${
              isDragging ? 'text-blue-600' : 'text-gray-400'
            }`}
          />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Arrastra tus XMLs aquí o haz clic para buscar
          </h3>
          <p className="text-gray-500 text-sm max-w-sm">
            Solo archivos .xml (Facturas, Retenciones, Notas de Crédito)
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Archivos Cargados</h3>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              + Agregar más
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".xml,text/xml"
              multiple
              onChange={handleFileChange}
            />
          </div>
          <ul className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {uploadedFiles.map((meta, index) => {
              const theme = getColorTheme(meta.tipoDoc);
              return (
              <li
                key={`${meta.file.name}-${index}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className={`${theme.bg} p-2 rounded-lg flex-shrink-0`}>
                    <FileType className={`w-6 h-6 ${theme.text}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate max-w-[180px] sm:max-w-xs" title={meta.file.name}>
                      {meta.file.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${theme.bg} ${theme.text}`}>
                        {theme.label}
                      </span>
                      <span className="text-xs text-gray-500">{formatFileSize(meta.file.size)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                  <button
                    onClick={() => onVisualizar && onVisualizar(index)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                    title="Visualizar este archivo"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Eliminar archivo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </li>
            )})}
          </ul>
          <div className="p-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => onVisualizar && onVisualizar()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Visualizar Todos ({uploadedFiles.length})
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
