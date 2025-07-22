import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      // 状态
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // 登录
      login: (userData) => {
        set({
          user: userData,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      },

      // 登出
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null
        });
      },

      // 设置加载状态
      setLoading: (loading) => {
        set({ loading });
      },

      // 设置错误
      setError: (error) => {
        set({ error, loading: false });
      },

      // 清除错误
      clearError: () => {
        set({ error: null });
      },

      // 更新用户信息
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData }
          });
        }
      }
    }),
    {
      name: 'auth-storage', // 本地存储的key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }) // 只持久化用户信息和认证状态
    }
  )
);
