import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2, Database, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ConnectionTest() {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [backendMessage, setBackendMessage] = useState('');
  const [supabaseMessage, setSupabaseMessage] = useState('');

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    // Check Backend API
    try {
      const response = await fetch('http://localhost:8000/docs');
      if (response.ok) {
        setBackendStatus('connected');
        setBackendMessage('Backend API is running on http://localhost:8000');
      } else {
        setBackendStatus('error');
        setBackendMessage(`Backend returned status: ${response.status}`);
      }
    } catch (error) {
      setBackendStatus('error');
      setBackendMessage('Cannot connect to backend. Make sure it\'s running on port 8000');
    }

    // Check Supabase Connection
    try {
      const { data: _data, error } = await supabase.auth.getSession();
      if (error) {
        setSupabaseStatus('error');
        setSupabaseMessage(`Supabase error: ${error.message}`);
      } else {
        setSupabaseStatus('connected');
        setSupabaseMessage('Supabase connection successful');
      }
    } catch (error: any) {
      setSupabaseStatus('error');
      setSupabaseMessage(`Supabase connection failed: ${error.message}`);
    }
  };

  const StatusIcon = ({ status }: { status: 'checking' | 'connected' | 'error' }) => {
    if (status === 'checking') return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />;
    if (status === 'connected') return <CheckCircle className="w-6 h-6 text-green-500" />;
    return <XCircle className="w-6 h-6 text-red-500" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Connection Status</h2>
        
        {/* Backend Status */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Backend API</h3>
            <StatusIcon status={backendStatus} />
          </div>
          <p className={`text-sm ${backendStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
            {backendMessage}
          </p>
          {backendStatus === 'error' && (
            <div className="mt-2 text-xs text-gray-600">
              <p>To start backend:</p>
              <code className="block mt-1 p-2 bg-gray-100 rounded">
                cd backend && uvicorn app.main:app --reload
              </code>
            </div>
          )}
        </div>

        {/* Supabase Status */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Supabase Database</h3>
            <StatusIcon status={supabaseStatus} />
          </div>
          <p className={`text-sm ${supabaseStatus === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
            {supabaseMessage}
          </p>
          {supabaseStatus === 'error' && (
            <div className="mt-2 text-xs text-gray-600">
              <p>Check your .env file:</p>
              <code className="block mt-1 p-2 bg-gray-100 rounded">
                VITE_SUPABASE_URL=your_url<br/>
                VITE_SUPABASE_ANON_KEY=your_key
              </code>
            </div>
          )}
        </div>

        {/* Test Again Button */}
        <button
          onClick={checkConnections}
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Test Again
        </button>

        {/* Info */}
        {backendStatus === 'connected' && supabaseStatus === 'connected' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg"
          >
            <p className="text-green-800 font-semibold">✅ All systems operational!</p>
            <p className="text-sm text-green-700 mt-1">
              You can now use all messaging and authentication features.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
