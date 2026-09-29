import * as XLSX from "xlsx";
import { Order } from "@/types/store";
import { formatDate } from "@/lib/utils";

export function exportSalesReportToExcel(
  orders: Order[],
  fileName: string = "Sales_Report.xlsx"
) {
  // 1. Detailed Orders Sheet
  const orderRows = orders.map((order, idx) => {
    const itemsSummary = order.items
      ?.map(
        (item) =>
          `${item.product?.name || "Product"} (${item.selectedSize}/${item.selectedColor?.name || "Standard"}) x${item.quantity}`
      )
      .join("; ");

    return {
      "S.No": idx + 1,
      "Order ID": order.id,
      "Order Date": order.createdAt ? formatDate(order.createdAt) : "N/A",
      "Customer Name": `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`.trim() || "Customer",
      "Phone": order.shippingAddress?.phone || "N/A",
      "Email": order.shippingAddress?.email || "N/A",
      "City": order.shippingAddress?.city || "N/A",
      "State": order.shippingAddress?.state || "N/A",
      "Pincode": order.shippingAddress?.pincode || "N/A",
      "Items": itemsSummary || "N/A",
      "Total Quantity": order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
      "Subtotal (₹)": order.subtotal || 0,
      "Discount (₹)": order.discount || 0,
      "Shipping (₹)": order.shipping || 0,
      "Tax (₹)": order.tax || 0,
      "Total Amount (₹)": order.total || 0,
      "Payment Method": order.shippingAddress?.paymentMethod?.toUpperCase() || "N/A",
      "Order Status": order.status,
      "Tracking Number": order.trackingInfo?.trackingNumber || "N/A",
      "Shipping Date": order.trackingInfo?.shippingDate || "N/A",
      "Admin Notes": order.adminNotes || "",
    };
  });

  // 2. Summary Sheet
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED").length;
  const shippedOrders = orders.filter((o) => o.status === "SHIPPED").length;
  const processingOrders = orders.filter((o) => o.status === "PROCESSING" || o.status === "CONFIRMED").length;
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED").length;
  const newOrders = orders.filter((o) => o.status === "NEW").length;
  const totalItemsSold = orders.reduce(
    (sum, o) => sum + (o.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0),
    0
  );

  const summaryRows = [
    { Metric: "Total Orders", Value: totalOrders },
    { Metric: "Total Gross Revenue (₹)", Value: totalRevenue },
    { Metric: "Average Order Value (₹)", Value: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0 },
    { Metric: "Total Items Sold", Value: totalItemsSold },
    { Metric: "New Orders", Value: newOrders },
    { Metric: "Confirmed / Processing Orders", Value: processingOrders },
    { Metric: "Shipped Orders", Value: shippedOrders },
    { Metric: "Delivered Orders", Value: deliveredOrders },
    { Metric: "Cancelled Orders", Value: cancelledOrders },
    { Metric: "Report Generated At", Value: new Date().toLocaleString() },
  ];

  // 3. Create Workbook & Sheets
  const wb = XLSX.utils.book_new();

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  const wsOrders = XLSX.utils.json_to_sheet(orderRows);

  // Column width formatting
  wsOrders["!cols"] = [
    { wch: 6 },  // S.No
    { wch: 20 }, // Order ID
    { wch: 15 }, // Date
    { wch: 22 }, // Customer Name
    { wch: 14 }, // Phone
    { wch: 25 }, // Email
    { wch: 15 }, // City
    { wch: 15 }, // State
    { wch: 10 }, // Pincode
    { wch: 45 }, // Items
    { wch: 14 }, // Total Qty
    { wch: 14 }, // Subtotal
    { wch: 14 }, // Discount
    { wch: 14 }, // Shipping
    { wch: 12 }, // Tax
    { wch: 16 }, // Total
    { wch: 16 }, // Payment Method
    { wch: 14 }, // Status
    { wch: 20 }, // Tracking
    { wch: 15 }, // Shipping Date
    { wch: 25 }, // Admin Notes
  ];

  wsSummary["!cols"] = [
    { wch: 30 },
    { wch: 25 },
  ];

  XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");
  XLSX.utils.book_append_sheet(wb, wsOrders, "Orders Breakdown");

  // Trigger download in browser
  XLSX.writeFile(wb, fileName);
}
