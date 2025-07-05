import { Link } from '@/i18n/routing';

export default function NotFoundPage() {

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-400 dark:text-gray-600">404</h1>
            <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
              페이지를 찾을 수 없습니다
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              요청하신 페이지가 존재하지 않거나 이동되었습니다.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}