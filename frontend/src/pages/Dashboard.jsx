import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllSpecs } from '../api/client';
import { FileText, Plus, Search, Calendar, ChevronRight } from 'lucide-react';

export default function Dashboard() {
  const [specs, setSpecs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchSpecs() {
      try {
        const data = await getAllSpecs();
        setSpecs(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch specs');
      } finally {
        setLoading(false);
      }
    }
    fetchSpecs();
  }, []);

  const filteredSpecs = specs.filter(spec =>
    (spec.title || 'Untitled Spec').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'draft':
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );

  if (error) return <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg m-6">{error}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 mt-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Specifications</h1>
          <p className="text-gray-500 mt-1">Manage and view all your AI-generated product specs.</p>
        </div>

        <Link
          to="/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 hover:shadow transition-all font-medium whitespace-nowrap"
        >
          <Plus size={20} />
          New Spec
        </Link>
      </div>

      {specs.length > 0 && (
        <div className="relative mb-8 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search specs by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm transition-all"
          />
        </div>
      )}

      {specs.length === 0 ? (
        <div className="text-center p-16 bg-white rounded-xl shadow-sm border border-gray-100 mt-8">
          <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No specs yet Workspace is empty</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            You haven't generated any product specifications yet. Create your first one to get started!
          </p>
          <Link
            to="/new"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-lg shadow hover:bg-gray-800 transition-all font-medium"
          >
            <Plus size={20} />
            Create your first spec
          </Link>
        </div>
      ) : filteredSpecs.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 rounded-xl border border-gray-100">
          <p className="text-gray-500">No specifications found matching "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="text-blue-600 hover:underline mt-2 font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecs.map((spec) => (
            <Link
              key={spec.id}
              to={`/spec/${spec.id}`}
              className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-300 transition-all overflow-hidden flex flex-col h-full"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(spec.status)} uppercase tracking-wider`}>
                    {spec.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center text-gray-400 text-xs font-medium">
                    <Calendar size={14} className="mr-1.5" />
                    {formatDate(spec.created_at)}
                  </div>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {spec.title || 'Untitled Spec'}
                </h2>

                <p className="text-sm text-gray-500 line-clamp-3 mt-auto flex-1">
                  {spec.generated_spec ? spec.generated_spec : spec.raw_idea}
                </p>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                View Specification
                <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
