import { Search, UserCircle, Book } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  title?: string;
  onSearchClick?: () => void;
  onProfileClick?: () => void;
}

export default function MobileHeader({ 
  title = "VocabMaster", 
  onSearchClick, 
  onProfileClick 
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-50 glass">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 gradient-button rounded-lg flex items-center justify-center">
            <Book className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          {onSearchClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchClick}
              className="p-2 text-slate-400 hover:text-white"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          {onProfileClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onProfileClick}
              className="p-2 text-slate-400 hover:text-white"
            >
              <UserCircle className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
