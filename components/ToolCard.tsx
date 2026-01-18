import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

interface ToolCardProps {
  title: string;
  description: string;
  tags: string[];
  href: string;
}

const ToolCard = ({ title, description, tags, href }: ToolCardProps) => {
  return (
    <Link 
      href={href}
      className="group block p-6 rounded-2xl bg-[var(--surface-two)] border border-[var(--border)] hover:border-[var(--primary)] hover:shadow-lg transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-[var(--text-one)] group-hover:text-[var(--primary)] transition-colors">
          {title}
        </h3>
        <ArrowUpRight className="text-[var(--text-four)] group-hover:text-[var(--primary)] transition-colors" size={20} />
      </div>
      
      <p className="text-[var(--text-four)] mb-6 line-clamp-2">
        {description}
      </p>
      
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span 
            key={tag} 
            className="px-2 py-1 text-xs rounded-md bg-[var(--surface-three)] text-[var(--secondary)] border border-[var(--border)]"
          >
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
};

export default ToolCard;