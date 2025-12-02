'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useAdminAuth } from '@/app/context/AdminAuthContext';

interface Document {
  id: number;
  document_type: string;
  document_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

const DOCUMENT_TYPES = [
  { value: 'SSN', label: 'Social Security Card', icon: '🆔' },
  { value: 'PASSPORT', label: 'Passport', icon: '🛂' },
  { value: 'DRIVERS_LICENSE', label: 'Driver\'s License', icon: '🚗' },
  { value: 'BIRTH_CERTIFICATE', label: 'Birth Certificate', icon: '📄' },
  { value: 'OTHER', label: 'Other Document', icon: '📋' }
];

export default function DocumentsPage() {
  const { user } = useAuth();
  const { admin } = useAdminAuth();
  const [participantId, setParticipantId] = useState('');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedType, setSelectedType] = useState('SSN');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customName, setCustomName] = useState('');
  const [editingDoc, setEditingDoc] = useState<number | null>(null);
  const [newName, setNewName] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      setParticipantId(user.id.toString());
      fetchDocuments(user.id.toString());
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h1>
          <p className="text-gray-600 mb-6">You need to login to access your documents</p>
          <a href="/login" className="inline-block py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
            Go to Login
          </a>
        </div>
      </section>
    );
  }

  const fetchDocuments = async (pid: string) => {
    if (!pid) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/documents/participant/${pid}`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        setMessage('Failed to load documents');
      }
    } catch (error) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage('Please select a file');
      return;
    }

    setUploading(true);
    setMessage('');

    // Create file with custom name if provided
    const fileName = customName.trim() || selectedFile.name;
    const file = new File([selectedFile], fileName, { type: selectedFile.type });

    const formData = new FormData();
    formData.append('participant_id', participantId);
    formData.append('document_type', selectedType);
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/api/v1/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setMessage('Document uploaded successfully!');
        setSelectedFile(null);
        setCustomName('');
        fetchDocuments(participantId);
      } else {
        setMessage('Upload failed');
      }
    } catch (error) {
      setMessage('Network error');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId: number, fileName: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/documents/download/${docId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      setMessage('Download failed');
    }
  };

  const openDeleteModal = (doc: Document) => {
    setDocToDelete(doc);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    setDeleting(true);

    try {
      const response = await fetch(`http://localhost:8000/api/v1/documents/${docToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage('Document deleted successfully!');
        setDocuments(docs => docs.filter(d => d.id !== docToDelete.id));
        setShowDeleteModal(false);
      } else {
        setMessage(`Delete failed: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage('Delete failed: Network error');
    } finally {
      setDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getDocumentIcon = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.icon || '📄';
  };

  const getDocumentLabel = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📁 My Documents</h1>
          <p className="text-gray-600 mb-6">Upload and manage your documents</p>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📤 Upload New Document</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Document Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  {DOCUMENT_TYPES.map(type => (
                    <option key={type.value} value={type.value} className="text-gray-900">
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Custom Name (Optional)</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g., My SSN Card"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select File</label>
                <label className="w-full cursor-pointer">
                  <input
                    type="file"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <div className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 transition bg-blue-50 hover:bg-blue-100 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm font-medium text-blue-700">
                      {selectedFile ? selectedFile.name : 'Choose File'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="mt-4 w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition shadow-md"
            >
              {uploading ? 'Uploading...' : '📤 Upload Document'}
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-lg text-sm font-medium mb-6 ${
              message.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {documents.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-4">📂 Your Documents ({documents.length})</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map(doc => (
                  <div key={doc.id} className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:shadow-lg transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{getDocumentIcon(doc.document_type)}</div>
                      {admin && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditingDoc(doc.id);
                              setNewName(doc.document_name);
                            }}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="Rename"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              openDeleteModal(doc);
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{getDocumentLabel(doc.document_type)}</h3>
                    {editingDoc === doc.id ? (
                      <div className="mb-2">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                          autoFocus
                        />
                        <div className="flex gap-1 mt-1">
                          <button
                            type="button"
                            onClick={async () => {
                              try {
                                const formData = new FormData();
                                formData.append('new_name', newName);
                                
                                const response = await fetch(`http://localhost:8000/api/v1/documents/${doc.id}/rename`, {
                                  method: 'PUT',
                                  body: formData
                                });
                                
                                if (response.ok) {
                                  setDocuments(docs => docs.map(d => 
                                    d.id === doc.id ? { ...d, document_name: newName } : d
                                  ));
                                  setMessage('Document renamed successfully!');
                                  setEditingDoc(null);
                                } else {
                                  setMessage('Rename failed');
                                }
                              } catch (error) {
                                setMessage('Rename failed: Network error');
                              }
                            }}
                            className="flex-1 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDoc(null)}
                            className="flex-1 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 mb-2 truncate" title={doc.document_name}>{doc.document_name}</p>
                    )}
                    <p className="text-xs text-gray-500 mb-3">{formatFileSize(doc.file_size)}</p>
                    <button
                      onClick={() => handleDownload(doc.id, doc.document_name)}
                      className="w-full py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition text-sm"
                    >
                      ⬇️ Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {documents.length === 0 && !loading && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No documents uploaded yet</p>
              <p className="text-sm">Upload your first document above</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && docToDelete && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">Delete Document?</h3>
            <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{getDocumentIcon(docToDelete.document_type)}</span>
                <div>
                  <h4 className="font-bold text-gray-800">{getDocumentLabel(docToDelete.document_type)}</h4>
                  <p className="text-sm text-gray-600">{docToDelete.document_name}</p>
                </div>
              </div>
            </div>
            <p className="text-gray-600 mb-6 text-center">This action cannot be undone. Are you sure you want to delete this document?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 py-3 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}