import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import OnboardingFlow from './features/onboarding/OnboardingFlow';
import DashboardHome from './features/dashboard/DashboardHome';
import MealsHome from './features/meals/MealsHome';
import WorkoutsHome from './features/workouts/WorkoutsHome';
import SettingsPage from './features/settings/SettingsPage';
import ProgressHome from './features/progress/ProgressHome';
import AuthScreen from './features/auth/AuthScreen';
import { useUserStore } from './store/userStore';
import { supabase } from './lib/supabase';

// Route wrapper that checks if user is logged in AND onboarding is completed
const ProtectedRoute = () => {
  const { profile, session } = useUserStore();

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // If no target calories are set, we assume onboarding is not finished
  if (!profile?.targetDailyCalories) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
};

const App: React.FC = () => {
  const { session, setSession } = useUserStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    console.log("App mounted, checking session...");
    // Check active session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("getSession returned:", session ? "User found" : "No user");
      try {
        setSession(session);
        if (session) {
          console.log("Fetching profile for user...");
          await useUserStore.getState().fetchProfile();
          await Promise.all([
            useUserStore.getState().fetchWeeklyPlan(),
            useUserStore.getState().fetchWeightHistory(),
            useUserStore.getState().fetchWorkoutLogs(),
          ]);
          console.log("All data fetched successfully");
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        console.log("Setting isInitializing to false");
        setIsInitializing(false);
      }
    }).catch((err) => {
      console.error("getSession error:", err);
      setIsInitializing(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      setSession(session);
      // Only fetch profile on explicit SIGN_IN, not on INITIAL_SESSION which getSession handles
      if (session && event === 'SIGNED_IN') {
        await useUserStore.getState().fetchProfile();
        await Promise.all([
          useUserStore.getState().fetchWeeklyPlan(),
          useUserStore.getState().fetchWeightHistory(),
          useUserStore.getState().fetchWorkoutLogs(),
        ]);
      }
    });

    return () => subscription.unsubscribe();
  }, [setSession]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg fade-in">
        <div className="loader spin border-emerald-500 border-t-emerald-200 w-12 h-12"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={
          session ? <Navigate to="/" replace /> : <AuthScreen onComplete={() => { }} />
        } />

        <Route path="/onboarding" element={
          !session ? <Navigate to="/auth" replace /> : <OnboardingFlow />
        } />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="meals" element={<MealsHome />} />
            <Route path="workouts" element={<WorkoutsHome />} />
            <Route path="progress" element={<ProgressHome />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
