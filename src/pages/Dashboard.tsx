import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  Plus,
  ArrowLeft,
  Scale,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import UploadModal from '../components/UploadModal';
import { BASE_URL } from '../utils';

interface Document {
  id: number;
  title: string;
  description: string;
  doc_type: string;
  file_name: string;
  file_size: number;
  upload_date: string;
  status: 'Processed' | 'Processing' | 'Failed';
}

interface DocumentResponse {
  documents: Document[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<
    'All' | 'contract' | 'legal_brief' | 'case_study' | 'compliance' | 'research' | 'other'
  >('All');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();

  const fetchDocuments = async (page: number = 1) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      const response = await fetch(`${BASE_URL}/llama/documents?page=${page}&page_size=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('access_token');
          navigate('/login');
          return;
        }
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }

      const data: DocumentResponse = await response.json();
      setDocuments(data.documents);
      setCurrentPage(data.page);
      setTotalPages(data.pages);
      setTotalDocuments(data.total);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(currentPage);
  }, [currentPage]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    // doc?.file_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || doc.doc_type === filter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`/deleteDocument/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      // Refresh the documents list
      fetchDocuments(currentPage);
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document. Please try again.');
    }
  };

  const handleUploadSuccess = () => {
    fetchDocuments(currentPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Processed':
        return 'bg-green-100 text-green-800';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Processed':
        return <CheckCircle className="h-4 w-4" />;
      case 'Processing':
        return <Clock className="h-4 w-4" />;
      case 'Failed':
        return <span className="text-red-500">⚠️</span>;
      default:
        return null;
    }
  };

  const getDocTypeColor = (docType: string) => {
    const colors = {
      contract: 'bg-blue-100 text-blue-800',
      legal_brief: 'bg-purple-100 text-purple-800',
      case_study: 'bg-green-100 text-green-800',
      compliance: 'bg-orange-100 text-orange-800',
      research: 'bg-indigo-100 text-indigo-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[docType as keyof typeof colors] || colors.other;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Back to Home */}
        <Link
          to="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Chat
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            {/* <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl mr-4 shadow-lg">
              <Scale className="h-10 w-10 text-white" />
            </div> */}
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-indigo-100 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">📁 Document Management</h2>
                <p className="text-gray-600">
                  Upload, analyze, and manage your legal documents with AI-powered insights
                </p>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
              >
                <Plus className="h-5 w-5" />
                <span>📤 Upload Document</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 font-medium">📊 Total Documents</p>
                    <p className="text-2xl font-bold text-blue-800">{totalDocuments}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 font-medium">✅ Processed</p>
                    <p className="text-2xl font-bold text-green-800">
                      {documents.filter((d) => d.status === 'Processed').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 font-medium">🔄 Processing</p>
                    <p className="text-2xl font-bold text-purple-800">
                      {documents.filter((d) => d.status === 'Processing').length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg border border-indigo-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-indigo-400" />
              <input
                type="text"
                placeholder="🔍 Search documents by title, description, or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 w-full border-2 border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gradient-to-r from-white to-indigo-50"
              />
            </div>
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-indigo-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="border-2 border-indigo-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gradient-to-r from-white to-indigo-50 font-medium"
              >
                <option value="All">🗂️ All Types</option>
                <option value="pdf">📄 PDFs</option>
                <option value="csv">📋CSVs</option>
              </select>
            </div>
          </div>
        </div>

        {/* Documents Table */}
        <div className="bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
                <span className="text-lg text-indigo-600 font-medium">🔄 Loading your documents...</span>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b-2 border-indigo-100">
                    <tr>
                      <th className="text-left py-4 px-6 font-semibold text-indigo-800">📄 Document</th>
                      <th className="text-left py-4 px-6 font-semibold text-indigo-800">🏷️ Type</th>
                      {/* <th className="text-left py-4 px-6 font-semibold text-indigo-800">📁 File</th>
                      <th className="text-left py-4 px-6 font-semibold text-indigo-800">📏 Size</th> */}
                      <th className="text-left py-4 px-6 font-semibold text-indigo-800">📅 Date</th>
                      <th className="text-left py-4 px-6 font-semibold text-indigo-800">⚡ Status</th>
                      <th className="text-left py-4 px-6 font-semibold text-indigo-800">🔧 Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-100">
                    {filteredDocuments.map((doc) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-2 rounded-lg">
                              <FileText className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <span className="text-gray-900 font-semibold">{doc.title}</span>
                              <p className="text-sm text-gray-500 mt-1">{doc.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getDocTypeColor(doc.doc_type)}`}
                          >
                            {doc.doc_type.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        {/* <td className="py-4 px-6 text-gray-600 font-medium">{doc.file_name}</td>
                        <td className="py-4 px-6 text-gray-600">{formatFileSize(doc.file_size)}</td> */}
                        <td className="py-4 px-6 text-gray-600">{formatDate(doc.upload_date ?? Date.now())}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 w-fit ${getStatusColor(
                              doc.status,
                            )}`}
                          >
                            {getStatusIcon(doc.status ?? 'Processed')}
                            <span>{doc.status ?? 'Processed'}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-800 p-2 rounded-lg hover:bg-indigo-50 transition-colors">
                              <Download className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(doc.id)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t-2 border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                  <div className="text-sm text-indigo-600 font-medium">
                    📊 Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalDocuments)}{' '}
                    of {totalDocuments} documents
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                          page === currentPage
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                            : 'text-indigo-600 hover:bg-indigo-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 text-indigo-600 hover:text-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {!loading && filteredDocuments.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-12 max-w-md mx-auto">
              <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <FileText className="h-12 w-12 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-3">
                {searchTerm || filter !== 'All' ? '🔍 No documents found' : '📁 No documents yet'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filter !== 'All'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Upload your first document to get started with AI-powered legal analysis'}
              </p>
              {!searchTerm && filter === 'All' && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 inline-flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  <Plus className="h-5 w-5" />
                  <span>🚀 Upload First Document</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default Dashboard;
