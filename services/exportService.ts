import { Product } from '../types';

export const exportProductsToCSV = (products: Product[]) => {
  const headers = [
    'ID',
    'Name',
    'Category',
    'Description',
    'Price (BDT)',
    'Stock',
    'New Arrival',
    'In Stock',
    'Sizes',
    'Colors',
    'Created At'
  ];

  const rows = products.map(p => {
    // Escape double quotes in text fields
    const escape = (text: any) => {
      if (text === undefined || text === null) return '""';
      const str = String(text).replace(/"/g, '""');
      return `"${str}"`;
    };

    return [
      escape(p.id),
      escape(p.name),
      escape(p.category),
      escape(p.description),
      escape(p.price),
      escape(p.stock),
      escape(p.isNew),
      escape(p.inStock),
      escape((p.sizes || []).join(', ')),
      escape((p.colors || []).join(', ')),
      escape(p.created_at)
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `putimach_inventory_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};