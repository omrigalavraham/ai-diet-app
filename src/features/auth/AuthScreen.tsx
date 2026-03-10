import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AuthScreenProps {
    onComplete: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onComplete }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let authResponse;
            if (isLogin) {
                authResponse = await supabase.auth.signInWithPassword({ email, password });
            } else {
                authResponse = await supabase.auth.signUp({ email, password });
            }

            if (authResponse.error) throw authResponse.error;

            // Update userStore explicitly (though we'll also have a global listener)
            if (authResponse.data.session) {
                onComplete();
            } else if (!isLogin) {
                // For sign ups with email confirmation enabled
                setError('נשלח מייל אימות. אנא אמת את חשבונך והתחבר.');
            }
        } catch (err: any) {
            setError(err.message || 'אירעה שגיאה בלתי צפויה');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4 fade-in">
            <div className="card-glass p-8 max-w-md w-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -ml-16 -mb-16"></div>

                <div className="relative z-10 text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                        <span className="text-3xl text-white">🥗</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {isLogin ? 'ברוך שובך' : 'צור חשבון חדש'}
                    </h2>
                    <p className="text-sm text-gray-400">
                        {isLogin ? 'התחבר כדי לראות את התפריט שלך' : 'הצטרף למהפכת התזונה החכמה'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="relative z-10 space-y-4">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 px-1">אימייל</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            dir="ltr"
                            className="w-full bg-surface/50 border border-surface-hover rounded-xl p-3.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-left"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1.5 px-1">סיסמה</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            dir="ltr"
                            className="w-full bg-surface/50 border border-surface-hover rounded-xl p-3.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-left"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-3.5 mt-6 font-semibold"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="loader w-4 h-4 border-2 border-white/20 border-t-white"></div>
                                מתחבר...
                            </div>
                        ) : (
                            isLogin ? 'התחברות' : 'הרשמה'
                        )}
                    </button>

                    <div className="text-center mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {isLogin ? 'אין לך חשבון? הירשם כאן' : 'יש לך כבר חשבון? התחבר'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthScreen;
