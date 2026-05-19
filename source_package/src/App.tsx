import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  PlayCircle, 
  Sparkles, 
  FileText, 
  BarChart3, 
  LayoutDashboard, 
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquareQuote
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type Brand = '洋葱/妙懂' | '学而思' | '万物指南' | 'NB虚拟实验室' | '赛先生';

type Project = {
  id: string;
  name: string;
  date: string;
};

const PROJECTS: Project[] = [
  { id: 'proj1', name: '2024年启蒙教育品牌对比研究', date: '2024.03 - 2024.05' },
  { id: 'proj2', name: '2023年成人泛心理学消费趋势', date: '2023.08 - 2023.11' },
  { id: 'proj3', name: '教育硬件：智能台灯使用观察', date: '2024.01 - 2024.02' },
];

interface VOC {
  id: string;
  brand: Brand;
  text: string;
  respondent: string;
}

// --- Constants ---
const BRANDS: { name: Brand; color: string; bg: string; border: string }[] = [
  { name: '洋葱/妙懂', color: '#f97316', bg: '#fff7ed', border: '#fdba74' },
  { name: '学而思', color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd' },
  { name: '万物指南', color: '#22c55e', bg: '#f0fdf4', border: '#86efac' },
  { name: 'NB虚拟实验室', color: '#a855f7', bg: '#faf5ff', border: '#d8b4fe' },
  { name: '赛先生', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5' },
];

const QUAL_INSIGHTS_DATA = {
  '家长对启蒙的态度': [
    {
      title: '学习焦虑感与启蒙初衷',
      vocs: [
        { brand: '洋葱/妙懂', text: '“主要是不想让孩子输在起跑线上，希望通过这种比较生动的形式让他先接触一下科学。”', respondent: '家长#A01' },
        { brand: '学而思', text: '“学而思比较体系化，虽然有点难，但感觉对以后幼升小有帮助。”', respondent: '家长#B12' },
        { brand: '万物指南', text: '“更看重体验，让孩子自己动手做实验，比单纯看视频好。”', respondent: '家长#C05' },
        { brand: '洋葱/妙懂', text: '“孩子挺喜欢那个小洋葱的形象，每天主动要求看。”', respondent: '家长#A08' },
      ]
    },
    {
      title: '对线上录播课的接受度',
      vocs: [
        { brand: '洋葱/妙懂', text: '“时间自由，随时能看，而且动画做得确实比老师直播讲更有趣。”', respondent: '家长#A22' },
        { brand: '学而思', text: '“还是担心互动不够，孩子容易走神。”', respondent: '家长#B03' },
      ]
    }
  ],
  '吸引卖点': [],
  '产品体验': []
};

// --- Components ---

const Sidebar = ({ 
  current, 
  onChange, 
  activeProject, 
  onProjectChange 
}: { 
  current: string;
  onChange: (id: string) => void;
  activeProject: Project;
  onProjectChange: (project: Project) => void;
}) => {
  const [isProjectMenuOpen, setIsProjectMenuOpen] = React.useState(false);
  
  const items = [
    { id: 'insights', label: '定性洞察', icon: MessageSquareQuote },
    { id: 'qual_report', label: '定性报告', icon: Sparkles },
    { id: 'quan_report', label: '定量报告', icon: BarChart3 },
    { id: 'summary', label: '项目总结', icon: LayoutDashboard },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-gray-50 text-center">
        <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <LayoutDashboard size={18} />
          </div>
          洞察管理
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              current === item.id 
                ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon size={20} className={current === item.id ? 'text-indigo-600' : ''} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50 relative">
        <AnimatePresence>
          {isProjectMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-20" 
                onClick={() => setIsProjectMenuOpen(false)} 
              />
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full left-4 right-4 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-30 overflow-hidden"
              >
                <div className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                  选择研究项目
                </div>
                {PROJECTS.map(proj => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onProjectChange(proj);
                      setIsProjectMenuOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl transition-colors ${
                      activeProject.id === proj.id 
                        ? 'bg-indigo-50 text-indigo-700 font-bold' 
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className="text-sm line-clamp-1">{proj.name}</div>
                    <div className="text-[10px] opacity-60 mt-0.5">{proj.date}</div>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
          className={`w-full bg-gray-50 rounded-2xl p-4 text-left transition-all border group ${
            isProjectMenuOpen ? 'border-indigo-200 bg-indigo-50/30' : 'border-transparent hover:border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">当前项目</p>
            <ChevronDown size={14} className={`text-gray-400 transition-transform ${isProjectMenuOpen ? 'rotate-180' : ''}`} />
          </div>
          <p className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {activeProject.name}
          </p>
        </button>
      </div>
    </div>
  );
};

// Page: Qualitative Insights
const InsightsPage = () => {
  const [activeTab, setActiveTab] = React.useState('家长对启蒙的态度');
  const [expanded, setExpanded] = React.useState<string | null>('学习焦虑感与启蒙初衷');
  const [selectedBrands, setSelectedBrands] = React.useState<Brand[]>(['洋葱/妙懂', '学而思', '万物指南']);

  const tabs = ['家长对启蒙的态度', '吸引卖点', '产品体验'];

  return (
    <div className="p-8 pb-20">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">定性洞察</h2>
          <p className="text-gray-500 mt-2">基于用户原声的深度对比分析</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {QUAL_INSIGHTS_DATA[activeTab as keyof typeof QUAL_INSIGHTS_DATA]?.map((item) => (
          <div key={item.title} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setExpanded(expanded === item.title ? null : item.title)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${expanded === item.title ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                  {expanded === item.title ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </div>
                <span className="text-lg font-semibold text-gray-800">{item.title}</span>
              </div>
              <div className="flex gap-2">
                {BRANDS.slice(0, 3).map(b => (
                  <span key={b.name} className="px-2 py-1 bg-gray-50 text-[10px] font-bold rounded border border-gray-100 uppercase tracking-wider text-gray-400">
                    {b.name}
                  </span>
                ))}
              </div>
            </button>

            <AnimatePresence>
              {expanded === item.title && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-50"
                >
                  <div className="p-6 bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">显示品牌</span>
                      <div className="flex gap-3">
                        {BRANDS.map(brand => (
                          <label key={brand.name} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={selectedBrands.includes(brand.name)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedBrands([...selectedBrands, brand.name]);
                                else setSelectedBrands(selectedBrands.filter(b => b !== brand.name));
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-600 group-hover:text-gray-900">{brand.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-4">
                      {BRANDS.filter(b => selectedBrands.includes(b.name)).map(b => (
                        <div key={b.name} className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                           <span className="text-xs font-medium text-gray-600">
                             {b.name} (12条 | <span className="text-green-600">67% 正面</span>)
                           </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 overflow-x-auto">
                    <div className="flex gap-6 min-w-max">
                      {BRANDS.filter(b => selectedBrands.includes(b.name)).map(brand => (
                        <div key={brand.name} className="w-80 flex-shrink-0">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: brand.color }} />
                            <h4 className="font-bold text-gray-900">{brand.name}</h4>
                          </div>
                          <div className="space-y-4">
                            {item.vocs.filter(v => v.brand === brand.name).map((voc, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm group hover:border-indigo-100 transition-all">
                                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                                  {voc.text}
                                </p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                                    {voc.respondent}
                                  </div>
                                  <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                    <PlayCircle size={18} />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {item.vocs.filter(v => v.brand === brand.name).length === 0 && (
                              <div className="py-12 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
                                <AlertCircle size={24} className="mb-2" />
                                <span className="text-xs font-medium uppercase tracking-widest">暂无相关VOC</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

// Page: Qualitative Report
const QualReportPage = () => {
  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">定性报告</h2>
        <p className="text-gray-500 mt-2">AI 智能总结与各品牌综合对比</p>
      </div>

      <section className="bg-indigo-600 rounded-2xl p-8 mb-8 relative overflow-hidden text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Sparkles size={24} className="text-indigo-100" />
            </div>
            <h3 className="text-xl font-bold uppercase tracking-wider">AI 智能总结</h3>
            <span className="px-2 py-0.5 bg-white/10 text-[10px] font-bold rounded-full border border-white/20 backdrop-blur-sm">自动生成</span>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-indigo-50 leading-relaxed text-lg italic">
                “整体研究发现，家长对启蒙教育的投入正从‘知识灌输’转向‘能力培养’，特别是科学素养。洋葱/妙懂在动画生动性上处于行业领先，而学而思在家长心中依然占据着‘权威、标准、体系’的认知高峰。万物指南则在大班实验互动中具有极高满意度。”
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h4 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-70">核心趋势</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-1.5" />
                  <span>3-6岁阶段：由于去繁就简政策，家长更倾向于能够激发兴趣的‘非功利’性产品。</span>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 mt-1.5" />
                  <span>核心痛点：屏幕时长焦虑依然是线上产品推广的最大壁垒。</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* Abstract shapes */}
        <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-50" />
      </section>

      <div className="mb-8 flex justify-center">
        <button 
          onClick={() => {
            alert('AI 正在分析全量 VOC 数据并重新生成总结...');
          }}
          className="flex items-center gap-2 px-8 py-4 bg-white border border-gray-100 shadow-sm rounded-2xl hover:border-indigo-500 hover:text-indigo-600 font-bold transition-all text-sm uppercase tracking-widest"
        >
          <Sparkles size={18} />
          重新生成 AI 洞察总结
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {BRANDS.slice(0, 3).map(brand => (
          <div key={brand.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-50 flex items-center justify-between">
              <h4 className="text-xl font-bold text-gray-900">{brand.name}</h4>
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: brand.bg, color: brand.color }}>
                <CheckCircle2 size={24} />
              </div>
            </div>
            <div className="p-6 flex-1 space-y-6">
              <div>
                <h5 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3">核心发现</h5>
                <ul className="space-y-2">
                   {[1,2,3].map(i => (
                     <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                       <span className="text-indigo-500 font-bold">•</span>
                       <span>该品牌在当前阶段的用户心智占有率较高...</span>
                     </li>
                   ))}
                </ul>
              </div>
              <div>
                <h5 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3">优势亮点</h5>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">高频互动</span>
                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">低价门槛</span>
                </div>
              </div>
              <div>
                <h5 className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-3">痛点/槽点</h5>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full">加载缓慢</span>
                  <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full">客服响应慢</span>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 text-center">
              <button className="text-indigo-600 text-xs font-bold uppercase tracking-widest hover:text-indigo-700 transition-colors">查看完整报告</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Page: Quantitative Report
const QuanReportPage = () => {
  const data = [
    { name: '洋葱/妙懂', score: 85, satisfaction: 88, retention: 72 },
    { name: '学而思', score: 78, satisfaction: 82, retention: 85 },
    { name: '万物指南', score: 92, satisfaction: 95, retention: 65 },
    { name: 'NB实验室', score: 70, satisfaction: 75, retention: 60 },
    { name: '赛先生', score: 65, satisfaction: 70, retention: 55 },
  ];

  const pieData = [
    { name: '一线城市', value: 400 },
    { name: '二线城市', value: 300 },
    { name: '三线及以下', value: 300 },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-8 pb-20 max-w-7xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">定量报告</h2>
          <p className="text-gray-500 mt-2">问卷星全量调研数据分析可视化</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-xl text-xs font-bold text-gray-500">
          数据来源：问卷星
          <ExternalLink size={14} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[
          { label: '总计样本数', value: '2,485', trend: '+12%'},
          { label: '有效回收率', value: '98.2%', trend: '+0.5%'},
          { label: '调研耗时', value: '15d', trend: '稳定'},
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-lg">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-8">品牌综合满意度对比 (100分制)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-8">用户地域分布概况</h3>
          <div className="grid grid-cols-2 items-center h-80">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
               {pieData.map((d, i) => (
                 <div key={i} className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                     <span className="text-sm font-medium text-gray-600">{d.name}</span>
                   </div>
                   <span className="text-sm font-bold text-gray-900">{((d.value/1000)*100).toFixed(0)}%</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Page: Project Summary
const SummaryPage = () => {
  return (
    <div className="p-8 pb-20 max-w-5xl mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">项目总结报告</h2>
        <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
          <span>研究周期: 2024.03 - 2024.05</span>
          <span className="w-1 h-1 rounded-full bg-gray-400" />
          <span>研究负责人: 张小用</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-10 space-y-12">
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">核心结论 Top 3</h3>
          </div>
          <div className="grid gap-6">
            {[
              { title: "跨品类竞争加剧", desc: "科学启蒙不再是小众需求，已成为幼小衔接刚需，各家产品同质化严重。" },
              { title: "动手能力>视觉灌输", desc: "实物盒子与线上课的结合是未来的高溢价点，纯线上课面临获客成本瓶颈。" },
              { title: "品牌心智的分化", desc: "家长对‘品牌’的信任度显著高于个别老师的表现，建立机构公信力是关键。" }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 flex gap-6">
                <span className="text-4xl font-black text-gray-200">0{i+1}</span>
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
              <Sparkles size={20} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">下一步行动建议</h3>
          </div>
          <div className="space-y-4">
             {[
               "加大对大班段科学实验盒子的研发投入，提升与视频的互动性。",
               "在营销渠道中强调‘闭眼入、不用选’的体系化优势，对标学而思。",
               "优化APP加载速度，解决VOC中反馈较多的‘卡顿’痛点。"
             ].map((txt, i) => (
               <div key={i} className="flex items-start gap-4 p-4 border border-gray-100 rounded-xl hover:border-indigo-200 transition-colors">
                 <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">{i+1}</div>
                 <p className="text-gray-700">{txt}</p>
               </div>
             ))}
          </div>
        </section>

        <section className="pt-8 border-t border-gray-100 flex justify-between items-center">
           <div className="flex items-center gap-4">
             <div className="flex -space-x-2">
               {[1,2,3].map(i => (
                 <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-gray-200 i-${i}`} />
               ))}
             </div>
             <span className="text-xs text-gray-400 font-medium">已有 12 位部门领导审阅</span>
           </div>
           <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-colors">
             <FileText size={18} />
             下载完整PDF报告
           </button>
        </section>
      </div>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [currentPage, setCurrentPage] = React.useState('insights');
  const [activeProject, setActiveProject] = React.useState<Project>(PROJECTS[0]);

  const renderPage = () => {
    switch(currentPage) {
      case 'insights': return <InsightsPage />;
      case 'qual_report': return <QualReportPage />;
      case 'quan_report': return <QuanReportPage />;
      case 'summary': return <SummaryPage />;
      default: return <InsightsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex">
      <Sidebar 
        current={currentPage} 
        onChange={setCurrentPage} 
        activeProject={activeProject}
        onProjectChange={setActiveProject}
      />
      <main className="flex-1 ml-64 overflow-y-auto h-screen bg-gray-50/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeProject.id}-${currentPage}`}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase tracking-widest">
                  当前项目
                </span>
                <h2 className="text-sm font-bold text-gray-500 truncate">{activeProject.name}</h2>
              </div>
              <div className="text-[10px] font-medium text-gray-400">
                最后同步时间: 10分钟前
              </div>
            </div>
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
