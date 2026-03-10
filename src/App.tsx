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
  const { profile, session, profileLoaded } = useUserStore();

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Profile fetch failed or timed out - show retry instead of redirecting to onboarding
  if (!profileLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bg fade-in gap-4" dir="rtl">
        <p className="text-muted">לא הצלחנו לטעון את הפרופיל שלך</p>
        <button
          className="btn-primary px-6 py-2"
          onClick={async () => {
            await useUserStore.getState().fetchProfile();
          }}
        >
          נסה שוב
        </button>
      </div>
    );
  }

  // Profile loaded successfully but no target calories = onboarding not finished
  if (!profile?.targetDailyCalories) {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
};

const App: React.FC = () => {
  const { session, setSession } = useUserStore();
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    console.log("App mounted, initializing...");
    let isMounted = true;
    let initialSessionHandled = false;

    const loadUserData = async () => {
      try {
        await useUserStore.getState().fetchProfile();
        if (useUserStore.getState().profileLoaded) {
          await Promise.all([
            useUserStore.getState().fetchWeeklyPlan(),
            useUserStore.getState().fetchWeightHistory(),
            useUserStore.getState().fetchWorkoutLogs(),
          ]);
        }
        console.log("Data loading complete, profileLoaded:", useUserStore.getState().profileLoaded);
      } catch (err) {
        console.error("Data fetch error:", err);
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      if (!isMounted) return;

      // Always update session state
      setSession(session);

      if (event === 'INITIAL_SESSION') {
        // INITIAL_SESSION is guaranteed to fire exactly once with a valid session
        // This is the ONLY event we trust for first-time initialization
        initialSessionHandled = true;
        if (session) {
          await loadUserData();
        }
        if (isMounted) setIsInitializing(false);
      } else if (event === 'SIGNED_IN') {
        // SIGNED_IN may fire before INITIAL_SESSION during token recovery
        // Only handle it if INITIAL_SESSION was already processed (= subsequent login)
        if (initialSessionHandled) {
          await loadUserData();
        }
        // If INITIAL_SESSION hasn't fired yet, ignore — it will handle loading
      } else if (event === 'SIGNED_OUT') {
        if (isMounted) setIsInitializing(false);
      }
    });

    // Safety timeout — never let the app hang on loading forever
    const timeout = setTimeout(() => {
      if (isMounted) {
        console.warn("Init timeout reached (12s), forcing load");
        setIsInitializing(false);
      }
    }, 12000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
