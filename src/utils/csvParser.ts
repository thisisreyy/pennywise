import { Transaction } from '../types';

export interface CSVParseResult {
  transactions: Transaction[];
  errors: string[];
  skipped: number;
}

export const parseCSV = (csvContent: string): CSVParseResult => {
  const lines = csvContent.trim().split('\n');
  const transactions: Transaction[] = [];
  const errors: string[] = [];
  let skipped = 0;

  if (lines.length === 0) {
    return { transactions, errors: ['CSV file is empty'], skipped };
  }

  // Skip header if present
  const startIndex = lines[0].toLowerCase().includes('date') || 
                    lines[0].toLowerCase().includes('amount') || 
                    lines[0].toLowerCase().includes('description') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const columns = parseCSVLine(line);
      
      if (columns.length < 3) {
        errors.push(`Line ${i + 1}: Not enough columns (expected at least 3: date, amount, description)`);
        skipped++;
        continue;
      }

      const [dateStr, amountStr, description, category = 'Other'] = columns;
      
      // Parse date
      const date = parseDate(dateStr);
      if (!date) {
        errors.push(`Line ${i + 1}: Invalid date format "${dateStr}"`);
        skipped++;
        continue;
      }

      // Parse amount
      const amount = parseAmount(amountStr);
      if (amount === null) {
        errors.push(`Line ${i + 1}: Invalid amount "${amountStr}"`);
        skipped++;
        continue;
      }

      transactions.push({
        id: `csv-${Date.now()}-${i}`,
        date: date.toISOString().split('T')[0],
        amount: Math.abs(amount),
        description: description.trim(),
        category: category.trim() || 'Other',
        type: amount < 0 ? 'expense' : 'income'
      });

    } catch (error) {
      errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      skipped++;
    }
  }

  return { transactions, errors, skipped };
};

const parseCSVLine = (line: string): string[] => {
  const columns: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      columns.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  columns.push(current);
  return columns.map(col => col.replace(/^"|"$/g, ''));
};

const parseDate = (dateStr: string): Date | null => {
  const cleanStr = dateStr.trim();
  
  // Try different date formats
  const formats = [
    /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
    /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
    /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
    /^\d{2}\/\d{2}\/\d{2}$/, // MM/DD/YY
  ];

  for (const format of formats) {
    if (format.test(cleanStr)) {
      const date = new Date(cleanStr);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
};

const parseAmount = (amountStr: string): number | null => {
  const cleanStr = amountStr.trim().replace(/[$,]/g, '');
  const num = parseFloat(cleanStr);
  return isNaN(num) ? null : num;
};