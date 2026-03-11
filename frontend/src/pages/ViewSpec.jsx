import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { getSpec, updateSpec, deleteSpec,generateSpec } from '../api/client';
import { Loader2, ArrowLeft, Trash2, Check, Download, Copy, Edit2, FileText } from 'lucide-react';

export default function ViewSpec() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status edit
  const [actionLoading, setActionLoading] = useState(false);

  // Inline title edit
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');
  const titleInputRef = useRef(null);

  // Copy
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchSpec();
  }, [id]);

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  async function fetchSpec() {
    try {
      setLoading(true);
      const data = await getSpec(id);
      console.log("SPEC DATA:", data);
      setSpec(data);
      setEditTitleValue(data.title || 'Untitled Spec');
    } catch (err) {
      console.log("FETCH ERROR:", err);
      setError(err.message || 'Failed to load spec');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (newStatus) => {
    try {
      setActionLoading(true);
      const updated = await updateSpec(id, { status: newStatus });
      setSpec(updated);
    } catch (err) {
      alert(err.message || 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveTitle = async () => {
    if (!editTitleValue.trim() || editTitleValue === spec.title) {
      setIsEditingTitle(false);
      setEditTitleValue(spec.title); // Reset to original if empty
      return;
    }

    try {
      setActionLoading(true);
      const updated = await updateSpec(id, { title: editTitleValue.trim() });
      setSpec(updated);
      setIsEditingTitle(false);
    } catch (err) {
      alert(err.message || 'Failed to update title');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setEditTitleValue(spec.title);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this specification? This action cannot be undone.')) return;

    try {
      setActionLoading(true);
      await deleteSpec(id);
      navigate('/');
    } catch (err) {
      alert(err.message || 'Failed to delete spec');
      setActionLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!spec?.generated_spec) return;
    navigator.clipboard.writeText(spec.generated_spec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    if (!spec?.generated_spec) return;
    const blob = new Blob([spec.generated_spec], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Format filename safely
    const safeTitle = (spec.title || 'spec').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    a.download = `${safeTitle}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegenerateSpec = async () => {
    if (!window.confirm('Are you sure you want to regenerate the specification? This will overwrite the current generated spec.')) return;

    try {
      setActionLoading(true);
      const q = safeJSONParse(spec.clarifying_questions);
      const a = safeJSONParse(spec.answers);

      const res = await generateSpec(spec.raw_idea, q, a);
      const updated = await updateSpec(id, { generated_spec: res.spec });

      setSpec(updated);
    } catch (err) {
      alert(err.message || 'Failed to regenerate spec');
    } finally {
      setActionLoading(false);
    }
  };

  const safeJSONParse = (data) => {
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to parse JSON for spec:", e);
      return [];
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 mt-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-500 max-w-2xl mx-auto mt-8 bg-red-50 rounded-lg">{error} — {JSON.stringify(error)}</div>;
  if (!spec) return <div className="p-8 text-center text-gray-500 mt-8">Spec not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 mt-4">

      {/* Header Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition font-medium mb-6 w-fit"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      {/* Main Spec Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Top Header - Title & Status */}
        <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

          <div className="flex-1 w-full relative group">
            {isEditingTitle ? (
              <div className="flex items-center gap-2">
                <input
                  ref={titleInputRef}
                  type="text"
                  value={editTitleValue}
                  onChange={(e) => setEditTitleValue(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={handleTitleKeyDown}
                  className="text-2xl md:text-3xl font-bold text-gray-900 bg-white border border-blue-300 rounded px-2 py-1 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={actionLoading}
                />
              </div>
            ) : (
              <div
                className="flex items-center gap-3 cursor-pointer p-1 -ml-1 rounded hover:bg-gray-100 transition"
                onClick={() => setIsEditingTitle(true)}
                title="Click to edit title"
              >
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  {spec.title || 'Untitled Spec'}
                </h1>
                <Edit2 size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            )}
          </div>

          <div className="flex items-center shrink-0">
            <label htmlFor="status-select" className="text-sm font-medium text-gray-500 mr-3">Status:</label>
            <select
              value={spec.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              disabled={actionLoading}
              className={`text-sm rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-blue-500 font-medium py-2 pl-3 pr-8 appearance-none transition bg-white cursor-pointer ${spec.status === 'ready' ? 'text-green-700 bg-green-50' :
                spec.status === 'in_progress' ? 'text-yellow-700 bg-yellow-50' :
                  'text-gray-700 bg-gray-50'
                }`}
            >
              <option value="draft">Draft</option>
              <option value="in_progress">In Progress</option>
              <option value="ready">Ready to Ship</option>
            </select>
          </div>

        </div>

        {/* Action Bar */}
        <div className="px-6 py-3 bg-white border-b border-gray-100 flex flex-wrap gap-3">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
          >
            {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy Markdown'}
          </button>

          <button
            onClick={downloadMarkdown}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all"
          >
            <Download size={16} />
            Download .md
          </button>

          <button
            onClick={handleDelete}
            disabled={actionLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-100 hover:bg-red-100 transition-all ml-auto"
          >
            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Delete
          </button>
        </div>

        {/* Markdown Render Body */}
        <div className="p-6 md:p-10 bg-white">
          {spec.generated_spec ? (
            <div className="prose prose-blue prose-slate max-w-none prose-headings:font-bold prose-h2:border-b prose-h2:pb-2 prose-h2:mt-10 prose-h2:mb-4">
              <ReactMarkdown>{spec.generated_spec}</ReactMarkdown>
            </div>
          ) : (
            <div className="text-gray-500 italic p-12 bg-gray-50 rounded-xl text-center border border-dashed border-gray-200">
              <FileText size={32} className="mx-auto text-gray-300 mb-3" />
              No markdown specification has been generated for this idea yet.
            </div>
          )}
        </div>

        {/* Original Setup Context */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <details className="group">
            <summary className="font-medium text-gray-700 cursor-pointer list-none flex items-center gap-2 hover:text-blue-600">
              <span className="text-lg group-open:rotate-90 transition-transform">▸</span>
              View Original Context (Idea & Answers)
            </summary>

            <div className="mt-4 pl-6 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-1">Raw Idea:</h4>
                <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                  {spec.raw_idea}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-700 mb-2">Q&A:</h4>
                <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
                  {safeJSONParse(spec.clarifying_questions).length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 italic">No Q&A data available for this legacy specification.</div>
                  ) : (
                    safeJSONParse(spec.clarifying_questions).map((q, idx) => {
                      const ans = safeJSONParse(spec.answers);
                      return (
                        <div key={idx} className="p-3">
                          <p className="text-sm font-medium text-gray-800 mb-1">Q: {q}</p>
                          <p className="text-sm text-gray-600">A: {ans[idx] || 'N/A'}</p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </details>
        </div>

        {/* Footer Timestamps */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 flex flex-col md:flex-row justify-between gap-2">
          <div>
            <span className="font-medium text-gray-600">Created:</span> {new Date(spec.created_at).toLocaleString()}
          </div>
          {spec.updated_at && spec.updated_at !== spec.created_at && (
            <div>
              <span className="font-medium text-gray-600">Last updated:</span> {new Date(spec.updated_at).toLocaleString()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
