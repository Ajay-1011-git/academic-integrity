import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProfessorDashboard from './pages/professor/Dashboard';
import CreateAssignment from './pages/professor/CreateAssignment';
import AssignmentDetails from './pages/professor/AssignmentDetails';
import Submissions from './pages/professor/Submissions';
import EvaluateSubmission from './pages/professor/EvaluateSubmission';
import StudentDashboard from './pages/student/Dashboard';
import SubmitAssignment from './pages/student/SubmitAssignment';
import Scores from './pages/student/Scores';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          <Route
            path="/professor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['professor']}>
                <ProfessorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/assignments/create"
            element={
              <ProtectedRoute allowedRoles={['professor']}>
                <CreateAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/assignments/:assignmentId"
            element={
              <ProtectedRoute allowedRoles={['professor']}>
                <AssignmentDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/submissions/:assignmentId"
            element={
              <ProtectedRoute allowedRoles={['professor']}>
                <Submissions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/professor/evaluate/:submissionId"
            element={
              <ProtectedRoute allowedRoles={['professor']}>
                <EvaluateSubmission />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/assignments/:assignmentId/submit"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <SubmitAssignment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/scores"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <Scores />
              </ProtectedRoute>
            }
          />

          <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center"><p className="text-xl text-red-600">Unauthorized Access</p></div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;