import { Home, Book, Plus, Brain, BarChart3, CreditCard } from "lucide-react";
import { useLocation } from "wouter";
import { Link } from "wouter";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/library", icon: Book, label: "Library" },
  { href: "/add-word", icon: Plus, label: "Add", isSpecial: true },
  { href: "/flashcards", icon: CreditCard, label: "Cards" },
  { href: "/quiz", icon: Brain, label: "Quiz" },
  { href: "/statistics", icon: BarChart3, label: "Stats" },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-slate-700">
      <div className="flex justify-around py-2">
        {navItems.map(({ href, icon: Icon, label, isSpecial }) => {
          const isActive = location === href;
          
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center py-2">
              <div className={`
                ${isSpecial 
                  ? "w-8 h-8 gradient-button rounded-full flex items-center justify-center mb-1" 
                  : "mb-1"
                }
              `}>
                <Icon 
                  className={`
                    ${isSpecial ? "h-4 w-4 text-white" : "h-5 w-5"}
                    ${isActive && !isSpecial ? "text-blue-400" : !isSpecial ? "text-slate-400" : ""}
                    transition-colors hover:text-white
                  `} 
                />
              </div>
              <span className={`
                text-xs transition-colors
                ${isActive && !isSpecial ? "text-blue-400" : "text-slate-400"}
              `}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
