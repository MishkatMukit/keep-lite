import { useState, type FormEvent } from "react";
import { Link } from "react-router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Login submitted:", { email, password });
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
        <p className="text-sm text-slate-500 mt-1">
          Login to access your synchronized notes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-medium rounded-xl shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
        >
          Sign In
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link to="/register" className="font-semibold text-amber-600 hover:text-amber-700">
          Create one now
        </Link>
      </p>
    </div>
  );
};

export default Login;
