'use client';

import React, { useState } from 'react';
import {
  FolderPlus,
  X,
  Check,
  Trash2,
  Sparkles,
  Layers,
  FolderOpen,
} from 'lucide-react';
import { Workspace } from '@/types';

interface WorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onSelectWorkspace: (ws: Workspace) => void;
  onWorkspaceCreated: (ws: Workspace) => void;
  onWorkspaceDeleted: (id: string) => void;
}

export const WorkspaceModal: React.FC<WorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspaces,
  currentWorkspace,
  onSelectWorkspace,
  onWorkspaceCreated,
  onWorkspaceDeleted,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    setError(null);

    try {
      const resp = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newTitle.trim(),
          description: newDesc.trim() || undefined,
        }),
      });

      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to create workspace');
      }

      onWorkspaceCreated(data.workspace);
      setNewTitle('');
      setNewDesc('');
      setIsCreating(false);
    } catch (err: any) {
      setError(err.message);
      setIsCreating(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete workspace "${name}" and all its ingested documents?`)) {
      return;
    }

    try {
      const resp = await fetch(`/api/workspaces/${id}`, {
        method: 'DELETE',
      });
      const data = await resp.json();
      if (!resp.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete workspace');
      }
      onWorkspaceDeleted(id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background-deep border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-600/20 text-violet-400 border border-violet-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Workspace Management</h3>
              <p className="text-xs text-slate-400">Switch or create isolated document workspaces</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Workspaces List */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Available Workspaces ({workspaces.length})
            </label>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {workspaces.map((ws) => {
                const isSelected = currentWorkspace?.id === ws.id;
                return (
                  <div
                    key={ws.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-violet-600/20 border-violet-500/40 text-white shadow-glow/10'
                        : 'bg-background-card/80 border-white/10 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    <div
                      className="cursor-pointer flex-1 min-w-0"
                      onClick={() => {
                        onSelectWorkspace(ws);
                        onClose();
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-violet-400 shrink-0" />
                        <span className="font-medium text-sm truncate">{ws.name}</span>
                        {ws.isDemo && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            DEMO FIXTURE
                          </span>
                        )}
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </div>
                      {ws.description && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{ws.description}</p>
                      )}
                    </div>

                    {!ws.isDemo && (
                      <button
                        onClick={() => handleDelete(ws.id, ws.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-2"
                        title="Delete Workspace"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Create New Workspace Form */}
          <form onSubmit={handleCreate} className="p-4 rounded-xl bg-background-card/50 border border-white/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-violet-300 uppercase tracking-wider">
              <FolderPlus className="w-4 h-4" />
              <span>Create New Workspace</span>
            </div>

            {error && (
              <div className="text-xs text-rose-400 bg-rose-500/10 p-2 rounded border border-rose-500/20">
                {error}
              </div>
            )}

            <div>
              <input
                type="text"
                placeholder="Workspace Name (e.g., Q4 Legal Contract Review)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-background-deep border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                required
              />
            </div>

            <div>
              <input
                type="text"
                placeholder="Brief description or team objective (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-background-deep border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={isCreating || !newTitle.trim()}
              className="w-full py-2 rounded-lg text-sm font-semibold bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white shadow-glow transition-all"
            >
              {isCreating ? 'Creating Workspace...' : 'Create Workspace'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
