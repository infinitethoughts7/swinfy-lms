import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileMenu = ({ isOpen, onToggle }: MobileMenuProps) => {
  const menuItems = [
    { href: '/courses', label: 'Courses' },
    { href: '/team', label: 'Team' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/hire', label: 'Hire from us' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="md:hidden p-2 rounded-lg hover:bg-text-primary/5 transition-colors duration-200"
        aria-label="Toggle mobile menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-text-primary" />
        ) : (
          <Menu className="w-6 h-6 text-text-primary" />
        )}
      </button>

      {/* Mobile menu overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
          <div className="fixed top-16 left-0 right-0 bg-white border-b border-border-subtle shadow-lg">
            <div className="px-4 py-6 space-y-4">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="block py-3 px-4 text-text-primary hover:text-text-secondary hover:bg-text-primary/5 rounded-lg transition-all duration-200 font-inter font-medium"
                  onClick={onToggle}
                >
                  {item.href === '/courses' ? (
                    <span>Browse Courses</span>
                  ) : (
                    item.label
                  )}
                </a>
              ))}
              
              {/* Mobile CTA buttons */}
              <div className="pt-4 space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-center font-inter font-medium text-text-primary hover:bg-text-primary/5"
                  onClick={onToggle}
                >
                  Login
                </Button>
                <Button 
                  className="w-full justify-center bg-text-primary text-white hover:bg-text-primary/90 font-inter font-medium"
                  onClick={onToggle}
                >
                  Sign up
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileMenu;
