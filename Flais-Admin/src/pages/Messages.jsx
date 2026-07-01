import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Mail, 
  Trash2, 
  Reply, 
  MoreVertical,
  Star,
  Save,
  Settings,
  Filter,
  Download,
  FileText
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const defaultContactSettings = {
  phone1: '+91 95867 33300',
  phone2: '+91 98983 04831',
  email: 'info@flaisgranito.com',
  address: 'Survey No. 151/pl, Unchi Mandal, Halvad Highway, Gujarat 363642, India.',
  heroTitle: 'Contact Us',
  heroSubtitle: 'Have a question or planning a project? Reach out to our team of experts today.',
  heroMedia: '',
  facebook: 'https://www.facebook.com/FlaisTile/',
  instagram: 'https://www.instagram.com/flaisgranito/',
  linkedin: 'https://www.linkedin.com/company/flais-granito/',
  youtube: 'https://www.youtube.com/@FlaisGranito'
};

const countryCodes = [
  { code: '+91', name: 'India (IN)' },
  { code: '+93', name: 'Afghanistan' },
  { code: '+355', name: 'Albania' },
  { code: '+213', name: 'Algeria' },
  { code: '+376', name: 'Andorra' },
  { code: '+244', name: 'Angola' },
  { code: '+1-268', name: 'Antigua and Barbuda' },
  { code: '+54', name: 'Argentina' },
  { code: '+374', name: 'Armenia' },
  { code: '+61', name: 'Australia' },
  { code: '+43', name: 'Austria' },
  { code: '+994', name: 'Azerbaijan' },
  { code: '+1-242', name: 'Bahamas' },
  { code: '+973', name: 'Bahrain' },
  { code: '+880', name: 'Bangladesh' },
  { code: '+1-246', name: 'Barbados' },
  { code: '+375', name: 'Belarus' },
  { code: '+32', name: 'Belgium' },
  { code: '+501', name: 'Belize' },
  { code: '+229', name: 'Benin' },
  { code: '+975', name: 'Bhutan' },
  { code: '+591', name: 'Bolivia' },
  { code: '+387', name: 'Bosnia and Herzegovina' },
  { code: '+267', name: 'Botswana' },
  { code: '+55', name: 'Brazil' },
  { code: '+673', name: 'Brunei' },
  { code: '+359', name: 'Bulgaria' },
  { code: '+226', name: 'Burkina Faso' },
  { code: '+257', name: 'Burundi' },
  { code: '+855', name: 'Cambodia' },
  { code: '+237', name: 'Cameroon' },
  { code: '+1', name: 'Canada' },
  { code: '+238', name: 'Cape Verde' },
  { code: '+236', name: 'Central African Republic' },
  { code: '+235', name: 'Chad' },
  { code: '+56', name: 'Chile' },
  { code: '+86', name: 'China' },
  { code: '+57', name: 'Colombia' },
  { code: '+269', name: 'Comoros' },
  { code: '+242', name: 'Congo (Republic)' },
  { code: '+243', name: 'Congo (Democratic Republic)' },
  { code: '+506', name: 'Costa Rica' },
  { code: '+385', name: 'Croatia' },
  { code: '+53', name: 'Cuba' },
  { code: '+357', name: 'Cyprus' },
  { code: '+420', name: 'Czech Republic' },
  { code: '+45', name: 'Denmark' },
  { code: '+253', name: 'Djibouti' },
  { code: '+1-767', name: 'Dominica' },
  { code: '+1-809', name: 'Dominican Republic' },
  { code: '+593', name: 'Ecuador' },
  { code: '+20', name: 'Egypt' },
  { code: '+503', name: 'El Salvador' },
  { code: '+240', name: 'Equatorial Guinea' },
  { code: '+291', name: 'Eritrea' },
  { code: '+372', name: 'Estonia' },
  { code: '+251', name: 'Ethiopia' },
  { code: '+679', name: 'Fiji' },
  { code: '+358', name: 'Finland' },
  { code: '+33', name: 'France' },
  { code: '+241', name: 'Gabon' },
  { code: '+220', name: 'Gambia' },
  { code: '+995', name: 'Georgia' },
  { code: '+49', name: 'Germany' },
  { code: '+233', name: 'Ghana' },
  { code: '+30', name: 'Greece' },
  { code: '+1-473', name: 'Grenada' },
  { code: '+502', name: 'Guatemala' },
  { code: '+224', name: 'Guinea' },
  { code: '+245', name: 'Guinea-Bissau' },
  { code: '+592', name: 'Guyana' },
  { code: '+509', name: 'Haiti' },
  { code: '+504', name: 'Honduras' },
  { code: '+852', name: 'Hong Kong' },
  { code: '+36', name: 'Hungary' },
  { code: '+354', name: 'Iceland' },
  { code: '+62', name: 'Indonesia' },
  { code: '+98', name: 'Iran' },
  { code: '+964', name: 'Iraq' },
  { code: '+353', name: 'Ireland' },
  { code: '+972', name: 'Israel' },
  { code: '+39', name: 'Italy' },
  { code: '+225', name: 'Ivory Coast' },
  { code: '+1-876', name: 'Jamaica' },
  { code: '+81', name: 'Japan' },
  { code: '+962', name: 'Jordan' },
  { code: '+7', name: 'Kazakhstan' },
  { code: '+254', name: 'Kenya' },
  { code: '+686', name: 'Kiribati' },
  { code: '+965', name: 'Kuwait' },
  { code: '+996', name: 'Kyrgyzstan' },
  { code: '+856', name: 'Laos' },
  { code: '+371', name: 'Latvia' },
  { code: '+961', name: 'Lebanon' },
  { code: '+266', name: 'Lesotho' },
  { code: '+231', name: 'Liberia' },
  { code: '+218', name: 'Libya' },
  { code: '+423', name: 'Liechtenstein' },
  { code: '+370', name: 'Lithuania' },
  { code: '+352', name: 'Luxembourg' },
  { code: '+853', name: 'Macao' },
  { code: '+389', name: 'Macedonia' },
  { code: '+261', name: 'Madagascar' },
  { code: '+265', name: 'Malawi' },
  { code: '+60', name: 'Malaysia' },
  { code: '+960', name: 'Maldives' },
  { code: '+223', name: 'Mali' },
  { code: '+356', name: 'Malta' },
  { code: '+692', name: 'Marshall Islands' },
  { code: '+222', name: 'Mauritania' },
  { code: '+230', name: 'Mauritius' },
  { code: '+52', name: 'Mexico' },
  { code: '+691', name: 'Micronesia' },
  { code: '+373', name: 'Moldova' },
  { code: '+377', name: 'Monaco' },
  { code: '+976', name: 'Mongolia' },
  { code: '+382', name: 'Montenegro' },
  { code: '+212', name: 'Morocco' },
  { code: '+258', name: 'Mozambique' },
  { code: '+95', name: 'Myanmar' },
  { code: '+264', name: 'Namibia' },
  { code: '+674', name: 'Nauru' },
  { code: '+977', name: 'Nepal' },
  { code: '+31', name: 'Netherlands' },
  { code: '+64', name: 'New Zealand' },
  { code: '+505', name: 'Nicaragua' },
  { code: '+227', name: 'Niger' },
  { code: '+234', name: 'Nigeria' },
  { code: '+850', name: 'North Korea' },
  { code: '+47', name: 'Norway' },
  { code: '+968', name: 'Oman' },
  { code: '+92', name: 'Pakistan' },
  { code: '+680', name: 'Palau' },
  { code: '+507', name: 'Panama' },
  { code: '+675', name: 'Papua New Guinea' },
  { code: '+595', name: 'Paraguay' },
  { code: '+51', name: 'Peru' },
  { code: '+63', name: 'Philippines' },
  { code: '+48', name: 'Poland' },
  { code: '+351', name: 'Portugal' },
  { code: '+974', name: 'Qatar' },
  { code: '+40', name: 'Romania' },
  { code: '+7', name: 'Russia' },
  { code: '+250', name: 'Rwanda' },
  { code: '+1-869', name: 'Saint Kitts and Nevis' },
  { code: '+1-758', name: 'Saint Lucia' },
  { code: '+1-784', name: 'Saint Vincent' },
  { code: '+685', name: 'Samoa' },
  { code: '+378', name: 'San Marino' },
  { code: '+239', name: 'Sao Tome and Principe' },
  { code: '+966', name: 'Saudi Arabia' },
  { code: '+221', name: 'Senegal' },
  { code: '+381', name: 'Serbia' },
  { code: '+248', name: 'Seychelles' },
  { code: '+232', name: 'Sierra Leone' },
  { code: '+65', name: 'Singapore' },
  { code: '+421', name: 'Slovakia' },
  { code: '+386', name: 'Slovenia' },
  { code: '+677', name: 'Solomon Islands' },
  { code: '+252', name: 'Somalia' },
  { code: '+27', name: 'South Africa' },
  { code: '+82', name: 'South Korea' },
  { code: '+211', name: 'South Sudan' },
  { code: '+94', name: 'Sri Lanka' },
  { code: '+249', name: 'Sudan' },
  { code: '+597', name: 'Suriname' },
  { code: '+268', name: 'Swaziland' },
  { code: '+46', name: 'Sweden' },
  { code: '+41', name: 'Switzerland' },
  { code: '+963', name: 'Syria' },
  { code: '+886', name: 'Taiwan' },
  { code: '+992', name: 'Tajikistan' },
  { code: '+255', name: 'Tanzania' },
  { code: '+66', name: 'Thailand' },
  { code: '+670', name: 'Timor-Leste' },
  { code: '+228', name: 'Togo' },
  { code: '+676', name: 'Tonga' },
  { code: '+1-868', name: 'Trinidad and Tobago' },
  { code: '+216', name: 'Tunisia' },
  { code: '+90', name: 'Turkey' },
  { code: '+993', name: 'Turkmenistan' },
  { code: '+688', name: 'Tuvalu' },
  { code: '+256', name: 'Uganda' },
  { code: '+380', name: 'Ukraine' },
  { code: '+971', name: 'United Arab Emirates' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+1', name: 'United States' },
  { code: '+598', name: 'Uruguay' },
  { code: '+998', name: 'Uzbekistan' },
  { code: '+678', name: 'Vanuatu' },
  { code: '+379', name: 'Vatican City' },
  { code: '+58', name: 'Venezuela' },
  { code: '+84', name: 'Vietnam' },
  { code: '+967', name: 'Yemen' },
  { code: '+260', name: 'Zambia' },
  { code: '+263', name: 'Zimbabwe' }
];

const countryCodeLookup = [...countryCodes].sort((a, b) => b.code.length - a.code.length);

const getCountryFromPhone = (phone = '') => {
  const normalized = String(phone).trim();
  const match = countryCodeLookup.find(({ code }) => normalized.startsWith(code));
  return match?.name || 'Unknown';
};

const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapePdfText = (value = '') =>
  String(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/\r?\n/g, ' ');

const formatDateTime = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '-'
    : date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
};

