import React, { useState, useEffect } from 'react';
import { Screen } from './types';
import { HomeScreen } from './screens/Home';
import { NewTransactionScreen } from './screens/NewTransaction';
import { NotificationsScreen } from './screens/Notifications';
import { ProfileScreen } from './screens/Profile';
import { AnalyticsScreen } from './screens/Analytics';
import { LoginScreen } from './screens/Login';
import { RegisterScreen } from './screens/Register';
import { BottomNav } from './components/BottomNav';
import { useTheme } from './ThemeContext';
import { useData } from './DataContext';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.HOME);
  const { wallpaper } = useTheme();
  const { isAuthenticated } = useData();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      if (currentScreen !== Screen.REGISTER) {
        setCurrentScreen(Screen.LOGIN);
      }
    } else {
      if (currentScreen === Screen.LOGIN || currentScreen === Screen.REGISTER) {
        setCurrentScreen(Screen.HOME);
      }
    }
  }, [isAuthenticated, currentScreen]);

  const renderAppScreen = () => {
    if (!isAuthenticated) {
      if (currentScreen === Screen.REGISTER) {
         return <RegisterScreen onNavigate={setCurrentScreen} />;
      }
      return <LoginScreen onNavigate={setCurrentScreen} />;
    }

    switch (currentScreen) {
      case Screen.HOME:
        return <HomeScreen onNavigate={setCurrentScreen} />;
      case Screen.TRANSACTION:
        return <NewTransactionScreen onBack={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.NOTIFICATIONS:
        return <NotificationsScreen onBack={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.PROFILE:
        return <ProfileScreen onBack={() => setCurrentScreen(Screen.HOME)} />;
      case Screen.ANALYTICS:
        return <AnalyticsScreen onBack={() => setCurrentScreen(Screen.HOME)} />;
      default:
        return <HomeScreen onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className={`relative min-h-screen text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300 ${
      !wallpaper ? 'bg-background-light dark:bg-background-dark' : 'bg-background-light/90 dark:bg-background-dark/90'
    }`}>
      {/* Global Wallpaper Background */}
      {wallpaper && isAuthenticated && (
        <div 
          className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat pointer-events-none transition-opacity duration-500"
          style={{ backgroundImage: `url('${wallpaper}')` }}
        />
      )}
      
      {/* Content */}
      <div className={`flex-1 flex flex-col ${wallpaper && isAuthenticated ? 'backdrop-blur-[2px]' : ''}`}>
        {renderAppScreen()}
      </div>

      {isAuthenticated && <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />}
    </div>
  );
};

export default App;