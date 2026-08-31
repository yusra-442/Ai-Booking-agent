import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
      <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-purple-600 text-primary-foreground font-bold text-lg shadow-lg animate-pulse-glow">
              B
            </div>
            <span className="text-xl font-bold gradient-text">BookAI</span>
     </div>
          <nav className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="hover-lift">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover-lift">Get Started</Button>
            </Link>
          </nav>
      </div>
    </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-full blur-3xl" />
    </div>

        <div className="container mx-auto text-center max-w-5xl">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-scale-in">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              AI-Powered Business Automation
            </span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight sm:text-7xl animate-fade-in stagger-1">
            Your Business,
            <br />
            <span className="gradient-text animate-gradient bg-gradient-to-r from-primary via-purple-500 to-cyan-500">
              Supercharged
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground animate-fade-in stagger-2">
            AI assistant that handles bookings, answers questions, and sells your services 24/7.
            Let customers book appointments, check prices, and get instant support — automatically.
     </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in stagger-3">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-lg bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl hover-lift animate-pulse-glow">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-lg hover-lift">
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-3 gap-8 animate-fade-in stagger-4">
            <div className="text-center">
      <div className="text-3xl font-bold gradient-text">10K+</div>
        <div className="text-sm text-muted-foreground mt-1">Appointments Booked</div>
      </div>
        <div className="text-center">
     <div className="text-3xl font-bold gradient-text">98%</div>
      <div className="text-sm text-muted-foreground mt-1">Customer Satisfaction</div>
         </div>
         <div className="text-center">
       <div className="text-3xl font-bold gradient-text">24/7</div>
           <div className="text-sm text-muted-foreground mt-1">Always Available</div>
          </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
        <h2 className="text-3xl font-bold sm:text-4xl">
        Everything Your Business Needs
          </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              One platform to automate bookings, answer customers, and grow your business.
          </p>
      </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
         {[
              {
                icon: '🤖',
            title: 'AI Assistant',
           desc: 'Answers questions about services, pricing, hours — and books appointments automatically.',
                color: 'from-purple-500 to-indigo-500',
              },
            {
            icon: '📅',
         title: 'Smart Booking',
      desc: 'Visual calendar, working hours, buffer times, and holiday management.',
        color: 'from-blue-500 to-cyan-500',
        },
       {
      icon: '💬',
        title: 'WhatsApp & Chat',
     desc: 'Connect WhatsApp Business and embed chat widget on your website.',
           color: 'from-green-500 to-emerald-500',
      },
       {
        icon: '📧',
       title: 'Email Alerts',
          desc: 'Automatic confirmations, reminders, and follow-ups sent to your customers.',
       color: 'from-orange-500 to-red-500',
     },
      {
          icon: '📦',
        title: 'Products & Services',
         desc: 'Manage inventory, services, pricing, and FAQs in one place.',
        color: 'from-pink-500 to-rose-500',
        },
       {
       icon: '💳',
        title: 'Payments',
         desc: 'Accept payments online with Stripe integration. Secure and reliable.',
        color: 'from-violet-500 to-purple-500',
         },
          ].map((feature, i) => (
        <div
           key={feature.title}
           className={`group p-6 rounded-2xl bg-card border hover-lift animate-fade-in stagger-${i + 1}`}
          >
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} text-white text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
    {feature.icon}
          </div>
            <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-cyan-500/10 border">
        <h2 className="text-3xl font-bold sm:text-4xl">Ready to Automate Your Business?</h2>
            <p className="mt-4 text-muted-foreground">
              Join thousands of businesses using BookAI to save time and grow revenue.
            </p>
            <Link href="/signup">
              <Button size="lg" className="mt-8 h-12 px-8 text-lg bg-gradient-to-r from-primary to-purple-600 shadow-xl hover-lift">
                Get Started Free
        </Button>
          </Link>
          </div>
        </div>
    </section>

      {/* Footer */}
      <footer className="border-t py-8 bg-muted/30">
    <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center gap-2">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600 text-primary-foreground font-bold text-sm">
          B
           </div>
      <span className="font-semibold gradient-text">BookAI</span>
           </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
    <Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Sign In</Link>
           <Link href="/signup" className="hover:text-foreground transition-colors">Sign Up</Link>
          </div>
         <div className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} BookAI. All rights reserved.
            </div>
      </div>
      </div>
    </footer>
    </div>
  )
}
