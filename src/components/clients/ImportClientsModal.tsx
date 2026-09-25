import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  FileText,
  Check,
  Search,
  Users,
  TrendingUp,
  Landmark,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Layers,
  Trash2,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useData } from '../../context/DataContext';
import { EraseImportedDataModal } from './EraseImportedDataModal';
import {
  parseExcelOrCsvFile,
  processParsedRows,
  calculateSummary,
  downloadSampleClientTemplate,
  CLIENT_IMPORT_FIELDS,
  ParseResult,
  ParsedClientRow,
} from '../../services/importService';
import { formatCurrency } from '../../utils/formatters';

interface ImportClientsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportClientsModal: React.FC<ImportClientsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { clients, plans, importClientsBulk } = useData();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Import Options
  const [updateExisting, setUpdateExisting] = useState(true);
  const [createInvestments, setCreateInvestments] = useState(true);
  const [createLoans, setCreateLoans] = useState(true);

  // Column Mapping state
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showAllFields, setShowAllFields] = useState(true);

  // Preview filtering
  const [previewFilter, setPreviewFilter] = useState<'ALL' | 'VALID' | 'DUPLICATES' | 'ERRORS'>('ALL');
  const [previewSearch, setPreviewSearch] = useState('');

  // Import Execution state
  const [isImporting, setIsImporting] = useState(false);
  const [eraseModalOpen, setEraseModalOpen] = useState(false);
  const [importStats, setImportStats] = useState<{
    importedCount: number;
    updatedCount: number;
    investmentsCount: number;
    loansCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setStep(1);
    setFile(null);
    setParseResult(null);
    setColumnMapping({});
    setImportStats(null);
    setPreviewFilter('ALL');
    setPreviewSearch('');
    setSelectedCategory('ALL');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile) return;

    const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExt || '')) {
      alert('Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file.');
      return;
    }

    setFile(selectedFile);
    setIsParsing(true);

    try {
      const res = await parseExcelOrCsvFile(selectedFile, clients);
      setParseResult(res);
      setColumnMapping(res.columnMapping);
      setStep(2);
    } catch (err: any) {
      console.error('Error parsing spreadsheet:', err);
      alert('Could not read spreadsheet: ' + (err.message || 'Unknown error. Check file format.'));
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Re-process rows when user edits column mapping
  const handleMappingChange = (targetKey: string, excelHeader: string) => {
    const updated = { ...columnMapping };
    if (!excelHeader) {
      delete updated[targetKey];
    } else {
      updated[targetKey] = excelHeader;
    }
    setColumnMapping(updated);

    if (parseResult) {
      const reprocessed = processParsedRows(
        parseResult.rows.map((r) => r.raw),
        updated,
        clients
      );
      const summary = calculateSummary(reprocessed);
      setParseResult({
        ...parseResult,
        columnMapping: updated,
        rows: reprocessed,
        summary,
      });
    }
  };

  const handleExecuteImport = async () => {
    if (!parseResult || !parseResult.rows.length) return;

    setIsImporting(true);
    setStep(4);

    try {
      const stats = await importClientsBulk(parseResult.rows, {
        updateExisting,
        createInvestments,
        createLoans,
      });
      setImportStats(stats);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Import error:', err);
      alert('Import failed: ' + (err.message || 'An error occurred during saving'));
    } finally {
      setIsImporting(false);
    }
  };

  // Filtered rows for Step 3 Preview
  const filteredPreviewRows = parseResult?.rows.filter((row) => {
    const query = previewSearch.toLowerCase().trim();
    const matchesQuery =
      !query ||
      row.data.name.toLowerCase().includes(query) ||
      row.data.phone.includes(query) ||
      (row.data.memberNumber && row.data.memberNumber.toLowerCase().includes(query)) ||
      (row.data.bishiGroupName && row.data.bishiGroupName.toLowerCase().includes(query)) ||
      (row.data.aadhaarNumber && row.data.aadhaarNumber.includes(query)) ||
      row.data.city.toLowerCase().includes(query) ||
      row.data.email.toLowerCase().includes(query);

    if (!matchesQuery) return false;

    if (previewFilter === 'VALID') return row.isValid && !row.isDuplicate;
    if (previewFilter === 'DUPLICATES') return row.isDuplicate;
    if (previewFilter === 'ERRORS') return !row.isValid;
    return true;
  }) || [];

  // Filtered fields for Step 2 Column Mapping
  const filteredFields = CLIENT_IMPORT_FIELDS.filter((f) => {
    if (selectedCategory !== 'ALL' && f.category !== selectedCategory) {
      return false;
    }
    return true;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Import Bhishi Excel / Spreadsheet
            </h3>
            <p className="text-xs text-slate-500">
              Bulk import all member records, installments, savings, and custom sheet fields into your website
            </p>
          </div>
        </div>
      }
      maxWidth="5xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {step > 1 && step < 4 && (
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => setStep((s) => (s - 1) as any)}
                disabled={isImporting}
              >
                Back
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 1 && (
              <Button variant="outline" size="sm" onClick={handleClose}>
                Cancel
              </Button>
            )}

            {step === 2 && (
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 shadow-fintech"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep(3)}
              >
                Review Data ({parseResult?.summary.valid || 0} Valid Members)
              </Button>
            )}

            {step === 3 && (
              <>
                <Button variant="outline" size="sm" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 shadow-fintech"
                  leftIcon={<Upload className="w-4 h-4" />}
                  onClick={handleExecuteImport}
                  disabled={!parseResult?.summary.valid}
                >
                  Import {parseResult?.summary.valid || 0} Members & Portfolios
                </Button>
              </>
            )}

            {step === 4 && (
              <Button
                variant="primary"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleClose}
              >
                Done
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="grid grid-cols-4 gap-2 border-b border-slate-100 pb-4">
          {[
            { num: 1, label: 'Upload Sheet' },
            { num: 2, label: 'Match Fields' },
            { num: 3, label: 'Preview All Data' },
            { num: 4, label: 'Finished' },
          ].map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div
                key={s.num}
                className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all ${
                  isCurrent
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm'
                    : isCompleted
                    ? 'text-emerald-700 bg-slate-50'
                    : 'text-slate-400 bg-transparent'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                    isCurrent
                      ? 'bg-emerald-600 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className="truncate hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* STEP 1: Upload File & Template Download */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Existing Data Notice */}
            {clients.some((c) => c.monthlyLedger?.length || c.bishiGroupName || c.notes?.includes('Excel') || c.srNo !== undefined) && (
              <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-900 block">Existing Imported Records Detected</span>
                    <p className="text-amber-800 text-[11px]">
                      You currently have spreadsheet member records in your system. You can erase them before re-importing or merge new rows.
                    </p>
                  </div>
                </div>

                <Button
                  size="xs"
                  variant="outline"
                  className="bg-white border-amber-300 text-amber-900 hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300 shrink-0"
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
                  onClick={() => setEraseModalOpen(true)}
                >
                  Erase Previous Data
                </Button>
              </div>
            )}

            {/* Template Download Banner */}
            <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-100/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Need an Excel Format Template?
                  </h4>
                  <p className="text-xs text-slate-600 mt-0.5 max-w-lg">
                    Download our ready-made Bhishi template with pre-configured column headers for Member No, Aadhaar, Hfta, Total Paid, and Savings records.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-50 shadow-xs"
                  leftIcon={<Download className="w-4 h-4 text-emerald-600" />}
                  onClick={() => downloadSampleClientTemplate('xlsx')}
                >
                  Download Excel (.xlsx)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
                  onClick={() => downloadSampleClientTemplate('csv')}
                >
                  CSV
                </Button>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
                  : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/80'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />

              <div className="w-16 h-16 rounded-2xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shadow-fintech mb-1">
                {isParsing ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>

              <div>
                <p className="text-base font-bold text-slate-800">
                  {isParsing ? 'Reading and parsing your Excel sheet...' : 'Click to browse or drag & drop your Excel file'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports Microsoft Excel (.xlsx, .xls) and Comma-Separated Values (.csv)
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  ⚡ Auto-maps Marathi & English column headers
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  🛡️ Duplicate check by mobile phone
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
                  📦 Preserves 100% of custom Excel columns
                </span>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-emerald-600" />
                Helpful Tips for Excel Import:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-500 pl-1">
                <li>
                  <strong className="text-slate-700">Full Name (नाव)</strong> and <strong className="text-slate-700">Mobile Phone (मोबाईल)</strong> are the only mandatory columns.
                </li>
                <li>
                  Columns for <strong className="text-slate-700">Member No, Monthly Hfta, Months Paid, Total Paid, Aadhaar, PAN</strong>, and Bank details are automatically recognized and mapped.
                </li>
                <li>
                  Any other extra columns in your Excel sheet (e.g. Witness, Receipts, Cheque No, Notes) are <strong className="text-indigo-700">automatically saved into custom member attributes</strong> so nothing is left behind!
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* STEP 2: Column Mapping & Settings */}
        {step === 2 && parseResult && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Sheet Summary */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  XLSX
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    {file?.name}
                    <span className="text-xs font-normal text-slate-500">
                      ({parseResult.rawRowsCount} rows found)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Sheet: <span className="font-semibold text-slate-700">{parseResult.activeSheet}</span> •{' '}
                    {Object.keys(columnMapping).length} columns auto-mapped •{' '}
                    {parseResult.headers.length - Object.keys(columnMapping).length} dynamic custom columns
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => {
                  const auto = parseExcelOrCsvFile(file!, clients);
                  auto.then((res) => {
                    setColumnMapping(res.columnMapping);
                    setParseResult(res);
                  });
                }}
              >
                Reset Mappings
              </Button>
            </div>

            {/* Options Toggle Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Import Preferences
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={updateExisting}
                    onChange={(e) => setUpdateExisting(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Update Existing Members</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      If mobile number exists, merge and update member fields
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={createInvestments}
                    onChange={(e) => setCreateInvestments(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Create Investment Portfolios</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Auto-create active investment if deposit / hfta is present
                    </div>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50/80 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={createLoans}
                    onChange={(e) => setCreateLoans(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-800">Create Loan Portfolios</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Auto-create loan & EMI schedule if loan amount is present
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Column Mapping Section with Category Pills */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Column Mapping ({Object.keys(columnMapping).length} Mapped)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Match fields in your spreadsheet to system fields. Unmapped columns are automatically saved into Custom Attributes.
                  </p>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                  {['ALL', 'Bhishi / Group', 'Core', 'Financial & ID', 'Bank & Nominee', 'Address'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[360px] overflow-y-auto">
                {filteredFields.map((field) => {
                  const mappedHeader = columnMapping[field.key] || '';
                  const isMapped = Boolean(mappedHeader);

                  return (
                    <div
                      key={field.key}
                      className={`p-3 rounded-xl border transition-all ${
                        isMapped
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : field.required
                          ? 'border-rose-200 bg-rose-50/20'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          {field.label}
                          {field.required && (
                            <span className="text-rose-500 font-black">* Required</span>
                          )}
                        </label>
                        {isMapped ? (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Check className="w-3 h-3" /> Mapped
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400">
                            Auto / Unmapped
                          </span>
                        )}
                      </div>

                      <select
                        value={mappedHeader}
                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                        className={`w-full text-xs rounded-lg border px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                          isMapped
                            ? 'border-emerald-300 text-slate-800 font-medium'
                            : field.required
                            ? 'border-rose-300 text-slate-400'
                            : 'border-slate-200 text-slate-500'
                        }`}
                      >
                        <option value="">-- Save as Custom Field / Do Not Map --</option>
                        {parseResult.headers.map((h) => (
                          <option key={h} value={h}>
                            Excel: "{h}"
                          </option>
                        ))}
                      </select>
                      {field.description && (
                        <p className="text-[10px] text-slate-400 mt-1">{field.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Preview & Validation Table */}
        {step === 3 && parseResult && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-600" /> Total Members
                </div>
                <div className="text-xl font-black text-slate-900 mt-1">
                  {parseResult.summary.total}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Ready to Import
                </div>
                <div className="text-xl font-black text-emerald-800 mt-1">
                  {parseResult.summary.valid}
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl">
                <div className="text-xs text-indigo-700 font-medium flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Total Monthly Hfta
                </div>
                <div className="text-xl font-black text-indigo-800 mt-1">
                  {formatCurrency(parseResult.summary.totalMonthlyInstallments)}
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Existing in System
                </div>
                <div className="text-xl font-black text-amber-800 mt-1">
                  {parseResult.summary.duplicates}
                </div>
              </div>
            </div>

            {/* Preview Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { key: 'ALL', label: `All (${parseResult.summary.total})` },
                  { key: 'VALID', label: `New (${parseResult.summary.valid - parseResult.summary.duplicates})` },
                  { key: 'DUPLICATES', label: `Existing (${parseResult.summary.duplicates})` },
                  { key: 'ERRORS', label: `Errors (${parseResult.summary.errors})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setPreviewFilter(tab.key as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                      previewFilter === tab.key
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="w-full sm:w-72">
                <Input
                  placeholder="Search name, phone, member no, aadhaar..."
                  leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Preview Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-[340px] overflow-y-auto bg-white shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-3 font-bold text-slate-700">#</th>
                    <th className="p-3 font-bold text-slate-700">Status</th>
                    <th className="p-3 font-bold text-slate-700">Member No & Name</th>
                    <th className="p-3 font-bold text-slate-700">Mobile & Aadhaar</th>
                    <th className="p-3 font-bold text-slate-700">Monthly Hfta (हप्ता)</th>
                    <th className="p-3 font-bold text-slate-700">Paid Months</th>
                    <th className="p-3 font-bold text-slate-700">Total Paid</th>
                    <th className="p-3 font-bold text-slate-700">Balance Due</th>
                    <th className="p-3 font-bold text-slate-700">Custom Columns</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPreviewRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        No rows found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPreviewRows.map((row) => {
                      const customCount = Object.keys(row.data.customFields || {}).length;
                      return (
                        <tr
                          key={row.rowIndex}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            !row.isValid ? 'bg-rose-50/30' : row.isDuplicate ? 'bg-amber-50/20' : ''
                          }`}
                        >
                          <td className="p-3 text-slate-400 font-mono text-[11px]">
                            {row.data.srNo || row.rowIndex}
                          </td>
                          <td className="p-3">
                            {!row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                                <XCircle className="w-3 h-3" /> Error
                              </span>
                            ) : row.isDuplicate ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                                <AlertTriangle className="w-3 h-3" /> Existing
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                                <CheckCircle2 className="w-3 h-3" /> Ready
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5">
                              <div className="font-bold text-slate-800">{row.data.name || '—'}</div>
                              {row.data.memberNumber && (
                                <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                  {row.data.memberNumber}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {row.data.bishiGroupName || 'साई बीशी मंडळ'} • {row.data.city}
                            </div>
                            {row.warnings.length > 0 && (
                              <div className="text-[10px] text-amber-600 mt-0.5">
                                {row.warnings[0]}
                              </div>
                            )}
                            {row.errors.length > 0 && (
                              <div className="text-[10px] text-rose-600 font-medium mt-0.5">
                                {row.errors[0]}
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-mono text-slate-700">
                            <div className="font-medium">{row.data.phone || '—'}</div>
                            {row.data.aadhaarNumber && (
                              <div className="text-[10px] text-slate-400">UID: {row.data.aadhaarNumber}</div>
                            )}
                          </td>
                          <td className="p-3 font-bold text-emerald-700">
                            {row.data.monthlyInstallment
                              ? formatCurrency(row.data.monthlyInstallment)
                              : '—'}
                          </td>
                          <td className="p-3 text-slate-700">
                            {row.data.monthsPaid || 0} / {row.data.totalMonths || 12}
                          </td>
                          <td className="p-3 font-medium text-emerald-700">
                            {row.data.totalPaid ? formatCurrency(row.data.totalPaid) : '—'}
                          </td>
                          <td className="p-3 font-medium text-slate-800">
                            {row.data.balanceAmount ? formatCurrency(row.data.balanceAmount) : '—'}
                          </td>
                          <td className="p-3">
                            {customCount > 0 ? (
                              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100" title={Object.keys(row.data.customFields).join(', ')}>
                                {customCount} custom fields
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* STEP 4: Success & Result Summary */}
        {step === 4 && (
          <div className="py-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            {isImporting ? (
              <div className="space-y-4 py-8">
                <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">
                  Importing Bhishi Records...
                </h3>
                <p className="text-xs text-slate-500">
                  Saving members, initializing portfolios, and syncing with cloud database...
                </p>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-fintech border-2 border-emerald-200">
                  <Sparkles className="w-8 h-8" />
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    Import Completed Successfully!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    All Bhishi members, monthly contributions, and custom sheet columns have been saved into the CRM.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-[11px] text-slate-500 font-medium">New Members Added</div>
                    <div className="text-xl font-black text-emerald-700 mt-1">
                      {importStats?.importedCount || 0}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-[11px] text-slate-500 font-medium">Members Updated</div>
                    <div className="text-xl font-black text-amber-700 mt-1">
                      {importStats?.updatedCount || 0}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-[11px] text-slate-500 font-medium">Investments Created</div>
                    <div className="text-xl font-black text-indigo-700 mt-1">
                      {importStats?.investmentsCount || 0}
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="text-[11px] text-slate-500 font-medium">Loans Created</div>
                    <div className="text-xl font-black text-purple-700 mt-1">
                      {importStats?.loansCount || 0}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <EraseImportedDataModal
        isOpen={eraseModalOpen}
        onClose={() => setEraseModalOpen(false)}
      />
    </Modal>
  );
};
