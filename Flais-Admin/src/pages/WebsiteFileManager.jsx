import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { 
  Folder, File, ChevronRight, ChevronDown, Plus, Upload, 
  MoreVertical, Edit, Trash2, Home, Download, CornerDownRight, RefreshCw, AlertCircle, Link
} from 'lucide-react';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_BACKEND_URL;

const WebsiteFileManager = () => {
  const [nodes, setNodes] = useState([]);
  const [currentNodeId, setCurrentNodeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  // Modals state
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [showUploadFile, setShowUploadFile] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showSync, setShowSync] = useState(false);
  const [targetNode, setTargetNode] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newName, setNewName] = useState('');
  const [targetParentId, setTargetParentId] = useState('');
  const [allFolders, setAllFolders] = useState([]);
  const [uploadFile, setUploadFile] = useState(null);
  
  // Tree state
  const [treeExpanded, setTreeExpanded] = useState(new Set([null]));
  const [treeNodes, setTreeNodes] = useState({ null: [] }); // parentId -> nodes
  
  // Sync state
  const [syncPreview, setSyncPreview] = useState(null);
  const [syncing, setSyncing] = useState(false);

  const fileInputRef = useRef(null);

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
  });

  const fetchNodes = async (parentId = null) => {
    setLoading(true);
    try {
      const url = parentId 
        ? `${API}/api/admin/website-nodes?parentId=${parentId}`
        : `${API}/api/admin/website-nodes`;
      const res = await axios.get(url, getHeaders());
      if (res.data.success) {
        setNodes(res.data.data);
        // Also update tree if these are folders
        setTreeNodes(prev => ({ ...prev, [parentId]: res.data.data.filter(n => n.type === 'folder') }));
      }
    } catch (error) {
      toast.error('Failed to load nodes');
    } finally {
      setLoading(false);
    }
  };

  const fetchBreadcrumbs = async (id) => {
    if (!id) {
      setBreadcrumbs([]);
      return;
    }
    try {
      const res = await axios.get(`${API}/api/admin/website-nodes/${id}/breadcrumbs`, getHeaders());
      if (res.data.success) {
        setBreadcrumbs(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load breadcrumbs');
    }
  };

  const fetchTreeChildren = async (parentId) => {
    try {
      const url = parentId 
        ? `${API}/api/admin/website-nodes?parentId=${parentId}`
        : `${API}/api/admin/website-nodes`;
      const res = await axios.get(url, getHeaders());
      if (res.data.success) {
        setTreeNodes(prev => ({ ...prev, [parentId]: res.data.data.filter(n => n.type === 'folder') }));
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchNodes(currentNodeId);
    fetchBreadcrumbs(currentNodeId);
  }, [currentNodeId]);

  useEffect(() => {
    // Initial fetch for root tree
    fetchTreeChildren(null);
  }, []);

  const handleNavigate = (id) => {
    setCurrentNodeId(id);
    if (id !== null) {
      setTreeExpanded(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    }
  };

  const toggleTree = (e, id) => {
    e.stopPropagation();
    setTreeExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        fetchTreeChildren(id);
      }
      return next;
    });
  };

  const renderTree = (parentId = null, level = 0) => {
    const children = treeNodes[parentId] || [];
    return children.map(node => {
      const isExpanded = treeExpanded.has(node._id);
      const isSelected = currentNodeId === node._id;
      return (
        <div key={node._id}>
          <div 
            className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-blue-100 text-[#0145F2]' : 'hover:bg-slate-100 text-slate-700'}`}
            style={{ paddingLeft: `${(level * 12) + 8}px` }}
            onClick={() => handleNavigate(node._id)}
          >
            <div onClick={(e) => toggleTree(e, node._id)} className="p-0.5 hover:bg-slate-200 rounded-sm">
              <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
            <Folder size={16} className={isSelected ? 'text-blue-500 fill-blue-500/20' : 'text-slate-400'} />
            <span className="text-sm font-medium truncate">{node.name}</span>
          </div>
          {isExpanded && renderTree(node._id, level + 1)}
        </div>
      );
    });
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    
    try {
      await axios.post(`${API}/api/admin/website-nodes/folder`, {
        parentId: currentNodeId,
        name: newFolderName.trim()
      }, getHeaders());
      
      toast.success('Folder created successfully');
      setShowCreateFolder(false);
      setNewFolderName('');
      fetchNodes(currentNodeId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create folder');
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    if (currentNodeId) {
      formData.append('parentId', currentNodeId);
    }

    try {
      await axios.post(`${API}/api/admin/website-nodes/upload`, formData, {
        headers: {
          ...getHeaders().headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('File uploaded successfully');
      setShowUploadFile(false);
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchNodes(currentNodeId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    }
  };

  const handleRename = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !targetNode) return;
    
    try {
      await axios.patch(`${API}/api/admin/website-nodes/${targetNode._id}/rename`, {
        newName: newName.trim()
      }, getHeaders());
      
      toast.success('Renamed successfully');
      setShowRename(false);
      setTargetNode(null);
      setNewName('');
      fetchNodes(currentNodeId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to rename');
    }
  };

  const fetchAllFolders = async () => {
    try {
      // Small trick: Get all nodes and filter on frontend, or create an API specifically for folders. 
      // Using an empty parentId might not fetch all. 
      // Actually, since this is for Move, let's just use the treeNodes state flattened, 
      // or we can fetch a full flat list from API. Let's assume treeNodes is mostly populated, 
      // or we can just fetch all folders from root if we had an endpoint.
      // For simplicity, let's just make an API call to get all folders. We don't have it.
      // So we will just use the treeNodes we already fetched, flattened.
      const folders = [];
      const traverse = (nodes) => {
        nodes.forEach(n => {
           if (n.type === 'folder') {
             folders.push(n);
             if (treeNodes[n._id]) traverse(treeNodes[n._id]);
           }
        });
      };
      traverse(treeNodes[null] || []);
      setAllFolders(folders);
    } catch (error) {
    }
  };

  const handleMove = async (e) => {
    e.preventDefault();
    if (!targetNode) return;
    
    try {
      await axios.patch(`${API}/api/admin/website-nodes/${targetNode._id}/move`, {
        targetParentId: targetParentId === 'root' ? null : targetParentId
      }, getHeaders());
      
      toast.success('Moved successfully');
      setShowMove(false);
      setTargetNode(null);
      setTargetParentId('');
      fetchNodes(currentNodeId);
      fetchTreeChildren(currentNodeId);
      fetchTreeChildren(targetParentId === 'root' ? null : targetParentId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to move');
    }
  };

  const handleDelete = async () => {
    if (!targetNode) return;
    
    try {
      await axios.delete(`${API}/api/admin/website-nodes/${targetNode._id}`, getHeaders());
      toast.success('Deleted successfully');
      setShowDelete(false);
      setTargetNode(null);
      fetchNodes(currentNodeId);
      // Refresh tree root to be safe
      fetchTreeChildren(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleDownload = (node) => {
    window.open(`${API}/api/admin/website-nodes/${node._id}/download?token=${localStorage.getItem('adminToken')}`, '_blank');
  };

  const handleShare = (node) => {
    const baseUrl = API.endsWith('/') ? API.slice(0, -1) : API;
    const relativePath = node.relativePath.startsWith('/') ? node.relativePath.slice(1) : node.relativePath;
    const shareUrl = `${baseUrl}/${relativePath}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success('Link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handlePreviewSync = async () => {
    try {
      setSyncing(true);
      const res = await axios.get(`${API}/api/admin/website-nodes/sync/preview`, getHeaders());
      if (res.data.success) {
        setSyncPreview(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to preview sync');
    } finally {
      setSyncing(false);
    }
  };

  const handleApplySync = async () => {
    try {
      setSyncing(true);
      await axios.post(`${API}/api/admin/website-nodes/sync/apply`, {}, getHeaders());
      toast.success('Sync applied successfully');
      setShowSync(false);
      setSyncPreview(null);
      fetchNodes(currentNodeId);
    } catch (error) {
      toast.error('Failed to apply sync');
    } finally {
      setSyncing(false);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="flex h-screen bg-slate-50 flex-col font-sans">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Folder className="text-[#0145F2]" size={24} />
            Website Files
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage public website assets and folders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShowSync(true); handlePreviewSync(); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={16} />
            Sync Server
          </button>
          <button
            onClick={() => setShowCreateFolder(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0145F2] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus size={16} />
            New Folder
          </button>
          <button
            onClick={() => setShowUploadFile(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#0145F2] rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Upload size={16} />
            Upload File
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Tree */}
        <div className="w-64 bg-white border-r border-slate-200 overflow-y-auto hidden md:block">
          <div className="p-4">
            <div 
              className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${currentNodeId === null ? 'bg-blue-100 text-[#0145F2]' : 'hover:bg-slate-100 text-slate-700'}`}
              onClick={() => handleNavigate(null)}
            >
              <Home size={16} className={currentNodeId === null ? 'text-blue-500' : 'text-slate-400'} />
              <span className="text-sm font-medium">Website Root</span>
            </div>
            <div className="mt-1">
              {renderTree(null)}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
          
          {/* Breadcrumbs */}
          <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <button 
              onClick={() => handleNavigate(null)}
              className="flex items-center gap-1.5 text-slate-600 hover:text-[#0145F2] font-medium transition-colors"
            >
              <Home size={16} />
              Website Root
            </button>
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={b._id}>
                <ChevronRight size={16} className="text-slate-400 shrink-0" />
                <button 
                  onClick={() => handleNavigate(b._id)}
                  className="text-slate-600 hover:text-[#0145F2] font-medium transition-colors"
                >
                  {b.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0145F2]"></div>
              </div>
            ) : nodes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                <Folder size={48} className="text-slate-300 mb-4" />
                <p className="text-lg font-medium text-slate-700">This folder is empty</p>
                <p className="text-sm">Create a folder or upload files to get started.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Size</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Modified</th>
                    <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {nodes.map(node => (
                    <tr key={node._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div 
                          className={`flex items-center gap-3 ${node.type === 'folder' ? 'cursor-pointer hover:text-[#0145F2]' : ''}`}
                          onClick={() => node.type === 'folder' && handleNavigate(node._id)}
                        >
                          {node.type === 'folder' ? (
                            <Folder size={20} className="text-blue-400 fill-blue-400/20" />
                          ) : (
                            <File size={20} className="text-slate-400" />
                          )}
                          <span className="font-medium text-slate-700 group-hover:text-slate-900 truncate max-w-md">
                            {node.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {formatSize(node.fileSize)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                        {formatDate(node.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {node.type === 'file' && (
                            <button 
                              onClick={() => handleShare(node)}
                              className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                              title="Copy Link"
                            >
                              <Link size={16} />
                            </button>
                          )}
                          {node.type === 'file' && (
                            <button 
                              onClick={() => handleDownload(node)}
                              className="p-1.5 text-slate-400 hover:text-[#0145F2] hover:bg-blue-50 rounded-md transition-colors"
                              title="Download"
                            >
                              <Download size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => { setTargetNode(node); setNewName(node.name); setShowRename(true); }}
                            className="p-1.5 text-slate-400 hover:text-[#0145F2] hover:bg-blue-50 rounded-md transition-colors"
                            title="Rename"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => { setTargetNode(node); fetchAllFolders(); setTargetParentId(node.parentId || 'root'); setShowMove(true); }}
                            className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                            title="Move"
                          >
                            <CornerDownRight size={16} />
                          </button>
                          <button 
                            onClick={() => { setTargetNode(node); setShowDelete(true); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* Create Folder Modal */}
      {showCreateFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-lg">Create New Folder</h3>
            </div>
            <form onSubmit={handleCreateFolder} className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Folder Name</label>
              <input 
                type="text" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0145F2]/20 focus:border-[#0145F2]"
                placeholder="e.g. products"
                autoFocus
                required
              />
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowCreateFolder(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0145F2] hover:bg-blue-700 rounded-lg transition-colors">
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-lg">Upload File</h3>
            </div>
            <form onSubmit={handleUploadFile} className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Select File</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="text-[#0145F2] mb-3" size={32} />
                  <span className="text-sm font-medium text-slate-700">Click to browse or drag and drop</span>
                  <span className="text-xs text-slate-500 mt-1">Allowed: jpg, png, pdf, mp4, etc.</span>
                </label>
              </div>
              {uploadFile && (
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg flex items-center gap-2">
                  <File size={16} className="shrink-0" />
                  <span className="truncate">{uploadFile.name}</span>
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => {setShowUploadFile(false); setUploadFile(null);}} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={!uploadFile} className="px-4 py-2 text-sm font-medium text-white bg-[#0145F2] hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
                  Upload File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRename && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-lg">Rename {targetNode?.type === 'folder' ? 'Folder' : 'File'}</h3>
            </div>
            <form onSubmit={handleRename} className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">New Name</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0145F2]/20 focus:border-[#0145F2]"
                autoFocus
                required
              />
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowRename(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0145F2] hover:bg-blue-700 rounded-lg transition-colors">
                  Rename
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Modal */}
      {showMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 text-lg">Move {targetNode?.name}</h3>
            </div>
            <form onSubmit={handleMove} className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Destination</label>
              <select 
                value={targetParentId}
                onChange={(e) => setTargetParentId(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0145F2]/20 focus:border-[#0145F2]"
                required
              >
                <option value="root">Website Root</option>
                {allFolders.map(folder => (
                  <option key={folder._id} value={folder._id} disabled={folder._id === targetNode?._id}>
                    {folder.relativePath}
                  </option>
                ))}
              </select>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowMove(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-[#0145F2] hover:bg-blue-700 rounded-lg transition-colors">
                  Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Delete permanently?</h3>
                  <p className="text-slate-500 text-sm mt-1">
                    Are you sure you want to delete <span className="font-semibold text-slate-700">{targetNode?.name}</span>? 
                    {targetNode?.type === 'folder' && " All contents inside this folder will also be permanently deleted."}
                    This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setShowDelete(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm">
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sync Preview Modal */}
      {showSync && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
                <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
                Sync Server Files
              </h3>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              {syncing && !syncPreview ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0145F2] mb-4"></div>
                  <p className="text-slate-500">Scanning server filesystem...</p>
                </div>
              ) : syncPreview ? (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-[#0145F2]">{syncPreview.newNodes.length}</p>
                      <p className="text-sm font-medium text-blue-800 mt-1">New Nodes</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-orange-600">{syncPreview.metadataUpdates.length}</p>
                      <p className="text-sm font-medium text-orange-800 mt-1">Updates</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold text-red-600">{syncPreview.conflicts.length}</p>
                      <p className="text-sm font-medium text-red-800 mt-1">Conflicts</p>
                    </div>
                  </div>
                  
                  {syncPreview.newNodes.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-slate-700 mb-2">New Files/Folders (Will be created in DB)</h4>
                      <ul className="text-sm text-slate-600 max-h-32 overflow-y-auto bg-slate-50 border border-slate-200 rounded-md p-2">
                        {syncPreview.newNodes.slice(0, 50).map((n, i) => (
                          <li key={i} className="truncate">• {n.relativePath} ({n.type})</li>
                        ))}
                        {syncPreview.newNodes.length > 50 && <li>...and {syncPreview.newNodes.length - 50} more.</li>}
                      </ul>
                    </div>
                  )}

                  {syncPreview.conflicts.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-red-700 mb-2">Conflicts (Will be skipped)</h4>
                      <ul className="text-sm text-red-600 max-h-32 overflow-y-auto bg-red-50 border border-red-200 rounded-md p-2">
                        {syncPreview.conflicts.map((c, i) => (
                          <li key={i} className="truncate">• {c.relativePath}: {c.message}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {syncPreview.newNodes.length === 0 && syncPreview.metadataUpdates.length === 0 && (
                     <p className="text-slate-500 text-center py-4">Database is already perfectly synchronized with the server.</p>
                  )}
                </div>
              ) : null}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setShowSync(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 bg-white border border-slate-300 rounded-lg transition-colors">
                Cancel
              </button>
              {syncPreview && (syncPreview.newNodes.length > 0 || syncPreview.metadataUpdates.length > 0) && (
                <button 
                  type="button" 
                  onClick={handleApplySync} 
                  disabled={syncing}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#0145F2] hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {syncing ? 'Applying...' : 'Apply Sync'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WebsiteFileManager;
