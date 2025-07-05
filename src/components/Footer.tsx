'use client';

export default function Footer() {
  return (
    <footer className="mt-8 py-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-6">
            {/* Buy me a coffee 링크 */}
            <a
              href="https://buymeacoffee.com/gmkseta"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-medium text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-.766-1.623a4.596 4.596 0 0 0-1.315-1.126 4.565 4.565 0 0 0-1.707-.37c-.725 0-1.426.197-2.05.555-.624.358-1.165.863-1.579 1.474a6.696 6.696 0 0 0-.925 2.253 6.696 6.696 0 0 0-.925-2.253c-.414-.611-.955-1.116-1.579-1.474-.624-.358-1.325-.555-2.05-.555a4.565 4.565 0 0 0-1.707.37 4.596 4.596 0 0 0-1.315 1.126c-.378.46-.647 1.025-.766 1.623L2.784 6.415c-.04.2-.06.403-.06.607 0 .672.269 1.316.748 1.791.479.475 1.129.741 1.806.741h14.443c.677 0 1.327-.266 1.806-.741.479-.475.748-1.119.748-1.791 0-.204-.02-.407-.06-.607zM5.31 10.423L6.93 21.97c.08.55.531.98 1.09.98h8.96c.559 0 1.01-.43 1.09-.98l1.62-11.547H5.31z"/>
              </svg>
              <span>Buy me a coffee</span>
            </a>
          </div>
          
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>
              Made with ❤️ by{' '}
              <a
                href="https://github.com/gmkseta"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                gmkseta
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}