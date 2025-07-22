import { useAuthStore } from '../store/authStore';

const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl shadow-xl p-12 animate-fade-in text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-primary mb-6">
              这里是首页
            </h1>
            {user ? (
              <p className="text-gray-600 text-lg">
                欢迎回来，{user.username}！
              </p>
            ) : (
              <p className="text-gray-600 text-lg">
                请登录以继续使用
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
