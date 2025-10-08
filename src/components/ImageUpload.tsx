'use client';

import React, { useState, useRef, useCallback } from 'react';
import { uploadToIPFS, validateImageFile, resizeImage } from '@/utils/ipfsUpload';
import { FaUpload, FaImage, FaTimes, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import Image from 'next/image';

interface ImageUploadProps {
  onImageUploaded: (ipfsUrl: string) => void;
  onError: (error: string) => void;
  currentImageUrl?: string;
  className?: string;
  disabled?: boolean;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  success: boolean;
}

export default function ImageUpload({
  onImageUploaded,
  onError,
  currentImageUrl,
  className = '',
  disabled = false
}: ImageUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    success: false
  });
  
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (file: File) => {
    if (disabled) return;

    setUploadState({
      uploading: true,
      progress: 0,
      error: null,
      success: false
    });

    try {
      // Validate file first
      const validation = await validateImageFile(file);
      if (!validation.valid) {
        setUploadState(prev => ({
          ...prev,
          uploading: false,
          error: validation.error || 'Invalid file'
        }));
        onError(validation.error || 'Invalid file');
        return;
      }

      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload to IPFS
      const result = await uploadToIPFS(file, (progress) => {
        setUploadState(prev => ({
          ...prev,
          progress
        }));
      });

      if (result.success && result.ipfsUrl) {
        setUploadState({
          uploading: false,
          progress: 100,
          error: null,
          success: true
        });
        
        onImageUploaded(result.ipfsUrl);
        
        // Clear success state after 3 seconds
        setTimeout(() => {
          setUploadState(prev => ({
            ...prev,
            success: false
          }));
        }, 3000);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState({
        uploading: false,
        progress: 0,
        error: errorMessage,
        success: false
      });
      onError(errorMessage);
      
      // Clear preview on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [disabled, onImageUploaded, onError, previewUrl]);

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [disabled, handleFileSelect]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  // Clear current image
  const handleClear = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    
    setUploadState({
      uploading: false,
      progress: 0,
      error: null,
      success: false
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [previewUrl]);

  // Get display image URL
  const displayImageUrl = previewUrl || currentImageUrl;

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-[#00b8d8] bg-[#00b8d8]/10' : 'border-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-500'}
          ${uploadState.error ? 'border-red-500 bg-red-500/10' : ''}
          ${uploadState.success ? 'border-green-500 bg-green-500/10' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Upload Content */}
        {!displayImageUrl && !uploadState.uploading && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <FaUpload className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-300">
                Upload Token Logo
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag & drop an image or click to browse
              </p>
              <p className="text-xs text-gray-600 mt-2">
                Recommended: 400x300px • PNG, JPG, SVG, WebP • Max 5MB
              </p>
            </div>
          </div>
        )}

        {/* Image Preview */}
        {displayImageUrl && !uploadState.uploading && (
          <div className="space-y-3">
            <div className="relative w-32 h-24 mx-auto">
              <Image
                src={displayImageUrl}
                alt="Token logo preview"
                fill
                className="object-contain rounded"
                unoptimized
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                disabled={disabled}
              >
                <FaTimes className="h-3 w-3" />
              </button>
            </div>
            <p className="text-sm text-gray-400">
              Click to replace or drag a new image
            </p>
          </div>
        )}

        {/* Upload Progress */}
        {uploadState.uploading && (
          <div className="space-y-3">
            <div className="flex justify-center">
              <FaSpinner className="h-12 w-12 text-[#00b8d8] animate-spin" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-300">
                Uploading to IPFS...
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                <div
                  className="bg-[#00b8d8] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {uploadState.progress}% complete
              </p>
            </div>
          </div>
        )}

        {/* Success State */}
        {uploadState.success && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-lg">
            <div className="text-center">
              <FaCheck className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="text-green-400 font-medium">Upload Successful!</p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {uploadState.error && (
        <div className="mt-3 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <FaExclamationTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{uploadState.error}</p>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-3 text-xs text-gray-500 space-y-1">
        <p>• Images will be uploaded to IPFS for decentralized storage</p>
        <p>• Recommended dimensions: 400x300 pixels for optimal display</p>
        <p>• Supported formats: PNG, JPG, SVG, WebP (max 5MB)</p>
      </div>
    </div>
  );
}
