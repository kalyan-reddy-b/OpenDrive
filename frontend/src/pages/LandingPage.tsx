import { Link } from 'react-router';
import {
  Cloud, Shield, Zap, FolderSync, Share2,
  Lock, HardDrive, Users, CheckCircle2, Star
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Shield,
      title: 'Decentralized Security',
      desc: 'JWT-authenticated APIs, bcrypt password hashing, and secure token rotation keep your data safe.',
      color: 'text-[#FF4F00] bg-[#FF4F00]/10'
    },
    {
      icon: Zap,
      title: 'Lightning Fast Uploads',
      desc: 'Real-time progress bars, parallel uploads, and optimistic UI updates make file management instant.',
      color: 'text-[#FF4F00] bg-[#FF4F00]/10'
    },
    {
      icon: FolderSync,
      title: 'Smart Organization',
      desc: 'Folders, categories, favorites, and trash give you a full Google Drive-like file management system.',
      color: 'text-[#FF4F00] bg-[#FF4F00]/10'
    },
    {
      icon: Share2,
      title: 'Collaborative Sharing',
      desc: 'Share files securely with team members with granular access controls and real-time alerts.',
      color: 'text-[#FF4F00] bg-[#FF4F00]/10'
    },
    {
      icon: HardDrive,
      title: '100 GB Storage Quota',
      desc: 'Generous storage with real-time usage tracking, category breakdowns, and easy management.',
      color: 'text-[#FF4F00] bg-[#FF4F00]/10'
    },
    {
      icon: Users,
      title: 'Team Workspaces',
      desc: 'Built for teams with multi-user support, role-based access, and collaborative workflows.',
      color: 'text-[#FF4F00] bg-[#FF4F00]/10'
    },
  ];

  const steps = [
    { step: '01', title: 'Setup Operator', desc: 'Sign up in seconds with just your email and password. No credit card required.' },
    { step: '02', title: 'Push Data Nodes', desc: 'Drag and drop or click to upload. Supports any file type up to 100MB per file.' },
    { step: '03', title: 'Collaborate', desc: 'Access, share, and manage your files from any device, any browser, anywhere.' },
  ];

  const plans = [
    {
      name: 'Free Sandbox',
      price: '$0',
      period: '/month',
      desc: 'Perfect for personal use',
      features: ['5 GB Storage', 'Up to 50 files', 'Basic file sharing', 'Community support'],
      cta: 'Get Started Free',
      to: '/register',
      highlight: false,
      color: 'bg-white'
    },
    {
      name: 'Pro Operator',
      price: '$9',
      period: '/month',
      desc: 'For power users and creators',
      features: ['100 GB Storage', 'Unlimited files', 'Advanced sharing', 'Priority support', 'File versioning'],
      cta: 'Start Pro Trial',
      to: '/register',
      highlight: true,
      color: 'bg-[#F7F5F2]' // Soft off-white panel
    },
    {
      name: 'Enterprise Grid',
      price: '$29',
      period: '/month',
      desc: 'For teams and organizations',
      features: ['1 TB Storage', 'Team management', 'SSO & SAML', 'Dedicated support', 'SLA guarantee'],
      cta: 'Contact Sales',
      to: '/register',
      highlight: false,
      color: 'bg-white'
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFEFB] text-[#201515] flex flex-col font-sans select-none">
      {/* ── Nav Header ── */}
      <header className="sticky top-0 z-50 bg-[#FFFEFB] border-b border-[#E8E5DF]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 bg-[#FF4F00] text-white rounded-[4px]">
              <Cloud className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#201515]">
              Open<span className="text-[#FF4F00]">Drive</span>
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-[#36342E] hover:text-[#FF4F00] transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-semibold text-[#36342E] hover:text-[#FF4F00] transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-semibold text-[#36342E] hover:text-[#FF4F00] transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 border border-[#E8E5DF] rounded-[4px] bg-white hover:bg-[#F7F5F2] text-sm font-semibold text-[#201515] transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 bg-[#FF4F00] hover:bg-[#e04500] text-white text-sm font-semibold rounded-[4px] transition-all"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-20 pb-20 overflow-hidden bg-[#FFFEFB]">
        <div className="badge-sticker text-xs mb-6 uppercase tracking-wider font-semibold text-[#605D52]">
          Secure Cloud Storage · v1.0
        </div>

        <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-[#201515] max-w-5xl mb-6 leading-[1.05]">
          Your files. Your rules. <br />
          Anywhere in <span className="text-[#FF4F00] relative">the cloud.</span>
        </h1>
        
        <p className="text-base md:text-lg text-[#36342E] max-w-2xl mb-10 leading-relaxed">
          Upload, organize, and share files securely. Built on .NET 8, SQLite, and React 19
          packaged in a clean, high-performance workspace interface.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16 z-10 w-full justify-center max-w-md">
          <Link
            to="/register"
            className="px-6 py-3 bg-[#FF4F00] hover:bg-[#e04500] text-white text-base font-semibold rounded-[4px] transition-all text-center"
          >
            Start Free with Email
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 border border-[#E8E5DF] bg-white hover:bg-[#F7F5F2] text-base font-semibold rounded-[4px] text-center transition-all text-[#201515]"
          >
            Access Grid Console
          </Link>
        </div>

        {/* Big Headline Stats Row (Zapier device) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto w-full border-y border-[#E8E5DF] py-8 mb-16">
          <div className="text-center">
            <div className="text-[40px] font-medium text-[#FF4F00] leading-none mb-1">100 GB</div>
            <div className="text-xs font-medium uppercase tracking-wider text-[#605D52]">Free Storage</div>
          </div>
          <div className="text-center">
            <div className="text-[40px] font-medium text-[#FF4F00] leading-none mb-1">99.99%</div>
            <div className="text-xs font-medium uppercase tracking-wider text-[#605D52]">Uptime SLA</div>
          </div>
          <div className="text-center">
            <div className="text-[40px] font-medium text-[#FF4F00] leading-none mb-1">100MB</div>
            <div className="text-xs font-medium uppercase tracking-wider text-[#605D52]">Max File Size</div>
          </div>
          <div className="text-center">
            <div className="text-[40px] font-medium text-[#FF4F00] leading-none mb-1">AES-256</div>
            <div className="text-xs font-medium uppercase tracking-wider text-[#605D52]">Encryption</div>
          </div>
        </div>

        {/* Soft Off-White Panel ("FOR BUILDERS" style panel) holding bordered app tiles */}
        <div className="w-full max-w-5xl mx-auto bg-[#F7F5F2] border border-[#E8E5DF] rounded-[8px] p-6 shadow-sm">
          <div className="text-left mb-6 border-b border-[#E8E5DF] pb-4 flex items-center justify-between">
            <div>
              <span className="text-[12px] font-semibold text-[#605D52] uppercase tracking-wider">FOR TEAMS & BUILDERS</span>
              <h3 className="text-lg font-medium text-[#201515] mt-1">Get started in seconds</h3>
            </div>
            <span className="text-[11px] font-semibold bg-[#FF4F00] text-white px-2 py-0.5 rounded-[4px] uppercase">Active Console</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 space-y-2 text-left">
              {['My Drive', 'Recent Files', 'Favorites', 'Shared', 'Trash'].map((item, i) => (
                <div 
                  key={item} 
                  className={`px-3 py-2 border rounded-[4px] text-xs font-semibold uppercase transition-all ${
                    i === 0 
                      ? 'bg-[#FF4F00] text-white border-[#FF4F00]' 
                      : 'bg-white text-[#201515] border-[#E8E5DF] hover:bg-[#F7F5F2]'
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="md:col-span-3 p-6 bg-white border border-[#E8E5DF] rounded-[6px] text-left">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#E8E5DF]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#605D52]">Active Files Node</span>
                <div className="text-xs font-semibold text-[#FF4F00]">+ Upload Content</div>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Report_Q3_Overview.pdf', size: '2.4 MB', type: 'pdf', fav: true },
                  { name: 'product_wireframes.png', size: '1.1 MB', type: 'img', fav: false },
                  { name: 'database_backup.db', size: '48.0 MB', type: 'db', fav: false },
                ].map(f => (
                  <div key={f.name} className="flex items-center gap-3 px-4 py-2 border border-[#E8E5DF] rounded-[4px] bg-[#F7F5F2]">
                    <div className="w-7 h-7 border border-[#E8E5DF] bg-white rounded-[4px] flex items-center justify-center text-[10px] font-semibold uppercase text-[#36342E]">
                      {f.type}
                    </div>
                    <span className="flex-1 text-xs font-semibold text-[#201515] truncate">{f.name}</span>
                    {f.fav && <Star className="w-3.5 h-3.5 text-[#FF4F00] fill-current shrink-0" />}
                    <span className="text-[11px] text-[#605D52] bg-white border border-[#E8E5DF] px-2 py-0.5 rounded-[4px] shrink-0 font-mono">{f.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Brand Band (Forest Green separator) ── */}
      <div className="marquee-container select-none">
        <div className="marquee-content">
          OPENDrive CLOUD STORAGE • LIGHTWEIGHT & SECURE • 100% API DRIVEN • JWT SECURE METADATA • MULTI-USER SHARING ENABLED • SECURE CLOUD STORAGE • LIGHTWEIGHT & SECURE • 100% API DRIVEN • JWT SECURE METADATA • MULTI-USER SHARING ENABLED •
        </div>
      </div>

      {/* ── Features Section ── */}
      <section id="features" className="py-20 px-6 bg-white border-b border-[#E8E5DF]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[12px] font-semibold text-[#605D52] uppercase tracking-wider">FEATURES</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#201515] mt-2 mb-4">Everything You Need</h2>
            <p className="text-[#36342E] max-w-xl mx-auto text-sm">
              A clean and highly functional cloud storage architecture designed to secure and organize your work.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="bg-[#F7F5F2] border border-[#E8E5DF] rounded-[8px] p-6 hover:-translate-y-0.5 transition-all duration-200">
                <div className={`inline-flex p-2.5 rounded-[6px] border border-[#E8E5DF] ${f.color} mb-4`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-[#201515] mb-2">{f.title}</h3>
                <p className="text-xs text-[#36342E] leading-relaxed font-sans">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ── */}
      <section id="how-it-works" className="py-20 px-6 bg-[#FFFEFB] border-b border-[#E8E5DF]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[12px] font-semibold text-[#605D52] uppercase tracking-wider">WORKFLOW</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#201515] mt-2 mb-4">How it works</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="bg-[#F7F5F2] border border-[#E8E5DF] rounded-[8px] p-6 relative">
                <div className="w-8 h-8 rounded-[4px] bg-[#FF4F00] text-white flex items-center justify-center mb-4 text-sm font-semibold font-mono">
                  {s.step}
                </div>
                <h3 className="text-base font-semibold text-[#201515] mb-2">{s.title}</h3>
                <p className="text-xs text-[#36342E] leading-relaxed font-sans">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ── */}
      <section id="pricing" className="py-20 px-6 bg-white border-b border-[#E8E5DF]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[12px] font-semibold text-[#605D52] uppercase tracking-wider">PRICING</span>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#201515] mt-2 mb-4">Transparent Quota Cost</h2>
            <p className="text-[#36342E] text-sm">No hidden fees. Cancel anytime.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map(p => (
              <div key={p.name} className={`border border-[#E8E5DF] rounded-[8px] p-8 ${p.highlight ? 'bg-[#F7F5F2] ring-2 ring-[#FF4F00]' : 'bg-white'}`}>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-[#201515] mb-1">{p.name}</h3>
                  <p className="text-xs text-[#605D52] mb-4">{p.desc}</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-medium text-[#201515]">{p.price}</span>
                    <span className="text-xs text-[#605D52] uppercase">{p.period}</span>
                  </div>
                </div>
                
                <ul className="space-y-3 mb-8 border-t border-dashed border-[#E8E5DF] pt-4">
                  {p.features.map(feat => (
                    <li key={feat} className="flex items-center gap-2 text-xs text-[#36342E]">
                      <CheckCircle2 className="w-4 h-4 text-[#FF4F00] shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>

                <Link
                  to={p.to}
                  className={`block text-center py-2.5 rounded-[4px] text-xs font-semibold transition-all ${
                    p.highlight
                      ? 'bg-[#FF4F00] text-white hover:bg-[#e04500]'
                      : 'bg-white border border-[#E8E5DF] text-[#201515] hover:bg-[#F7F5F2]'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Call to Action Banner (Forest Green background) ── */}
      <section className="py-20 px-6 bg-[#2D3A2E] text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10 text-[#FFFEFB]">
          <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-[6px] mx-auto mb-6">
            <Lock className="w-6 h-6 text-[#FFFEFB]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-[#FFFEFB]">Your Files, Your Control</h2>
          <p className="text-[#F7F5F2]/80 mb-8 text-sm max-w-xl mx-auto leading-relaxed">
            Open source, self-hostable, and privacy-first. Deploy on your own infrastructure or use our secure cloud grid.
          </p>
          <Link
            to="/register"
            className="px-6 py-3 bg-[#FF4F00] hover:bg-[#e04500] text-[#FFFEFB] text-sm font-semibold rounded-[4px] transition-all inline-block"
          >
            Start Free with Email
          </Link>
        </div>
      </section>

      {/* ── Footer (Deep Forest Green band) ── */}
      <footer className="py-12 px-6 bg-[#2D3A2E] border-t border-[#FFFEFB]/10 text-[#F7F5F2]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-7 h-7 bg-[#FF4F00] rounded-[4px] text-white">
                  <Cloud className="w-4 h-4" />
                </div>
                <span className="font-bold text-[#FFFEFB] text-sm tracking-tight">OpenDrive</span>
              </div>
              <p className="text-xs text-[#F7F5F2]/70 leading-relaxed font-sans">
                Secure cloud storage built on modern web paradigms and optimized clean API structures.
              </p>
            </div>
            
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold text-[#FFFEFB] mb-4 uppercase tracking-wider">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-xs text-[#F7F5F2]/70 hover:text-[#FF4F00] transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#FFFEFB]/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#F7F5F2]/60">
            <p>
              © {new Date().getFullYear()} OpenDrive. All rights reserved.
            </p>
            <p className="font-mono text-[10px]">
              Built with .NET 8 · React 19 · SQLite · Tailwind CSS v4
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
