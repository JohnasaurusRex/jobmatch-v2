import { useState } from 'react';
import { ThumbsUp, Search, Hammer, Heart, UserPlus, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const tabs = [
  { id: 'overview', icon: ThumbsUp, label: 'Overview' },
  { id: 'searchability', icon: Search, label: 'Searchability' },
  { id: 'hardSkills', icon: Hammer, label: 'Hard Skills' },
  { id: 'softSkills', icon: Heart, label: 'Soft Skills' },
  { id: 'recruiterTips', icon: UserPlus, label: 'Recruiter Tips' },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/');
  };

  const handleTabChange = (id: string) => {
    onTabChange(id);
    setIsOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <nav className="space-y-2">
            {tabs.map(({ id, icon: Icon, label }) => (
              <Button
                key={id}
                variant={activeTab === id ? 'secondary' : 'default'}
                className={`w-full justify-start ${activeTab === id ? 'font-bold' : ''}`}
                onClick={() => handleTabChange(id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </nav>
        </div>
      </div>
      <div className="p-4 border-t mt-auto">
        <Button
          variant="outline"
          className="w-full justify-center"
          onClick={handleBackClick}
        >
          Back
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="fixed top-4 left-4 z-40 bg-white">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px] p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Analysis Results</h2>
                  <Button variant="outline" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <SidebarContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-white">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Analysis Results</h2>
        </div>
        <SidebarContent />
      </aside>
    </>
  );
}
