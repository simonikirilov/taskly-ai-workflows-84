import { useState, useEffect } from 'react';

export function WelcomeSection() {
  const [userName, setUserName] = useState<string>('');
  const [slogan, setSlogan] = useState<string>('Report • Label • Automate');

  useEffect(() => {
    const userData = localStorage.getItem('taskly-onboarding-data');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserName(parsed.name || '');
    }
    
    const preferences = localStorage.getItem('taskly-user-preferences');
    if (preferences) {
      const parsed = JSON.parse(preferences);
      setSlogan(parsed.slogan || 'Report • Label • Automate');
    }
  }, []);

  if (!userName) return null;

  return (
    <div className="text-center space-y-2 mb-8">
      <h1 className="text-2xl font-semibold text-foreground">
        Welcome, {userName}
      </h1>
      <p className="text-muted-foreground text-sm">
        {slogan}
      </p>
    </div>
  );
}