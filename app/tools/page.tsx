import Link from 'next/link';
import { Code2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ToolCard from '../../components/ToolCard';

export default function ToolsPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

      <div className="wrapper flex-grow">
        <section id="tools" className="py-10">
          <div className="flex items-center gap-3 mb-10">
            <Code2 className="text-[var(--primary)]" size={28} />
            <h2 className="text-3xl font-bold text-[var(--text-one)] m-0">My Tools</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Tool Card 1 */}
            <ToolCard 
              title="Image Optimizer" 
              description="Compress and resize images directly in your browser without uploading data."
              tags={['React', 'WASM']}
              href="#"
            />
            {/* Tool Card 2 */}
            <ToolCard 
              title="JSON Formatter" 
              description="Beautify and validate JSON data with syntax highlighting and error detection."
              tags={['Utility', 'DevTool']}
              href="#"
            />
            {/* Tool Card 3 */}
            <ToolCard 
              title="Color Palette Gen" 
              description="Generate accessible color palettes based on Material You guidelines."
              tags={['Design', 'CSS']}
              href="#"
            />
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
