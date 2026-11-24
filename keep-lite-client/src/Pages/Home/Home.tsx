import { useState } from "react";
import { Link } from "react-router";

interface Note {
  id: number;
  title: string;
  content: string;
  color: string;
  isPinned: boolean;
  category?: { id: number; name: string } | null;
  updatedAt: string;
}

const sampleNotes: Note[] = [
  {
    id: 1,
    title: "Database Normalization (3NF)",
    content: "Must satisfy 2NF with zero transitive functional dependencies.",
    color: "#fef08a",
    isPinned: true,
    category: { id: 1, name: "Database" },
    updatedAt: "2026-11-25T00:00:00.000Z",
  },
  {
    id: 2,
    title: "Grocery Shopping",
    content: "Almond milk, whole beans coffee, organic sourdough bread.",
    color: "#dcfce7",
    isPinned: false,
    category: { id: 2, name: "Personal" },
    updatedAt: "2026-11-25T00:10:00.000Z",
  },
  {
    id: 3,
    title: "Security & JWT Checklist",
    content: "Store tokens in httpOnly cookies, rotate refresh token, verify roles.",
    color: "#ffffff",
    isPinned: false,
    category: { id: 1, name: "Database" },
    updatedAt: "2026-11-25T00:15:00.000Z",
  },
];

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Database", "Personal", "Work"];

  const filteredNotes = sampleNotes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || note.category?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Top Bar: Search & Action */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm"
          />
          <span className="absolute left-3.5 top-3 text-slate-400 text-sm">🔍</span>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
        >
          <span>➕</span>
          <span>New Note</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === cat
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            style={{ backgroundColor: note.color }}
            className="rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between min-h-[180px]"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-900 text-base leading-snug">
                  {note.title}
                </h3>
                {note.isPinned && (
                  <span className="text-sm" title="Pinned Note">
                    📌
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {note.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-slate-500">
              {note.category ? (
                <span className="px-2 py-0.5 rounded-md bg-black/5 font-medium text-slate-700">
                  {note.category.name}
                </span>
              ) : (
                <span>No category</span>
              )}
              <Link
                to={`/note/${note.id}`}
                className="font-medium text-slate-600 hover:text-slate-900"
              >
                Edit &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
