"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Github, Home, Wrench, Settings, Menu, X, ChevronRight, Moon, Sun, Monitor, Command } from 'lucide-react';

const toolCategories = [
  {
    title: 'Study',
    items: [
      { name: 'StudyAI', href: '/tools/study-ai', description: 'AI Oral Exam Simulator' },
      { name: 'Image Optimizer', href: '/tools', description: 'Compress & resize images' },
      { name: 'JSON Formatter', href: '/tools', description: 'Beautify & validate JSON' },
    ]
  },
  {
    title: 'Design',
    items: [
      { name: 'Color Palette Gen', href: '/tools', description: 'Generate accessible colors' },
    ]
  },
  {
    title: 'Game',
    items: [
      { name: 'Check Nickname', href: '/tools', description: 'Check game nickname availability' },
    ]
  }
];

const Navbar = () => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeMobileMenu, setActiveMobileMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleMenu = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <>
      {/* Desktop Sidebar Navigation Rail */}
      <aside className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col items-center gap-6 py-6 px-3 rounded-full border border-[var(--border)] bg-[var(--surface-eight)]/80 backdrop-blur-2xl shadow-2xl z-50 transition-all duration-300">
        {/* Logo */}
        <Link href="/" className="p-3 rounded-full bg-[var(--surface-two)] border border-[var(--border)] text-[var(--primary)] hover:scale-110 hover:rotate-12 transition-all duration-300 shadow-md group">
             <Command size={24} />
        </Link>

        {/* Separator */}
        <div className="w-8 h-[1px] bg-[var(--border)]"></div>

        {/* Nav Icons */}
        <div className="flex flex-col gap-4 w-full items-center">
          
          {/* Home */}
          <Link 
            href="/" 
            className={`relative p-3 rounded-full transition-all duration-300 group flex justify-center items-center ${pathname === '/' ? 'bg-[var(--primary)] text-[var(--background-one)] shadow-[0_0_20px_-5px_var(--primary)] scale-110' : 'text-[var(--text-four)] hover:bg-[var(--surface-two)] hover:text-[var(--text-one)] hover:scale-110'}`}
          >
            <Home size={22} strokeWidth={pathname === '/' ? 2.5 : 2} />
            <div className="absolute left-full ml-6 px-3 py-1.5 bg-[var(--surface-eight)] border border-[var(--border)] rounded-xl text-xs font-medium text-[var(--text-one)] opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl">
              Home
            </div>
          </Link>

          {/* Tools (with Submenu) */}
          <div className="relative">
            <button 
              onClick={() => toggleMenu('tools')}
              className={`relative p-3 rounded-full transition-all duration-300 group flex justify-center items-center ${activeMenu === 'tools' || pathname.startsWith('/tools') ? 'bg-[var(--primary)] text-[var(--background-one)] shadow-[0_0_20px_-5px_var(--primary)] scale-110' : 'text-[var(--text-four)] hover:bg-[var(--surface-two)] hover:text-[var(--text-one)] hover:scale-110'}`}
            >
              <Wrench size={22} strokeWidth={activeMenu === 'tools' ? 2.5 : 2} />
              
               {/* Tooltip */}
               {activeMenu !== 'tools' && (
                <div className="absolute left-full ml-6 px-3 py-1.5 bg-[var(--surface-eight)] border border-[var(--border)] rounded-xl text-xs font-medium text-[var(--text-one)] opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  Tools
                </div>
               )}
            </button>

            {/* Submenu Panel */}
            <div className={`absolute left-full top-0 ml-6 w-72 bg-[var(--surface-eight)]/90 backdrop-blur-2xl border border-[var(--border)] rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] p-6 transition-all duration-300 origin-top-left z-[60] ${activeMenu === 'tools' ? 'opacity-100 translate-x-0 visible' : 'opacity-0 -translate-x-4 invisible'}`}>
               <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-[var(--text-one)] text-lg flex items-center gap-2"><Wrench size={18} className="text-[var(--primary)]"/> Tools</h3>
                  <button onClick={() => setActiveMenu(null)} className="p-1 rounded-md hover:bg-[var(--surface-three)] text-[var(--text-four)] hover:text-[var(--text-one)] transition-colors"><X size={16}/></button>
               </div>
               
               <div className="space-y-4">
                 {toolCategories.map((cat) => (
                   <div key={cat.title} className="group/cat">
                     <h4 className="text-[10px] font-bold text-[var(--text-four)] uppercase tracking-wider mb-2 pl-2 border-l-2 border-[var(--border)] group-hover/cat:border-[var(--primary)] transition-colors">{cat.title}</h4>
                     <div className="space-y-1">
                       {cat.items.map((item) => (
                         <Link 
                           key={item.name} 
                           href={item.href}
                           className="block px-3 py-2 rounded-xl text-sm text-[var(--text-one)] hover:bg-[var(--surface-two)] hover:text-[var(--primary)] hover:translate-x-1 transition-all"
                         >
                           {item.name}
                         </Link>
                       ))}
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Settings (Example) */}
          <div className="relative">
            <button 
              onClick={() => toggleMenu('settings')}
              className={`relative p-3 rounded-full transition-all duration-300 group flex justify-center items-center ${activeMenu === 'settings' ? 'bg-[var(--primary)] text-[var(--background-one)] shadow-[0_0_20px_-5px_var(--primary)] scale-110' : 'text-[var(--text-four)] hover:bg-[var(--surface-two)] hover:text-[var(--text-one)] hover:scale-110'}`}
            >
              <Settings size={22} strokeWidth={activeMenu === 'settings' ? 2.5 : 2} />
              
               {/* Tooltip */}
               {activeMenu !== 'settings' && (
                <div className="absolute left-full ml-6 px-3 py-1.5 bg-[var(--surface-eight)] border border-[var(--border)] rounded-xl text-xs font-medium text-[var(--text-one)] opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                  Settings
                </div>
               )}
            </button>

            {/* Settings Panel */}
            <div className={`absolute left-full top-0 ml-6 w-64 bg-[var(--surface-eight)]/90 backdrop-blur-2xl border border-[var(--border)] rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] p-6 transition-all duration-300 origin-top-left z-[60] ${activeMenu === 'settings' ? 'opacity-100 translate-x-0 visible' : 'opacity-0 -translate-x-4 invisible'}`}>
               <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-[var(--text-one)] text-lg flex items-center gap-2"><Settings size={18} className="text-[var(--primary)]"/> Settings</h3>
                  <button onClick={() => setActiveMenu(null)} className="p-1 rounded-md hover:bg-[var(--surface-three)] text-[var(--text-four)] hover:text-[var(--text-one)] transition-colors"><X size={16}/></button>
               </div>
               
               <div className="space-y-1">
                  {/* Appearance Section */}
                  <div className="mb-4">
                    <h4 className="text-[10px] font-bold text-[var(--text-four)] uppercase tracking-wider mb-3 pl-2 border-l-2 border-[var(--border)]">Appearance</h4>
                    {mounted && (
                      <div className="grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => setTheme('light')} 
                          className={`flex flex-col items-center justify-center gap-2 p-2 rounded-xl border transition-all ${theme === 'light' ? 'bg-[var(--surface-two)] border-[var(--primary)] text-[var(--primary)]' : 'border-transparent hover:bg-[var(--surface-two)] text-[var(--text-four)]'}`}
                        >
                          <Sun size={18} />
                          <span className="text-[10px] font-medium">Light</span>
                        </button>
                        <button 
                          onClick={() => setTheme('dark')} 
                          className={`flex flex-col items-center justify-center gap-2 p-2 rounded-xl border transition-all ${theme === 'dark' ? 'bg-[var(--surface-two)] border-[var(--primary)] text-[var(--primary)]' : 'border-transparent hover:bg-[var(--surface-two)] text-[var(--text-four)]'}`}
                        >
                          <Moon size={18} />
                          <span className="text-[10px] font-medium">Dark</span>
                        </button>
                        <button 
                          onClick={() => setTheme('system')} 
                          className={`flex flex-col items-center justify-center gap-2 p-2 rounded-xl border transition-all ${theme === 'system' ? 'bg-[var(--surface-two)] border-[var(--primary)] text-[var(--primary)]' : 'border-transparent hover:bg-[var(--surface-two)] text-[var(--text-four)]'}`}
                        >
                          <Monitor size={18} />
                          <span className="text-[10px] font-medium">System</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Other Settings */}
                  <div>
                    <h4 className="text-[10px] font-bold text-[var(--text-four)] uppercase tracking-wider mb-2 pl-2 border-l-2 border-[var(--border)]">General</h4>
                    {['Account', 'About'].map((item) => (
                      <button key={item} className="w-full text-left px-3 py-2 rounded-xl text-sm text-[var(--text-one)] hover:bg-[var(--surface-two)] hover:text-[var(--primary)] hover:translate-x-1 transition-all flex items-center justify-between group">
                        {item}
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-four)]" />
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* Separator */}
        <div className="w-8 h-[1px] bg-[var(--border)]"></div>

        {/* Bottom Icons */}
        <div className="flex flex-col gap-4 items-center w-full">
          <Link href="https://github.com" target="_blank" className="p-3 rounded-full text-[var(--text-four)] hover:bg-[var(--surface-two)] hover:text-[var(--text-one)] hover:scale-110 transition-all">
            <Github size={22} />
          </Link>
        </div>
      </aside>

      {/* Mobile Navbar (Top Bar) */}
      <nav className="md:hidden fixed top-0 left-0 w-full py-4 px-6 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-eight)]/80 backdrop-blur-md z-40">
        <div className="font-bold text-xl tracking-tight text-[var(--text-one)]">
            <Link href="/" className="hover:text-[var(--primary)] transition-colors">
              Jiya<span className="text-[var(--primary)]">World</span>
            </Link>
        </div>
        <Link href="https://github.com" target="_blank" className="text-[var(--text-four)] hover:text-[var(--text-one)]">
            <Github size={20} />
        </Link>
      </nav>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-8 py-4 px-8 rounded-full border border-[var(--border)] bg-[var(--surface-eight)]/90 backdrop-blur-2xl shadow-2xl z-50">
          <Link 
            href="/" 
            className={`p-2 rounded-full transition-all ${pathname === '/' ? 'bg-[var(--primary)] text-[var(--background-one)] shadow-lg shadow-[var(--primary)]/20' : 'text-[var(--text-four)]'}`}
          >
            <Home size={24} />
          </Link>
          
          <button 
            onClick={() => setActiveMobileMenu(activeMobileMenu === 'tools' ? null : 'tools')}
            className={`p-2 rounded-full transition-all ${activeMobileMenu === 'tools' || pathname.startsWith('/tools') ? 'bg-[var(--primary)] text-[var(--background-one)] shadow-lg shadow-[var(--primary)]/20' : 'text-[var(--text-four)]'}`}
          >
            <Wrench size={24} />
          </button>

          <button 
            onClick={() => setActiveMobileMenu(activeMobileMenu === 'settings' ? null : 'settings')}
            className={`p-2 rounded-full transition-all ${activeMobileMenu === 'settings' ? 'bg-[var(--primary)] text-[var(--background-one)] shadow-lg shadow-[var(--primary)]/20' : 'text-[var(--text-four)]'}`}
          >
            <Settings size={24} />
          </button>
      </div>

      {/* Mobile Bottom Sheet Backdrop */}
      {activeMobileMenu && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-[45] backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActiveMobileMenu(null)} />
      )}

      {/* Mobile Tools Sheet */}
      <div className={`md:hidden fixed bottom-0 left-0 w-full bg-[var(--surface-eight)] border-t border-[var(--border)] rounded-t-3xl p-6 z-[46] transition-transform duration-300 ease-out ${activeMobileMenu === 'tools' ? 'translate-y-0' : 'translate-y-full'}`} style={{ paddingBottom: '100px' }}>
          <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2 text-[var(--text-one)]"><Wrench size={20} className="text-[var(--primary)]"/> Tools</h3>
              <button onClick={() => setActiveMobileMenu(null)} className="p-1 bg-[var(--surface-two)] rounded-full text-[var(--text-four)]"><X size={20} /></button>
          </div>
          <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {toolCategories.map((cat) => (
                  <div key={cat.title}>
                      <h4 className="text-xs font-bold text-[var(--text-four)] uppercase tracking-wider mb-3 pl-1 border-l-2 border-[var(--primary)]">{cat.title}</h4>
                      <div className="grid grid-cols-1 gap-2">
                          {cat.items.map((item) => (
                              <Link 
                                  key={item.name} 
                                  href={item.href}
                                  onClick={() => setActiveMobileMenu(null)}
                                  className="block p-4 rounded-xl bg-[var(--surface-two)] border border-[var(--border)] text-sm font-medium text-[var(--text-one)] active:scale-95 transition-transform"
                              >
                                  {item.name}
                              </Link>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </div>

      {/* Mobile Settings Sheet */}
      <div className={`md:hidden fixed bottom-0 left-0 w-full bg-[var(--surface-eight)] border-t border-[var(--border)] rounded-t-3xl p-6 z-[46] transition-transform duration-300 ease-out ${activeMobileMenu === 'settings' ? 'translate-y-0' : 'translate-y-full'}`} style={{ paddingBottom: '100px' }}>
          <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg flex items-center gap-2 text-[var(--text-one)]"><Settings size={20} className="text-[var(--primary)]"/> Settings</h3>
              <button onClick={() => setActiveMobileMenu(null)} className="p-1 bg-[var(--surface-two)] rounded-full text-[var(--text-four)]"><X size={20} /></button>
          </div>
          
          <div>
              <h4 className="text-xs font-bold text-[var(--text-four)] uppercase tracking-wider mb-4">Appearance</h4>
              {mounted && (
                  <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => setTheme('light')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${theme === 'light' ? 'border-[var(--primary)] bg-[var(--surface-two)] text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-four)]'}`}>
                          <Sun size={24} />
                          <span className="text-xs font-medium">Light</span>
                      </button>
                      <button onClick={() => setTheme('dark')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${theme === 'dark' ? 'border-[var(--primary)] bg-[var(--surface-two)] text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-four)]'}`}>
                          <Moon size={24} />
                          <span className="text-xs font-medium">Dark</span>
                      </button>
                      <button onClick={() => setTheme('system')} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${theme === 'system' ? 'border-[var(--primary)] bg-[var(--surface-two)] text-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-four)]'}`}>
                          <Monitor size={24} />
                          <span className="text-xs font-medium">System</span>
                      </button>
                  </div>
              )}
          </div>
      </div>
    </>
  );
};

export default Navbar;