const buildSimplePdf = (rows) => {
  const pageWidth = 841.89;
  const pageHeight = 595.28;
  const margin = 24;
  const tableX = margin;
  const tableWidth = pageWidth - margin * 2;
  const titleTop = pageHeight - margin;
  const subtitleTop = titleTop - 18;
  const startY = pageHeight - 76;
  const bottomLimit = margin + 12;
  const headerHeight = 22;
  const lineHeight = 12;
  const bodyFontSize = 9;

  const columns = [
    { key: 'index', label: '#', width: 26, wrap: 4 },
    { key: 'name', label: 'Name', width: 90, wrap: 14 },
    { key: 'email', label: 'Email', width: 145, wrap: 22 },
    { key: 'country', label: 'Country', width: 80, wrap: 14 },
    { key: 'phone', label: 'Phone', width: 70, wrap: 12 },
    { key: 'status', label: 'Status', width: 52, wrap: 8 },
    { key: 'date', label: 'Date', width: 90, wrap: 14 },
    { key: 'message', label: 'Message', width: 240, wrap: 36 }
  ];

  const wrapText = (value, maxChars) => {
    const text = String(value || '-').trim() || '-';
    const words = text.split(/\s+/);
    const lines = [];
    let current = '';

    const pushCurrent = () => {
      if (current) lines.push(current);
      current = '';
    };

    for (const word of words) {
      if (word.length > maxChars) {
        pushCurrent();
        for (let i = 0; i < word.length; i += maxChars) {
          lines.push(word.slice(i, i + maxChars));
        }
        continue;
      }

      if (!current) {
        current = word;
      } else if ((current + ' ' + word).length <= maxChars) {
        current += ` ${word}`;
      } else {
        pushCurrent();
        current = word;
      }
    }

    pushCurrent();
    return lines.length ? lines : ['-'];
  };

  const buildRow = (msg, index) => {
    const cellData = {
      index: String(index + 1),
      name: msg.name || '-',
      email: msg.email || '-',
      country: getCountryFromPhone(msg.phone),
      phone: msg.phone || '-',
      status: msg.isRead ? 'Read' : 'Unread',
      date: formatDateTime(msg.createdAt),
      message: msg.message || '-'
    };

    const wrapped = {};
    let lineCount = 1;
    columns.forEach((column) => {
      wrapped[column.key] = wrapText(cellData[column.key], column.wrap);
      lineCount = Math.max(lineCount, wrapped[column.key].length);
    });

    return { wrapped, lineCount, isRead: !!msg.isRead };
  };

  const preparedRows = rows.map(buildRow);
  const pages = [];
  let currentPage = [];
  let currentY = startY;

  const rowHeightFor = (row) => row.lineCount * lineHeight + 12;

  const newPage = () => {
    if (currentPage.length) pages.push(currentPage);
    currentPage = [];
    currentY = startY;
  };

  preparedRows.forEach((row) => {
    const rowHeight = rowHeightFor(row);
    if (currentY - rowHeight < bottomLimit) {
      newPage();
    }
    currentPage.push({ row, y: currentY, height: rowHeight });
    currentY -= rowHeight;
  });
  if (currentPage.length) pages.push(currentPage);

  const objects = [];
  const addObject = (content) => {
    objects.push(content);
    return objects.length;
  };

  const fontRegular = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  const fontBold = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
  const pageObjectRefs = [];

  const drawText = (x, y, text, size = bodyFontSize, bold = false) =>
    `BT /${bold ? 'F2' : 'F1'} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdfText(text)}) Tj ET`;

  const addRect = (x, y, w, h, fill = null, stroke = null) => {
    const cmds = [];
    if (fill) cmds.push(`${fill} rg`);
    if (stroke) cmds.push(`${stroke} RG`);
    cmds.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re`);
    cmds.push(fill && stroke ? 'B' : fill ? 'f' : 'S');
    return cmds.join('\n');
  };

  pages.forEach((pageRows) => {
    const cmds = [];

    cmds.push('1 1 1 rg');
    cmds.push(`0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)} re`);
    cmds.push('f');

    cmds.push(drawText(tableX, titleTop - 10, 'FLAIS GRANITO - Customer Inquiries', 16, true));
    cmds.push(drawText(tableX, subtitleTop - 6, `Generated on: ${new Date().toLocaleString()}`, 9, false));

    const headerY = startY + headerHeight;
    let xCursor = tableX;
    cmds.push(addRect(tableX, headerY - headerHeight, tableWidth, headerHeight, '0.01 0.27 0.95', null));
    columns.forEach((column) => {
      cmds.push(drawText(xCursor + 6, headerY - 14, column.label, 9, true));
      xCursor += column.width;
    });

    pageRows.forEach(({ row, y }, index) => {
      const rowBottom = y - row.height;
      const fillColor = row.isRead ? '0.98 0.98 0.98' : '0.95 0.97 1';
      cmds.push(addRect(tableX, rowBottom, tableWidth, row.height, fillColor, null));

      let cellX = tableX;
      columns.forEach((column) => {
        const lines = row.wrapped[column.key];
        const textTop = y - 9;
        lines.forEach((line, lineIndex) => {
          const textY = textTop - (lineIndex * lineHeight);
          const isCentered = column.key === 'index' || column.key === 'status';
          const textX = isCentered ? cellX + column.width / 2 - (line.length * 2.2) : cellX + 6;
          cmds.push(drawText(textX, textY, line, 9, column.key === 'status'));
        });
        cellX += column.width;
      });

      cmds.push(`0.88 G`);
      cmds.push(`${tableX.toFixed(2)} ${(rowBottom).toFixed(2)} m ${(tableX + tableWidth).toFixed(2)} ${(rowBottom).toFixed(2)} l S`);
    });

    const contentStream = cmds.join('\n');
    const contentObj = addObject(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`);
    const pageObj = addObject(`<< /Type /Page /Parent {{PAGES}} 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /Font << /F1 ${fontRegular} 0 R /F2 ${fontBold} 0 R >> >> /Contents ${contentObj} 0 R >>`);
    pageObjectRefs.push(pageObj);
  });

  const pagesObj = addObject(`<< /Type /Pages /Kids [${pageObjectRefs.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectRefs.length} >>`);
  const catalogObj = addObject(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);

  const resolvedObjects = objects.map((obj) => obj.replace('{{PAGES}}', String(pagesObj)));

  let output = '%PDF-1.4\n';
  const offsets = [0];
  resolvedObjects.forEach((obj, index) => {
    offsets[index + 1] = output.length;
    output += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefStart = output.length;
  output += `xref\n0 ${resolvedObjects.length + 1}\n`;
  output += '0000000000 65535 f \n';
  for (let i = 1; i <= resolvedObjects.length; i += 1) {
    output += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  output += `trailer\n<< /Size ${resolvedObjects.length + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return output;
};

const Messages = () => {
  const [activeTab, setActiveTab] = useState('inbox');
  const [contactSettings, setContactSettings] = useState(defaultContactSettings);

  const handleSaveSettings = (e) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem('adminToken');
    axios.put(`${API}/api/settings`, contactSettings, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (res.data.success) toast.success('Contact page settings saved!');
      })
      .catch(() => toast.error('Failed to save contact page settings'));
  };

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const API = import.meta.env.VITE_BACKEND_URL;
  const enrichedMessages = useMemo(
    () => messages.map((msg) => ({ ...msg, country: getCountryFromPhone(msg.phone) })),
    [messages]
  );
  const countryOptions = useMemo(() => {
    const unique = new Set(enrichedMessages.map((msg) => msg.country).filter(Boolean));
    return ['all', ...Array.from(unique).sort((a, b) => a.localeCompare(b))];
  }, [enrichedMessages]);
  const countryStats = useMemo(() => {
    const counts = enrichedMessages.reduce((acc, msg) => {
      acc[msg.country] = (acc[msg.country] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [enrichedMessages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/api/contact`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(response.data.messages);
    } catch (error) {
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    const fetchContactSettings = async () => {
      try {
        const response = await axios.get(`${API}/api/settings`);
        if (response.data.success && response.data.settings) {
          setContactSettings({ ...defaultContactSettings, ...response.data.settings });
        }
      } catch (error) {
        toast.error('Failed to load contact page settings');
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchContactSettings();
  }, [API]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API}/api/contact/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Message deleted');
        setMessages(messages.filter(m => m._id !== id));
      } catch (error) {
        toast.error('Failed to delete message');
      }
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const isRead = status === 'Read';
      await axios.put(`${API}/api/contact/${id}`, { isRead }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setMessages(messages.map(m => m._id === id ? { ...m, isRead } : m));
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getMessageStatus = (msg) => (msg.isRead ? 'Read' : 'Unread');
  const [filters, setFilters] = useState({
    query: '',
    status: 'all',
    country: 'all',
    from: '',
    to: ''
  });

  const filteredMessages = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const fromTime = filters.from ? new Date(`${filters.from}T00:00:00`).getTime() : null;
    const toTime = filters.to ? new Date(`${filters.to}T23:59:59`).getTime() : null;

    return messages.filter((msg) => {
      const createdAt = new Date(msg.createdAt).getTime();
      const country = getCountryFromPhone(msg.phone);
      const matchesQuery =
        !query ||
        [msg.name, msg.email, msg.phone, msg.message, country]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query));
      const matchesStatus =
        filters.status === 'all' ||
        (filters.status === 'read' && msg.isRead) ||
        (filters.status === 'unread' && !msg.isRead);
      const matchesFrom = fromTime === null || createdAt >= fromTime;
      const matchesTo = toTime === null || createdAt <= toTime;
      const matchesCountry = filters.country === 'all' || country === filters.country;

      return matchesQuery && matchesStatus && matchesFrom && matchesTo && matchesCountry;
    });
  }, [filters, messages]);

  const handleExportExcel = () => {
    if (!filteredMessages.length) {
      toast.error('No messages to export.');
      return;
    }

    const rows = filteredMessages.map((msg) => `
      <tr>
        <td>${escapeHtml(msg.name)}</td>
        <td>${escapeHtml(msg.email)}</td>
        <td>${escapeHtml(getCountryFromPhone(msg.phone))}</td>
        <td>${escapeHtml(msg.phone || '')}</td>
        <td>${escapeHtml(msg.isRead ? 'Read' : 'Unread')}</td>
        <td>${escapeHtml(formatDateTime(msg.createdAt))}</td>
        <td>${escapeHtml(msg.message)}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Country</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Date</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-inquiries-${new Date().toISOString().slice(0, 10)}.xls`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!filteredMessages.length) {
      toast.error('No messages to export.');
      return;
    }

    const pdfText = buildSimplePdf(filteredMessages);
    const blob = new Blob([pdfText], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-inquiries-${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contact & Inquiry Management</h1>
          <p className="text-slate-500">
            {activeTab === 'inbox' ? 'Manage customer inquiries and contact form submissions.' : 'Customize the Contact page banner details, address, phone numbers, and social links.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'inbox'
              ? 'border-[#0145F2] text-[#0145F2]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Mail size={18} />
          Messages Inbox
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'settings'
              ? 'border-[#0145F2] text-[#0145F2]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings size={18} />
          Page Settings
        </button>
      </div>

      {activeTab === 'inbox' && (
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-4 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Customer Inquiries</h2>
                <p className="text-sm text-slate-500">Filter, review, and export the submitted contact forms.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                >
                  <Download size={16} />
                  Export Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
                >
                  <FileText size={16} />
                  Export PDF
                </button>
              </div>
            </div>

            {countryStats.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {countryStats.map((item) => (
                  <span
                    key={item.country}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
                  >
                    {item.country}
                    <span className="rounded-full bg-white px-2 py-0.5 text-slate-500">{item.count}</span>
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="relative md:col-span-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  placeholder="Search name, email, phone, or message..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:outline-none"
                />
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Filter size={16} />
                </span>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:outline-none"
                >
                  <option value="all">All statuses</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters({ ...filters, from: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                  title="From date"
                />
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters({ ...filters, to: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:outline-none"
                  title="To date"
                />
              </div>
              <div className="relative md:col-span-2">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Filter size={16} />
                </span>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                  className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm focus:outline-none"
                >
                  {countryOptions.map((country) => (
                    <option key={country} value={country}>
                      {country === 'all' ? 'All countries' : country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-10 text-center text-slate-500">Loading messages...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-10 text-center text-slate-500">No messages found.</div>
            ) : filteredMessages.map((msg) => (
              <div key={msg._id} className={`group flex items-start gap-4 px-6 py-5 transition-colors hover:bg-slate-50/50 cursor-pointer ${!msg.isRead ? 'bg-blue-50/30' : ''}`}>
                <button 
                  onClick={() => handleStatusUpdate(msg._id, getMessageStatus(msg) === 'Read' ? 'Unread' : 'Read')}
                  className={`mt-1 text-slate-300 hover:text-yellow-400 ${msg.isRead ? 'text-yellow-400' : ''}`}
                  title={msg.isRead ? 'Mark as Unread' : 'Mark as Read'}
                >
                  <Star size={18} />
                </button>
                <div className="flex-1 min-w-0" onClick={() => handleStatusUpdate(msg._id, 'Read')}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h4 className={`text-sm ${!msg.isRead ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                        {msg.name} <span className="text-xs font-normal text-slate-400 ml-2">({msg.email})</span>
                      </h4>
                      <p className="mt-1 text-xs text-slate-400">
                        {getCountryFromPhone(msg.phone)} {msg.phone ? `• ${msg.phone}` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`truncate text-sm ${!msg.isRead ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                      {msg.message}
                    </span>
                    {!msg.isRead && (
                      <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#0145F2]"></span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 text-slate-400 hover:text-blue-600" title="Reply">
                    <Reply size={16} />
                  </button>
                  <button onClick={() => handleDelete(msg._id)} className="p-1.5 text-slate-400 hover:text-red-600" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-slate-100 text-center">
            <button className="text-sm font-semibold text-slate-500 hover:text-[#0145F2]">
              Showing {filteredMessages.length} of {messages.length} messages
            </button>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Contact Page Settings</h2>
            <p className="text-sm text-slate-500">Edit hero texts, support email addresses, phones, and brand social profiles links.</p>
          </div>

          {settingsLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-500">
              Loading settings...
            </div>
          ) : (
            <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Page Hero Title</label>
                <input
                  type="text"
                  value={contactSettings.heroTitle}
                  onChange={(e) => setContactSettings({ ...contactSettings, heroTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="Contact Us"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Page Hero Subtitle</label>
                <input
                  type="text"
                  value={contactSettings.heroSubtitle}
                  onChange={(e) => setContactSettings({ ...contactSettings, heroSubtitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="Get in touch with FLAIS..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Banner Image/Media File</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setContactSettings({ ...contactSettings, heroMedia: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
              />
              {contactSettings.heroMedia && (
                <div className="mt-2 h-20 w-36 border border-slate-200 rounded overflow-hidden">
                  {contactSettings.heroMedia.startsWith('data:video/') || contactSettings.heroMedia.includes('.mp4') ? (
                    <video src={contactSettings.heroMedia} className="h-full w-full object-cover" muted />
                  ) : (
                    <img src={contactSettings.heroMedia} alt="preview" className="h-full w-full object-cover" />
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={contactSettings.phone}
                  onChange={(e) => setContactSettings({ ...contactSettings, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  value={contactSettings.email}
                  onChange={(e) => setContactSettings({ ...contactSettings, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="info@flaisgranito.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location Address</label>
                <input
                  type="text"
                  value={contactSettings.address}
                  onChange={(e) => setContactSettings({ ...contactSettings, address: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="Street, City, State, ZIP..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Facebook Profile Link</label>
                <input
                  type="text"
                  value={contactSettings.facebook}
                  onChange={(e) => setContactSettings({ ...contactSettings, facebook: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Instagram Profile Link</label>
                <input
                  type="text"
                  value={contactSettings.instagram}
                  onChange={(e) => setContactSettings({ ...contactSettings, instagram: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">LinkedIn Profile Link</label>
                <input
                  type="text"
                  value={contactSettings.linkedin}
                  onChange={(e) => setContactSettings({ ...contactSettings, linkedin: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">YouTube Channel Link</label>
                <input
                  type="text"
                  value={contactSettings.youtube}
                  onChange={(e) => setContactSettings({ ...contactSettings, youtube: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={settingsLoading}
              className="flex items-center gap-2 rounded-lg bg-[#0145F2] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
            >
              <Save size={18} /> Save Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Messages;
