import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useLogin } from '@/hooks/useLogin';
import Seo from '@/components/seo/Seo';
import Button from '@/components/ui/Button';
import AuthSplitLayout from '@/components/layout/AuthSplitLayout';

const inputCls =
 'w-full border border-rim bg-surface-input rounded px-4 py-3 text-sm text-ink ' +
 'placeholder:text-ink-4 outline-none transition ' +
 'focus:border-navy focus:ring-2 focus:ring-navy/10';

const inputErrCls =
 'w-full border border-fail bg-surface-input rounded px-4 py-3 text-sm text-ink ' +
 'placeholder:text-ink-4 outline-none transition focus:border-fail focus:ring-2 focus:ring-fail/10';

export default function LoginPage() {
 const { loading, error, success, handleLogin } = useLogin();
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 const [showPassword, setShowPassword] = useState(false);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 await handleLogin({ username, password });
 };

 return (
 <AuthSplitLayout>
 <Seo title="Sign In" description="Sign in to your Royal Derby account." />

 {/* Heading */}
 <div className="mb-8">
 <h1 className="font-serif text-4xl font-bold text-ink sm:text-5xl">Welcome back</h1>
 <p className="mt-2 text-base text-ink-3">Sign in to continue to Royal Derby</p>
 </div>

 {/* Tabs */}
 <div className="mb-6 flex border-b border-rim">
 <span className="-mb-px border-b-2 border-navy px-4 pb-3 text-sm font-semibold text-navy">
 Sign In
 </span>
 <Link to="/register"
 className="px-4 pb-3 text-sm font-medium text-ink-3 hover:text-ink transition-colors">
 Register
 </Link>
 </div>

 {/* Alerts */}
 {success && (
 <div role="status" className="mb-5 bg-ok-subtle px-4 py-3 text-sm text-ok">{success}</div>
 )}
 {error && (
 <div role="alert" className="mb-5 bg-fail-subtle px-4 py-3 text-sm text-fail">{error}</div>
 )}

 {/* Form */}
 <form onSubmit={handleSubmit} className="space-y-5" noValidate>
 <div>
 <label htmlFor="login-username" className="mb-1.5 block text-xs font-medium text-ink-3">Username</label>
 <input
 id="login-username"
 type="text"
 className={error ? inputErrCls : inputCls}
 placeholder="Enter your username"
 value={username}
 onChange={(e) => setUsername(e.target.value)}
 aria-invalid={!!error}
 />
 </div>

 <div>
 <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-ink-3">Password</label>
 <div className="relative">
 <input
 id="login-password"
 type={showPassword ? 'text' : 'password'}
 className={error ? inputErrCls : inputCls}
 placeholder="Enter your password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 aria-invalid={!!error}
 />
 <button
 type="button"
 aria-label={showPassword ? 'Hide password' : 'Show password'}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-4 hover:text-ink-2 transition-colors"
 onClick={() => setShowPassword(!showPassword)}
 >
 {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
 </button>
 </div>
 </div>

 <div className="text-right">
 <Link to="/forgot-password" className="text-xs text-navy hover:text-navy-hi transition-colors">
 Forgotten password?
 </Link>
 </div>

 <Button type="submit" variant="primary" size="lg" className="w-full" disabled={loading}>
 {loading
 ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-blue border-t-transparent" />
 : <>Sign In <ArrowRight size={15} /></>}
 </Button>
 </form>

 <p className="mt-6 text-center text-sm text-ink-3">
 Don't have an account?{' '}
 <Link to="/register" className="font-semibold text-navy hover:text-navy-hi transition-colors">
 Register now
 </Link>
 </p>
 </AuthSplitLayout>
 );
}
