import { useState } from 'react';
import { BottomNavigation } from '@/components/BottomNavigation';
import { AppMenu } from '@/components/AppMenu';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, User, Edit2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function Account() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(localStorage.getItem('taskly_user_name') || '');
  const [useCases, setUseCases] = useState<string[]>(() => {
    const stored = localStorage.getItem('taskly_use_cases');
    return stored ? JSON.parse(stored) : [];
  });

  const availableUseCases = [
    { id: 'job', label: 'Job Tasks', icon: '💼' },
    { id: 'projects', label: 'Projects', icon: '📋' },
    { id: 'clients', label: 'Client Work', icon: '🤝' },
    { id: 'daily', label: 'Daily Life', icon: '🏠' },
    { id: 'custom', label: 'Custom', icon: '⚙️' }
  ];

  const handleSave = () => {
    localStorage.setItem('taskly_user_name', name);
    localStorage.setItem('taskly_use_cases', JSON.stringify(useCases));
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your information has been saved successfully",
    });
  };

  const toggleUseCase = (caseId: string) => {
    setUseCases(prev => 
      prev.includes(caseId) 
        ? prev.filter(id => id !== caseId)
        : [...prev, caseId]
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img 
              src="/lovable-uploads/d9e422aa-ea2c-4619-8ac2-3818edd8bcb3.png"
              alt="Taskly"
              className="w-8 h-8"
            />
            <span className="font-semibold text-lg">Account</span>
          </div>
          <AppMenu />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        <div className="text-center">
          <User className="w-16 h-16 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        {/* Profile Card */}
        <Card className="p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="w-4 h-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-lg font-medium">{name || 'Not set'}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <Button onClick={handleSave} className="mt-4 w-full">
              Save Changes
            </Button>
          )}
        </Card>

        {/* Use Cases Card */}
        <Card className="p-6 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">How you use Taskly</h2>
          </div>

          {isEditing ? (
            <div className="space-y-3">
              {availableUseCases.map((useCase) => (
                <button
                  key={useCase.id}
                  onClick={() => toggleUseCase(useCase.id)}
                  className={`w-full p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 ${
                    useCases.includes(useCase.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50 text-foreground"
                  }`}
                >
                  <span className="text-xl">{useCase.icon}</span>
                  <span className="font-medium">{useCase.label}</span>
                  {useCases.includes(useCase.id) && (
                    <CheckCircle className="ml-auto h-5 w-5" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {useCases.map((caseId) => {
                const useCase = availableUseCases.find(uc => uc.id === caseId);
                return useCase ? (
                  <Badge key={caseId} variant="secondary" className="text-sm">
                    <span className="mr-1">{useCase.icon}</span>
                    {useCase.label}
                  </Badge>
                ) : null;
              })}
              {useCases.length === 0 && (
                <p className="text-muted-foreground">No use cases selected</p>
              )}
            </div>
          )}
        </Card>

        {/* Storage Info */}
        <Card className="p-6 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">Data Storage</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Storage type:</span>
              <span className="font-medium">Local device storage</span>
            </div>
            <div className="flex justify-between">
              <span>Data sync:</span>
              <span className="font-medium">Device only</span>
            </div>
            <p className="text-muted-foreground mt-3">
              Your data is stored locally on this device for privacy and speed.
            </p>
          </div>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
}