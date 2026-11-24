import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 text-3xl shadow-inner mx-auto">
          📝
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            KeepLite Client
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            React 19 + TypeScript + Tailwind CSS
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-left text-sm space-y-2">
          <div className="flex items-center space-x-2 text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Tailwind CSS is active</span>
          </div>
          <p className="text-xs text-slate-500">
            Connects to KeepLite API at{" "}
            <code className="font-mono text-slate-700 bg-slate-200/60 px-1.5 py-0.5 rounded">
              http://localhost:5000/api/v1
            </code>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCount((c) => c + 1)}
          className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-medium rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          Count is: {count}
        </button>
      </div>
    </div>
  );
}

export default App;
