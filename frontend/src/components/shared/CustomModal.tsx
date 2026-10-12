'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, AlertOctagon, Info, CheckCircle2, Lock, X } from 'lucide-react';

export interface ModalConfig {
  isOpen: boolean;
  type?: 'alert' | 'confirm' | 'warning' | 'danger' | 'success' | 'info';
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface CustomModalProps {
  config: ModalConfig | null;
  onClose: () => void;
}

export default function CustomModal({ config, onClose }: CustomModalProps) {
  useEffect(() => {
    if (!config?.isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && config.type !== 'confirm') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (config.onConfirm) {
          config.onConfirm();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [config, onClose]);

  if (!config || !config.isOpen) return null;

  const type = config.type || 'alert';

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertOctagon className="w-6 h-6 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-[#FFD84D]" />;
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-[#B8E63E]" />;
      case 'confirm':
        return <Lock className="w-6 h-6 text-[#3155FF]" />;
      case 'alert':
      default:
        return <Info className="w-6 h-6 text-[#B8E63E]" />;
    }
  };

  const getHeaderBorderColor = () => {
    switch (type) {
      case 'danger':
        return 'border-red-500/30';
      case 'warning':
        return 'border-[#FFD84D]/30';
      case 'confirm':
        return 'border-[#3155FF]/30';
      default:
        return 'border-white/10';
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        // Prevent click outside from doing anything in confirmation dialogs
        if (type !== 'confirm') {
          onClose();
        }
      }}
    >
      <div
        className="w-full max-w-lg bg-[#171717] rounded-2xl border-2 border-white/20 shadow-2xl overflow-hidden font-mono text-left animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-6 py-4 border-b ${getHeaderBorderColor()} flex items-center justify-between bg-white/[0.03]`}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white/5 border border-white/10">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {config.title}
              </h3>
            </div>
          </div>
          {type !== 'confirm' && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-line font-mono">
            {config.message}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex items-center justify-end gap-3">
          {type === 'confirm' && (
            <button
              type="button"
              onClick={() => {
                if (config.onCancel) config.onCancel();
                onClose();
              }}
              className="px-4 py-2 bg-transparent hover:bg-white/5 text-gray-300 rounded-xl border border-white/20 text-xs font-bold transition-all"
            >
              {config.cancelText || 'Cancel'}
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={() => {
              if (config.onConfirm) {
                config.onConfirm();
              }
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${
              type === 'danger'
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : type === 'warning'
                ? 'bg-[#FFD84D] hover:bg-[#FFE37A] text-[#171717]'
                : 'bg-[#B8E63E] hover:bg-[#C9F257] text-[#171717]'
            }`}
          >
            {config.confirmText || (type === 'confirm' ? 'Confirm & Proceed' : 'Understood')}
          </button>
        </div>
      </div>
    </div>
  );
}
