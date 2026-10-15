'use client';

import React, { useState, useRef } from 'react';
import {
  Upload,
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  FileCode,
  FileCheck,
} from 'lucide-react';
import { DocumentRecord } from '@/types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  onSuccess: (doc: DocumentRecord) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  onSuccess,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scannedWarning, setScannedWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (f: File) => {
    setError(null);
    setScannedWarning(null);

    const ext = f.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext || '')) {
      setError('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (f.size > 25 * 1024 * 1024) {
      setError(`File is too large (${(f.size / (1024 * 1024)).toFixed(1)}MB). Limit is 25MB.`);
      return;
    }

    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);
    setError(null);
    setScannedWarning(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('workspaceId', workspaceId);

      setUploadProgress(50);

      const resp = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(85);

      const data = await resp.json();

      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadProgress(100);

      if (data.isScannedWarning) {
        setScannedWarning(data.warningMessage || 'Document appears to be a scanned image.');
      }

      setTimeout(() => {
        onSuccess(data.document);
        onClose();
        setFile(null);
        setIsUploading(false);
        setUploadProgress(0);
      }, 600);
    } catch (err: any) {
      setError(err.message || 'An error occurred during upload.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background-deep border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/20">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Ingest New Document</h3>
              <p className="text-xs text-slate-400">PDF, DOCX, or TXT (Max 25MB)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-violet-500 bg-violet-500/10'
                : file
                ? 'border-emerald-500/50 bg-emerald-500/5'
                : 'border-white/10 hover:border-violet-500/40 bg-background-card/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileCheck className="w-10 h-10 text-emerald-400" />
                <span className="font-medium text-sm text-white">{file.name}</span>
                <span className="text-xs text-slate-400">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
                <span className="text-[11px] text-violet-400 hover:underline">
                  Click or drag another to replace
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center text-violet-400 mb-1">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-slate-200">
                  Drag & drop your document here, or <span className="text-violet-400">browse</span>
                </p>
                <p className="text-xs text-slate-400">
                  Full text extraction with original page numbers preserved
                </p>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scanned Warning */}
          {scannedWarning && (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{scannedWarning}</span>
            </div>
          )}

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Extracting text & preserving page metadata...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-violet-500 to-cyan-400 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex justify-end gap-3 bg-background-deep">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-glow transition-all flex items-center gap-2"
          >
            {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isUploading ? 'Ingesting...' : 'Start Ingestion'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
