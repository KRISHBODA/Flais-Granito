import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
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
  Image as ImageIcon,
  Package,
  FolderOpen,
  Camera,
  ExternalLink,
  Search,
  Sparkles,
  Layers,
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
  Cell,
} from 'recharts';
import toast from 'react-hot-toast';
import api, { getImageUrl } from '../utils/api';

const RANGE_OPTIONS = [7, 30, 90];

const cardShell = 'rounded-3xl border border-slate-200 bg-white shadow-sm';

const COLLECTION_COLORS = [
  '#0145F2',
  '#0F766E',
  '#5D4037',
  '#D97706',
  '#7C3AED',
  '#EC4899',
  '#2563EB',
  '#059669',
];

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
  const [collectionSearch, setCollectionSearch] = useState('');
  const [collectionSort, setCollectionSort] = useState('tiles-desc');
  const [collectionMetricMode, setCollectionMetricMode] = useState('tiles'); // 'tiles' (1 per product) | 'photos' (all photos)

  const collectionPhotos = useMemo(() => {
    return summary?.collectionPhotos || {
      totalPhotos: 0,
      totalProducts: 0,
      totalTilesUploaded: 0,
      collectionsCount: 0,
      collections: [],
    };
  }, [summary]);

  const filteredCollections = useMemo(() => {
    let list = [...(collectionPhotos.collections || [])];
    if (collectionSearch.trim()) {
      const q = collectionSearch.toLowerCase().trim();
      list = list.filter((c) => c.collectionName.toLowerCase().includes(q));
    }
    if (collectionSort === 'tiles-desc') {
      list.sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
    } else if (collectionSort === 'tiles-asc') {
      list.sort((a, b) => (a.productCount || 0) - (b.productCount || 0));
    } else if (collectionSort === 'photos-desc') {
      list.sort((a, b) => (b.photoCount || 0) - (a.photoCount || 0));
    } else if (collectionSort === 'photos-asc') {
      list.sort((a, b) => (a.photoCount || 0) - (b.photoCount || 0));
    } else if (collectionSort === 'name-asc') {
      list.sort((a, b) => a.collectionName.localeCompare(b.collectionName));
    }
    return list;
  }, [collectionPhotos, collectionSearch, collectionSort]);

  const collectionChartData = useMemo(() => {
    const isTilesMode = collectionMetricMode === 'tiles';
    return (collectionPhotos.collections || []).map((item) => {
      const percentage = isTilesMode
        ? (item.percentageOfProducts || (collectionPhotos.totalProducts > 0 ? Number(((item.productCount / collectionPhotos.totalProducts) * 100).toFixed(1)) : 0))
        : item.percentageOfPhotos;

      return {
        name: item.collectionName.replace(/\s+Collection$/i, ''),
        fullName: item.collectionName,
        value: isTilesMode ? item.productCount : item.photoCount,
        tiles: item.productCount,
        photos: item.photoCount,
        percentage,
      };
    }).sort((a, b) => b.value - a.value);
  }, [collectionPhotos, collectionMetricMode]);

  const metricCards = [
    { label: 'Total events', value: summary?.totalEvents, icon: MousePointer2, tone: 'from-blue-500 to-cyan-500' },
    { label: 'Page views', value: summary?.pageViews, icon: Eye, tone: 'from-slate-700 to-slate-900' },
    { label: 'PDF views', value: summary?.pdfViews, icon: FileText, tone: 'from-emerald-500 to-teal-500' },
    { label: 'PDF downloads', value: summary?.pdfDownloads, icon: Download, tone: 'from-amber-500 to-orange-500' },
    { label: 'Unique visitors', value: summary?.uniqueVisitors, icon: Users, tone: 'from-violet-500 to-fuchsia-500' },
    { label: 'Sessions', value: summary?.uniqueSessions, icon: Clock3, tone: 'from-rose-500 to-pink-500' },
  ];

  const getEventBadge = (eventType) => {
    if (eventType === 'pdf_download') {
      return {
        label: 'PDF download',
        className: 'bg-amber-50 text-amber-700 border border-amber-200/80',
        Icon: Download,
      };
    }
    if (eventType === 'pdf_view') {
      return {
        label: 'PDF view',
        className: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
        Icon: FileText,
      };
    }
    return {
      label: 'Page view',
      className: 'bg-blue-50 text-[#0145F2] border border-blue-200/80',
      Icon: Eye,
    };
  };

  const formatPageTitle = (event) => {
    if (event.eventType === 'pdf_view' || event.eventType === 'pdf_download') {
      return event.targetLabel || event.title || event.pageLabel || 'Brochure PDF';
    }

    const raw = event.pageLabel || event.targetLabel || event.title || '';
    if (!raw) {
      if (event.path === '/' || event.pageKey === 'home') return 'Home';
      return event.path || event.pageKey || 'Page View';
    }

    if (/[A-Z]/.test(raw)) return raw;

    return raw
      .split(/[\s-]+/)
      .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
      .join(' ');
  };

  const formatEventTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) return 'Today';

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return 'Yesterday';

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
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
                      <tr key={item.key} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="max-w-[260px]">
                            <p className="font-semibold text-slate-900 truncate" title={item.label || 'Untitled PDF'}>{item.label || 'Untitled PDF'}</p>
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
              <div className="max-h-[620px] overflow-y-auto">
                <table className="w-full table-fixed">
                  <thead className="sticky top-0 z-10 bg-slate-50/95 text-left text-xs uppercase tracking-wider text-slate-400 backdrop-blur-sm border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5 w-[140px]">Action</th>
                      <th className="px-5 py-3.5">Page / Target</th>
                      <th className="px-5 py-3.5 text-right w-[115px]">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEvents.length > 0 ? recentEvents.map((event) => {
                      const badge = getEventBadge(event.eventType);
                      const BadgeIcon = badge.Icon;
                      const title = formatPageTitle(event);
                      const subtitle = event.path || (event.eventType !== 'page_view' ? event.pageLabel : '');

                      return (
                        <tr key={event._id} className="border-t border-slate-100 transition-colors hover:bg-slate-50/70">
                          <td className="px-5 py-4 align-middle whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge.className}`}>
                              <BadgeIcon size={12} className="shrink-0" />
                              <span className="whitespace-nowrap">{badge.label}</span>
                            </span>
                          </td>
                          <td className="px-5 py-4 align-middle">
                            <p className="font-semibold text-slate-900 truncate" title={title}>
                              {title}
                            </p>
                            {subtitle && (
                              <p className="text-xs text-slate-400 truncate mt-0.5 font-mono" title={subtitle}>
                                {subtitle}
                              </p>
                            )}
                          </td>
                          <td className="px-5 py-4 align-middle text-right whitespace-nowrap" title={new Date(event.createdAt).toLocaleString()}>
                            <p className="text-xs font-semibold text-slate-700">{formatEventTime(event.createdAt)}</p>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5">{formatEventDate(event.createdAt)}</p>
                          </td>
                        </tr>
                      );
                    }) : (
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

          {/* Collection Photo Uploads & Catalog Media Breakdown */}
          <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0145F2] border border-blue-200/80">
                    <Camera size={13} />
                    Catalog Media Assets
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">Collection uploads breakdown</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Total tiles uploaded (1 per design) and total gallery photos across each collection.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* View Mode Toggle: Tiles Uploaded (1 per design) vs. Total Photos */}
                <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200/80 shadow-2xs">
                  <button
                    onClick={() => setCollectionMetricMode('tiles')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      collectionMetricMode === 'tiles'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Package size={14} className={collectionMetricMode === 'tiles' ? 'text-[#0145F2]' : 'text-slate-400'} />
                    <span>Tiles Uploaded (1 per design)</span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-[#0145F2] font-extrabold">
                      {formatNumber(collectionPhotos.totalProducts)}
                    </span>
                  </button>
                  <button
                    onClick={() => setCollectionMetricMode('photos')}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                      collectionMetricMode === 'photos'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Camera size={14} className={collectionMetricMode === 'photos' ? 'text-amber-600' : 'text-slate-400'} />
                    <span>Total Photos (All images)</span>
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700 font-extrabold">
                      {formatNumber(collectionPhotos.totalPhotos)}
                    </span>
                  </button>
                </div>

                <Link
                  to="/admin/products"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
                >
                  <Package size={16} className="text-[#0145F2]" />
                  Manage Products
                </Link>
              </div>
            </div>

            {/* Explanatory Info Callout Banner */}
            <div className="flex items-start gap-3 rounded-2xl bg-blue-50/70 border border-blue-200/80 p-4 text-xs text-blue-950 shadow-2xs">
              <Sparkles size={18} className="shrink-0 text-[#0145F2] mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900">Understanding Tile Uploads vs. Total Photos:</span>
                <p className="text-slate-600 leading-relaxed">
                  When you add a tile to a collection (for example, in <strong>Extra Max Collection</strong> or <strong>Marvel Collection</strong>), each tile counts as <strong>1 unique design upload</strong> (e.g. <strong>47 tile designs uploaded</strong> in Extra Max). Because each tile design has multiple gallery photos (different angles, textures, and room scenes), the total photos count reaches <strong>193 photos</strong>. You can switch between viewing <strong>Tiles Uploaded (1 per design)</strong> and <strong>Total Photos</strong> using the toggle buttons above.
                </p>
              </div>
            </div>

            {/* 4 Summary Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className={`rounded-3xl border bg-white p-5 shadow-sm transition-all ${
                collectionMetricMode === 'tiles' ? 'border-[#0145F2] ring-2 ring-[#0145F2]/20' : 'border-slate-200'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tiles Uploaded</p>
                      {collectionMetricMode === 'tiles' && (
                        <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-[#0145F2]">Active</span>
                      )}
                    </div>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatNumber(collectionPhotos.totalProducts)}</p>
                    <p className="mt-1 text-xs text-slate-400">1 count per unique tile design</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                    <Package size={22} />
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl border bg-white p-5 shadow-sm transition-all ${
                collectionMetricMode === 'photos' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Gallery Photos</p>
                      {collectionMetricMode === 'photos' && (
                        <span className="rounded-full bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">Active</span>
                      )}
                    </div>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatNumber(collectionPhotos.totalPhotos)}</p>
                    <p className="mt-1 text-xs text-slate-400">All photos across all tiles</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                    <Camera size={22} />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Collections</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatNumber(collectionPhotos.collectionsCount)}</p>
                    <p className="mt-1 text-xs text-slate-400">Distinct catalog series</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-md">
                    <FolderOpen size={22} />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Photos / Tile</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                      {collectionPhotos.totalProducts > 0
                        ? (collectionPhotos.totalPhotos / collectionPhotos.totalProducts).toFixed(1)
                        : '0.0'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Average images per tile design</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                    <ImageIcon size={22} />
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Bar Chart & Share Breakdown */}
            <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <div className={cardShell}>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {collectionMetricMode === 'tiles' ? 'Tiles uploaded by collection (1 per design)' : 'Total photos uploaded by collection'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {collectionMetricMode === 'tiles'
                        ? 'Number of unique tile designs uploaded in each collection.'
                        : 'Total volume of uploaded gallery photos per tile collection.'}
                    </p>
                  </div>
                  <BarChart3 className="text-[#0145F2]" size={20} />
                </div>
                <div className="p-4">
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={collectionChartData} margin={{ top: 15, right: 15, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: '#64748B' }}
                          interval={0}
                          angle={-20}
                          textAnchor="end"
                          height={50}
                        />
                        <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                        <Tooltip
                          formatter={(value, name, props) => [
                            collectionMetricMode === 'tiles'
                              ? `${formatNumber(value)} tiles (${props.payload.percentage}% of catalog)`
                              : `${formatNumber(value)} photos (${props.payload.percentage}% of photos)`,
                            collectionMetricMode === 'tiles' ? 'Tiles Uploaded' : 'Photos Uploaded'
                          ]}
                          labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                        />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {collectionChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLLECTION_COLORS[index % COLLECTION_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className={cardShell}>
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Collection share ({collectionMetricMode === 'tiles' ? 'By Tiles' : 'By Photos'})
                    </h3>
                    <p className="text-sm text-slate-500">
                      {collectionMetricMode === 'tiles'
                        ? 'Share of total unique tile designs uploaded.'
                        : 'Share of total uploaded gallery photos.'}
                    </p>
                  </div>
                  <Sparkles className="text-amber-500" size={20} />
                </div>
                <div className="p-5 space-y-3.5 max-h-[360px] overflow-y-auto">
                  {collectionChartData.map((col, idx) => {
                    const displayCount = collectionMetricMode === 'tiles' ? col.tiles : col.photos;
                    const unit = collectionMetricMode === 'tiles' ? 'tiles' : 'photos';

                    return (
                      <div key={col.fullName} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                              idx === 0 ? 'bg-amber-100 text-amber-800' :
                              idx === 1 ? 'bg-slate-200 text-slate-700' :
                              idx === 2 ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-slate-800 truncate" title={col.fullName}>
                              {col.fullName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-bold text-slate-900">{formatNumber(displayCount)} {unit}</span>
                            <span className="text-slate-400 font-medium">({col.percentage}%)</span>
                          </div>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${col.percentage}%`,
                              backgroundColor: COLLECTION_COLORS[idx % COLLECTION_COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Comprehensive Detail Table */}
            <div className={cardShell}>
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">All collection breakdown</h3>
                  <p className="text-sm text-slate-500">
                    Detailed counts for tiles uploaded (1 per design), total photos, and averages.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search collection..."
                      value={collectionSearch}
                      onChange={(e) => setCollectionSearch(e.target.value)}
                      className="w-52 rounded-full border border-slate-200 bg-slate-50/80 pl-9 pr-3.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 outline-none focus:border-[#0145F2] focus:bg-white transition-all shadow-2xs"
                    />
                  </div>
                  <select
                    value={collectionSort}
                    onChange={(e) => setCollectionSort(e.target.value)}
                    className="rounded-full border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#0145F2] focus:bg-white transition-all shadow-2xs"
                  >
                    <option value="tiles-desc">Most tiles uploaded (1 per design)</option>
                    <option value="tiles-asc">Least tiles uploaded</option>
                    <option value="photos-desc">Most total photos</option>
                    <option value="photos-asc">Least total photos</option>
                    <option value="name-asc">Collection name A-Z</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/70 text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-5 py-3.5">Collection</th>
                      <th className="px-5 py-3.5">Sample Photos</th>
                      <th className={`px-5 py-3.5 text-right transition-colors ${
                        collectionMetricMode === 'tiles' ? 'text-[#0145F2] font-bold bg-blue-50/50' : ''
                      }`}>
                        Tiles Uploaded (1 per design)
                      </th>
                      <th className={`px-5 py-3.5 text-right transition-colors ${
                        collectionMetricMode === 'photos' ? 'text-amber-700 font-bold bg-amber-50/50' : ''
                      }`}>
                        Total Photos
                      </th>
                      <th className="px-5 py-3.5 text-right">Avg / Tile</th>
                      <th className="px-5 py-3.5 w-44">
                        Share ({collectionMetricMode === 'tiles' ? 'Tiles' : 'Photos'})
                      </th>
                      <th className="px-5 py-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredCollections.length > 0 ? (
                      filteredCollections.map((col, idx) => {
                        const tileShare = col.percentageOfProducts || (collectionPhotos.totalProducts > 0
                          ? Number(((col.productCount / collectionPhotos.totalProducts) * 100).toFixed(1))
                          : 0);
                        const photoShare = col.percentageOfPhotos || 0;
                        const activeShare = collectionMetricMode === 'tiles' ? tileShare : photoShare;

                        return (
                          <tr key={col.collectionName} className="transition-colors hover:bg-slate-50/70">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0145F2] font-bold text-xs">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{col.collectionName}</p>
                                  <p className="text-xs text-slate-400">{col.productCount} tile designs uploaded</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center -space-x-2 overflow-hidden py-1">
                                {col.previewImages && col.previewImages.length > 0 ? (
                                  col.previewImages.map((img, imgIdx) => (
                                    <img
                                      key={imgIdx}
                                      src={getImageUrl(img)}
                                      alt=""
                                      className="inline-block h-9 w-9 rounded-lg border-2 border-white object-cover shadow-2xs bg-slate-100"
                                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                  ))
                                ) : (
                                  <span className="text-xs text-slate-400 italic">No previews</span>
                                )}
                                {col.photoCount > 4 && (
                                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600 shadow-2xs">
                                    +{col.photoCount - 4}
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* Tiles Uploaded: 1 count per unique design (e.g. 47 tiles) */}
                            <td className={`px-5 py-4 text-right transition-colors ${
                              collectionMetricMode === 'tiles' ? 'bg-blue-50/30' : ''
                            }`}>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 font-bold text-xs text-[#0145F2] border border-blue-200/70">
                                <Package size={13} />
                                {formatNumber(col.productCount)} tiles
                              </span>
                            </td>
                            {/* Total Photos: all photos combined (e.g. 193 photos) */}
                            <td className={`px-5 py-4 text-right transition-colors ${
                              collectionMetricMode === 'photos' ? 'bg-amber-50/30' : ''
                            }`}>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-semibold text-xs text-amber-800 border border-amber-200/70">
                                <Camera size={13} />
                                {formatNumber(col.photoCount)} photos
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right text-slate-600">
                              <span className="font-mono text-xs font-semibold">{col.avgPhotosPerProduct}</span>
                              <span className="text-[10px] text-slate-400 ml-1">photos/tile</span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                  <span className="font-bold text-slate-700">{activeShare}%</span>
                                  <span className="text-[10px] text-slate-400">
                                    of {collectionMetricMode === 'tiles' ? 'tiles' : 'photos'}
                                  </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      collectionMetricMode === 'tiles' ? 'bg-[#0145F2]' : 'bg-amber-500'
                                    }`}
                                    style={{ width: `${activeShare}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-center">
                              <Link
                                to={`/admin/products?category=${encodeURIComponent(col.collectionName)}`}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-[#0145F2] hover:text-white hover:border-[#0145F2]"
                                title={`View ${col.collectionName} in Collection`}
                              >
                                <span>View</span>
                                <ExternalLink size={12} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-5 py-10 text-center text-slate-400">
                          No collections found matching "{collectionSearch}".
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
