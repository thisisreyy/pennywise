import React, { useState, useCallback } from 'react';
import { Upload, FileText, Check, X, AlertCircle, Download } from 'lucide-react';
import { parseCSV } from '../utils/csvParser';
import { Transaction } from '../types';

interface CSVUploadProps {
  onImport: (transactions: Transaction[]) => void;
}

const CSVUpload: React.FC<CSVUploadProps> = ({ onImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [parseResult, setParseResult] = useState<any>(null);
  const [previewTransactions, setPreviewTransactions] = useState<Transaction[]>([]);

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
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please select a CSV file');
      return;
    }

    setUploading(true);
    
    try {
      const text = await file.text();
      const result = parseCSV(text);
      setParseResult(result);
      setPreviewTransactions(result.transactions);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      alert('Error parsing CSV file. Please check the format and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleImport = () => {
    if (previewTransactions.length > 0) {
      onImport(previewTransactions);
      setParseResult(null);
      setPreviewTransactions([]);
    }
  };

  const handleReset = () => {
    setParseResult(null);
    setPreviewTransactions([]);
  };

  const downloadTemplate = () => {
    const csvContent = [
      'Date,Amount,Description,Category',
      '2024-01-15,-25.50,Coffee shop,Food & Dining',
      '2024-01-16,-120.00,Grocery shopping,Food & Dining',
      '2024-01-17,2500.00,Salary,Other',
      '2024-01-18,-45.00,Gas station,Transportation'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expense_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (parseResult) {
    return (
      <div className="space-y-6">
        {/* Import Summary */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Import Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
              <Check className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">{parseResult.transactions.length}</div>
              <div className="text-sm text-green-300">Successfully parsed</div>
            </div>
            
            {parseResult.errors.length > 0 && (
              <div className="text-center p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <X className="w-8 h-8 text-red-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-400">{parseResult.errors.length}</div>
                <div className="text-sm text-red-300">Errors</div>
              </div>
            )}
            
            {parseResult.skipped > 0 && (
              <div className="text-center p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-400">{parseResult.skipped}</div>
                <div className="text-sm text-yellow-300">Skipped</div>
              </div>
            )}
          </div>

          {/* Errors */}
          {parseResult.errors.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-white mb-3">Errors</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {parseResult.errors.map((error: string, index: number) => (
                  <div key={index} className="text-sm text-red-300 bg-red-500/10 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              onClick={handleImport}
              disabled={previewTransactions.length === 0}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Import {previewTransactions.length} Transactions
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Preview */}
        {previewTransactions.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {previewTransactions.slice(0, 10).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                  <div>
                    <div className="font-medium text-white">{transaction.description}</div>
                    <div className="text-sm text-gray-400">
                      {transaction.category} • {transaction.date}
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.type === 'expense' ? 'text-red-400' : 'text-green-400'}`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
              {previewTransactions.length > 10 && (
                <div className="text-center text-gray-400 py-2">
                  ... and {previewTransactions.length - 10} more transactions
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Import Transactions</h2>
        <div className="space-y-4">
          <p className="text-gray-300">
            Upload a CSV file to import your transactions. Your CSV should have the following columns:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-1">
            <li><strong>Date:</strong> Transaction date (YYYY-MM-DD, MM/DD/YYYY, etc.)</li>
            <li><strong>Amount:</strong> Transaction amount (negative for expenses, positive for income)</li>
            <li><strong>Description:</strong> Transaction description</li>
            <li><strong>Category:</strong> Transaction category (optional, defaults to "Other")</li>
          </ul>
          <div className="flex items-center space-x-4">
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </button>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-gray-600 bg-gray-800'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        
        <div className="space-y-4">
          {uploading ? (
            <>
              <div className="animate-spin w-12 h-12 border-4 border-gray-600 border-t-blue-400 rounded-full mx-auto"></div>
              <p className="text-gray-300">Processing your CSV file...</p>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                {dragActive ? (
                  <FileText className="w-12 h-12 text-blue-400" />
                ) : (
                  <Upload className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-2">
                  {dragActive ? 'Drop your CSV file here' : 'Drag and drop your CSV file here'}
                </p>
                <p className="text-gray-400">
                  or click to browse and select a file
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CSVUpload;