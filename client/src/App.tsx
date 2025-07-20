import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import AddWord from "@/pages/add-word";
import Library from "@/pages/library";
import Quiz from "@/pages/quiz";
import Statistics from "@/pages/statistics";
import Flashcards from "@/pages/flashcards";
import BottomNavigation from "@/components/layout/bottom-navigation";
import { useIsMobile } from "@/hooks/use-mobile";

function Router() {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className={`${isMobile ? 'pb-20' : 'pb-4'}`}>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/add-word" component={AddWord} />
          <Route path="/library" component={Library} />
          <Route path="/flashcards" component={Flashcards} />
          <Route path="/quiz" component={Quiz} />
          <Route path="/statistics" component={Statistics} />
          <Route component={Home} />
        </Switch>
      </div>
      {isMobile && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
