import { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { StudentDashboard } from './components/StudentDashboard';
import { FacultyDashboard } from './components/FacultyDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ResourcesPage } from './components/ResourcesPage';
import { ResourceDetail } from './components/ResourceDetail';
import { CommunityForum } from './components/CommunityForum';
import { ProfilePage } from './components/ProfilePage';
import { BlogsPage } from './components/BlogsPage';
import { BlogDetail } from './components/BlogDetail';
import { AIAssistant } from './components/AIAssistant';
import MessagingPage from './pages/MessagingPage';
import { ConnectionTest } from './components/ConnectionTest';

type Page = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'resources' 
  | 'resource-detail' 
  | 'forum'
  | 'profile'
  | 'blogs'
  | 'blog-detail'
  | 'ai-assistant'
  | 'admin'
  | 'messages'
  | 'connection-test';

type UserRole = 'student' | 'faculty' | 'admin' | null;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [selectedResource, setSelectedResource] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentPage('landing');
  };

  const handleViewResource = (resourceId: string) => {
    setSelectedResource(resourceId);
    setCurrentPage('resource-detail');
  };

  const handleViewBlog = (blogId: string) => {
    setSelectedBlog(blogId);
    setCurrentPage('blog-detail');
  };

  const handleViewProfile = (userId: string) => {
    setSelectedProfile(userId);
    setCurrentPage('profile');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onLogin={() => setCurrentPage('login')}
            onGetStarted={() => setCurrentPage('register')}
          />
        );
      case 'login':
        return (
          <LoginPage
            onLogin={handleLogin}
            onRegister={() => setCurrentPage('register')}
            onBack={() => setCurrentPage('landing')}
          />
        );
      case 'register':
        return (
          <RegisterPage
            onRegister={handleLogin}
            onLogin={() => setCurrentPage('login')}
            onBack={() => setCurrentPage('landing')}
          />
        );
      case 'dashboard':
        if (userRole === 'student') {
          return (
            <StudentDashboard
              onNavigate={setCurrentPage}
              onLogout={handleLogout}
              onViewResource={handleViewResource}
              onViewBlog={handleViewBlog}
            />
          );
        } else if (userRole === 'faculty') {
          return (
            <FacultyDashboard
              onNavigate={setCurrentPage}
              onLogout={handleLogout}
              onViewResource={handleViewResource}
            />
          );
        } else if (userRole === 'admin') {
          return (
            <AdminDashboard
              userRole={userRole}
              onNavigate={setCurrentPage}
              onLogout={handleLogout}
            />
          );
        }
        return null;
      case 'resources':
        return (
          <ResourcesPage
            userRole={userRole}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            onViewResource={handleViewResource}
          />
        );
      case 'resource-detail':
        return (
          <ResourceDetail
            resourceId={selectedResource}
            userRole={userRole}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            onBack={() => setCurrentPage('resources')}
          />
        );
      case 'forum':
        return (
          <CommunityForum
            userRole={userRole}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            onViewProfile={handleViewProfile}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            userId={selectedProfile}
            userRole={userRole}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            onViewResource={handleViewResource}
            onViewBlog={handleViewBlog}
          />
        );
      case 'blogs':
        return (
          <BlogsPage
            userRole={userRole}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            onViewBlog={handleViewBlog}
            onViewProfile={handleViewProfile}
          />
        );
      case 'blog-detail':
        return (
          <BlogDetail
            blogId={selectedBlog}
            userRole={userRole}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
            onBack={() => setCurrentPage('blogs')}
            onViewProfile={handleViewProfile}
          />
        );
      case 'ai-assistant':
        return (
          <AIAssistant
            userRole={userRole}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
          />
        );
      case 'admin':
        return (
          <AdminDashboard
            userRole={userRole}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
          />
        );
      case 'messages':
        return (
          <MessagingPage />
        );
      case 'connection-test':
        return (
          <ConnectionTest />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {renderPage()}
    </div>
  );
}
