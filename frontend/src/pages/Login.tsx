import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';
import { api } from '../services/api';
import { Lock, Mail, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');
     const [error, setError] = useState('');
     const [loading, setLoading] = useState(false);

     const login = useAuthStore((state) => state.login);
     const navigate = useNavigate();

     const handleSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setLoading(true);
          setError('');

          try {
               // Use URLSearchParams for OAuth2PasswordRequestForm if backend expects it
               // Default FastAPI OAuth2 expects form-data
               // const formData = new FormData();
               // formData.append('username', email); // FASTAPI Oauth2 uses 'username' for email often
               // formData.append('password', password);

               const { data } = await api.post('/auth/login',{
                    email,
                    password
               }); // Adjust endpoint to match backend

               // Assume backend returns { access_token, token_type }
               // We also need user data. If backend doesn't return user, we fetch it.
               // For MVP, let's assume we fetch user after login or backend returns it.

               // Let's create a fake user for now if backend doesn't return one, 
               // OR fetch /users/me immediately.
               // Temporary user obj
               // Fetch real user details
               try {
                    const userRes = await api.get('/auth/me', {
                         headers: { Authorization: `Bearer ${data.access_token}` }
                    });

                    login(data.access_token, userRes.data);
               } catch (err) {
                    console.warn("Could not fetch user details", err);
               }

               navigate('/');
          }catch (err: any) {
               const detail = err.response?.data?.detail;
               setError(
                    Array.isArray(detail)
                      ? detail[0].msg
                      : detail || 'Login failed'
               );
} finally {
               setLoading(false);
          }
     };

     return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
               <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
                    <div className="text-center mb-8">
                         <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                              SmartNoteX
                         </h1>
                         <p className="text-gray-500 mt-2">Welcome back, Engineer.</p>
                    </div>

                    {error && (
                         <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                              {error}
                         </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                         <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <div className="relative">
                                   <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                   <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="student@university.edu"
                                   />
                              </div>
                         </div>

                         <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                              <div className="relative">
                                   <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                   <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                        placeholder="••••••••"
                                   />
                              </div>
                         </div>

                         <button
                              type="submit"
                              disabled={loading}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                         >
                              {loading ? 'Authenticating...' : (
                                   <>
                                        Sign In <ArrowRight className="h-5 w-5" />
                                   </>
                              )}
                         </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-600">
                         Don't have an account?{' '}
                         <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                              Register for free
                         </Link>
                    </p>
               </div>
          </div>
     );
};
