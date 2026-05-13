'use client';

import { useState, useRef } from 'react';
import { uploadProductMediaAction, deleteProductMediaAction, setPrimaryProductMediaAction } from '../productos/[id]/actions';
import { UploadCloud, Trash2, Star, Loader2, Image as ImageIcon } from 'lucide-react';

interface MediaUploaderProps {
  productId: string;
  country: string;
  dict: any;
  storageReady: boolean;
  existingMedia: {
    id: string;
    url: string;
    position: number;
  }[];
}

export function MediaUploader({ productId, country, dict, storageReady, existingMedia }: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!storageReady) {
    return (
      <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
          <UploadCloud className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-bold text-gray-500 mb-1">{dict?.mediaManager?.storageDisabled || 'Storage no configurado'}</p>
        <p className="text-xs text-gray-400 max-w-xs">{dict?.mediaManager?.storageDisabledDesc || 'El sistema de almacenamiento no está disponible actualmente.'}</p>
      </div>
    );
  }

  const handleUpload = async (file: File) => {
    setErrorMsg(null);

    // Validations
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setErrorMsg(dict?.mediaManager?.typeError || 'Tipo de archivo no permitido. Solo JPEG, PNG, WEBP.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(dict?.mediaManager?.sizeError || 'El archivo supera el límite de 5MB.');
      return;
    }
    if (existingMedia.length >= 8) {
      setErrorMsg(dict?.mediaManager?.maxImagesReached || 'Has alcanzado el límite de 8 imágenes.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId);
      formData.append('country', country);

      const res = await uploadProductMediaAction(formData);
      if (!res.success) {
        setErrorMsg(dict?.mediaManager?.uploadError || 'Error al subir la imagen.');
      }
    } catch (e) {
      setErrorMsg(dict?.mediaManager?.uploadError || 'Error al subir la imagen.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      {existingMedia.length < 8 && (
        <div 
          className={`relative border-2 border-dashed rounded-2xl p-6 transition-all ${
            isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleUpload(e.dataTransfer.files[0]);
            }
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
            accept="image/jpeg, image/png, image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUpload(e.target.files[0]);
              }
            }}
            disabled={isUploading}
          />
          
          <div className="flex flex-col items-center justify-center text-center pointer-events-none">
            {isUploading ? (
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
            ) : (
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                <UploadCloud className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <p className="text-sm font-bold text-secondary mb-1">
              {isUploading ? 'Subiendo...' : (dict?.mediaManager?.uploadPlaceholder || 'Haz clic o arrastra una imagen')}
            </p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">
              {dict?.mediaManager?.limitNote || 'Máximo 8 imágenes. JPEG, PNG, WEBP (hasta 5MB).'}
            </p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-600 text-sm font-bold p-3 rounded-xl border border-red-100">
          {errorMsg}
        </div>
      )}

      {/* Gallery Grid */}
      {existingMedia.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {existingMedia.map((media, idx) => (
            <div key={media.id} className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
              <img src={media.url} alt="Media" className="w-full h-full object-contain mix-blend-multiply" />
              
              {/* Primary Badge */}
              {idx === 0 && (
                <div className="absolute top-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                  {dict?.mediaManager?.primary || 'PRINCIPAL'}
                </div>
              )}

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 gap-2">
                {idx !== 0 && (
                  <button 
                    onClick={() => setPrimaryProductMediaAction(media.id, productId, country)}
                    className="w-full bg-white text-secondary text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-gray-100"
                  >
                    <Star className="w-3 h-3" /> {dict?.mediaManager?.setPrimary || 'Principal'}
                  </button>
                )}
                <button 
                  onClick={() => deleteProductMediaAction(media.id, productId, country)}
                  className="w-full bg-red-600 text-white text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-red-700"
                >
                  <Trash2 className="w-3 h-3" /> {dict?.mediaManager?.remove || 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-2">
            <ImageIcon className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-sm text-neutral font-medium">{dict?.sellerProfile?.noImages || 'No hay imágenes'}</p>
        </div>
      )}
    </div>
  );
}
