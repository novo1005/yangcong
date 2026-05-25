import React from 'react';

/**
 * 项目总结页 — 嵌入数据新闻叙事报告
 * story.html 放在 client/public/story.html，随 Vite 构建一起打包
 */
export default function SummaryPage() {
  return (
    <iframe
      src="/story.html"
      title="竞品用户研究叙事报告"
      className="w-full h-full border-0 block"
      style={{ minHeight: '100%' }}
    />
  );
}
