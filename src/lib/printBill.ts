const RECEIPT_PRINT_STYLES = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', system-ui, sans-serif;
    font-size: 12px;
    line-height: 1.4;
    color: #000;
    max-width: 80mm;
    margin: 0 auto;
    padding: 8px;
  }
  .bill-receipt { width: 100%; }
  .bill-receipt > * + * { margin-top: 10px; }
  .text-center { text-align: center; }
  .font-bold { font-weight: 700; }
  .text-base { font-size: 14px; }
  .text-xs { font-size: 11px; }
  .space-y-0\\.5 > * + * { margin-top: 2px; }
  .space-y-1 > * + * { margin-top: 4px; }
  .space-y-3 > * + * { margin-top: 12px; }
  .border-b, .border-t { border-color: #999; }
  .border-b { border-bottom: 1px dashed #999; padding-bottom: 10px; }
  .border-t { border-top: 1px dashed #999; padding-top: 8px; }
  .pb-3 { padding-bottom: 10px; }
  .pt-2 { padding-top: 8px; }
  .flex { display: flex; }
  .justify-between { justify-content: space-between; }
  .gap-2 { gap: 8px; }
  .min-w-0 { min-width: 0; }
  .flex-1 { flex: 1; }
  .shrink-0 { flex-shrink: 0; }
  .text-slate-600, .text-slate-500 { color: #444; }
`;

export function printBillReceipt(receiptHtml: string, billNo: string): void {
  const printWindow = window.open('', '_blank', 'width=400,height=700');
  if (!printWindow) {
    window.alert('Please allow pop-ups to print the bill.');
    return;
  }

  printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Bill ${billNo}</title>
    <style>${RECEIPT_PRINT_STYLES}</style>
  </head>
  <body>${receiptHtml}</body>
</html>`);
  printWindow.document.close();
  printWindow.focus();

  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };

  // Fallback if onload does not fire
  setTimeout(() => {
    if (!printWindow.closed) {
      printWindow.print();
      printWindow.close();
    }
  }, 300);
}
