import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClassProvider, useClass } from './context/ClassContext';
import { StudentProvider } from './context/StudentContext';
import { APIKeyProvider } from './context/APIKeyContext';
import { SaveStatusProvider } from './context/SaveStatusContext';
import { migrateFromLocalStorage } from './db/indexedDB';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import StudentManager from './pages/StudentManager';
import AttendanceTracker from './pages/AttendanceTracker';
import JournalEntry from './pages/JournalEntry';
import EvaluationView from './pages/EvaluationView';
import AssignmentManager from './pages/AssignmentManager';
import Notepad from './pages/Notepad';
import BudgetManager from './pages/BudgetManager';
import Settings from './pages/Settings';
import Login from './pages/Login';
import ClassSelect from './pages/ClassSelect';
import CreateClass from './pages/CreateClass';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { currentClass } = useClass();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!currentClass) {
    return <Navigate to="/select-class" replace />;
  }

  return children;
};

const AuthRedirect = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/select-class" replace />;
  }

  return children;
};

const ClassRedirect = ({ children }) => {
  const { user, loading } = useAuth();
  const { currentClass } = useClass();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (currentClass) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <Login />
            </AuthRedirect>
          }
        />
        <Route
          path="/select-class"
          element={
            <ClassRedirect>
              <ClassSelect />
            </ClassRedirect>
          }
        />
        <Route
          path="/create-class"
          element={
            <ClassRedirect>
              <CreateClass />
            </ClassRedirect>
          }
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="notepad" element={<Notepad />} />
          <Route path="students" element={<StudentManager />} />
          <Route path="attendance" element={<AttendanceTracker />} />
          <Route path="journal-entry" element={<JournalEntry />} />
          <Route path="evaluation-view" element={<EvaluationView />} />
          <Route path="assignments" element={<AssignmentManager />} />
          <Route path="budget" element={<BudgetManager />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

function App() {
  // Run migration on app load
  useEffect(() => {
    const runMigration = async () => {
      try {
        const result = await migrateFromLocalStorage();
        if (result.success && !result.alreadyMigrated) {
          console.log('✅ Successfully migrated data from LocalStorage to IndexedDB');
        }
      } catch (error) {
        console.error('Migration error:', error);
      }
    };

    runMigration();
  }, []);

  return (
    <AuthProvider>
      <ClassProvider>
        <StudentProvider>
          <APIKeyProvider>
            <SaveStatusProvider>
              <AppRoutes />
            </SaveStatusProvider>
          </APIKeyProvider>
        </StudentProvider>
      </ClassProvider>
    </AuthProvider>
  );
}

export default App;
