import React, { useState } from 'react';
import { X, Upload, FileText, Sparkles, CheckCircle } from 'lucide-react';
import { BASE_URL } from '../utils';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [docType, setDocType] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileType = selectedFile.type;
      const fileName = selectedFile.name.toLowerCase();

      if (
        fileType === 'application/pdf' ||
        fileName.endsWith('.pdf') ||
        fileType === 'text/csv' ||
        fileName.endsWith('.csv')
      ) {
        setFile(selectedFile);
        setError('');
      } else {
        setError('Please select only PDF or CSV files');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title || !description || !docType) {
      setError('Please fill in all fields');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please login to upload documents');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('doc_type', docType);

      const response = await fetch(BASE_URL + '/llama/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setDocType('');

      onUploadSuccess();
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload document. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setFile(null);
      setTitle('');
      setDescription('');
      setDocType('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-indigo-100">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">📤 Upload Document</h2>
                <p className="text-indigo-100 text-sm">Add files for AI analysis</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isUploading}
              className="text-white/80 hover:text-white disabled:opacity-50 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">⚠️</span>
                {error}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">📁 Select File (PDF or CSV only)</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.csv,application/pdf,text/csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full border-2 border-dashed border-indigo-300 rounded-xl p-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-200"
              >
                <div className="text-center">
                  {file ? (
                    <>
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p className="text-xs text-green-600 mt-2">✅ File ready for upload</p>
                    </>
                  ) : (
                    <>
                      <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                        <Upload className="h-8 w-8 text-indigo-600" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">📤 Click to select file</p>
                      <p className="text-xs text-gray-500 mt-1">PDF or CSV files only</p>
                      <p className="text-xs text-indigo-600 mt-2">🚀 Ready for AI analysis</p>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
              📝 Document Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-2 border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gradient-to-r from-white to-indigo-50"
              placeholder="Enter a descriptive title"
              disabled={isUploading}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
              📄 Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border-2 border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none bg-gradient-to-r from-white to-indigo-50"
              placeholder="Describe the document content and purpose"
              disabled={isUploading}
              required
            />
          </div>

          <div>
            <label htmlFor="doc_type" className="block text-sm font-semibold text-gray-700 mb-2">
              🏷️ Document Type
            </label>
            <select
              id="doc_type"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="w-full border-2 border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gradient-to-r from-white to-indigo-50"
              disabled={isUploading}
              required
            >
              <option value="">Select document type</option>
              <option value="pdf">📄 PDF</option>
              <option value="csv">📋 CSV</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !file || !title || !description || !docType}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-semibold shadow-lg"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  🚀 Uploading...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
