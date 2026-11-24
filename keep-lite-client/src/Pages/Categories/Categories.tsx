import { useState, type FormEvent } from "react";

interface CategoryItem {
  id: number;
  name: string;
  notesCount: number;
}

const initialCategories: CategoryItem[] = [
  { id: 1, name: "Database", notesCount: 4 },
  { id: 2, name: "Personal", notesCount: 2 },
  { id: 3, name: "Work", notesCount: 0 },
];

const Categories = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [name, setName] = useState("");

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newCategory: CategoryItem = {
      id: Date.now(),
      name: name.trim(),
      notesCount: 0,
    };
    setCategories([...categories, newCategory]);
    setName("");
  };

  const handleDelete = (id: number) => {
    setCategories(categories.filter((c) => c.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="text-sm text-slate-500 mt-1">
          Organize your notes into customized groups
        </p>
      </div>

      {/* Create Category Form */}
      <form
        onSubmit={handleCreate}
        className="flex gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
      >
        <input
          type="text"
          placeholder="New category name (e.g. Research, Projects)..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
        >
          Add
        </button>
      </form>

      {/* Categories List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between p-4 hover:bg-slate-50/60 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-semibold">
                🏷️
              </span>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-400">
                  {cat.notesCount} {cat.notesCount === 1 ? "note" : "notes"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(cat.id)}
              className="text-xs text-rose-500 hover:text-rose-700 font-medium px-2.5 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
