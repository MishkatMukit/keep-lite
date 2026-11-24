import { useState } from "react";
import { Link } from "react-router";
import {
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTag,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { BsPinAngle, BsPinFill } from "react-icons/bs";

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
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = ["All", "Database", "Personal", "Work"];

  const togglePin = (id: number) => {
    setNotes(
      notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n)),
    );
  };

  const deleteNote = (id: number) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || note.category?.name === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

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
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-sm text-slate-800 placeholder:text-slate-400"
          />
          <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
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
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === cat
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <FiTag className="w-3 h-3" />
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            style={{ backgroundColor: note.color }}
            className="rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between min-h-[190px] group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-900 text-base leading-snug">
                  {note.title}
                </h3>
                <button
                  type="button"
                  onClick={() => togglePin(note.id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    note.isPinned
                      ? "text-amber-600 bg-amber-500/10"
                      : "text-slate-400 hover:text-slate-600 hover:bg-black/5 opacity-0 group-hover:opacity-100"
                  }`}
                  title={note.isPinned ? "Unpin Note" : "Pin Note"}
                >
                  {note.isPinned ? (
                    <BsPinFill className="w-4 h-4" />
                  ) : (
                    <BsPinAngle className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                {note.content}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-slate-600">
              {note.category ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/5 font-medium text-slate-700">
                  <FiTag className="w-3 h-3 text-slate-500" />
                  {note.category.name}
                </span>
              ) : (
                <span className="text-slate-400">Uncategorized</span>
              )}

              <div className="flex items-center gap-1">
                <Link
                  to={`/note/${note.id}`}
                  className="p-1 text-slate-500 hover:text-slate-800 rounded hover:bg-black/5 transition-colors"
                  title="Edit Note"
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                </Link>
                <button
                  type="button"
                  onClick={() => deleteNote(note.id)}
                  className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-black/5 transition-colors cursor-pointer"
                  title="Delete Note"
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
