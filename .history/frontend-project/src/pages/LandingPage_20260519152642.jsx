import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Car, Wrench, CreditCard, FileText, Shield, Clock, 
  Users, TrendingUp, CheckCircle, ArrowRight, Menu, X,
  Phone, Mail, MapPin, Facebook, Twitter, Linkedin,
  Star, Calendar, DollarSign, BarChart3, Settings,
  Zap, Target, Globe, Award, Truck, Sparkles
} from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Car, title: 'Car Management', description: 'Easily manage all vehicle information including plate numbers, models, and service history.' },
    { icon: Wrench, title: 'Service Tracking', description: 'Track all repair services, costs, and assign mechanics to each job.' },
    { icon: CreditCard, title: 'Payment Processing', description: 'Process payments, track pending balances, and generate receipts.' },
    { icon: FileText, title: 'Report Generation', description: 'Generate comprehensive reports including service bills and daily payments.' },
    { icon: Shield, title: 'Secure System', description: 'Password-protected access with session-based authentication.' },
    { icon: TrendingUp, title: 'Analytics Dashboard', description: 'Real-time insights with charts and performance metrics.' },
  ];

  const stats = [
    { value: '500+', label: 'Cars Serviced', icon: Car },
    { value: '98%', label: 'Satisfaction Rate', icon: Star },
    { value: '24/7', label: 'Support Available', icon: Clock },
    { value: '50+', label: 'Expert Mechanics', icon: Users },
  ];

  const testimonials = [
    {
      name: 'John Mugisha',
      role: 'Fleet Manager',
      content: 'CRPMS has transformed how we manage our vehicle fleet. The reporting features are exceptional!',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      name: 'Sarah Uwase',
      role: 'Workshop Owner',
      content: 'The payment tracking and service record management save us hours of manual work every week.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      name: 'Peter Nduwimana',
      role: 'Mechanic',
      content: 'Very intuitive interface. I can quickly log services and check vehicle history.',
      rating: 4,
      image: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
  ];

  const pricing = [
    {
      name: 'Basic',
      price: 'Free',
      features: ['Up to 50 cars', 'Basic reports', 'Email support', '1 user account'],
      button: 'Get Started',
      popular: false
    },
    {
      name: 'Professional',
      price: '$49',
      period: '/month',
      features: ['Unlimited cars', 'Advanced reports', 'Priority support', '5 user accounts', 'Export to PDF/Excel'],
      button: 'Start Free Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      features: ['Unlimited everything', '24/7 phone support', 'Custom integrations', 'Unlimited users', 'Dedicated account manager'],
      button: 'Contact Sales',
      popular: false
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 dark:bg-slate-900/95 shadow-lg backdrop-blur-sm' : 'bg-transparent'
      }`}>
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">CRPMS</span>
            </Link>

            {/* Desktop Menu */}
            <div className="items-center hidden gap-8 md:flex">
              <a href="#home" className="transition-colors text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">Home</a>
              <a href="#features" className="transition-colors text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">Features</a>
              <a href="#about" className="transition-colors text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">About</a>
              <a href="#pricing" className="transition-colors text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">Pricing</a>
              <a href="#contact" className="transition-colors text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400">Contact</a>
            </div>

            {/* Auth Buttons */}
            <div className="items-center hidden gap-4 md:flex">
              <Link to="/login" className="btn btn-outline">Sign In</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-lg md:hidden hover:bg-slate-100 dark:hover:bg-slate-800">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="py-4 bg-white border-t md:hidden dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="flex flex-col gap-4 px-4">
              <a href="#home" className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Home</a>
              <a href="#features" className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Features</a>
              <a href="#about" className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>About</a>
              <a href="#pricing" className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Pricing</a>
              <a href="#contact" className="py-2 text-slate-600 dark:text-slate-300 hover:text-primary-600" onClick={() => setIsMenuOpen(false)}>Contact</a>
              <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Link to="/login" className="flex-1 text-center btn btn-outline">Sign In</Link>
                <Link to="/register" className="flex-1 text-center btn btn-primary">Get Started</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="px-4 pt-32 pb-20 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
        <div className="container mx-auto">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <Sparkles className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium text-primary-600">Smart Workshop Management</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl text-slate-900 dark:text-white">
                Manage Your Car Repair Workshop
                <span className="gradient-text"> Efficiently</span>
              </h1>
              <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
                CRPMS helps you streamline vehicle repairs, track payments, and generate reports - all in one place.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
                <Link to="/register" className="flex items-center justify-center gap-2 px-8 py-3 text-lg btn btn-primary">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link to="/login" className="px-8 py-3 text-lg btn btn-outline">Live Demo</Link>
              </div>
              <div className="flex items-center justify-center gap-8 mt-8 md:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-slate-600">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-slate-600">14-day free trial</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative p-6 bg-white border shadow-2xl dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="ml-2 text-sm text-slate-500">dashboard.crpms.com</span>
                </div>
                <img 
                  src="https://placehold.co/600x400/0ea5e9/white?text=CRPMS+Dashboard" 
                  alt="Dashboard Preview"
                  className="w-full rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex p-3 mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl text-slate-900 dark:text-white">
              Powerful Features for Your Workshop
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Everything you need to manage your car repair business efficiently
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="transition-all duration-300 card hover:shadow-xl group">
                  <div className="p-3 mb-4 transition-transform bg-primary-100 dark:bg-primary-900/30 rounded-xl w-fit group-hover:scale-110">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white dark:bg-slate-950">
        <div className="container px-4 mx-auto">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <img 
                src="https://placehold.co/500x400/8b5cf6/white?text=About+CRPMS" 
                alt="About CRPMS"
                className="w-full shadow-xl rounded-2xl"
              />
            </div>
            <div>
              <h2 className="mb-4 text-3xl font-bold md:text-4xl text-slate-900 dark:text-white">
                Why Choose CRPMS?
              </h2>
              <p className="mb-6 text-lg text-slate-600 dark:text-slate-400">
                CRPMS is designed specifically for car repair workshops in Rwanda, addressing unique local requirements.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-1 text-green-500" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Rwandan Phone Validation</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Support for MTN, Airtel, and other local carriers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-1 text-green-500" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Local Plate Number Format</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">RAB123C, ABC123D formats supported</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 mt-1 text-green-500" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">RWF Currency Support</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">All prices in Rwandan Francs</p>
                  </div>
                </div>
              </div>
              <Link to="/register" className="inline-flex items-center gap-2 mt-8 btn btn-primary">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/50">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl text-slate-900 dark:text-white">
              What Our Clients Say
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Trusted by workshop owners across Rwanda
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="card">
                <div className="flex items-center gap-4 mb-4">
                  <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full" />
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-400">"{testimonial.content}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white dark:bg-slate-950">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl text-slate-900 dark:text-white">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Choose the plan that works best for your business
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {pricing.map((plan, index) => (
              <div key={index} className={`card relative ${plan.popular ? 'border-primary-500 shadow-xl scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute transform -translate-x-1/2 -top-3 left-1/2">
                    <span className="px-4 py-1 text-sm text-white rounded-full bg-primary-500">Most Popular</span>
                  </div>
                )}
                <div className="mb-6 text-center">
                  <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                    {plan.period && <span className="text-slate-500">{plan.period}</span>}
                  </div>
                </div>
                <div className="mb-6 space-y-3">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
                    </div>
                  ))}
                </div>
                <button className={`w-full ${plan.popular ? 'btn btn-primary' : 'btn btn-outline'}`}>
                  {plan.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Ready to Transform Your Workshop?
          </h2>
          <p className="max-w-2xl mx-auto mb-8 text-xl text-white/90">
            Join hundreds of workshop owners who trust CRPMS for their daily operations
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/register" className="px-8 py-3 text-lg bg-white btn text-primary-600 hover:bg-slate-100">
              Start Free Trial
            </Link>
            <Link to="/contact" className="px-8 py-3 text-lg text-white border-2 border-white btn hover:bg-white/10">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 text-white bg-slate-900">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-8 h-8 text-primary-400" />
                <span className="text-xl font-bold">CRPMS</span>
              </div>
              <p className="mb-4 text-sm text-slate-400">
                Car Repair Management System - Streamlining workshop operations in Rwanda.
              </p>
              <div className="flex gap-4">
                <Facebook className="w-5 h-5 cursor-pointer text-slate-400 hover:text-primary-400" />
                <Twitter className="w-5 h-5 cursor-pointer text-slate-400 hover:text-primary-400" />
                <Linkedin className="w-5 h-5 cursor-pointer text-slate-400 hover:text-primary-400" />
              </div>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#home" className="hover:text-primary-400">Home</a></li>
                <li><a href="#features" className="hover:text-primary-400">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary-400">Pricing</a></li>
                <li><a href="#about" className="hover:text-primary-400">About Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-primary-400">Help Center</a></li>
                <li><a href="#" className="hover:text-primary-400">Documentation</a></li>
                <li><a href="#" className="hover:text-primary-400">API Status</a></li>
                <li><a href="#" className="hover:text-primary-400">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold">Contact Info</h4>
              <ul className="space-y-3 text-slate-400">
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Rubavu District, Rwanda</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">+250 788 123 456</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">info@crpms.rw</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mt-8 text-sm text-center border-t border-slate-800 text-slate-400">
            <p>&copy; 2024 CRPMS - Car Repair Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;