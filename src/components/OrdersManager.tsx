'use client';

import React, { useState, useEffect } from 'react';
import { OrderStatus, QuoteOrder } from '@/types';
import {
  ClipboardList,
  Search,
  Printer,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  Wrench,
  Truck,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface OrdersManagerProps {
  onViewOrder?: (order: QuoteOrder) => void;
}

export const OrdersManager: React.FC<OrdersManagerProps> = ({ onViewOrder }) => {
  const [orders, setOrders] = useState<QuoteOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<QuoteOrder | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const url = new URL('/api/orders', window.location.origin);
      if (statusFilter !== 'all') url.searchParams.set('status', statusFilter);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status', id: orderId, status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Update order status error:', err);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) return;
    try {
      const res = await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
      if (res.ok) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
    } catch (err) {
      console.error('Delete order error:', err);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'quote':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">Báo Giá</span>;
      case 'approved':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">Đã Duyệt / Đặt Cọc</span>;
      case 'printing':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">Đang In Máy</span>;
      case 'finishing':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800 border border-purple-200">Đang Gia Công</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Đã Hoàn Thành</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-100 text-teal-800 border border-teal-200">Đã Giao Hàng</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">Đã Hủy</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">{status}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Thanh tìm kiếm & lọc trạng thái */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="quote">Báo giá</option>
            <option value="approved">Đã duyệt / Đặt cọc</option>
            <option value="printing">Đang in máy</option>
            <option value="finishing">Đang gia công</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>

          <button
            onClick={fetchOrders}
            className="p-2 text-slate-600 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Tải lại"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bảng danh sách đơn hàng */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Tên Ấn Phẩm</th>
                <th className="py-3 px-4 text-center">Công Nghệ</th>
                <th className="py-3 px-4 text-center">Số Lượng</th>
                <th className="py-3 px-4 text-right">Tổng Tiền</th>
                <th className="py-3 px-4 text-center">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Không tìm thấy đơn hàng nào
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-blue-600 whitespace-nowrap">
                      {order.code}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <strong className="block text-slate-800">{order.customerName}</strong>
                      <span className="text-[11px] text-slate-500">{order.customerPhone}</span>
                    </td>

                    <td className="py-3 px-4">
                      <strong className="block text-slate-800">{order.jobName}</strong>
                      <span className="text-[11px] text-slate-500">
                        {order.widthMm}x{order.heightMm}mm • {order.paperName}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.printTech === 'offset'
                            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                            : 'bg-sky-100 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {order.printTech}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center font-bold text-slate-800">
                      {order.quantity.toLocaleString('vi-VN')}
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                      {order.finalPrice.toLocaleString('vi-VN')}đ
                      <span className="block text-[10px] text-slate-500 font-normal">
                        ({order.unitPrice.toLocaleString('vi-VN')}đ/c)
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-block relative">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className="text-[11px] font-medium border border-slate-200 rounded-md px-2 py-1 bg-white cursor-pointer hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="quote">Báo giá</option>
                          <option value="approved">Đã duyệt / Cọc</option>
                          <option value="printing">Đang in máy</option>
                          <option value="finishing">Gia công</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="delivered">Đã giao</option>
                          <option value="cancelled">Hủy đơn</option>
                        </select>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                          title="Xóa đơn hàng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
