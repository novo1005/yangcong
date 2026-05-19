import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Sparkles,
  MessageSquareQuote,
  LayoutDashboard,
  FileText,
  ExternalLink,
  X,
  Loader2,
  Trash2,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { capabilityClient } from '@lark-apaas/client-toolkit';
import { getDataloom } from '@lark-apaas/client-toolkit/dataloom';
import { getDefaultBucketId } from '@lark-apaas/client-toolkit/tools/storage';
import type { VocDocParserOneInput, VocDocParserOneOutput, VocStructuredExtractionOneInput, VocStructuredExtractionOneOutput } from '@shared/plugin-types';
import { Button } from '@client/src/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@client/src/components/ui/dialog';
import { Input } from '@client/src/components/ui/input';
import { Label } from '@client/src/components/ui/label';
import { UniversalLink } from '@lark-apaas/client-toolkit/components/UniversalLink';

// --- Types ---
type Brand = '洋葱' | '妙懂' | '学而思' | '万物指南' | 'NB虚拟实验室' | '赛先生';

interface VOCItem {
  id: string;
  brand: Brand;
  text: string;
  respondent: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

interface SubDimension {
  title: string;
  vocs: VOCItem[];
}

interface Dimension {
  id: string;
  name: string;
  subDimensions: SubDimension[];
}

interface ProjectFile {
  id: string;
  name: string;
  feishuLink?: string;
  fileUrl?: string;
  filePath?: string;
  parsedContent?: string;
  isParsing?: boolean;
}

interface Project {
  id: string;
  name: string;
  dateRange: string;
  files: ProjectFile[];
  parsedVOCs: VOCItem[];
}

// --- Constants ---
const BRANDS: { name: Brand; color: string; bg: string; border: string }[] = [
  { name: '洋葱', color: '#f97316', bg: '#fff7ed', border: '#fdba74' },
  { name: '妙懂', color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d' },
  { name: '学而思', color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd' },
  { name: '万物指南', color: '#22c55e', bg: '#f0fdf4', border: '#86efac' },
  { name: 'NB虚拟实验室', color: '#a855f7', bg: '#faf5ff', border: '#d8b4fe' },
  { name: '赛先生', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5' },
];

// 三级维度结构
const DIMENSIONS: Dimension[] = [
  {
    id: 'level1',
    name: '需求认知',
    subDimensions: [
      { title: '诉求是什么？', vocs: [] },
      { title: '对「启蒙」的要求&态度', vocs: [] },
      { title: '「启蒙有效」的标准&预期', vocs: [] },
    ]
  },
  {
    id: 'level2',
    name: '购买决策',
    subDimensions: [
      { title: '触达渠道：在哪看到的？', vocs: [] },
      { title: '吸引卖点：什么内容吸引促使购买？', vocs: [] },
      { title: '购前预期：买前希望孩子怎么学？', vocs: [] },
    ]
  },
  {
    id: 'level3',
    name: '产品体验',
    subDimensions: [
      { title: '使用场景：什么时候学？', vocs: [] },
      { title: '优势/好评', vocs: [] },
      { title: '劣势/差评', vocs: [] },
    ]
  },
];

// 示例项目数据
const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'proj1',
    name: '2024年启蒙教育品牌对比研究',
    dateRange: '2024.03 - 2024.05',
    files: [
      { id: 'f1', name: '用户访谈记录-第1期', feishuLink: 'https://example.com/doc1' },
    ],
    parsedVOCs: [
      { id: 'v1', brand: '洋葱', text: '主要是不想让孩子输在起跑线上，希望通过这种比较生动的形式让他先接触一下科学。', respondent: '家长#A01', sentiment: 'positive' },
      { id: 'v2', brand: '学而思', text: '学而思比较体系化，虽然有点难，但感觉对以后幼升小有帮助。', respondent: '家长#B12', sentiment: 'neutral' },
      { id: 'v3', brand: '万物指南', text: '更看重体验，让孩子自己动手做实验，比单纯看视频好。', respondent: '家长#C05', sentiment: 'positive' },
    ]
  },
];

// --- Components ---

// 删除确认弹窗
const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  projectName
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  projectName: string;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="w-5 h-5" />
            删除项目
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-600">
            确定要删除项目「<span className="font-semibold text-gray-900">{projectName}</span>」吗？
          </p>
          <p className="text-sm text-gray-400 mt-2">此操作不可恢复，相关数据将被永久删除。</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white">
            确认删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 创建项目弹窗
const CreateProjectDialog = ({
  open,
  onOpenChange,
  onCreate,
  isParsing,
  onParseAndCreate
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (project: Omit<Project, 'id' | 'parsedVOCs'>) => void;
  isParsing?: boolean;
  onParseAndCreate?: (project: Omit<Project, 'id' | 'parsedVOCs'>) => Promise<void>;
}) => {
  const [name, setName] = React.useState('');
  const [dateRange, setDateRange] = React.useState('');
  const [files, setFiles] = React.useState<{ name: string; link?: string; file?: File }[]>([]);
  const [uploadMode, setUploadMode] = React.useState<'file' | 'link'>('file');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = selectedFiles.map(file => ({
      name: file.name,
      file: file
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: 'name' | 'link', value: string) => {
    const newFiles = [...files];
    newFiles[index][field] = value;
    setFiles(newFiles);
  };

  const handleAddLink = () => {
    setFiles([...files, { name: '', link: '' }]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('请输入项目名称');
      return;
    }

    const projectData: Omit<Project, 'id' | 'parsedVOCs'> = {
      name: name.trim(),
      dateRange: dateRange.trim() || new Date().toISOString().slice(0, 7),
      files: []
    };

    // 先上传文件获取 URL，再调用 AI 解析
    const filesWithUrl: Omit<ProjectFile, 'id'>[] = [];
    for (const f of files) {
      if (f.file) {
        filesWithUrl.push({ name: f.name, fileUrl: '' });
      } else if (f.link) {
        filesWithUrl.push({ name: f.name, feishuLink: f.link });
      }
    }

    // 上传本地文件到存储服务
    if (filesWithUrl.some(f => f.fileUrl !== undefined || !f.feishuLink)) {
      const dataloom = await getDataloom();
      const bucketId = getDefaultBucketId();

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        if (f.file) {
          toast.info(`正在上传: ${f.name}...`);
          const { data, error } = await dataloom
            .storage
            .from(bucketId)
            .uploadFile(f.file);

          if (error || !data) {
            toast.error(`文件 "${f.name}" 上传失败: ${error?.message || '未知错误'}`);
            continue;
          }

          filesWithUrl[i] = { name: f.name, fileUrl: data.download_url };
          toast.success(`文件 "${f.name}" 上传成功`);
        }
      }
    }

    projectData.files = filesWithUrl.map((f, i) => ({
      id: `file-${Date.now()}-${i}`,
      name: f.name,
      feishuLink: f.feishuLink,
      fileUrl: f.fileUrl
    }));

    // 如果有上传的文件且提供了 onParseAndCreate，则调用 AI 解析
    const hasFiles = filesWithUrl.some(f => f.fileUrl);
    if (hasFiles && onParseAndCreate) {
      await onParseAndCreate(projectData);
    } else {
      onCreate(projectData);
    }

    // 重置表单
    setName('');
    setDateRange('');
    setFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            新建研究项目
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>项目名称</Label>
            <Input
              placeholder="例如：2024年启蒙教育品牌对比研究"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>研究周期</Label>
            <Input
              placeholder="例如：2024.03 - 2024.05"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>关联文件</Label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUploadMode('file')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${uploadMode === 'file' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  上传文件
                </button>
                <button
                  type="button"
                  onClick={() => setUploadMode('link')}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${uploadMode === 'link' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  飞书链接
                </button>
              </div>
            </div>

            {/* 文件上传区域 */}
            {uploadMode === 'file' && (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.txt,.md"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                >
                  <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">点击或拖拽上传文件</p>
                  <p className="text-xs text-gray-400 mt-1">支持 PDF、Word、TXT、Markdown</p>
                </div>

                {/* 已选文件列表 */}
                {files.filter(f => f.file).length > 0 && (
                  <div className="space-y-2">
                    {files.filter(f => f.file).map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText size={18} className="text-indigo-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-700">{file.name}</p>
                            <p className="text-xs text-gray-400">
                              {(file.file!.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFile(files.indexOf(file))}
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 链接输入区域 */}
            {uploadMode === 'link' && (
              <div className="space-y-3">
                <Button type="button" variant="outline" size="sm" onClick={handleAddLink}>
                  <Plus className="w-4 h-4 mr-1" />
                  添加链接
                </Button>
                {files.filter(f => f.link !== undefined).map((file, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="文件名称"
                        value={file.name}
                        onChange={(e) => handleLinkChange(files.indexOf(file), 'name', e.target.value)}
                      />
                      <Input
                        placeholder="飞书妙记链接"
                        value={file.link || ''}
                        onChange={(e) => handleLinkChange(files.indexOf(file), 'link', e.target.value)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveFile(files.indexOf(file))}
                      className="mt-1"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isParsing}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={isParsing || !name.trim()}
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI解析中...
              </>
            ) : files.filter(f => f.file).length > 0 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                创建并AI解析
              </>
            ) : (
              '创建项目'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 添加文件弹窗
const AddFileDialog = ({
  open,
  onOpenChange,
  projectName,
  onAddFiles,
  isParsing
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  onAddFiles: (files: Omit<ProjectFile, 'id'>[], parseImmediately: boolean) => void;
  isParsing?: boolean;
}) => {
  const [files, setFiles] = React.useState<{ name: string; link?: string; file?: File }[]>([]);
  const [uploadMode, setUploadMode] = React.useState<'file' | 'link'>('file');
  const [parseImmediately, setParseImmediately] = React.useState(true);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const newFiles = selectedFiles.map(file => ({
      name: file.name,
      file: file
    }));
    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, field: 'name' | 'link', value: string) => {
    const newFiles = [...files];
    newFiles[index][field] = value;
    setFiles(newFiles);
  };

  const handleAddLink = () => {
    setFiles([...files, { name: '', link: '' }]);
  };

  const [isUploading, setIsUploading] = React.useState(false);

  const handleSubmit = async () => {
    const validFiles = files.filter(f => f.name && (f.file || f.link));

    if (validFiles.length === 0) {
      toast.error('请至少添加一个有效的文件');
      return;
    }

    setIsUploading(true);

    try {
      // 上传本地文件到存储服务获取 URL
      const dataloom = await getDataloom();
      const bucketId = getDefaultBucketId();

      const uploadedFiles: Omit<ProjectFile, 'id'>[] = [];

      for (const f of validFiles) {
        if (f.file) {
          // 上传本地文件
          toast.info(`正在上传: ${f.name}...`);
          const { data, error } = await dataloom
            .storage
            .from(bucketId)
            .uploadFile(f.file);

          if (error || !data) {
            toast.error(`文件 "${f.name}" 上传失败: ${error?.message || '未知错误'}`);
            continue;
          }

          uploadedFiles.push({
            name: f.name,
            feishuLink: undefined,
            fileUrl: data.download_url // 使用上传后的 URL
          });
          toast.success(`文件 "${f.name}" 上传成功`);
        } else if (f.link) {
          // 飞书链接直接保存
          uploadedFiles.push({
            name: f.name,
            feishuLink: f.link,
            fileUrl: undefined
          });
        }
      }

      if (uploadedFiles.length === 0) {
        toast.error('没有文件上传成功');
        return;
      }

      onAddFiles(uploadedFiles, parseImmediately);
      setFiles([]);
      onOpenChange(false);
    } catch (error) {
      logger.error('Upload files failed:', String(error));
      toast.error('文件上传失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            添加文件到「{projectName}」
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 上传模式切换 */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setUploadMode('file')}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors ${uploadMode === 'file' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              上传文件
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('link')}
              className={`flex-1 py-2 text-sm rounded-lg transition-colors ${uploadMode === 'link' ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
            >
              飞书链接
            </button>
          </div>

          {/* 文件上传区域 */}
          {uploadMode === 'file' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.md"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
              >
                <Upload className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">点击或拖拽上传文件</p>
                <p className="text-xs text-gray-400 mt-1">支持 PDF、Word、TXT、Markdown</p>
              </div>

              {/* 已选文件列表 */}
              {files.filter(f => f.file).length > 0 && (
                <div className="space-y-2">
                  {files.filter(f => f.file).map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText size={18} className="text-indigo-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{file.name}</p>
                          <p className="text-xs text-gray-400">
                            {(file.file!.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveFile(files.indexOf(file))}
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 链接输入区域 */}
          {uploadMode === 'link' && (
            <div className="space-y-3">
              <Button type="button" variant="outline" size="sm" onClick={handleAddLink}>
                <Plus className="w-4 h-4 mr-1" />
                添加链接
              </Button>
              {files.filter(f => f.link !== undefined).map((file, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="文件名称"
                      value={file.name}
                      onChange={(e) => handleLinkChange(files.indexOf(file), 'name', e.target.value)}
                    />
                    <Input
                      placeholder="飞书妙记链接"
                      value={file.link || ''}
                      onChange={(e) => handleLinkChange(files.indexOf(file), 'link', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFile(files.indexOf(file))}
                    className="mt-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 立即解析选项 */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="parse-immediately"
              checked={parseImmediately}
              onChange={(e) => setParseImmediately(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="parse-immediately" className="text-sm text-gray-700 cursor-pointer">
              添加后立即进行AI解析
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isParsing}>
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-indigo-600 hover:bg-indigo-700"
            disabled={isParsing || files.length === 0}
          >
            {isParsing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI解析中...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                添加文件
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// 侧边栏组件
const Sidebar = ({
  projects,
  activeProject,
  onProjectChange,
  onCreateProject,
  onDeleteProject
}: {
  projects: Project[];
  activeProject: Project;
  onProjectChange: (project: Project) => void;
  onCreateProject: () => void;
  onDeleteProject: (project: Project) => void;
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const items = [
    { id: 'insights', label: '定性洞察', icon: MessageSquareQuote },
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-indigo-50 text-indigo-700 font-bold shadow-sm"
          >
            <item.icon size={20} className="text-indigo-600" />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-50 space-y-3">
        {/* 新建项目按钮 */}
        <button
          onClick={onCreateProject}
          className="w-full flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-medium"
        >
          <Plus size={18} />
          新建项目
        </button>

        {/* 项目选择器 */}
        <div className="relative">
          <AnimatePresence>
            {isMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setIsMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-30 overflow-hidden"
                >
                  <div className="p-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                    选择研究项目
                  </div>
                  {projects.map(proj => (
                    <div
                      key={proj.id}
                      className={`group flex items-center justify-between p-3 rounded-xl transition-colors ${
                        activeProject.id === proj.id
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onProjectChange(proj);
                          setIsMenuOpen(false);
                        }}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm line-clamp-1">{proj.name}</div>
                        <div className="text-[10px] opacity-60 mt-0.5">{proj.dateRange}</div>
                      </button>
                      <button
                        onClick={() => onDeleteProject(proj)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="删除项目"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-full bg-gray-50 rounded-2xl p-4 text-left transition-all border group ${
              isMenuOpen ? 'border-indigo-200 bg-indigo-50/30' : 'border-transparent hover:border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">当前项目</p>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
            </div>
            <p className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {activeProject.name}
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

// 定性洞察页面
const InsightsPage = ({
  project,
  onParseFiles,
  onAddFiles
}: {
  project: Project;
  onParseFiles: () => void;
  onAddFiles: () => void;
}) => {
  const [activeDimension, setActiveDimension] = React.useState(0);
  const [expandedSubDimensions, setExpandedSubDimensions] = React.useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = React.useState<Brand[]>(BRANDS.map(b => b.name));

  const toggleSubDimension = (title: string) => {
    setExpandedSubDimensions(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const currentDimension = DIMENSIONS[activeDimension];

  // 将VOCs分配到对应子维度（示例逻辑）
  const getVOCsForSubDimension = (subDimensionTitle: string): VOCItem[] => {
    // 这里简化处理，实际应根据AI解析结果进行分类
    return project.parsedVOCs.filter((_, index) =>
      index % currentDimension.subDimensions.length === currentDimension.subDimensions.findIndex(s => s.title === subDimensionTitle)
    );
  };

  return (
    <div className="p-8 pb-20">
      {/* 项目文件信息 */}
      <div className="mb-6 bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{project.name}</h2>
            <p className="text-gray-500 mt-1">研究周期：{project.dateRange}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={onAddFiles}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus size={18} />
              添加文件
            </Button>
            {project.files.length > 0 && (
              <Button
                onClick={onParseFiles}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <Sparkles size={18} />
                AI解析文件
              </Button>
            )}
          </div>
        </div>

        {project.files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">关联文件：</p>
            <div className="flex flex-wrap gap-2">
              {project.files.map(file => (
                file.feishuLink ? (
                  <UniversalLink
                    key={file.id}
                    to={file.feishuLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <FileText size={14} />
                    {file.name}
                    <ExternalLink size={12} className="text-gray-400" />
                  </UniversalLink>
                ) : (
                  <div
                    key={file.id}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-700"
                    title="本地文件"
                  >
                    <FileText size={14} />
                    {file.name}
                  </div>
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 三级维度 Tab */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h3 className="text-xl font-bold text-gray-900">定性洞察</h3>
          <p className="text-gray-500 mt-1">基于用户原声的深度分析</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          {DIMENSIONS.map((dim, index) => (
            <button
              key={dim.id}
              onClick={() => setActiveDimension(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeDimension === index
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {dim.name}
            </button>
          ))}
        </div>
      </div>

      {/* 品牌筛选器 */}
      <div className="mb-6 bg-gray-50 rounded-xl p-4 flex items-center gap-4 flex-wrap">
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

      {/* 子维度列表 */}
      <div className="space-y-4">
        {currentDimension.subDimensions.map((subDim) => {
          const vocs = getVOCsForSubDimension(subDim.title);
          const isExpanded = expandedSubDimensions.includes(subDim.title);

          return (
            <div key={subDim.title} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleSubDimension(subDim.title)}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isExpanded ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                  <span className="text-lg font-semibold text-gray-800">{subDim.title}</span>
                  <span className="px-2 py-1 bg-gray-100 text-xs text-gray-500 rounded-full">
                    {vocs.length} 条
                  </span>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-50"
                  >
                    <div className="p-6 overflow-x-auto">
                      <div className="flex gap-6 min-w-max">
                        {BRANDS.filter(b => selectedBrands.includes(b.name)).map(brand => {
                          const brandVOCs = vocs.filter(v => v.brand === brand.name);

                          return (
                            <div key={brand.name} className="w-80 flex-shrink-0">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: brand.color }} />
                                <h4 className="font-bold text-gray-900">{brand.name}</h4>
                                <span className="text-xs text-gray-400">({brandVOCs.length})</span>
                              </div>
                              <div className="space-y-4">
                                {brandVOCs.map((voc) => (
                                  <div
                                    key={voc.id}
                                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-all"
                                  >
                                    <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                      {voc.text}
                                    </p>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                          {voc.respondent}
                                        </span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                                          voc.sentiment === 'positive' ? 'bg-green-50 text-green-600' :
                                          voc.sentiment === 'negative' ? 'bg-red-50 text-red-600' :
                                          'bg-gray-100 text-gray-500'
                                        }`}>
                                          {voc.sentiment === 'positive' ? '正面' :
                                           voc.sentiment === 'negative' ? '负面' : '中性'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {brandVOCs.length === 0 && (
                                  <div className="py-8 flex flex-col items-center justify-center text-gray-300 border-2 border-dashed border-gray-100 rounded-xl">
                                    <MessageSquareQuote size={24} className="mb-2" />
                                    <span className="text-xs">暂无数据</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 空状态组件
const EmptyState = ({ onCreate }: { onCreate: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full py-20">
    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
      <LayoutDashboard size={40} className="text-indigo-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">暂无项目</h3>
    <p className="text-gray-500 mb-6">创建一个新项目开始管理VOC洞察</p>
    <Button onClick={onCreate} className="bg-indigo-600 hover:bg-indigo-700">
      <Plus size={18} className="mr-2" />
      新建项目
    </Button>
  </div>
);

// --- Main Home Page ---
const Home = () => {
  const [projects, setProjects] = React.useState<Project[]>(DEFAULT_PROJECTS);
  const [activeProject, setActiveProject] = React.useState<Project>(DEFAULT_PROJECTS[0]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [projectToDelete, setProjectToDelete] = React.useState<Project | null>(null);
  const [isParsing, setIsParsing] = React.useState(false);
  const [isAddFileDialogOpen, setIsAddFileDialogOpen] = React.useState(false);

  // 插件调用错误分类处理
  const handlePluginError = (error: unknown, context: string) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorName = error instanceof Error ? error.name : 'UnknownError';

    logger.error(`[${context}] Plugin error:`, { name: errorName, message: errorMessage });

    // 根据错误类型分类处理
    if (errorMessage.includes('quota exhausted') || errorMessage.includes('RateLimitError')) {
      toast.error('AI服务配额已耗尽，请联系管理员充值或稍后重试');
      return 'RATE_LIMIT';
    }
    if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
      toast.error('请求超时，请检查网络后重试');
      return 'TIMEOUT';
    }
    if (errorMessage.includes('network') || errorMessage.includes('ECONNREFUSED')) {
      toast.error('网络错误，请检查网络连接');
      return 'NETWORK';
    }
    if (errorName === 'InputValidationError' || errorMessage.includes('validation')) {
      toast.error('参数校验失败，请检查文件格式是否正确');
      return 'VALIDATION';
    }

    toast.error(`AI解析失败: ${errorMessage}`);
    return 'UNKNOWN';
  };

  // 指数退避重试包装函数
  const callPluginWithRetry = async <T,>(
    callFn: () => Promise<T>,
    context: string,
    maxRetries = 3
  ): Promise<T | null> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await callFn();
      } catch (error) {
        const errorType = handlePluginError(error, `${context} (attempt ${attempt + 1}/${maxRetries})`);

        // 配额耗尽不重试
        if (errorType === 'RATE_LIMIT') {
          return null;
        }

        // 最后一次尝试失败
        if (attempt === maxRetries - 1) {
          return null;
        }

        // 指数退避等待
        const delay = Math.min(1000 * Math.pow(2, attempt), 8000);
        logger.info(`Retrying ${context} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return null;
  };

  // 从localStorage加载项目
  React.useEffect(() => {
    const saved = localStorage.getItem('insight_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setProjects(parsed);
        if (parsed.length > 0) {
          setActiveProject(parsed[0]);
        }
      } catch (e) {
        logger.error('Failed to load projects:', String(e));
      }
    }
  }, []);

  // 保存到localStorage
  React.useEffect(() => {
    localStorage.setItem('insight_projects', JSON.stringify(projects));
  }, [projects]);

  const handleCreateProject = (newProject: Omit<Project, 'id' | 'parsedVOCs'>) => {
    const project: Project = {
      ...newProject,
      id: `proj-${Date.now()}`,
      parsedVOCs: []
    };
    setProjects([...projects, project]);
    setActiveProject(project);
    toast.success('项目创建成功');
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;

    const newProjects = projects.filter(p => p.id !== projectToDelete.id);
    setProjects(newProjects);

    // 如果删除的是当前项目，切换到第一个项目
    if (activeProject.id === projectToDelete.id && newProjects.length > 0) {
      setActiveProject(newProjects[0]);
    }

    toast.success('项目已删除');
    setIsDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  // 添加文件到已有项目
  const handleAddFilesToProject = async (
    newFiles: Omit<ProjectFile, 'id'>[],
    parseImmediately: boolean
  ) => {
    const filesWithId: ProjectFile[] = newFiles.map((f, i) => ({
      ...f,
      id: `file-${Date.now()}-${i}`
    }));

    // 更新项目文件列表
    setProjects(prev => prev.map(p =>
      p.id === activeProject.id
        ? { ...p, files: [...p.files, ...filesWithId] }
        : p
    ));

    toast.success(`已添加 ${filesWithId.length} 个文件`);

    // 如果选择了立即解析
    if (parseImmediately) {
      const filesToParse = filesWithId.filter(f => f.fileUrl);
      if (filesToParse.length > 0) {
        setIsParsing(true);
        toast.info('开始AI解析新添加的文件...');

        const parsedVOCs: VOCItem[] = [];

        try {
          for (const fileData of filesToParse) {
            if (!fileData.fileUrl) continue;

            toast.info(`正在解析: ${fileData.name}...`);

            // Step 1: 解析文档内容（带重试）
            const docResult = await callPluginWithRetry<VocDocParserOneOutput>(
              () => capabilityClient
                .load('voc_doc_parser_1')
                .call<VocDocParserOneOutput>('parseDocToMarkdown', {
                  voc_file: [fileData.fileUrl]
                } as unknown as Record<string, unknown>),
              `解析文档: ${fileData.name}`
            );

            if (!docResult?.content) {
              toast.warning(`文件 "${fileData.name}" 未能提取到文本内容`);
              continue;
            }

            // Step 2: 结构化提取VOC数据（带重试）
            const structuredResult = await callPluginWithRetry<VocStructuredExtractionOneOutput>(
              () => capabilityClient
                .load('voc_structured_extraction_1')
                .call<VocStructuredExtractionOneOutput>('textToJson', {
                  doc_content: docResult.content
                } as unknown as Record<string, unknown>),
              `结构化提取: ${fileData.name}`
            );

            if (structuredResult?.vocList && Array.isArray(structuredResult.vocList)) {
              parsedVOCs.push(...(structuredResult.vocList as VOCItem[]));
              toast.success(`文件 "${fileData.name}" 解析完成，提取 ${structuredResult.vocList.length} 条VOC`);
            }
          }

          // 更新项目解析数据
          setProjects(prev => prev.map(p =>
            p.id === activeProject.id
              ? { ...p, parsedVOCs: [...p.parsedVOCs, ...parsedVOCs] }
              : p
          ));

          toast.success(`解析完成，共提取 ${parsedVOCs.length} 条VOC数据`);
        } catch (error) {
          logger.error('Parse files failed:', String(error));
          toast.error('AI解析失败: ' + (error instanceof Error ? error.message : '未知错误'));
        } finally {
          setIsParsing(false);
        }
      }
    }
  };

  // AI 解析文件并创建项目
  const handleParseAndCreate = async (
    projectData: Omit<Project, 'id' | 'parsedVOCs'>
  ) => {
    setIsParsing(true);
    toast.info('开始AI解析文件...');

    const parsedVOCs: VOCItem[] = [];

    try {
      for (const fileData of projectData.files) {
        if (!fileData.fileUrl) continue;

        toast.info(`正在解析: ${fileData.name}...`);

        // Step 1: 解析文档内容（带重试）
        const docResult = await callPluginWithRetry<VocDocParserOneOutput>(
          () => capabilityClient
            .load('voc_doc_parser_1')
            .call<VocDocParserOneOutput>('parseDocToMarkdown', {
              voc_file: [fileData.fileUrl]
            } as unknown as Record<string, unknown>),
          `解析文档: ${fileData.name}`
        );

        if (!docResult?.content) {
          toast.warning(`文件 "${fileData.name}" 未能提取到文本内容`);
          continue;
        }

        // Step 2: 结构化提取VOC数据（带重试）
        const structuredResult = await callPluginWithRetry<VocStructuredExtractionOneOutput>(
          () => capabilityClient
            .load('voc_structured_extraction_1')
            .call<VocStructuredExtractionOneOutput>('textToJson', {
              doc_content: docResult.content
            } as unknown as Record<string, unknown>),
          `结构化提取: ${fileData.name}`
        );

        if (structuredResult?.vocList && Array.isArray(structuredResult.vocList)) {
          parsedVOCs.push(...(structuredResult.vocList as VOCItem[]));
          toast.success(`文件 "${fileData.name}" 解析完成，提取 ${structuredResult.vocList.length} 条VOC`);
        }
      }

      // 创建项目并保存解析结果
      const project: Project = {
        ...projectData,
        id: `proj-${Date.now()}`,
        parsedVOCs
      };

      setProjects(prev => [...prev, project]);
      setActiveProject(project);
      toast.success(`项目创建成功，共解析 ${parsedVOCs.length} 条VOC数据`);
    } catch (error) {
      logger.error('Parse files failed:', String(error));
      toast.error('AI解析失败: ' + (error instanceof Error ? error.message : '未知错误'));

      // 解析失败时仍然创建项目，但没有解析数据
      const project: Project = {
        ...projectData,
        id: `proj-${Date.now()}`,
        parsedVOCs: []
      };
      setProjects(prev => [...prev, project]);
      setActiveProject(project);
    } finally {
      setIsParsing(false);
    }
  };

  const handleParseFiles = async () => {
    if (!activeProject.files.length) {
      toast.error('请先添加文件');
      return;
    }

    const filesWithUrl = activeProject.files.filter(f => f.fileUrl);
    if (filesWithUrl.length === 0) {
      toast.error('没有可解析的本地文件，请先上传文件');
      return;
    }

    setIsParsing(true);
    toast.info('开始AI解析文件...');

    const parsedVOCs: VOCItem[] = [];

    try {
      for (const fileData of filesWithUrl) {
        if (!fileData.fileUrl) continue;

        toast.info(`正在解析: ${fileData.name}...`);

        // Step 1: 解析文档内容（带重试）
        const docResult = await callPluginWithRetry<VocDocParserOneOutput>(
          () => capabilityClient
            .load('voc_doc_parser_1')
            .call<VocDocParserOneOutput>('parseDocToMarkdown', {
              voc_file: [fileData.fileUrl]
            } as unknown as Record<string, unknown>),
          `解析文档: ${fileData.name}`
        );

        if (!docResult?.content) {
          toast.warning(`文件 "${fileData.name}" 未能提取到文本内容`);
          continue;
        }

        // Step 2: 结构化提取VOC数据（带重试）
        const structuredResult = await callPluginWithRetry<VocStructuredExtractionOneOutput>(
          () => capabilityClient
            .load('voc_structured_extraction_1')
            .call<VocStructuredExtractionOneOutput>('textToJson', {
              doc_content: docResult.content
            } as unknown as Record<string, unknown>),
          `结构化提取: ${fileData.name}`
        );

        if (structuredResult?.vocList && Array.isArray(structuredResult.vocList)) {
          parsedVOCs.push(...(structuredResult.vocList as VOCItem[]));
          toast.success(`文件 "${fileData.name}" 解析完成，提取 ${structuredResult.vocList.length} 条VOC`);
        }
      }

      // 更新项目数据
      setProjects(prev => prev.map(p =>
        p.id === activeProject.id
          ? { ...p, parsedVOCs: [...p.parsedVOCs, ...parsedVOCs] }
          : p
      ));

      toast.success(`解析完成，共提取 ${parsedVOCs.length} 条VOC数据`);
    } catch (error) {
      logger.error('Parse files failed:', String(error));
      toast.error('AI解析失败: ' + (error instanceof Error ? error.message : '未知错误'));
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex">
      <Sidebar
        projects={projects}
        activeProject={activeProject}
        onProjectChange={setActiveProject}
        onCreateProject={() => setIsCreateDialogOpen(true)}
        onDeleteProject={handleDeleteProject}
      />
      <main className="flex-1 ml-64 overflow-y-auto h-screen bg-gray-50/50">
        {projects.length === 0 ? (
          <EmptyState onCreate={() => setIsCreateDialogOpen(true)} />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeProject.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <InsightsPage
                project={activeProject}
                onParseFiles={handleParseFiles}
                onAddFiles={() => setIsAddFileDialogOpen(true)}
              />
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreate={handleCreateProject}
        isParsing={isParsing}
        onParseAndCreate={handleParseAndCreate}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteProject}
        projectName={projectToDelete?.name || ''}
      />

      <AddFileDialog
        open={isAddFileDialogOpen}
        onOpenChange={setIsAddFileDialogOpen}
        projectName={activeProject.name}
        onAddFiles={handleAddFilesToProject}
        isParsing={isParsing}
      />
    </div>
  );
};

export default Home;
