import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateReceipt({
  donorName, donorEmail, amount, cause, paymentId, date, panNumber,
}: {
  donorName: string; donorEmail: string; amount: number; cause: string;
  paymentId: string; date: string; panNumber?: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);

  const saffron = rgb(0.91, 0.525, 0.039);
  const dark = rgb(0.165, 0.157, 0.361);
  const gray = rgb(0.612, 0.596, 0.565);
  const black = rgb(0.165, 0.157, 0.141);

  // Header background
  page.drawRectangle({ x: 0, y: height - 120, width, height: 120, color: dark });

  // Org name
  page.drawText('AASHA BHAVAN', {
    x: 40, y: height - 52,
    size: 22, font: helveticaBold, color: rgb(1, 1, 1),
  });
  page.drawText('Home of Hope · Hyderabad, Telangana', {
    x: 40, y: height - 72,
    size: 11, font: helvetica, color: rgb(0.808, 0.792, 0.965),
  });
  page.drawText('Est. 2008 | NGO Reg: AP/2008/0XXXXX', {
    x: 40, y: height - 90,
    size: 10, font: helvetica, color: rgb(0.808, 0.792, 0.965),
  });

  // Title
  page.drawText('DONATION RECEIPT (80G)', {
    x: 40, y: height - 150,
    size: 16, font: helveticaBold, color: dark,
  });
  page.drawLine({ start: { x: 40, y: height - 162 }, end: { x: width - 40, y: height - 162 }, thickness: 1, color: saffron });

  // Receipt details
  const rows: [string, string][] = [
    ['Receipt No.', `AB-${Date.now().toString().slice(-8)}`],
    ['Date', date],
    ['Donor Name', donorName],
    ['Donor Email', donorEmail],
    ...(panNumber ? [['PAN', panNumber] as [string, string]] : []),
    ['Donation Amount', `INR ${(amount / 100).toLocaleString('en-IN')} (${amountInWords(amount / 100)} Only)`],
    ['Purpose', cause],
    ['Payment ID', paymentId],
    ['Payment Method', 'Online (Razorpay)'],
    ['80G Reg. No.', 'AAATA0000A/2021-22'],
    ['FCRA No.', '010XXXXXX'],
  ];

  let y = height - 200;
  rows.forEach(([label, value]) => {
    page.drawText(label + ':', { x: 40, y, size: 11, font: helveticaBold, color: gray });
    page.drawText(value, { x: 200, y, size: 11, font: helvetica, color: black });
    y -= 26;
  });

  // Certification
  y -= 20;
  page.drawRectangle({ x: 40, y: y - 52, width: width - 80, height: 70, color: rgb(0.996, 0.976, 0.886), borderColor: saffron, borderWidth: 1 });
  page.drawText('Certified that the above donation is used exclusively for charitable purposes.', {
    x: 52, y: y - 20, size: 10, font: helvetica, color: black,
  });
  page.drawText('Donations made are eligible for 50% deduction under Section 80G of the Income Tax Act, 1961.', {
    x: 52, y: y - 36, size: 10, font: helvetica, color: black,
  });

  // Signature line
  page.drawLine({ start: { x: 40, y: 120 }, end: { x: 200, y: 120 }, thickness: 1, color: gray });
  page.drawText('Authorised Signatory', { x: 40, y: 104, size: 10, font: helvetica, color: gray });
  page.drawText('Aasha Bhavan, Hyderabad', { x: 40, y: 88, size: 10, font: helvetica, color: gray });

  // Footer
  page.drawText('Plot 47, Banjara Hills Road No.12, Hyderabad - 500034 | care@aashabhavanhyderabad.org | +91 98480 XXXXX', {
    x: 40, y: 40, size: 8, font: helvetica, color: gray,
  });

  return doc.save();
}

function amountInWords(n: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  if (n === 0) return 'Zero';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + amountInWords(n % 100) : '');
  if (n < 100000) return amountInWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + amountInWords(n % 1000) : '');
  if (n < 10000000) return amountInWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + amountInWords(n % 100000) : '');
  return amountInWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + amountInWords(n % 10000000) : '');
}
