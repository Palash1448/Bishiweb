import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { DocumentType } from '../types';
import { formatDate } from '../utils/formatters';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/common/EmptyState';
import {
  FileText,
  Search,
  Plus,
  ExternalLink,
  Trash2,
  FileCheck,
  Building2,
  CreditCard,
} from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const { documents, clients, uploadDocument, deleteDocument } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Form State
  const [fileName, setFileName] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [docType, setDocType] = useState<DocumentType>('AADHAAR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        doc.fileName.toLowerCase().includes(query) ||
        (doc.clientName && doc.clientName.toLowerCase().includes(query)) ||
        (doc.clientId && doc.clientId.toLowerCase().includes(query));

      const matchesType = typeFilter === 'ALL' || doc.documentType === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [documents, searchQuery, typeFilter]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    setIsSubmitting(true);
    const client = clients.find((c) => c.id === clientId);

    await uploadDocument({
      fileName,
      fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      fileSize: Math.floor(1000000 + Math.random() * 2000000),
      fileType: 'application/pdf',
      documentType: docType,
      clientId,
      clientName: client?.name,
    });

    setIsSubmitting(false);
    setFileName('');
    setUploadModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-emerald-600" /> Secure Documents Vault
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise cloud document storage for client KYC identities, bank proofs, and signed credit agreements
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setUploadModalOpen(true)}
        >
          Upload Document
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-fintech grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Search document name, client name, or ID..."
          leftIcon={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Document Categories' },
            { value: 'AADHAAR', label: 'Aadhaar Cards' },
            { value: 'PAN', label: 'PAN Cards' },
            { value: 'INCOME_PROOF', label: 'Income Proofs (Salary/ITR)' },
            { value: 'BANK_PROOF', label: 'Bank Statements' },
            { value: 'LOAN_AGREEMENT', label: 'Loan Agreements' },
            { value: 'OTHER', label: 'Other Misc Files' },
          ]}
        />
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-3">
            <EmptyState
              icon={<FileText className="w-8 h-8" />}
              title="No Documents Found"
              description="Upload customer KYC documents or agreements to store them securely."
              actionLabel="Upload New Document"
              onAction={() => setUploadModalOpen(true)}
            />
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-fintech flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                      {doc.fileName}
                    </h4>
                    <span className="text-[11px] font-bold text-emerald-700 block mt-0.5">
                      {doc.documentType.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1 text-slate-600">
                  {doc.clientName && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Client:</span>
                      <strong className="text-slate-900 truncate max-w-[150px]">
                        {doc.clientName} ({doc.clientId})
                      </strong>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">File Size:</span>
                    <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB (PDF)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Uploaded:</span>
                    <span>{formatDate(doc.uploadedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">By:</span>
                    <span>{doc.uploadedBy}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1"
                >
                  <span>Preview & Download</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Client Document"
        subtitle="Upload to secure Firebase storage vault"
        maxWidth="md"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <Input
            label="Document File Name"
            required
            placeholder="e.g. Rahul_Patil_PAN_Card.pdf"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />

          <Select
            label="Link to Client"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id})
              </option>
            ))}
          </Select>

          <Select
            label="Document Type / Category"
            value={docType}
            onChange={(e) => setDocType(e.target.value as DocumentType)}
            options={[
              { value: 'AADHAAR', label: 'Aadhaar Identity Proof' },
              { value: 'PAN', label: 'PAN Card Tax Proof' },
              { value: 'INCOME_PROOF', label: 'Income / Salary Statement / ITR' },
              { value: 'BANK_PROOF', label: 'Bank Statement / Passbook' },
              { value: 'LOAN_AGREEMENT', label: 'Signed Loan Sanction Agreement' },
              { value: 'OTHER', label: 'Other Proof Document' },
            ]}
          />

          <div className="p-4 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50/50">
            <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1" />
            <p className="text-xs font-semibold text-slate-700">Drag and drop file here or click to browse</p>
            <p className="text-[10px] text-slate-400 mt-0.5">PDF, PNG, JPG up to 10MB</p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Upload to Vault
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
