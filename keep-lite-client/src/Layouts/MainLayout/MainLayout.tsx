import { Outlet } from "react-router";
import Header from "../../Components/Header/Header";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500 bg-white">
        KeepLite &copy; {new Date().getFullYear()} — Multi-User Note Taking Platform
      </footer>
    </div>
  );
};

export default MainLayout;
