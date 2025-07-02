'use client';

import toast from 'react-hot-toast';

// 커스텀 토스트 컴포넌트
interface CustomToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  icon?: string;
}

const CustomToast = ({ message, type, icon }: CustomToastProps) => {
  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: icon || '✅',
          bgGradient: 'from-emerald-400 to-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          textColor: 'text-emerald-800',
          iconColor: 'text-emerald-600',
        };
      case 'error':
        return {
          icon: icon || '❌',
          bgGradient: 'from-red-400 to-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-600',
        };
      case 'warning':
        return {
          icon: icon || '⚠️',
          bgGradient: 'from-yellow-400 to-orange-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          iconColor: 'text-yellow-600',
        };
      case 'info':
        return {
          icon: icon || 'ℹ️',
          bgGradient: 'from-blue-400 to-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800',
          iconColor: 'text-blue-600',
        };
      default:
        return {
          icon: icon || '📌',
          bgGradient: 'from-gray-400 to-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800',
          iconColor: 'text-gray-600',
        };
    }
  };

  const config = getConfig();

  return (
    <div className="flex items-center space-x-3 max-w-md">
      <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r ${config.bgGradient} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
          {message}
        </p>
      </div>
    </div>
  );
};

// 편의 함수들
export const showToast = {
  success: (message: string, icon?: string) => {
    toast.custom(
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 p-4 backdrop-blur-sm bg-opacity-95">
        <CustomToast message={message} type="success" icon={icon} />
      </div>,
      {
        duration: 4000,
        position: 'top-center',
      }
    );
  },

  error: (message: string, icon?: string) => {
    toast.custom(
      <div className="bg-white rounded-2xl shadow-2xl border border-red-100 p-4 backdrop-blur-sm bg-opacity-95">
        <CustomToast message={message} type="error" icon={icon} />
      </div>,
      {
        duration: 5000,
        position: 'top-center',
      }
    );
  },

  warning: (message: string, icon?: string) => {
    toast.custom(
      <div className="bg-white rounded-2xl shadow-2xl border border-yellow-100 p-4 backdrop-blur-sm bg-opacity-95">
        <CustomToast message={message} type="warning" icon={icon} />
      </div>,
      {
        duration: 4500,
        position: 'top-center',
      }
    );
  },

  info: (message: string, icon?: string) => {
    toast.custom(
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 backdrop-blur-sm bg-opacity-95">
        <CustomToast message={message} type="info" icon={icon} />
      </div>,
      {
        duration: 4000,
        position: 'top-center',
      }
    );
  },

  loading: (message: string) => {
    return toast.custom(
      <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 p-4 backdrop-blur-sm bg-opacity-95">
        <div className="flex items-center space-x-3 max-w-md">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 leading-relaxed whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>
      </div>,
      {
        duration: Infinity,
        position: 'top-center',
      }
    );
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },

  promise: async <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      },
      {
        style: {
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '420px',
          padding: '16px 20px',
        },
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#10b981',
            secondary: 'rgba(16, 185, 129, 0.1)',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: 'rgba(239, 68, 68, 0.1)',
          },
        },
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: 'rgba(59, 130, 246, 0.1)',
          },
        },
      }
    );
  },
}; 