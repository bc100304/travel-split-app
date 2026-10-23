import React, { useState } from 'react';
import {
  X,
  Github,
  Copy,
  Check,
  Terminal,
  FileCode,
  ShieldCheck,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface GitHubPagesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GITHUB_ACTIONS_WORKFLOW = `name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;

export const GitHubPagesGuideModal: React.FC<GitHubPagesGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  if (!isOpen) return null;

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(GITHUB_ACTIONS_WORKFLOW);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/60 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-slate-900 text-white">
              <Github className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                GitHub Pages 免費發布指南
              </h2>
              <p className="text-xs text-slate-500">
                免費託管、自帶 HTTPS 加密（滿足 PWA 安裝與 GPS 定位需求）
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-600 leading-relaxed">
          {/* Highlights */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5 text-emerald-900">
            <div className="flex items-center gap-1.5 font-bold text-sm text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>為什麼推薦 GitHub Pages？</span>
            </div>
            <p>
              1. <strong>永久免費</strong>且無需後端主機維護。<br />
              2. <strong>原生支援 HTTPS</strong>，瀏覽器 Geolocation API (GPS) 與 PWA 手機主畫面安裝<strong>必須在 HTTPS 環境下才能啟用</strong>，GitHub Pages 完全符合規範！<br />
              3. 本專案 <code>vite.config.ts</code> 已預先設定 <code>base: './'</code>，無論在根目錄或子目錄 (如 <code>username.github.io/my-trip/</code>) 都能正確加載所有靜態資源！
            </p>
          </div>

          {/* Method A: GitHub Actions (Recommended) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>最佳方式：透過 GitHub Actions 全自動建置部署</span>
              </h3>
              <button
                onClick={handleCopyWorkflow}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 shadow-2xs ${
                  copiedWorkflow
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {copiedWorkflow ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>已複製 yml 檔案！</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>複製 deploy.yml</span>
                  </>
                )}
              </button>
            </div>

            <ol className="list-decimal list-inside space-y-2 text-slate-700 font-medium">
              <li>在 GitHub 建立一個新的公開或私有 Repository（例如：<code>travel-split-pwa</code>）。</li>
              <li>將專案程式碼推送到 GitHub：
                <div className="mt-1 p-2.5 rounded-lg bg-slate-900 text-teal-300 font-mono text-[11px] select-all">
                  git init<br />
                  git add .<br />
                  git commit -m &quot;Initial commit: Travel Split PWA&quot;<br />
                  git branch -M main<br />
                  git remote add origin https://github.com/你的用戶名/你的專案名.git<br />
                  git push -u origin main
                </div>
              </li>
              <li>在專案內建立檔案：<code>.github/workflows/deploy.yml</code>，並貼上下方的 Actions 腳本。</li>
              <li>進入 GitHub 專案頁面 ➔ <strong>Settings ➔ Pages</strong>：
                <p className="text-slate-500 font-normal pl-4 pt-1">
                  在 <strong>Build and deployment ➔ Source</strong> 下拉選單中，選擇 <strong>「GitHub Actions」</strong>。
                </p>
              </li>
              <li>
                每次只要 <code>git push</code>，GitHub 就會自動執行 <code>npm run build</code> 並發布至 <code>https://&lt;你的帳號&gt;.github.io/&lt;專案名&gt;/</code>！
              </li>
            </ol>

            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-200 font-mono text-[11px] max-h-48 overflow-y-auto p-3">
              <pre className="whitespace-pre">{GITHUB_ACTIONS_WORKFLOW}</pre>
            </div>
          </div>

          {/* Local testing */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
            <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-teal-600" />
              <span>本機預覽編譯成品</span>
            </h4>
            <p className="text-slate-600">
              在本地終端機執行 <code>npm run build</code>，產生的 <code>dist/</code> 資料夾即為可直接放置於任何靜態伺服器的純前端成品。也可以搭配 <code>npx serve dist</code> 在本地驗證。
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition shadow-xs"
          >
            關閉指南
          </button>
        </div>
      </div>
    </div>
  );
};
