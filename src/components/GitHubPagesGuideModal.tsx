import React, { useState } from 'react';
import {
  X,
  Github,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  Sparkles,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';

interface GitHubPagesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GITHUB_ACTIONS_WORKFLOW = `name: Deploy to GitHub Pages

on:
  push:
    branches: [main, master]
  workflow_dispatch:

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
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Build application
        run: npm run build

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload dist artifact
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
                GitHub Pages 免費發布與 Actions 設定
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
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed">
          {/* Troubleshooting Alert */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2 text-amber-900">
            <div className="flex items-center gap-1.5 font-bold text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Actions 執行失敗 (Failed)？三大常見原因與解決方法：</span>
            </div>
            <div className="space-y-1.5 text-xs pl-2">
              <p>
                <strong>1. 尚未切換 Pages 來源為 GitHub Actions (最常見！)</strong>：<br />
                請前往 GitHub Repo ➔ <strong>Settings ➔ Pages</strong> ➔ 在 <strong>Build and deployment / Source</strong> 下拉選單中，務必將 <code>Deploy from a branch</code> 改選為 <strong>「GitHub Actions」</strong>！
              </p>
              <p>
                <strong>2. npm ci 找不到 package-lock.json 或 peer 衝突</strong>：<br />
                請改用 <code>npm install</code>（下方腳本已替您替換），並確認專案根目錄的 <code>package-lock.json</code> 與 <code>package.json</code> 一併 commit 推送。
              </p>
              <p>
                <strong>3. 分支名稱不符合</strong>：<br />
                有些專案分支名稱為 <code>main</code>，有些為 <code>master</code>。下方腳本已設定 <code>branches: [main, master]</code>，支援兩種命名。
              </p>
            </div>
          </div>

          {/* Workflow configuration code */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>完整 GitHub Actions 腳本 (.github/workflows/main.yml)</span>
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
                    <span>複製 main.yml</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 text-slate-200 font-mono text-[11px] max-h-56 overflow-y-auto p-3">
              <pre className="whitespace-pre">{GITHUB_ACTIONS_WORKFLOW}</pre>
            </div>
          </div>

          {/* Deployment steps */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-800 text-xs">
              4 步快速完成部署流程：
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>在 GitHub 建立 Repository（例如：<code>travel-split-pwa</code>）。</li>
              <li>在專案內建立檔案 <code>.github/workflows/main.yml</code>，貼上上方內容。</li>
              <li>進入 GitHub 倉庫的 <strong>Settings ➔ Pages</strong>，將 Source 設定為 <strong>GitHub Actions</strong>。</li>
              <li>將程式碼（含 <code>package.json</code> 及 <code>package-lock.json</code>）push 到 GitHub，Actions 就會全自動編譯上線！</li>
            </ol>
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
