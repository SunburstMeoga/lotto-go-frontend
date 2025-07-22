import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button, Input } from '../components';
import { useToastStore } from '../components/Toast';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const { addToast } = useToastStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟登录成功
      login({
        id: 1,
        username: formData.username,
        email: `${formData.username}@example.com`
      });

      addToast({
        type: 'success',
        title: '登录成功',
        message: `欢迎回来，${formData.username}！`
      });

      navigate('/');
    } catch (error) {
      console.error('登录失败:', error);
      addToast({
        type: 'error',
        title: '登录失败',
        message: '用户名或密码错误，请重试'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="glass-card-strong rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gradient-primary">
              登录
            </h2>
            <p className="mt-2 text-gray-600">
              请输入您的账户信息
            </p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <Input
                id="username"
                name="username"
                type="text"
                required
                label="用户名"
                value={formData.username}
                onChange={handleChange}
                placeholder="请输入用户名"
              />

              <Input
                id="password"
                name="password"
                type="password"
                required
                label="密码"
                value={formData.password}
                onChange={handleChange}
                placeholder="请输入密码"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  记住我
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200">
                  忘记密码？
                </a>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                loading={loading}
                className="w-full"
                variant="primary"
                size="lg"
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </div>

            <div className="text-center">
              <span className="text-gray-600">还没有账户？</span>
              <Link
                to="/register"
                className="ml-1 font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200"
              >
                立即注册
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
