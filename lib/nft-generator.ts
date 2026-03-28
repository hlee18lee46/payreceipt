import { createCanvas } from 'canvas';

export async function generateReceiptImage(invoice: any) {
  const width = 600;
  const height = 800;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 1. Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. Border
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 20;
  ctx.strokeRect(0, 0, width, height);

  // 3. Header
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 40px Courier';
  ctx.fillText('OFFICIAL RECEIPT', 120, 100);
  ctx.fillRect(50, 120, 500, 2);

  // 4. Invoice Details
  ctx.font = '20px Courier';
  ctx.fillText(`INVOICE ID: ${invoice._id.toString().slice(-8).toUpperCase()}`, 50, 180);
  ctx.fillText(`DATE: ${new Date().toLocaleDateString()}`, 50, 220);
  
  ctx.font = 'bold 30px Courier';
  ctx.fillText(`CUSTOMER: ${invoice.customerName}`, 50, 300);
  
  // 5. Amount (Big and Bold)
  ctx.font = 'bold 60px Courier';
  ctx.fillText(`${invoice.amount} TRX`, 50, 450);

  // 6. Footer / Verification
  ctx.font = 'italic 14px Courier';
  ctx.fillStyle = '#888888';
  ctx.fillText('Verified by ReceiptPay on TRON Nile', 50, 750);

  // Return as a Buffer
  return canvas.toBuffer('image/png');
}