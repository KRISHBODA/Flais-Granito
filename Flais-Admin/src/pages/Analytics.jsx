import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Eye,
  Download,
  MousePointer2,
  Users,
  Clock3,
  RefreshCw,
  FileText,
  Layers3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api';

const RANGE_OPTIONS = [7, 30, 90];

const cardShell = 'rounded-3xl border border-slate-200 bg-white shadow-sm';

const formatNumber = (value) => new Intl.NumberFormat('en-IN').format(Number(value || 0));

const Analytics = () => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/analytics/summary?days=${days}`);
      if (res.data.success) {
        setSummary(res.data.summary);
      }
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [days]);

  const chartData = useMemo(() => {
    if (!summary?.dailySeries) return [];
    return summary.dailySeries.map((item) => ({
      ...item,
      label: item.date,
    }));
  }, [summary]);

  const topPages = summary?.topPages || [];
  const topPdfs = summary?.topPdfs || [];
  const recentEvents = summary?.recentEvents || [];

  const metricCards = [
    { label: 'Total events', value: summary?.totalEvents, icon: MousePointer2, tone: 'from-blue-500 to-cyan-500' },
    { label: 'Page views', value: summary?.pageViews, icon: Eye, tone: 'from-slate-700 to-slate-900' },
    { label: 'PDF views', value: summary?.pdfViews, icon: FileText, tone: 'from-emerald-500 to-teal-500' },
    { label: 'PDF downloads', value: summary?.pdfDownloads, icon: Download, tone: 'from-amber-500 to-orange-500' },
    { label: 'Unique visitors', value: summary?.uniqueVisitors, icon: Users, tone: 'from-violet-500 to-fuchsia-500' },
    { label: 'Sessions', value: summary?.uniqueSessions, icon: Clock3, tone: 'from-rose-500 to-pink-500' },
  ];

  const getEventLabel = (eventType) => {
    if (eventType === 'page_view') return 'Page view';
    if (eventType === 'pdf_view') return 'PDF view';
    if (eventType === 'pdf_download') return 'PDF download';
    return eventType;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#0145F2]">Activity analytics</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">User behavior dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">
            Real page visits, PDF views, and downloads captured from the public site.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => setDays(option)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                days === option
                  ? 'bg-[#0145F2] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Last {option} days
            </button>
          ))}
          <button
            onClick={fetchSummary}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className={`${cardShell} p-10 text-center text-slate-500`}>Loading analytics...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{card.label}</p>
                      <p className="mt-2 text-3xl font-bold text-slate-900">{formatNumber(card.value)}</p>
                    </div>
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-md`}>
                      <Icon size={20} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <div className={cardShell}>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Daily activity</h2>
                  <p className="text-sm text-slate-500">Page views, PDF views, and downloads by day.</p>
                </div>
                <BarChart3 className="text-[#0145F2]" size={20} />
              </div>
              <div className="h-[340px] p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pageViews" stroke="#0145F2" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="pdfViews" stroke="#0F766E" strokeWidth={2.5} dot={false} />
                    <Line type="monotone" dataKey="pdfDownloads" stroke="#D97706" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={cardShell}>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Top pages</h2>
                  <p className="text-sm text-slate-500">Most visited public pages.</p>
                </div>
                <Layers3 className="text-[#0145F2]" size={20} />
              </div>
              <div className="p-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPages}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={70} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0145F2" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <div className={cardShell}>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Top PDFs</h2>
                  <p className="text-sm text-slate-500">Most viewed and downloaded brochures.</p>
                </div>
                <Download className="text-[#0145F2]" size={20} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Document</th>
                      <th className="px-5 py-3">Views</th>
                      <th className="px-5 py-3">Downloads</th>
                      <th className="px-5 py-3">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topPdfs.length > 0 ? topPdfs.map((item) => (
                      <tr key={item.key} className="border-t border-slate-100">
                        <td className="px-5 py-4">
                          <div className="max-w-[260px]">
                            <p className="font-semibold text-slate-900 truncate">{item.label || 'Untitled PDF'}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-slate-600">{formatNumber(item.views)}</td>
                        <td className="px-5 py-4 text-slate-600">{formatNumber(item.downloads)}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900">{formatNumber(item.total)}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-5 py-12 text-center text-slate-400">
                          No PDF activity yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={cardShell}>
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recent events</h2>
                  <p className="text-sm text-slate-500">Latest tracked actions from the public site.</p>
                </div>
                <Clock3 className="text-[#0145F2]" size={20} />
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                <table className="w-full">
                  <thead className="text-left text-xs uppercase tracking-wider text-slate-400">
                    <tr>
                      <th className="px-5 py-3">Action</th>
                      <th className="px-5 py-3">Page</th>
                      <th className="px-5 py-3">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.length > 0 ? recentEvents.map((event) => (
                      <tr key={event._id} className="border-t border-slate-100">
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            {getEventLabel(event.eventType)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">{event.pageLabel || event.targetLabel || 'Unknown'}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[220px]">
                            {event.targetLabel || event.path || event.pageKey}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">
                          {new Date(event.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="px-5 py-12 text-center text-slate-400">
                          No recent events found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
