import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import api from '@/utils/api';
import toast from 'react-hot-toast';

/**
 * R2 Video Uploader Component
 * Handles video uploads to Cloudflare R2 with progress tracking
 */
const R2VideoUploader = ({ onUploadSuccess, maxSize = 500 * 1024 * 1024 }) => {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);

  const validateFile = (file) => {
    // Check file size
    if (file.size > maxSize) {
      const sizeMB = maxSize / 1024 / 1024;
      setError(`File size exceeds ${sizeMB}MB limit`);
      return false;
    }

    // Check file type
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only video files are allowed (MP4, MOV, WebM, M4V)');
      return false;
    }

    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setProgress(0);

    if (!validateFile(file)) {
      fileInputRef.current.value = '';
      return;
    }

    handleUpload(file);
  };

  const handleUpload = async (file) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      const formData = new FormData();
      formData.append('file', file);

      // Upload to R2
      const response = await api.post('/api/admin/upload-video-r2', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        const { fileUrl, r2Key, size } = response.data;

        setUploadedFile({
          name: file.name,
          url: fileUrl,
          r2Key,
          size,
          type: file.type,
          uploadedAt: new Date(),
        });

        toast.success('Video uploaded to R2 successfully!');

        // Call callback with file data
        if (onUploadSuccess) {
          onUploadSuccess({
            fileUrl,
            r2Key,
            size,
            fileName: file.name,
          });
        }
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Upload failed';
      setError(errorMessage);
      toast.error(errorMessage);
          } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer?.files;
    if (files?.[0]) {
      const file = files[0];
      if (validateFile(file)) {
        handleUpload(file);
      }
    }
  };

  const handleRemove = async () => {
    if (!uploadedFile?.r2Key) return;

    try {
      setUploading(true);
      const response = await api.delete('/api/admin/delete-r2-file', {
        data: { r2Key: uploadedFile.r2Key },
      });

      if (response.data.success) {
        setUploadedFile(null);
        toast.success('File deleted from R2');
      }
    } catch (err) {
      toast.error('Failed to delete file');
          } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-md">
      {/* Upload Area */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDragDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition ${
          uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />

        {!uploadedFile ? (
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="cursor-pointer"
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-semibold text-gray-700 mb-2">
              Upload Video to R2
            </p>
            <p className="text-sm text-gray-500 mb-2">
              Drag and drop your video here, or click to browse
            </p>
            <p className="text-xs text-gray-400">
              Supported: MP4, MOV, WebM (Max {formatFileSize(maxSize)})
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
            <p className="font-semibold text-gray-700">Upload Complete!</p>
            <p className="text-sm text-gray-600">{uploadedFile.name}</p>
            <p className="text-xs text-gray-500">
              {formatFileSize(uploadedFile.size)}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        {uploading && progress > 0 && (
          <div className="mt-4 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {uploading && (
          <p className="mt-2 text-sm text-blue-600 font-medium">
            {progress}% Uploading...
          </p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* File Info */}
      {uploadedFile && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="font-medium text-gray-900">{uploadedFile.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                R2 Key: {uploadedFile.r2Key}
              </p>
            </div>
            <button
              onClick={handleRemove}
              disabled={uploading}
              className="text-red-500 hover:text-red-700 disabled:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Public URL */}
          <div className="bg-white p-2 rounded border border-gray-200 mb-3">
            <p className="text-xs text-gray-500 mb-1">Public URL:</p>
            <a
              href={uploadedFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline truncate block"
            >
              {uploadedFile.url}
            </a>
          </div>

          {/* Copy URL Button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(uploadedFile.url);
              toast.success('URL copied to clipboard');
            }}
            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Copy URL
          </button>
        </div>
      )}

      {/* Upload Another */}
      {uploadedFile && !uploading && (
        <button
          onClick={() => {
            setUploadedFile(null);
            setError(null);
            setProgress(0);
            fileInputRef.current?.click();
          }}
          className="mt-3 w-full px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition text-sm font-medium"
        >
          Upload Another Video
        </button>
      )}
    </div>
  );
};

export default R2VideoUploader;
