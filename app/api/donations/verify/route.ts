import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const {
      razorpay_payment_id, razorpay_order_id, razorpay_signature,
      orderId, amount, cause, frequency, donorName, donorEmail, donorPhone,
    } = await req.json();

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (expectedSig !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const { createAdminClient } = await import('@/lib/supabase-admin');
    const { format } = await import('date-fns');
    const supabase = createAdminClient();
    const dateStr = format(new Date(), 'dd MMM yyyy');

    // Generate 80G receipt PDF
    let receiptUrl: string | undefined;
    try {
      const { generateReceipt } = await import('@/lib/pdf-receipt');
      const pdfBytes = await generateReceipt({
        donorName: donorName || 'Donor',
        donorEmail: donorEmail || '',
        amount: amount * 100,
        cause: cause || 'Where needed most',
        paymentId: razorpay_payment_id,
        date: dateStr,
      });

      const { data: uploadData } = await supabase.storage
        .from('receipts')
        .upload(`${razorpay_payment_id}.pdf`, pdfBytes, { contentType: 'application/pdf' });

      if (uploadData) {
        const { data: urlData } = supabase.storage.from('receipts').getPublicUrl(uploadData.path);
        receiptUrl = urlData.publicUrl;
      }
    } catch (pdfErr) {
      console.error('PDF generation error:', pdfErr);
    }

    // Save donation to database
    const { data: donation, error: dbError } = await supabase.from('donations').insert({
      donor_name: donorName || null,
      donor_email: donorEmail || null,
      donor_phone: donorPhone || null,
      amount_paise: amount * 100,
      cause: cause || 'general',
      frequency: frequency || 'one-time',
      razorpay_payment_id,
      razorpay_order_id,
      payment_status: 'paid',
      receipt_80g_url: receiptUrl || null,
      receipt_sent: false,
    }).select().single();

    if (dbError) console.error('DB insert error:', dbError);

    // Log activity
    await supabase.from('activity_feed').insert({
      type: 'donation',
      message: `${donorName || 'Someone'} donated ₹${amount.toLocaleString('en-IN')} for ${cause || 'general'}`,
      icon: '❤️',
      color_type: 'k',
    });

    // Send email receipt
    if (donorEmail) {
      try {
        const { sendDonationReceipt } = await import('@/lib/email');
        await sendDonationReceipt({
          to: donorEmail,
          name: donorName || 'Donor',
          amount: amount * 100,
          cause: cause || 'general',
          paymentId: razorpay_payment_id,
          date: dateStr,
          receiptUrl,
        });

        if (donation) {
          await supabase.from('donations').update({ receipt_sent: true }).eq('id', donation.id);
        }
      } catch (emailErr) {
        console.error('Email send error:', emailErr);
      }
    }

    return NextResponse.json({ success: true, donationId: donation?.id, receiptUrl });
  } catch (err: unknown) {
    console.error('verify error:', err);
    const msg = err instanceof Error ? err.message : 'Verification failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
