'use client';

import toast from 'react-hot-toast';

// 커스텀 토스트 컴포넌트
interface CustomToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

const CustomToast = ({ message, type }: CustomToastProps) => {
  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
          borderColor: 'border-emerald-200 dark:border-emerald-800/50',
          textColor: 'text-emerald-800 dark:text-emerald-300',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'error':
        return {
          bgColor: 'bg-red-50 dark:bg-red-950/30',
          borderColor: 'border-red-200 dark:border-red-800/50',
          textColor: 'text-red-800 dark:text-red-300',
          iconColor: 'text-red-600 dark:text-red-400',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ),
        };
      case 'warning':
        return {
          bgColor: 'bg-amber-50 dark:bg-amber-950/30',
          borderColor: 'border-amber-200 dark:border-amber-800/50',
          textColor: 'text-amber-800 dark:text-amber-300',
          iconColor: 'text-amber-600 dark:text-amber-400',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
        };
              case 'info':
        return {
          bgColor: 'bg-blue-50 dark:bg-blue-950/30',
          borderColor: 'border-blue-200 dark:border-blue-800/50',
          textColor: 'text-blue-800 dark:text-blue-300',
          iconColor: 'text-blue-600 dark:text-blue-400',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
        };
      default:
        return {
          bgColor: 'bg-gray-50 dark:bg-gray-950/30',
          borderColor: 'border-gray-200 dark:border-gray-800/50',
          textColor: 'text-gray-800 dark:text-gray-300',
          iconColor: 'text-gray-600 dark:text-gray-400',
          icon: (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          ),
        };
    }
  };

  const config = getConfig();

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-xl p-6 max-w-xl shadow-lg backdrop-blur-sm`}>
      <div className="flex items-start space-x-4">
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-base font-medium ${config.textColor} leading-relaxed break-words`}>
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

// 편의 함수들
export const showToast = {
  success: (message: string) => {
    toast.custom(
      <CustomToast message={message} type="success" />,
      {
        duration: 4000,
        position: 'top-center',
      }
    );
  },

  error: (message: string) => {
    toast.custom(
      <CustomToast message={message} type="error" />,
      {
        duration: 5000,
        position: 'top-center',
      }
    );
  },

  warning: (message: string) => {
    toast.custom(
      <CustomToast message={message} type="warning" />,
      {
        duration: 4500,
        position: 'top-center',
      }
    );
  },

  info: (message: string) => {
    toast.custom(
      <CustomToast message={message} type="info" />,
      {
        duration: 4000,
        position: 'top-center',
      }
    );
  },

  loading: (message: string) => {
    return toast.custom(
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-xl p-6 max-w-xl shadow-lg backdrop-blur-sm">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-blue-800 dark:text-blue-300 leading-relaxed break-words">
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
      error: string | ((error: unknown) => string);
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
          borderRadius: '12px',
          border: '1px solid rgb(229 231 235)',
          background: 'rgb(249 250 251)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          maxWidth: '560px',
          padding: '24px',
        },
        success: {
          duration: 4000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#ecfdf5',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fef2f2',
          },
        },
        loading: {
          iconTheme: {
            primary: '#3b82f6',
            secondary: '#eff6ff',
          },
        },
      }
    );
  },
}; 