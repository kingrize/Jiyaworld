'use client';

export default function Footer() {
  return (
    <footer className="bg-[var(--surface-eight)] border-t border-[var(--border)] py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-one)]">
              Jiya<span className="text-[var(--primary)]">Dev</span>
            </h3>
            <p className="text-sm text-[var(--text-four)] mt-1">© 2024. All rights reserved.</p>
          </div>
          <div className="flex gap-6 text-sm text-[var(--text-four)]">
            <a href="#" className="hover:text-[var(--primary)] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[var(--primary)] transition-colors">Terms</a>
            <a href="#" className="hover:text-[var(--primary)] transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
