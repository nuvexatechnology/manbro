import jsPDF from "jspdf";
import QRCode from "qrcode";
import { Order } from "@/types/store";
import { formatCurrency, formatDate } from "@/lib/utils";

export async function generateOrderInvoicePdf(order: Order, download: boolean = true): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // ~210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // ~297 mm

  // 1. Generate QR Code Data (Embedded Product Details & Tracking URL)
  const itemsText = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. ${item.product.name} [Size: ${item.selectedSize}, Color: ${item.selectedColor.name}] x${item.quantity} = ₹${(
          (item.product.price || 0) * item.quantity
        ).toFixed(2)}`
    )
    .join("\n");

  const qrDataPayload = JSON.stringify({
    orderId: order.id,
    date: order.createdAt,
    customer: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
    phone: order.shippingAddress.phone,
    city: order.shippingAddress.city,
    total: `INR ${order.total}`,
    itemsCount: order.items.length,
    items: order.items.map((i) => ({
      name: i.product.name,
      size: i.selectedSize,
      color: i.selectedColor.name,
      qty: i.quantity,
      price: i.product.price,
    })),
    trackingUrl: `http://localhost:3002/track?orderId=${encodeURIComponent(order.id)}`,
  });

  const qrDataUrl = await QRCode.toDataURL(qrDataPayload, {
    margin: 1,
    width: 250,
    color: {
      dark: "#091D12",
      light: "#FFFFFF",
    },
  });

  // --- PDF STYLING & DESIGN ---

  // Top Luxury Header Banner (Dark Forest Green #091D12)
  doc.setFillColor(9, 29, 18);
  doc.rect(0, 0, pageWidth, 42, "F");

  // Gold Accent line (#D4AF37)
  doc.setFillColor(212, 175, 55);
  doc.rect(0, 42, pageWidth, 2, "F");

  // Brand Header
  doc.setTextColor(212, 175, 55);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("M A N B R O", 14, 18);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 215, 205);
  doc.text("LUXURY & BESPOKE APPAREL", 14, 25);
  doc.text("GSTIN: 29ABCDE1234F1Z5 • support@manbro.com", 14, 32);

  // Invoice Title on Right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("TAX INVOICE", pageWidth - 14, 18, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(212, 175, 55);
  doc.text(`INVOICE #: ${order.id}`, pageWidth - 14, 25, { align: "right" });
  doc.setTextColor(200, 215, 205);
  doc.text(`DATE: ${order.createdAt ? formatDate(order.createdAt) : new Date().toLocaleDateString()}`, pageWidth - 14, 32, { align: "right" });

  // 2. Customer Details & QR Code Section
  const startY = 52;

  // Box background for Customer Info
  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(218, 226, 220);
  doc.roundedRect(14, startY, 120, 48, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(9, 29, 18);
  doc.text("BILLED TO & SHIPPING DESTINATION", 18, startY + 7);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`, 18, startY + 14);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60, 70, 65);
  doc.text(`Phone: ${order.shippingAddress.phone}`, 18, startY + 20);
  doc.text(`Email: ${order.shippingAddress.email}`, 18, startY + 25);

  const splitAddress = doc.splitTextToSize(
    `${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`,
    110
  );
  doc.text(splitAddress, 18, startY + 30);

  // QR Code Box (Right Side)
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(212, 175, 55);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth - 62, startY, 48, 48, 2, 2, "FD");

  // Insert QR Code image
  doc.addImage(qrDataUrl, "PNG", pageWidth - 58, startY + 3, 40, 40);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(9, 29, 18);
  doc.text("SCAN FOR PRODUCT SPECS", pageWidth - 38, startY + 45, { align: "center" });

  // 3. Products Table Header
  const tableY = startY + 56;

  doc.setFillColor(9, 29, 18);
  doc.rect(14, tableY, pageWidth - 28, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(212, 175, 55);
  doc.text("#", 18, tableY + 5.5);
  doc.text("ITEM & SPECIFICATIONS", 28, tableY + 5.5);
  doc.text("SIZE / COLOR", 110, tableY + 5.5);
  doc.text("QTY", 145, tableY + 5.5, { align: "center" });
  doc.text("UNIT (INR)", 165, tableY + 5.5, { align: "right" });
  doc.text("TOTAL (INR)", pageWidth - 18, tableY + 5.5, { align: "right" });

  // Products Table Rows
  let curY = tableY + 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);

  order.items.forEach((item, idx) => {
    // Alternating row background
    if (idx % 2 === 0) {
      doc.setFillColor(250, 252, 250);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(14, curY, pageWidth - 28, 10, "F");
    doc.setDrawColor(230, 235, 230);
    doc.line(14, curY + 10, pageWidth - 14, curY + 10);

    doc.setTextColor(9, 29, 18);
    doc.setFont("helvetica", "bold");
    doc.text(`${idx + 1}`, 18, curY + 6.5);

    const itemName = item.product.name.length > 42 ? `${item.product.name.substring(0, 40)}...` : item.product.name;
    doc.text(itemName, 28, curY + 6.5);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 70, 65);
    doc.text(`${item.selectedSize} / ${item.selectedColor.name}`, 110, curY + 6.5);
    doc.text(`${item.quantity}`, 145, curY + 6.5, { align: "center" });

    const unitPrice = item.product.price || 0;
    const lineTotal = unitPrice * item.quantity;

    doc.text(unitPrice.toFixed(2), 165, curY + 6.5, { align: "right" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(9, 29, 18);
    doc.text(lineTotal.toFixed(2), pageWidth - 18, curY + 6.5, { align: "right" });

    curY += 10;
  });

  // 4. Totals Summary Box
  curY += 6;
  const totalsBoxX = pageWidth - 90;

  // Compute exact amounts with 5% GST
  const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
  const shipping = order.shipping !== undefined ? order.shipping : (subtotal >= 999 ? 0 : 70);
  const gst = order.tax !== undefined && order.tax > 0 ? order.tax : Math.round(subtotal * 0.05 * 100) / 100;
  const total = order.total || Math.round((subtotal + shipping + gst) * 100) / 100;

  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(218, 226, 220);
  doc.roundedRect(totalsBoxX, curY, 76, 40, 2, 2, "FD");

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 90, 85);

  doc.text("Subtotal:", totalsBoxX + 6, curY + 7);
  doc.text(`INR ${subtotal.toFixed(2)}`, pageWidth - 18, curY + 7, { align: "right" });

  doc.text("Delivery / Shipping:", totalsBoxX + 6, curY + 14);
  doc.text(shipping === 0 ? "FREE" : `INR ${shipping.toFixed(2)}`, pageWidth - 18, curY + 14, { align: "right" });

  doc.text("GST (5%):", totalsBoxX + 6, curY + 21);
  doc.text(`INR ${gst.toFixed(2)}`, pageWidth - 18, curY + 21, { align: "right" });

  // Total Row in Box
  doc.setFillColor(9, 29, 18);
  doc.roundedRect(totalsBoxX + 2, curY + 26, 72, 11, 1.5, 1.5, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(212, 175, 55);
  doc.text("Total Paid:", totalsBoxX + 6, curY + 33.5);
  doc.text(`INR ${total.toFixed(2)}`, pageWidth - 20, curY + 33.5, { align: "right" });

  // Payment Status on Left of Totals Box
  const statusBoxX = 14;
  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(218, 226, 220);
  doc.roundedRect(statusBoxX, curY, 95, 40, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(9, 29, 18);
  doc.text("PAYMENT & ORDER STATUS", statusBoxX + 6, curY + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 70, 65);
  doc.text(`Payment Gateway: ${order.shippingAddress.paymentMethod?.toUpperCase() || "CASHFREE"}`, statusBoxX + 6, curY + 14);
  doc.text(`Order Status: ${order.status}`, statusBoxX + 6, curY + 20);
  doc.text(`Tracking Partner: ${order.trackingInfo?.courierName || "India Post Speed Post"}`, statusBoxX + 6, curY + 26);
  if (order.trackingInfo?.trackingNumber) {
    doc.text(`Tracking ID: ${order.trackingInfo.trackingNumber}`, statusBoxX + 6, curY + 32);
  } else {
    doc.text("Tracking ID: Dispatched upon dispatch", statusBoxX + 6, curY + 32);
  }

  // 5. Footer Terms & Authenticity Signature
  doc.setFillColor(212, 175, 55);
  doc.rect(0, pageHeight - 16, pageWidth, 0.8, "F");

  doc.setFillColor(9, 29, 18);
  doc.rect(0, pageHeight - 15.2, pageWidth, 15.2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(200, 215, 205);
  doc.text("Thank you for choosing MANBRO Couture. All garments are crafted from sustainable organic materials.", pageWidth / 2, pageHeight - 8.5, { align: "center" });
  doc.text("This is a computer-generated tax invoice verified with QR Code authentication.", pageWidth / 2, pageHeight - 4.5, { align: "center" });

  if (download) {
    doc.save(`MANBRO_Invoice_${order.id}.pdf`);
  }

  return doc;
}
