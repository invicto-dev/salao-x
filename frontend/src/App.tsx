import { ConfigProvider, theme } from 'antd';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ptBR from 'antd/locale/pt_BR';
import AppLayout from './components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('salao-x-theme');
    return saved === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('salao-x-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  return (
    <ConfigProvider
      locale={ptBR}
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#212121', // Purple elegante
          colorSuccess: '#059669',
          colorWarning: '#d97706',
          colorError: '#dc2626',
          borderRadius: 6,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        components: {
          Layout: {
            siderBg: isDarkMode ? '#1a1a1a' : '#fafafa',
            headerBg: isDarkMode ? '#0f172a' : '#ffffff',
            bodyBg: isDarkMode ? '#111827' : '#f9fafb',
          },
          Menu: {
            itemBg: 'transparent',
            itemHoverBg: isDarkMode ? '#374151' : '#f3f4f6',
            itemSelectedBg: '#212121',
            itemSelectedColor: '#ffffff',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppLayout isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
          <Toaster />
        </BrowserRouter>
      </QueryClientProvider>
    </ConfigProvider>
  );
};

export default App;