import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import {
  getClarifyingQuestions,
  generateSpec,
  createSpec
} from '../api/client';
import { Loader2, Copy, Save, Check } from 'lucide-react';

export default function NewSpec() {
  const navigate = useNavigate();

  // Steps: 1 (Idea) -> 2 (Answer Questions) -> 3 (Final / Save)
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [idea, setIdea] = useState('');

  // AI intermediate data
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});

  // Final spec data
  const [finalSpec, setFinalSpec] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState('draft');
  const [copied, setCopied] = useState(false);

  const handleClarify = async (e) => {
    e.preventDefault();
    if (!idea.trim()) {
      setError('Idea description is required');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await getClarifyingQuestions(idea);
      setQuestions(res.questions || []);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to get clarifying questions');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const answerArr = questions.map((q, i) => answers[i] || 'No specific preference');

    setLoading(true);
    setError('');
    try {
      const res = await generateSpec(idea, questions, answerArr);
      setFinalSpec(res.spec);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to generate specification');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Spec title is required to save');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await createSpec({
        title,
        raw_idea: idea,
        clarifying_questions: JSON.stringify(questions),
        answers: JSON.stringify(questions.map((q, i) => answers[i] || 'No specific preference')),
        generated_spec: finalSpec,
        status: status
      });
      navigate(`/spec/${res.id}`);
    } catch (err) {
      setError(err.message || 'Failed to save specification');
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 mt-8">
      {/* Progress Indicator */}
      <h1 className="text-2xl font-bold mb-2 text-gray-800 tracking-tight">Create New Specification</h1>
      <p className="text-gray-500 mb-8 font-medium">Step {step} of 3</p>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">{error}</div>}

      {/* Step 1: Idea Input */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all">
          <form onSubmit={handleClarify} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Describe your product idea (don't worry about being vague)
              </label>
              <textarea
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg h-40 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all resize-y"
                placeholder="I want to build an app that..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 disabled:opacity-70 transition-all font-medium flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Generate Questions'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Answer Questions */}
      {step === 2 && (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 transition-all">
          <form onSubmit={handleGenerate} className="space-y-8">
            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="space-y-2">
                  <label className="block font-medium text-gray-800">
                    <span className="text-gray-400 mr-2">{idx + 1}.</span>{q}
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all placeholder-gray-400"
                    placeholder="Your answer..."
                    value={answers[idx] || ''}
                    onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-gray-900 text-white flex justify-center items-center gap-2 rounded-lg hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 disabled:opacity-75 font-medium transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Generate Spec'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: View & Save Spec */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50">
              <span className="font-semibold text-gray-700">Generated Spec Preview</span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-white px-3 py-1.5 border border-gray-200 rounded-md shadow-sm transition-all"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? 'Copied' : 'Copy markdown'}
              </button>
            </div>

            <div className="p-8 bg-white overflow-auto max-h-[600px] prose prose-blue prose-headings:font-bold max-w-none text-gray-800">
              <ReactMarkdown>{finalSpec}</ReactMarkdown>
            </div>
          </div>

          <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Specification Title</label>
              <input
                type="text"
                placeholder="e.g. Next-Gen Task Manager"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                required
              />
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-gray-700"
              >
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="ready">Ready to Ship</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto mt-4 md:mt-0 flex justify-center items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-75 font-medium shadow-sm transition-all whitespace-nowrap"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Spec
            </button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm text-gray-500 hover:text-gray-800 underline transition-all"
            >
              ← Go back to questions
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
