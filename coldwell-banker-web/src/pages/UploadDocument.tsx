// src/pages/UploadDocument.tsx
import React, { useState, type FormEvent, type ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import styles from './UploadDocument.module.css';

interface UploadResponse {
  mensaje: string;
  documento: {
    id: number;
    expedienteId: number;
    tipo: string;
    rutaArchivo: string;
  };
}

const UploadDocument: React.FC = () => {
  const { expedienteId } = useParams<{ expedienteId: string }>();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');

    const file = e.target.files?.[0];
    
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validar que sea PDF
    if (file.type !== 'application/pdf') {
      setError('Solo se permiten archivos PDF');
      setSelectedFile(null);
      return;
    }

    // Validar tamaño (ejemplo: máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('El archivo no puede superar los 10MB');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Por favor seleccioná un archivo PDF');
      return;
    }

    if (!expedienteId) {
      setError('No se pudo identificar el expediente');
      return;
    }

    setError('');
    setSuccess('');
    setUploading(true);

    try {
      // Crear FormData para enviar el archivo
      const formData = new FormData();
      formData.append('expedienteId', expedienteId);
      formData.append('tipo', 'PDF_COMPLETO');
      formData.append('archivo', selectedFile);

      const response = await api.post<UploadResponse>('/documentos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(response.data.mensaje || 'Documento subido exitosamente');
      setSelectedFile(null);
      
      // Limpiar el input file
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Redirigir al detalle del expediente después de 2 segundos
      setTimeout(() => {
        navigate(`/expedientes/${expedienteId}`);
      }, 2000);

    } catch (err: any) {
      setError(
        err?.response?.data?.error ||
        err?.response?.data?.mensaje ||
        'Error al subir el documento. Intentá nuevamente.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigate(`/expedientes/${expedienteId}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <button onClick={handleCancel} className={styles.backButton}>
          ← Volver al expediente
        </button>

        <div className={styles.card}>
          <h1 className={styles.title}>Subir Documento PDF</h1>
          <p className={styles.subtitle}>
            Expediente #{expedienteId}
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.fileInputWrapper}>
              <label htmlFor="file-input" className={styles.label}>
                Seleccionar archivo PDF
              </label>
              
              <input
                id="file-input"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className={styles.fileInput}
                disabled={uploading}
              />

              {selectedFile && (
                <div className={styles.fileInfo}>
                  <svg className={styles.fileIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div className={styles.fileDetails}>
                    <p className={styles.fileName}>{selectedFile.name}</p>
                    <p className={styles.fileSize}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}

              <p className={styles.hint}>
                Formato: PDF | Tamaño máximo: 10MB
              </p>
            </div>

            {error && (
              <div className={styles.error}>
                <svg className={styles.errorIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {success && (
              <div className={styles.success}>
                <svg className={styles.successIcon} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                onClick={handleCancel}
                className={styles.cancelButton}
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!selectedFile || uploading}
              >
                {uploading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Subiendo...
                  </>
                ) : (
                  'Subir documento'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadDocument;
