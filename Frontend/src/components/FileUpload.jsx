import { useState } from 'react';
import { Upload, File, CheckCircle, XCircle, Loader } from 'lucide-react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      setUploadStatus({
        type: 'error',
        message: 'Unsupported file type. Please upload PDF, DOCX, XLSX, PPTX, or TXT files.'
      });
      return;
    }

    // Upload file
    setUploading(true);
    setUploadStatus(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setUploadStatus({
        type: 'success',
        message: `✅ ${response.data.filename} uploaded! Created ${response.data.chunks_created} chunks.`
      });

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

      // Clear status after 5 seconds
      setTimeout(() => setUploadStatus(null), 5000);

    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: `❌ Upload failed: ${error.response?.data?.detail || error.message}`
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 bg-white hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileInput}
          accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt"
          disabled={uploading}
        />

        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          {uploading ? (
            <Loader className="w-12 h-12 text-blue-500 animate-spin mb-4" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400 mb-4" />
          )}

          <p className="text-lg font-semibold text-gray-700 mb-2">
            {uploading ? 'Uploading...' : 'Upload Document'}
          </p>
          <p className="text-sm text-gray-500">
            Drag & drop or click to select
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Supports: PDF, DOCX, XLSX, PPTX, TXT
          </p>
        </label>
      </div>

      {/* Status Message */}
      {uploadStatus && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
            uploadStatus.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {uploadStatus.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <p className="text-sm">{uploadStatus.message}</p>
        </div>
      )}
    </div>
  );
};

export default FileUpload;