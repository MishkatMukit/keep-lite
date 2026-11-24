import { useState, type FormEvent } from "react";
import { Link } from "react-router";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Registration submitted:", { name, email, password });
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Create an Account</h2>
        <p className="text-sm text-slate-500 mt-1">
          Start capturing and organizing your notes with KeepLite
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

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
            placeholder="Min. 8 characters (1 letter & 1 number)"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-medium rounded-xl shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
        >
          Create Account
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-amber-600 hover:text-amber-700">
          Sign In
        </Link>
      </p>
    </div>
  );
};

export default Register;
