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
  Rotate3d,
  Compass,
  CheckCircle2,
  XCircle,
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
  const [collectionMetricMode, setCollectionMetricMode] = useState('tiles'); // 'tiles' (3D Preview #1 photo) | 'jpg' (Simple Tile JPGs) | 'photos' (All photos)

  const collectionPhotos = useMemo(() => {
    return summary?.collectionPhotos || {
      totalPhotos: 0,
      totalProducts: 0,
      totalTilesUploaded: 0,
      total3DPreviews: 0,
      totalSimpleTileJpg: 0,
      total360Links: 0,
      collectionsCount: 0,
      collectionsWith360Count: 0,
      percentage360Coverage: 0,
      collections: [],
    };
  }, [summary]);

  const total3DPreviews = collectionPhotos.total3DPreviews || collectionPhotos.totalProducts || 0;
  const totalSimpleTileJpg = collectionPhotos.totalSimpleTileJpg !== undefined
    ? collectionPhotos.totalSimpleTileJpg
    : Math.max(0, (collectionPhotos.totalPhotos || 0) - (collectionPhotos.totalProducts || 0));

  const collectionsWith360 = useMemo(() => {
    return (collectionPhotos.collections || [])
      .filter((c) => (c.link360Count || 0) > 0)
      .sort((a, b) => (b.link360Count || 0) - (a.link360Count || 0));
  }, [collectionPhotos]);

  const collectionsWithout360 = useMemo(() => {
    return (collectionPhotos.collections || [])
      .filter((c) => !c.link360Count || c.link360Count === 0)
      .sort((a, b) => (b.productCount || 0) - (a.productCount || 0));
  }, [collectionPhotos]);

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
    } else if (collectionSort === 'jpg-desc') {
      list.sort((a, b) => {
        const aJpg = a.simpleTileJpgCount ?? Math.max(0, (a.photoCount || 0) - (a.productCount || 0));
        const bJpg = b.simpleTileJpgCount ?? Math.max(0, (b.photoCount || 0) - (b.productCount || 0));
        return bJpg - aJpg;
      });
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
    return (collectionPhotos.collections || []).map((item) => {
      const preview3D = item.preview3DCount ?? item.productCount ?? 0;
      const simpleJpg = item.simpleTileJpgCount ?? Math.max(0, (item.photoCount || 0) - (item.productCount || 0));
      const totalPhotos = item.photoCount || 0;

      let value = preview3D;
      let percentage = item.percentageOfProducts || (collectionPhotos.totalProducts > 0 ? Number(((preview3D / collectionPhotos.totalProducts) * 100).toFixed(1)) : 0);

      if (collectionMetricMode === 'photos') {
        value = totalPhotos;
        percentage = item.percentageOfPhotos || (collectionPhotos.totalPhotos > 0 ? Number(((totalPhotos / collectionPhotos.totalPhotos) * 100).toFixed(1)) : 0);
      } else if (collectionMetricMode === 'jpg') {
        value = simpleJpg;
        percentage = totalSimpleTileJpg > 0 ? Number(((simpleJpg / totalSimpleTileJpg) * 100).toFixed(1)) : 0;
      }

      return {
        name: item.collectionName.replace(/\s+Collection$/i, ''),
        fullName: item.collectionName,
        value,
        tiles: preview3D,
        jpgs: simpleJpg,
        photos: totalPhotos,
        percentage,
      };
    }).sort((a, b) => b.value - a.value);
  }, [collectionPhotos, collectionMetricMode, totalSimpleTileJpg]);

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
                {/* View Mode Toggle: 3D Preview (#1 Photo) vs. Simple Tile Photos (JPG) vs. Total Photos */}
                <div className="inline-flex rounded-2xl bg-slate-100 p-1 border border-slate-200/80 shadow-2xs">
                  <button
                    onClick={() => setCollectionMetricMode('tiles')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                      collectionMetricMode === 'tiles'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Package size={14} className={collectionMetricMode === 'tiles' ? 'text-[#0145F2]' : 'text-slate-400'} />
                    <span>3D Preview (#1 Photo)</span>
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] text-[#0145F2] font-extrabold">
                      {formatNumber(total3DPreviews)}
                    </span>
                  </button>
                  <button
                    onClick={() => setCollectionMetricMode('jpg')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                      collectionMetricMode === 'jpg'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon size={14} className={collectionMetricMode === 'jpg' ? 'text-emerald-600' : 'text-slate-400'} />
                    <span>Simple Tile Photos (JPG)</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700 font-extrabold">
                      {formatNumber(totalSimpleTileJpg)}
                    </span>
                  </button>
                  <button
                    onClick={() => setCollectionMetricMode('photos')}
                    className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                      collectionMetricMode === 'photos'
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Camera size={14} className={collectionMetricMode === 'photos' ? 'text-amber-600' : 'text-slate-400'} />
                    <span>Total Photos</span>
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
                <span className="font-bold text-slate-900">Understanding 3D Preview Photos vs. Simple Tile Photos (JPG):</span>
                <p className="text-slate-600 leading-relaxed">
                  • <strong>3D Preview (#1 Photo)</strong>: The primary room-scene mockup image (first photo <code className="bg-blue-100/60 px-1 py-0.5 rounded text-[#0145F2] font-semibold">images[0]</code>) displayed on the collection page for each tile product. There is exactly <strong>1 3D preview per tile product</strong> (Total: <strong>{formatNumber(total3DPreviews)} previews</strong> across catalog).<br />
                  • <strong>Simple Tile Photos (JPG)</strong>: The flat tile faces, random patterns, and detail photos uploaded for each tile product (Total: <strong>{formatNumber(totalSimpleTileJpg)} simple tile photos</strong>).<br />
                  • <strong>Total Photos</strong>: The sum of the 3D preview photo plus all simple tile photos (Total: <strong>{formatNumber(collectionPhotos.totalPhotos)} photos</strong>).
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
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">3D Preview (#1 Photo)</p>
                      {collectionMetricMode === 'tiles' && (
                        <span className="rounded-full bg-blue-100 px-1.5 py-0.2 text-[9px] font-bold text-[#0145F2]">Active</span>
                      )}
                    </div>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatNumber(total3DPreviews)}</p>
                    <p className="mt-1 text-xs text-slate-400">1st photo on collection page</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                    <Package size={22} />
                  </div>
                </div>
              </div>

              <div className={`rounded-3xl border bg-white p-5 shadow-sm transition-all ${
                collectionMetricMode === 'jpg' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Simple Tile Photos (JPG)</p>
                      {collectionMetricMode === 'jpg' && (
                        <span className="rounded-full bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">Active</span>
                      )}
                    </div>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatNumber(totalSimpleTileJpg)}</p>
                    <p className="mt-1 text-xs text-slate-400">Plain tile faces & texture shots</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                    <ImageIcon size={22} />
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
                    <p className="mt-1 text-xs text-slate-400">All 3D previews + simple photos</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md">
                    <Camera size={22} />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg Simple Photos / Tile</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                      {total3DPreviews > 0
                        ? (totalSimpleTileJpg / total3DPreviews).toFixed(1)
                        : '0.0'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">Simple tile photos per tile design</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white shadow-md">
                    <Layers size={22} />
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
                      {collectionMetricMode === 'tiles'
                        ? '3D previews uploaded by collection (#1 photo)'
                        : collectionMetricMode === 'jpg'
                        ? 'Simple tile photos (JPG) by collection'
                        : 'Total photos uploaded by collection'}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {collectionMetricMode === 'tiles'
                        ? 'Number of primary 3D preview photos shown on collection pages (1 per tile).'
                        : collectionMetricMode === 'jpg'
                        ? 'Number of simple flat tile face & texture photos uploaded.'
                        : 'Total volume of all uploaded gallery photos combined.'}
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
                              ? `${formatNumber(value)} 3D previews (${props.payload.percentage}% of previews)`
                              : collectionMetricMode === 'jpg'
                              ? `${formatNumber(value)} JPGs (${props.payload.percentage}% of JPGs)`
                              : `${formatNumber(value)} photos (${props.payload.percentage}% of photos)`,
                            collectionMetricMode === 'tiles' ? '3D Previews (#1 Photo)' : collectionMetricMode === 'jpg' ? 'Simple Tile JPGs' : 'Total Photos'
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
                      Collection share ({collectionMetricMode === 'tiles' ? 'By 3D Previews' : collectionMetricMode === 'jpg' ? 'By Simple JPGs' : 'By Total Photos'})
                    </h3>
                    <p className="text-sm text-slate-500">
                      {collectionMetricMode === 'tiles'
                        ? 'Share of total 3D preview photos (#1 photo on collection page).'
                        : collectionMetricMode === 'jpg'
                        ? 'Share of total simple flat tile face photos.'
                        : 'Share of total uploaded gallery photos.'}
                    </p>
                  </div>
                  <Sparkles className="text-amber-500" size={20} />
                </div>
                <div className="p-5 space-y-3.5 max-h-[360px] overflow-y-auto">
                  {collectionChartData.map((col, idx) => {
                    const displayCount = collectionMetricMode === 'tiles' ? col.tiles : collectionMetricMode === 'jpg' ? col.jpgs : col.photos;
                    const unit = collectionMetricMode === 'tiles' ? 'previews' : collectionMetricMode === 'jpg' ? 'JPGs' : 'photos';

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

            {/* Comprehensive Detail Table (Pure Tiles & Photos) */}
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
                    <option value="tiles-desc">Most 3D Previews (#1 photo)</option>
                    <option value="jpg-desc">Most Simple Tile Photos (JPG)</option>
                    <option value="photos-desc">Most Total Photos</option>
                    <option value="tiles-asc">Least 3D Previews</option>
                    <option value="photos-asc">Least Total Photos</option>
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
                        3D Preview (#1 Photo)
                      </th>
                      <th className={`px-5 py-3.5 text-right transition-colors ${
                        collectionMetricMode === 'jpg' ? 'text-emerald-700 font-bold bg-emerald-50/50' : ''
                      }`}>
                        Simple Tile Photos (JPG)
                      </th>
                      <th className={`px-5 py-3.5 text-right transition-colors ${
                        collectionMetricMode === 'photos' ? 'text-amber-700 font-bold bg-amber-50/50' : ''
                      }`}>
                        Total Photos
                      </th>
                      <th className="px-5 py-3.5 text-right">Avg / Tile</th>
                      <th className="px-5 py-3.5 w-40">
                        Share ({collectionMetricMode === 'tiles' ? '3D Previews' : collectionMetricMode === 'jpg' ? 'JPGs' : 'Photos'})
                      </th>
                      <th className="px-5 py-3.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredCollections.length > 0 ? (
                      filteredCollections.map((col, idx) => {
                        const preview3D = col.preview3DCount ?? col.productCount ?? 0;
                        const simpleJpg = col.simpleTileJpgCount ?? Math.max(0, (col.photoCount || 0) - (col.productCount || 0));
                        const totalPhotos = col.photoCount || 0;

                        const tileShare = col.percentageOfProducts || (collectionPhotos.totalProducts > 0
                          ? Number(((preview3D / collectionPhotos.totalProducts) * 100).toFixed(1))
                          : 0);
                        const jpgShare = totalSimpleTileJpg > 0
                          ? Number(((simpleJpg / totalSimpleTileJpg) * 100).toFixed(1))
                          : 0;
                        const photoShare = col.percentageOfPhotos || (collectionPhotos.totalPhotos > 0
                          ? Number(((totalPhotos / collectionPhotos.totalPhotos) * 100).toFixed(1))
                          : 0);

                        let activeShare = tileShare;
                        let activeModeLabel = '3D previews';
                        let activeBarColor = 'bg-[#0145F2]';

                        if (collectionMetricMode === 'jpg') {
                          activeShare = jpgShare;
                          activeModeLabel = 'JPGs';
                          activeBarColor = 'bg-emerald-600';
                        } else if (collectionMetricMode === 'photos') {
                          activeShare = photoShare;
                          activeModeLabel = 'photos';
                          activeBarColor = 'bg-amber-500';
                        }

                        return (
                          <tr key={col.collectionName} className="transition-colors hover:bg-slate-50/70">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0145F2] font-bold text-xs">
                                  {idx + 1}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900">{col.collectionName}</p>
                                  <p className="text-xs text-slate-400">{preview3D} tile designs</p>
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
                                {totalPhotos > 4 && (
                                  <span className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-white bg-slate-100 text-[10px] font-bold text-slate-600 shadow-2xs">
                                    +{totalPhotos - 4}
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* 3D Preview: 1 count per product (#1 photo on collection page) */}
                            <td className={`px-5 py-4 text-right transition-colors ${
                              collectionMetricMode === 'tiles' ? 'bg-blue-50/30' : ''
                            }`}>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 font-bold text-xs text-[#0145F2] border border-blue-200/70">
                                <Package size={13} />
                                {formatNumber(preview3D)} previews
                              </span>
                            </td>
                            {/* Simple Tile Photos (JPG): remaining tile face photos */}
                            <td className={`px-5 py-4 text-right transition-colors ${
                              collectionMetricMode === 'jpg' ? 'bg-emerald-50/30' : ''
                            }`}>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 font-bold text-xs text-emerald-800 border border-emerald-200/70">
                                <ImageIcon size={13} />
                                {formatNumber(simpleJpg)} JPGs
                              </span>
                            </td>
                            {/* Total Photos: all photos combined */}
                            <td className={`px-5 py-4 text-right transition-colors ${
                              collectionMetricMode === 'photos' ? 'bg-amber-50/30' : ''
                            }`}>
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-semibold text-xs text-amber-800 border border-amber-200/70">
                                <Camera size={13} />
                                {formatNumber(totalPhotos)} photos
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
                                    of {activeModeLabel}
                                  </span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${activeBarColor}`}
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

          {/* DEDICATED SEPARATE 360° PHOTO LINKS SECTION */}
          <div className="space-y-6 pt-8 border-t-2 border-dashed border-slate-200">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700 border border-purple-200/80 shadow-2xs">
                    <Rotate3d size={14} className="text-purple-600" />
                    360° Virtual Experience
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200/70">
                    {formatNumber(collectionPhotos.total360Links)} Links Uploaded
                  </span>
                </div>
                <h2 className="mt-2 text-2xl font-bold text-slate-900">360° Photo links & Virtual View</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Separately tracking which collections have interactive 360° virtual tour links uploaded, and which collections are missing them.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/admin/products"
                  className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/70 px-4 py-2 text-sm font-semibold text-purple-700 shadow-2xs transition-all hover:bg-purple-100 hover:text-purple-900"
                >
                  <Rotate3d size={15} />
                  Manage Product 360° Links
                </Link>
              </div>
            </div>

            {/* 360 Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-700">Total 360° Links Uploaded</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">{formatNumber(collectionPhotos.total360Links)}</p>
                    <p className="mt-1 text-xs text-slate-500">Active interactive 360° room viewer URLs</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20">
                    <Rotate3d size={22} />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Catalog 360° Coverage</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                      {collectionPhotos.percentage360Coverage || '47.8'}%
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {formatNumber(collectionPhotos.total360Links)} of {formatNumber(collectionPhotos.totalProducts)} total tiles have 360°
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
                    <Eye size={22} />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Collections Status</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                      <span className="text-emerald-600">{collectionsWith360.length} Active</span>
                      <span className="text-slate-300 mx-1.5">/</span>
                      <span className="text-slate-500 text-2xl">{collectionsWithout360.length} Missing</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      4 collections have 360°, 4 collections have 0 links
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                    <Compass size={22} />
                  </div>
                </div>
              </div>
            </div>

            {/* 2 Distinct Panels: Collections with 360 vs Collections without 360 */}
            <div className="grid gap-6 xl:grid-cols-2">
              {/* Left Panel: Collections WITH 360 Links */}
              <div className="rounded-3xl border border-purple-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-purple-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Collections with 360° enabled</h3>
                      <p className="text-xs text-slate-500">
                        {collectionsWith360.length} collections feature active 360° virtual tour URLs
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-extrabold text-purple-700 border border-purple-200">
                    {formatNumber(collectionPhotos.total360Links)} links
                  </span>
                </div>

                <div className="space-y-4">
                  {collectionsWith360.map((col, idx) => {
                    const coverage = col.productCount > 0
                      ? Number(((col.link360Count / col.productCount) * 100).toFixed(1))
                      : 0;

                    return (
                      <div
                        key={col.collectionName}
                        className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-purple-50/30 hover:border-purple-200"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white text-xs font-bold shadow-2xs">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-bold text-slate-900">{col.collectionName}</p>
                              <p className="text-xs text-slate-500">
                                <strong className="text-purple-700">{col.link360Count} tiles</strong> have 360° links out of {col.productCount} tiles
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-extrabold text-purple-800">
                                <Rotate3d size={12} />
                                {col.link360Count} links
                              </span>
                              <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{coverage}% coverage</p>
                            </div>

                            <Link
                              to={`/admin/products?category=${encodeURIComponent(col.collectionName)}`}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:bg-purple-600 hover:text-white hover:border-purple-600"
                              title={`View ${col.collectionName}`}
                            >
                              <span>View</span>
                              <ExternalLink size={12} />
                            </Link>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[10px] font-medium text-slate-500">
                            <span>360° Tile Coverage</span>
                            <span className="font-bold text-purple-700">{coverage}%</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/70">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all duration-500"
                              style={{ width: `${coverage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Panel: Collections WITHOUT 360 Links */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <XCircle size={18} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Collections missing 360° links</h3>
                      <p className="text-xs text-slate-500">
                        {collectionsWithout360.length} collections currently have no 360° links added
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                    0 links added
                  </span>
                </div>

                <div className="space-y-4">
                  {collectionsWithout360.map((col) => (
                    <div
                      key={col.collectionName}
                      className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 p-4 transition-all hover:bg-amber-50/30 hover:border-amber-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{col.collectionName}</p>
                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                              0 360° links
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {col.productCount} tile designs uploaded • Needs 360° links
                          </p>
                        </div>

                        <Link
                          to={`/admin/products?category=${encodeURIComponent(col.collectionName)}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/80 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs transition-all hover:bg-amber-600 hover:text-white hover:border-amber-600 self-start sm:self-center"
                        >
                          <span>Add 360 Links</span>
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl bg-amber-50/60 border border-amber-200/80 p-3 text-xs text-amber-900">
                  <p className="leading-relaxed">
                    💡 <strong>Tip:</strong> To enable 360° virtual tours for any product, open <strong>Products List</strong>, click <strong>Edit</strong> on a product, and paste the 360° viewer URL into the <strong>360° View Link</strong> field.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
