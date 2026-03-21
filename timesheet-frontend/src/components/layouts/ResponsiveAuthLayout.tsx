import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Layout Components
import Auth3DLayout from './Auth3DLayout';
import MobileAuthLayout from './MobileAuthLayout';
import ForgotPassword3DLayout from './ForgotPassword3DLayout';
import MobileForgotPasswordLayout from './MobileForgotPasswordLayout';

interface ResponsiveAuthLayoutProps {
  mode?: 'login' | 'signup';
  type?: 'auth' | 'forgot';
}

const ResponsiveAuthLayout: React.FC<ResponsiveAuthLayoutProps> = ({ 
  mode = 'login', 
  type = 'auth' 
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // For forgot password page
  if (type === 'forgot') {
    return isMobile ? <MobileForgotPasswordLayout /> : <ForgotPassword3DLayout />;
  }

  // For login/signup pages
  return isMobile ? <MobileAuthLayout mode={mode} /> : <Auth3DLayout mode={mode} />;
};

export default ResponsiveAuthLayout;
