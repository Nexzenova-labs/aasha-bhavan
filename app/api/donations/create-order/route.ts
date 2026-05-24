import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { amount, cause, frequency, donorName, donorEmail, donorPhone } = await req.json();

    const Razorpay = (await import('razorpay')).default;
    const rzp = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    if (!amount || amount < 100) {
      return NextResponse.json({ error: 'Minimum donation is ₹1' }, { status: 400 });
    }

    const order = await rzp.orders.create({
      amount: amount * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `AB-${Date.now()}`,
      notes: {
        cause: cause || 'Where needed most',
        frequency: frequency || 'one-time',
        donor_name: donorName || '',
        donor_email: donorEmail || '',
        donor_phone: donorPhone || '',
      },
    });

    return NextResponse.json({ id: order.id, amount: order.amount, currency: order.currency });
  } catch (err: unknown) {
    console.error('create-order error:', err);
    const msg = err instanceof Error ? err.message : 'Order creation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
