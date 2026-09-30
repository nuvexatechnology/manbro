"use client";

import React, { useState, useMemo } from "react";
import { Order, OrderStatus } from "@/types/store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { exportSalesReportToExcel } from "@/lib/exportExcel";
import { generateOrderInvoicePdf } from "@/lib/generateInvoicePdf";
import { toast } from "@/components/ui/toast";

interface SalesReportSectionProps {
  orders: Order[];
}

const ALL_STATUSES: OrderStatus[] = [
  "NEW",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function SalesReportSection({ orders }: SalesReportSectionProps) {
  // Filters
  const [selectedYear, setSelectedYear] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedPayment, setSelectedPayment] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Extract available years from orders
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    orders.forEach((order) => {
      if (order.createdAt) {
        const d = new Date(order.createdAt);
        if (!isNaN(d.getFullYear())) {
          years.add(d.getFullYear().toString());
        }
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [orders]);

  // Filtered orders based on all criteria
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderDate = order.createdAt ? new Date(order.createdAt) : null;

      // Custom date range filter
      if (startDate && orderDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (orderDate < start) return false;
      }
      if (endDate && orderDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (orderDate > end) return false;
      }

      // Year filter (if custom date range is not actively set)
      if (selectedYear !== "ALL" && orderDate) {
        if (orderDate.getFullYear().toString() !== selectedYear) return false;
      }

      // Month filter
      if (selectedMonth !== "ALL" && orderDate) {
        if (orderDate.getMonth().toString() !== selectedMonth) return false;
      }

      // Status filter
      if (selectedStatus !== "ALL") {
        if (order.status !== selectedStatus) return false;
      }

      // Payment method filter
      if (selectedPayment !== "ALL") {
        if (order.shippingAddress?.paymentMethod?.toLowerCase() !== selectedPayment.toLowerCase()) {
          return false;
        }
      }

      // Search query (Order ID, Customer Name, Phone, City)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = order.id?.toLowerCase().includes(q);
        const nameMatch = `${order.shippingAddress?.firstName || ""} ${order.shippingAddress?.lastName || ""}`
          .toLowerCase()
          .includes(q);
        const phoneMatch = order.shippingAddress?.phone?.includes(q);
        const cityMatch = order.shippingAddress?.city?.toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !phoneMatch && !cityMatch) return false;
      }

      return true;
    });
  }, [orders, selectedYear, selectedMonth, selectedStatus, selectedPayment, startDate, endDate, searchQuery]);

  // Key Aggregations for the filtered dataset
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalItemsSold = filteredOrders.reduce(
      (sum, o) => sum + (o.items?.reduce((iSum, it) => iSum + it.quantity, 0) || 0),
      0
    );
    const totalDiscount = filteredOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
    const totalShipping = filteredOrders.reduce((sum, o) => sum + (o.shipping || 0), 0);

    const deliveredCount = filteredOrders.filter((o) => o.status === "DELIVERED").length;
    const shippedCount = filteredOrders.filter((o) => o.status === "SHIPPED").length;
    const cancelledCount = filteredOrders.filter((o) => o.status === "CANCELLED").length;
    const activeCount = filteredOrders.filter(
      (o) => o.status === "NEW" || o.status === "CONFIRMED" || o.status === "PROCESSING"
    ).length;

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      totalItemsSold,
      totalDiscount,
      totalShipping,
      deliveredCount,
      shippedCount,
      cancelledCount,
      activeCount,
    };
  }, [filteredOrders]);

  // Monthly breakdown table for the selected year
  const monthlyBreakdown = useMemo(() => {
    const monthsData: { [key: number]: { month: string; orders: number; revenue: number; itemsSold: number } } = {};
    for (let i = 0; i < 12; i++) {
      monthsData[i] = { month: MONTH_NAMES[i], orders: 0, revenue: 0, itemsSold: 0 };
    }

    orders.forEach((o) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      if (selectedYear !== "ALL" && d.getFullYear().toString() !== selectedYear) return;
      
      const m = d.getMonth();
      monthsData[m].orders += 1;
      monthsData[m].revenue += o.total;
      monthsData[m].itemsSold += o.items?.reduce((s, it) => s + it.quantity, 0) || 0;
    });

    return Object.values(monthsData);
  }, [orders, selectedYear]);

  // Handle Export to Excel
  const handleExportExcel = () => {
    const monthPart = selectedMonth !== "ALL" ? `_${MONTH_NAMES[parseInt(selectedMonth)]}` : "";
    const yearPart = selectedYear !== "ALL" ? `_${selectedYear}` : "";
    const fileName = `MANBRO_Sales_Report${yearPart}${monthPart}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    exportSalesReportToExcel(filteredOrders, fileName);
  };

  const handleResetFilters = () => {
    setSelectedYear("ALL");
    setSelectedMonth("ALL");
    setSelectedStatus("ALL");
    setSelectedPayment("ALL");
    setStartDate("");
    setEndDate("");
    setSearchQuery("");
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Excel Download Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#11301F] border border-[#284234] rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📈</span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
              Sales & Financial Reports
            </h2>
          </div>
          <p className="text-xs text-neutral-300 mt-1">
            Analyze monthly sales performance, revenue metrics, order statuses, and download structured Excel spreadsheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={filteredOrders.length === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[#d4af37] text-black font-extrabold text-xs uppercase tracking-wider hover:bg-[#c29e2e] transition shadow-lg shadow-[#d4af37]/20 disabled:opacity-50 cursor-pointer active:scale-98"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export to Excel ({filteredOrders.length})
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-[#284234]">
          <div className="text-xs font-bold text-[#d4af37] uppercase tracking-wider flex items-center gap-2">
            <span>🔍</span> Filter Sales Reports
          </div>
          {(selectedYear !== "ALL" ||
            selectedMonth !== "ALL" ||
            selectedStatus !== "ALL" ||
            selectedPayment !== "ALL" ||
            startDate ||
            endDate ||
            searchQuery) && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-neutral-400 hover:text-[#d4af37] transition font-bold underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Year Filter */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Filter by Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
            >
              <option value="ALL">All Years</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Filter by Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
            >
              <option value="ALL">All Months</option>
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx.toString()}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Order Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Order Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
            >
              <option value="ALL">All Statuses</option>
              {ALL_STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Filter */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Payment Method
            </label>
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="whatsapp">WhatsApp Order</option>
              <option value="cod">Cash On Delivery (COD)</option>
              <option value="card">Card / Online</option>
            </select>
          </div>
        </div>

        {/* Date Range & Search Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37] transition"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Search Customer / Order ID
            </label>
            <input
              type="text"
              placeholder="Search by order ID, name, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#d4af37] transition"
            />
          </div>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
            Total Revenue
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#d4af37]">
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Across {stats.totalOrders} filtered orders
          </div>
        </div>

        <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
            Avg Order Value (AOV)
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {formatCurrency(stats.avgOrderValue)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Per transaction average
          </div>
        </div>

        <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
            Total Items Sold
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">
            {stats.totalItemsSold}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            Units delivered/in-progress
          </div>
        </div>

        <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 relative overflow-hidden shadow-lg">
          <div className="text-xs font-bold text-[#d4af37] uppercase tracking-wider mb-1">
            Fulfillment Rate
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {stats.totalOrders > 0
              ? `${Math.round(((stats.deliveredCount + stats.shippedCount) / stats.totalOrders) * 100)}%`
              : "0%"}
          </div>
          <div className="text-[11px] text-neutral-400 mt-2">
            {stats.deliveredCount} Delivered • {stats.shippedCount} Shipped
          </div>
        </div>
      </div>

      {/* Monthly Sales Breakdown Table */}
      <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">📅</span>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Monthly Revenue Distribution {selectedYear !== "ALL" ? `(${selectedYear})` : "(All Time)"}
            </h3>
          </div>
          <span className="text-xs text-[#d4af37] font-bold">
            12 Months Analysis
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#284234] text-neutral-400 text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Orders Count</th>
                <th className="py-3 px-4">Units Sold</th>
                <th className="py-3 px-4">Gross Revenue</th>
                <th className="py-3 px-4 text-right">Quick Filter</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#284234]">
              {monthlyBreakdown.map((item, idx) => {
                const isSelected = selectedMonth === idx.toString();
                return (
                  <tr
                    key={item.month}
                    className={`hover:bg-[#091D12]/60 transition ${
                      isSelected ? "bg-[#284234]/40" : ""
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                      {item.month}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300 font-medium">
                      {item.orders}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300 font-medium">
                      {item.itemsSold}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-[#d4af37]">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedMonth(isSelected ? "ALL" : idx.toString())}
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                          isSelected
                            ? "bg-[#d4af37] text-black"
                            : "bg-[#091D12] text-neutral-300 hover:text-white border border-[#284234]"
                        }`}
                      >
                        {isSelected ? "Clear" : "View"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filtered Orders List Table */}
      <div className="bg-[#11301F] border border-[#284234] rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">📋</span>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Orders Log ({filteredOrders.length})
            </h3>
          </div>
          <span className="text-xs text-neutral-400">
            Showing filtered orders ready for export
          </span>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-xs">
            No orders match the selected filters. Try changing your month, year, or date filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#284234] text-neutral-400 text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">City / State</th>
                  <th className="py-3 px-3">Items Qty</th>
                  <th className="py-3 px-3">Total (₹)</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">PDF Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#284234]">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#091D12]/60 transition">
                    <td className="py-3 px-3 font-mono font-bold text-[#d4af37]">
                      {order.id}
                    </td>
                    <td className="py-3 px-3 text-neutral-300">
                      {order.createdAt ? formatDate(order.createdAt) : "N/A"}
                    </td>
                    <td className="py-3 px-3 text-white font-medium">
                      <div>
                        {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {order.shippingAddress?.phone}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-neutral-300">
                      {order.shippingAddress?.city}, {order.shippingAddress?.state}
                    </td>
                    <td className="py-3 px-3 text-neutral-300 font-bold">
                      {order.items?.reduce((s, it) => s + it.quantity, 0) || 0}
                    </td>
                    <td className="py-3 px-3 font-extrabold text-white">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#091D12] border border-[#284234] text-neutral-300 uppercase">
                        {order.shippingAddress?.paymentMethod || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.status === "DELIVERED"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : order.status === "CANCELLED"
                            ? "bg-red-950 text-red-400 border border-red-800"
                            : order.status === "SHIPPED"
                            ? "bg-blue-950 text-blue-400 border border-blue-800"
                            : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={async () => {
                          try {
                            await generateOrderInvoicePdf(order);
                          } catch (err) {
                            toast.error("Failed to generate PDF");
                          }
                        }}
                        className="px-2.5 py-1 bg-[#d4af37] hover:bg-[#c29e2e] text-black font-extrabold text-[10px] uppercase rounded-lg transition cursor-pointer shadow inline-flex items-center gap-1"
                        title="Download Unique PDF Invoice with QR Code"
                      >
                        📄 PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
