import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useProjects, projectActions } from '../../store/useProjectStore';
import { cn } from '@/lib/utils';

const CATEGORIES = ['新课定位', '用户画像', '产品功能', '用户体验'];
const METHODS    = ['桌面研究', '定量调研', '定性调研'];
const STATUSES   = ['进行中', '已完成', '部分完成'];

const METHOD_COLOR: Record<string, string> = {
  '桌面研究': 'bg-slate-100 text-slate-500',
  '定量调研': 'bg-blue-50 text-blue-600',
  '定性调研': 'bg-teal-50 text-teal-600',
};
const CATEGORY_COLOR: Record<string, string> = {
  '新课定位': 'bg-orange-50 text-orange-500',
  '用户画像': 'bg-teal-50 text-teal-600',
  '产品功能': 'bg-blue-50 text-blue-600',
  '用户体验': 'bg-amber-50 text-amber-600',
};
const STATUS_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  '已完成':   { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
  '进行中':   { bg: 'bg-blue-50',    text: 'text-blue-600',    dot: 'bg-blue-400'    },
  '部分完成': { bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-400'   },
};

function FilterSection({
  title, options, selected, onToggle,
}: {
  title: string;
  options: string[];
  selected: Set<string>;
  onToggle: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-2">{title}</p>
      <div className="flex flex-col gap-0.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg text-[12.5px] transition-all text-left',
              selected.has(opt)
                ? 'bg-orange-50 text-orange-500 font-semibold'
                : 'text-gray-500 hover:bg-gray-50',
            )}
          >
            <span className={cn(
              'w-1.5 h-1.5 rounded-full shrink-0',
              selected.has(opt) ? 'bg-orange-400' : 'bg-gray-300',
            )} />
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const projects = useProjects();
  const navigate = useNavigate();
  const [creating, setCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [filterCat,    setFilterCat]    = React.useState<Set<string>>(new Set());
  const [filterMethod, setFilterMethod] = React.useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (creating) inputRef.current?.focus();
  }, [creating]);

  function toggle(set: Set<string>, val: string, setter: (s: Set<string>) => void) {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    setter(next);
  }

  const filtered = projects.filter((p) => {
    if (filterCat.size    && !filterCat.has(p.category ?? ''))              return false;
    if (filterMethod.size && !p.methods?.some((m) => filterMethod.has(m)))  return false;
    if (filterStatus.size && !filterStatus.has(p.status ?? ''))             return false;
    return true;
  });

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) { toast.error('请输入项目名称'); return; }
    const p = projectActions.create(name);
    setNewName('');
    setCreating(false);
    navigate(`/projects/${p.id}/summary`);
  };

  const handleDelete = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`确认删除「${name}」？该项目所有数据将被清除。`)) return;
    projectActions.delete(id);
    toast.success('项目已删除');
  };

  const anyFilter = filterCat.size + filterMethod.size + filterStatus.size > 0;

  return (
    <div className="flex flex-1 overflow-hidden bg-[#F4F5F7]">

        {/* ── Sidebar ── */}
        <aside className="w-[188px] shrink-0 border-r border-gray-200 bg-white px-3 py-5 flex flex-col gap-5 overflow-y-auto">
          {anyFilter && (
            <button
              onClick={() => { setFilterCat(new Set()); setFilterMethod(new Set()); setFilterStatus(new Set()); }}
              className="text-[11px] text-orange-500 font-medium hover:underline text-left"
            >
              清除筛选
            </button>
          )}
          <FilterSection
            title="项目类别"
            options={CATEGORIES}
            selected={filterCat}
            onToggle={(v) => toggle(filterCat, v, setFilterCat)}
          />
          <FilterSection
            title="研究方法"
            options={METHODS}
            selected={filterMethod}
            onToggle={(v) => toggle(filterMethod, v, setFilterMethod)}
          />
          <FilterSection
            title="项目状态"
            options={STATUSES}
            selected={filterStatus}
            onToggle={(v) => toggle(filterStatus, v, setFilterStatus)}
          />
        </aside>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(272px,1fr))] gap-4">

            {filtered.map((p) => {
              const readyFiles = p.files.filter((f) => f.status === 'ready').length;
              const vocCount   = p.files.filter((f) => f.status === 'ready').reduce((s, f) => s + f.vocList.length, 0);
              return (
                <button
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}/summary`)}
                  className="bg-white border border-gray-200 rounded-2xl p-[17px] text-left cursor-pointer hover:border-orange-400 hover:shadow-md transition-all group relative"
                >
                  {/* top row: tags + status */}
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex flex-wrap gap-1">
                      {p.category && (
                        <span className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', CATEGORY_COLOR[p.category] ?? 'bg-gray-100 text-gray-500')}>
                          {p.category}
                        </span>
                      )}
                      {p.methods?.map((m) => (
                        <span key={m} className={cn('text-[10px] font-bold px-1.5 py-0.5 rounded-full', METHOD_COLOR[m] ?? 'bg-gray-100 text-gray-500')}>
                          {m}
                        </span>
                      ))}
                    </div>
                    {p.status ? (
                      <span className={cn(
                        'shrink-0 ml-1 flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                        STATUS_CONFIG[p.status]?.bg,
                        STATUS_CONFIG[p.status]?.text,
                      )}>
                        <span className={cn('w-1 h-1 rounded-full shrink-0', STATUS_CONFIG[p.status]?.dot)} />
                        {p.status}
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400 shrink-0 ml-1">
                        {new Date(p.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' }).replace('/', '.')}
                      </span>
                    )}
                  </div>

                  {/* name */}
                  <div className="text-[14.5px] font-extrabold leading-snug tracking-tight mb-1.5">
                    {p.name}
                  </div>

                  {/* meta */}
                  <div className="text-[11px] text-gray-400 flex items-center gap-1 mb-3">
                    {readyFiles > 0
                      ? <><span>{readyFiles} 个文件</span><span className="text-gray-200">·</span><span>{vocCount} 条原声</span></>
                      : <span>暂无文件</span>
                    }
                    {p.team?.length && (
                      <><span className="text-gray-200">·</span><span>协同：{p.team.join('/')}</span></>
                    )}
                  </div>

                  {/* foot */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <FolderOpen size={12} className="text-gray-300" />
                      <span className="text-[11px] text-gray-400">进入项目</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleDelete(p.id, p.name, e)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                      <ArrowRight size={15} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Create card */}
            {creating ? (
              <div className="bg-white rounded-2xl border-2 border-[#4361EE] p-[17px]">
                <input
                  ref={inputRef}
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') { setCreating(false); setNewName(''); }
                  }}
                  placeholder="输入项目名称，例如：K12物理品牌调研2025Q2"
                  className="w-full text-[14px] font-medium text-gray-900 outline-none placeholder:text-gray-300 mb-4"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreate}
                    className="px-4 py-2 bg-[#4361EE] text-white text-[12.5px] font-medium rounded-lg hover:bg-[#3451d1] transition-colors"
                  >
                    创建项目
                  </button>
                  <button
                    onClick={() => { setCreating(false); setNewName(''); }}
                    className="px-4 py-2 text-gray-500 text-[12.5px] rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setCreating(true)}
                className="flex flex-col items-center justify-center gap-2 p-[17px] rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-orange-400 hover:text-orange-400 transition-all min-h-[140px]"
              >
                <Plus size={24} strokeWidth={1.5} />
                <span className="text-[13px] font-medium">新建研究项目</span>
              </button>
            )}

          </div>
        </main>

    </div>
  );
}
