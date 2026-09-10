'use client';

import React, { useState, useEffect } from 'react';
import { SystemSetting } from '@/types';
import { Settings, Save, Check, RefreshCw, Building, Phone, Mail, CreditCard, FileText } from 'lucide-react';

export const SettingsManager: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting>({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    bankAccount: '',
    bankName: '',
    quoteFooterNote: '',
    defaultProfitMargin: 25,
    defaultVatPercent: 8,
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-700" />
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Cấu Hình Thông Tin Xưởng In & Mặc Định</h2>
            <p className="text-xs text-slate-500">Thông tin xuất hiện trên Phiếu Báo Giá gửi khách và Lệnh Sản Xuất</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
        {saved && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600" />
            Đã lưu thông tin cấu hình hệ thống thành công!
          </div>
        )}

        <div>
          <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            Tên Doanh Nghiệp / Xưởng In (Header Báo Giá)
          </label>
          <input
            type="text"
            required
            value={settings.companyName}
            onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1">Địa Chỉ Xưởng Sản Xuất</label>
          <input
            type="text"
            value={settings.companyAddress}
            onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              Hotline / Điện Thoại
            </label>
            <input
              type="text"
              value={settings.companyPhone}
              onChange={(e) => setSettings({ ...settings, companyPhone: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Email Liên Hệ
            </label>
            <input
              type="email"
              value={settings.companyEmail}
              onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-blue-600" />
              Số Tài Khoản & Chủ Tài Khoản
            </label>
            <input
              type="text"
              value={settings.bankAccount}
              onChange={(e) => setSettings({ ...settings, bankAccount: e.target.value })}
              placeholder="VD: 19038889999999 - CTK: PRINTCAL"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tên Ngân Hàng & Chi Nhánh</label>
            <input
              type="text"
              value={settings.bankName}
              onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
              placeholder="VD: Techcombank CN TP.HCM"
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tỷ Lệ Lợi Nhuận Mặc Định (%)</label>
            <input
              type="number"
              value={settings.defaultProfitMargin}
              onChange={(e) => setSettings({ ...settings, defaultProfitMargin: Number(e.target.value) })}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Thuế Suất VAT Mặc Định (%)</label>
            <input
              type="number"
              value={settings.defaultVatPercent}
              onChange={(e) => setSettings({ ...settings, defaultVatPercent: Number(e.target.value) })}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Điều Khoản & Lưu Ý Báo Giá Khách Hàng
          </label>
          <textarea
            rows={4}
            value={settings.quoteFooterNote}
            onChange={(e) => setSettings({ ...settings, quoteFooterNote: e.target.value })}
            className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-1 focus:ring-blue-500 font-mono text-[11px]"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow transition-colors"
          >
            <Save className="w-4 h-4" />
            Lưu Cài Đặt
          </button>
        </div>
      </form>
    </div>
  );
};
