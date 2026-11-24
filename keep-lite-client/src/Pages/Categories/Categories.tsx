import { useState, type FormEvent } from "react";
import { FiFileText, FiFolder, FiFolderPlus, FiPlus, FiTrash2 } from "react-icons/fi";

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
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FiFolder className="w-6 h-6 text-amber-500" />
          <span>Categories</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Organize your notes into customized groups
        </p>
      </div>

      {/* Create Category Form */}
      <form
        onSubmit={handleCreate}
        className="flex gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm"
      >
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="New category name (e.g. Research, Projects)..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800 placeholder:text-slate-400"
          />
          <FiFolderPlus className="absolute left-3.5 top-3.5 text-slate-400 w-4 h-4" />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-amber-500/20 transition-all cursor-pointer"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add</span>
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
              <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-semibold">
                <FiFolder className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">
                  {cat.name}
                </h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <FiFileText className="w-3 h-3 text-slate-400" />
                  <span>
                    {cat.notesCount} {cat.notesCount === 1 ? "note" : "notes"}
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(cat.id)}
              className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-medium px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete Category"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;
