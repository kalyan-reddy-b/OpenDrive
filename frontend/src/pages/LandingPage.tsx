import { Link } from 'react-router';
import {
  Cloud, Shield, Zap, FolderSync, Upload, Share2,
  Star, Lock, Users, HardDrive, ArrowRight, CheckCircle2
} from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      icon: Shield,
      title: 'Bank-Grade Security',
      desc: 'JWT-authenticated APIs, bcrypt password hashing, and secure token rotation keep your data safe.',
      color: 'text-[#61AFEF]',
      bg: 'bg-[#1e2a38]',
      border: 'border-[#2d4a6b]',
    },
    {
      icon: Zap,
      title: 'Lightning Fast Uploads',
      desc: 'Real-time progress bars, parallel uploads, and optimistic UI updates make file management instant.',
      color: 'text-[#E5C07B]',
      bg: 'bg-[#2a2818]',
      border: 'border-[#6b5d2d]',
    },
    {
      icon: FolderSync,
      title: 'Smart Organisation',
      desc: 'Folders, categories, favorites, and trash give you a full Google Drive-like file management system.',
      color: 'text-[#98C379]',
      bg: 'bg-[#1a2a1e]',
      border: 'border-[#2d6b3e]',
    },
    {
      icon: Share2,
      title: 'File Sharing',
      desc: 'Share files securely with team members with granular access controls and shared links.',
      color: 'text-[#C678DD]',
      bg: 'bg-[#271a2a]',
      border: 'border-[#5d2d6b]',
    },
    {
      icon: HardDrive,
      title: '100 GB Storage',
      desc: 'Generous storage with real-time usage tracking, category breakdowns, and easy management.',
      color: 'text-[#E06C75]',
      bg: 'bg-[#2a1a1e]',
      border: 'border-[#6b2d38]',
    },
    {
      icon: Users,
      title: 'Team Ready',
      desc: 'Built for teams with multi-user support, role-based access, and collaborative workflows.',
      color: 'text-[#56B6C2]',
      bg: 'bg-[#1a2628]',
      border: 'border-[#2d5f6b]',
    },
  ];

  const steps = [
    { step: '01', title: 'Create Account', desc: 'Sign up in seconds with just your email and password. No credit card required.' },
    { step: '02', title: 'Upload Files', desc: 'Drag and drop or click to upload. Supports any file type up to 100MB per file.' },
    { step: '03', title: 'Access Anywhere', desc: 'Access, share, and manage your files from any device, any browser, anywhere.' },
  ];

  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '/month',
      desc: 'Perfect for personal use',
      features: ['5 GB Storage', 'Up to 50 files', 'Basic file sharing', 'Email support'],
      cta: 'Get Started Free',
      to: '/register',
      highlight: false,
    },
    {
      name: 'Pro',
      price: '$9',
      period: '/month',
      desc: 'For power users and creators',
      features: ['100 GB Storage', 'Unlimited files', 'Advanced sharing', 'Priority support', 'File versioning'],
      cta: 'Start Pro Trial',
      to: '/register',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: '$29',
      period: '/month',
      desc: 'For teams and organisations',
      features: ['1 TB Storage', 'Team management', 'SSO & SAML', 'Dedicated support', 'SLA guarantee', 'Audit logs'],
      cta: 'Contact Sales',
      to: '/register',
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#1a1a1a]/90 backdrop-blur-sm border-b border-[#40423A]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 bg-[#61AFEF] rounded-lg">
              <Cloud className="w-5 h-5 text-[#252622]" />
            </div>
            <span className="text-lg font-bold font-mono text-white">OpenDrive</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[#A1A6B4] hover:text-white transition-colors font-mono">Features</a>
            <a href="#how-it-works" className="text-sm text-[#A1A6B4] hover:text-white transition-colors font-mono">How it Works</a>
            <a href="#pricing" className="text-sm text-[#A1A6B4] hover:text-white transition-colors font-mono">Pricing</a>
          </nav>
          <div className="flex gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-mono font-bold text-[#A1A6B4] hover:text-white border border-[#40423A] hover:border-[#61AFEF] rounded-md transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-mono font-bold bg-[#61AFEF] hover:bg-[#5294CB] text-[#252622] rounded-md transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 pt-28 pb-32 overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#61AFEF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#C678DD]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#40423A] bg-[#252622] text-xs font-mono text-[#61AFEF] mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#98C379] animate-pulse" />
          Open Source · Self-Hostable · Production Ready
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl mb-6 font-mono leading-tight">
          Cloud Storage for<br />
          <span className="text-[#61AFEF]">Modern Teams</span>
        </h1>
        <p className="text-lg md:text-xl text-[#A1A6B4] max-w-2xl mb-10 font-mono leading-relaxed">
          Upload, organise, and share files securely. Built on .NET 8 and React 19
          with a clean, developer-friendly architecture.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            to="/register"
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold font-mono bg-[#61AFEF] hover:bg-[#5294CB] text-[#252622] rounded-md transition-all shadow-lg shadow-[#61AFEF]/20"
          >
            Start for Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold font-mono border border-[#40423A] hover:border-[#61AFEF] text-[#A1A6B4] hover:text-white rounded-md transition-all"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* Mock dashboard preview */}
        <div className="w-full max-w-5xl mx-auto rounded-xl border border-[#40423A] bg-[#252622] shadow-2xl shadow-black/50 overflow-hidden">
          <div className="flex items-center gap-1.5 px-4 py-3 bg-[#32332E] border-b border-[#40423A]">
            <span className="w-3 h-3 rounded-full bg-[#E06C75]" />
            <span className="w-3 h-3 rounded-full bg-[#E5C07B]" />
            <span className="w-3 h-3 rounded-full bg-[#98C379]" />
            <span className="ml-4 text-xs font-mono text-[#8A8F98]">opendrive.app/drive</span>
          </div>
          <div className="grid grid-cols-5 divide-x divide-[#40423A]">
            <div className="col-span-1 p-4 bg-[#252622] space-y-2 hidden md:block">
              {['My Drive', 'Recent Files', 'Favorites', 'Shared', 'Trash'].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs font-mono ${i === 0 ? 'bg-[#40423A] text-white' : 'text-[#8A8F98]'}`}>
                  <span className="w-3 h-3 rounded-sm bg-[#40423A]" />
                  {item}
                </div>
              ))}
            </div>
            <div className="col-span-5 md:col-span-4 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-bold font-mono text-white">My Drive</span>
                <div className="px-3 py-1 bg-[#61AFEF] rounded text-xs font-mono text-[#252622] font-bold flex items-center gap-1">
                  <Upload className="w-3 h-3" /> Upload Files
                </div>
              </div>
              <div className="space-y-2">
                {[
                  { name: 'Q3_Report.pdf', size: '2.4 MB', type: 'pdf', fav: true },
                  { name: 'product_mockup.png', size: '1.1 MB', type: 'img', fav: false },
                  { name: 'team_video.mp4', size: '48.0 MB', type: 'vid', fav: false },
                  { name: 'data_export.csv', size: '340 KB', type: 'doc', fav: true },
                ].map(f => (
                  <div key={f.name} className="flex items-center gap-3 px-3 py-2 rounded bg-[#32332E] border border-[#40423A]">
                    <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                      f.type === 'pdf' ? 'bg-[#1e2a38] text-[#61AFEF]' :
                      f.type === 'img' ? 'bg-[#1a2a1e] text-[#98C379]' :
                      f.type === 'vid' ? 'bg-[#271a2a] text-[#C678DD]' :
                      'bg-[#2a2818] text-[#E5C07B]'
                    }`}>
                      {f.type.toUpperCase()}
                    </div>
                    <span className="flex-1 text-xs font-mono text-white truncate">{f.name}</span>
                    {f.fav && <Star className="w-3 h-3 text-[#E5C07B] fill-current shrink-0" />}
                    <span className="text-xs font-mono text-[#8A8F98] shrink-0">{f.size}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-[#252622]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono font-bold text-[#61AFEF] uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-4xl font-bold font-mono text-white mb-4">Everything You Need</h2>
            <p className="text-[#A1A6B4] font-mono max-w-2xl mx-auto">
              A complete cloud storage solution with all the features your team expects.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className={`p-6 rounded-xl border ${f.border} ${f.bg} hover:scale-[1.02] transition-transform`}>
                <div className={`inline-flex p-2.5 rounded-lg bg-black/20 mb-4`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold font-mono text-white mb-2">{f.title}</h3>
                <p className="text-sm text-[#A1A6B4] font-mono leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-[#1a1a1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono font-bold text-[#61AFEF] uppercase tracking-widest mb-4">How It Works</p>
            <h2 className="text-4xl font-bold font-mono text-white mb-4">Up and Running in Minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-[#40423A] z-0" style={{ width: 'calc(100% - 2rem)', left: 'calc(50% + 2rem)' }} />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-full bg-[#252622] border-2 border-[#61AFEF] flex items-center justify-center mb-6 mx-auto md:mx-0">
                    <span className="font-mono font-bold text-[#61AFEF] text-lg">{s.step}</span>
                  </div>
                  <h3 className="text-lg font-bold font-mono text-white mb-3">{s.title}</h3>
                  <p className="text-sm text-[#A1A6B4] font-mono leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[#252622]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-mono font-bold text-[#61AFEF] uppercase tracking-widest mb-4">Pricing</p>
            <h2 className="text-4xl font-bold font-mono text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-[#A1A6B4] font-mono">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {plans.map(p => (
              <div key={p.name} className={`rounded-xl border p-8 ${
                p.highlight
                  ? 'border-[#61AFEF] bg-[#1e2a38] relative'
                  : 'border-[#40423A] bg-[#32332E]'
              }`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#61AFEF] text-[#252622] text-xs font-bold font-mono rounded-full">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold font-mono text-white mb-1">{p.name}</h3>
                  <p className="text-xs text-[#A1A6B4] font-mono mb-4">{p.desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold font-mono text-white">{p.price}</span>
                    <span className="text-sm text-[#A1A6B4] font-mono">{p.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {p.features.map(feat => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm font-mono text-[#A1A6B4]">
                      <CheckCircle2 className="w-4 h-4 text-[#98C379] shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to={p.to}
                  className={`block text-center py-2.5 rounded-md text-sm font-bold font-mono transition-all ${
                    p.highlight
                      ? 'bg-[#61AFEF] hover:bg-[#5294CB] text-[#252622]'
                      : 'border border-[#40423A] hover:border-[#61AFEF] text-[#A1A6B4] hover:text-white'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 px-6 bg-[#1a1a1a]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-[#61AFEF] rounded-2xl mx-auto mb-8">
            <Lock className="w-8 h-8 text-[#252622]" />
          </div>
          <h2 className="text-4xl font-bold font-mono text-white mb-4">Your Files, Your Control</h2>
          <p className="text-[#A1A6B4] font-mono mb-10 text-lg">
            Open source, self-hostable, and privacy-first. Deploy on your own infrastructure
            or use our managed cloud.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-10 py-4 text-base font-bold font-mono bg-[#61AFEF] hover:bg-[#5294CB] text-[#252622] rounded-md transition-all shadow-xl shadow-[#61AFEF]/20"
          >
            Get Started for Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#40423A] py-12 px-6 bg-[#252622]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-7 h-7 bg-[#61AFEF] rounded-md">
                  <Cloud className="w-4 h-4 text-[#252622]" />
                </div>
                <span className="font-bold font-mono text-white">OpenDrive</span>
              </div>
              <p className="text-xs text-[#8A8F98] font-mono leading-relaxed">
                Enterprise cloud storage built with modern web standards.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Security', 'Roadmap'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
              { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-xs text-[#8A8F98] hover:text-white font-mono transition-colors">{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#40423A] pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#8A8F98] font-mono">
              © {new Date().getFullYear()} OpenDrive. All rights reserved.
            </p>
            <p className="text-xs text-[#8A8F98] font-mono">
              Built with .NET 8 · React 19 · SQLite · Tailwind CSS
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
