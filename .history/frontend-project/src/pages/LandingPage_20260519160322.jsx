import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Wrench, CreditCard, FileText, LogIn, UserPlus, CheckCircle, ArrowRight, MapPin, Phone, Mail, Clock, Shield, Zap, Target, Award } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-900 dark:to-slate-950">
      
      {/* Navigation Bar */}
      <nav className="sticky top-0 z-50 shadow-sm bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">CRPMS</span>
              <span className="px-2 py-1 text-xs rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600">SmartPark</span>
            </div>

            {/* Nav Links */}
            <div className="hidden gap-6 md:flex">
              <a href="#home" className="text-slate-600 dark:text-slate-300 hover:text-primary-600">Home</a>
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-primary-600">Features</a>
              <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-primary-600">How It Works</a>
              <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-primary-600">About SmartPark</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex gap-3">
              <Link to="/login" className="flex items-center gap-2 btn btn-outline">
                <LogIn className="w-4 h-4" /> Login
              </Link>
              <Link to="/register" className="flex items-center gap-2 btn btn-primary">
                <UserPlus className="w-4 h-4" /> Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="container px-4 py-16 mx-auto md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-primary-100 dark:bg-primary-900/30">
            <MapPin className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-medium text-primary-600">Rubavu District, Western Province, Rwanda</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl text-slate-900 dark:text-white">
            SmartPark Car Repair 
            <span className="text-primary-600"> Management System</span>
          </h1>
          <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
            SmartPark is a leading car repair workshop in Rubavu District, Western Province of Rwanda.
            CRPMS helps us digitize our workshop operations - from vehicle registration to payment tracking.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/register" className="flex items-center justify-center gap-2 px-8 py-3 text-lg btn btn-primary">
              Start Digital Transformation <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="px-8 py-3 text-lg btn btn-outline">Access Dashboard</Link>
          </div>
        </div>
      </section>

      {/* Problem & Solution Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 md:grid-cols-2">
            <div className="border-red-200 card bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <h3 className="mb-4 text-xl font-bold text-red-700 dark:text-red-400">❌ Before CRPMS (Paper System)</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-red-600 dark:text-red-400">• Time-consuming manual recording</li>
                <li className="flex items-center gap-2 text-red-600 dark:text-red-400">• Lost or damaged paper records</li>
                <li className="flex items-center gap-2 text-red-600 dark:text-red-400">• Difficult to track service history</li>
                <li className="flex items-center gap-2 text-red-600 dark:text-red-400">• Error-prone payment calculations</li>
                <li className="flex items-center gap-2 text-red-600 dark:text-red-400">• Hard to generate daily reports</li>
              </ul>
            </div>
            <div className="border-green-200 card bg-green-50 dark:bg-green-900/20 dark:border-green-800">
              <h3 className="mb-4 text-xl font-bold text-green-700 dark:text-green-400">✅ After CRPMS (Digital System)</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-green-600 dark:text-green-400">• Quick digital recording</li>
                <li className="flex items-center gap-2 text-green-600 dark:text-green-400">• Secure cloud storage</li>
                <li className="flex items-center gap-2 text-green-600 dark:text-green-400">• Easy car service history lookup</li>
                <li className="flex items-center gap-2 text-green-600 dark:text-green-400">• Automatic payment tracking</li>
                <li className="flex items-center gap-2 text-green-600 dark:text-green-400">• One-click report generation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">SmartPark Features</h2>
            <p className="text-slate-600 dark:text-slate-400">Designed specifically for Rwandan car repair workshops</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="transition-shadow card hover:shadow-lg">
              <div className="p-3 mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl w-fit">
                <Car className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Vehicle Registration</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Register cars with Rwandan plate numbers (RAB123C, ABC123D) and driver details
              </p>
            </div>

            {/* Feature 2 */}
            <div className="transition-shadow card hover:shadow-lg">
              <div className="p-3 mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl w-fit">
                <Phone className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Rwandan Phone Support</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Validates MTN, Airtel numbers: 078XXXXXXX, 079XXXXXXX, 072XXXXXXX, +250 format
              </p>
            </div>

            {/* Feature 3 */}
            <div className="transition-shadow card hover:shadow-lg">
              <div className="p-3 mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl w-fit">
                <CreditCard className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">RWF Payment Tracking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                All prices in Rwandan Francs (RWF). Track paid, partial, and unpaid payments
              </p>
            </div>

            {/* Feature 4 */}
            <div className="transition-shadow card hover:shadow-lg">
              <div className="p-3 mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl w-fit">
                <Wrench className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Service Management</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Define service types: Oil Change, Brake Repair, Engine Diagnostics, etc.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="transition-shadow card hover:shadow-lg">
              <div className="p-3 mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl w-fit">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Secure Authentication</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Password-protected access with encrypted passwords and session management
              </p>
            </div>

            {/* Feature 6 */}
            <div className="transition-shadow card hover:shadow-lg">
              <div className="p-3 mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl w-fit">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Report Generation</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Export Service Bills and Daily Payment Reports to PDF, Excel, CSV
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 bg-white dark:bg-slate-900">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">How SmartPark Uses CRPMS</h2>
            <p className="text-slate-600 dark:text-slate-400">Simple workflow for daily workshop operations</p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="mb-2 font-semibold">Customer Arrives</h3>
              <p className="text-sm text-slate-600">Driver brings car to SmartPark workshop</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="mb-2 font-semibold">Register Car</h3>
              <p className="text-sm text-slate-600">Manager records car details and assigns mechanic</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="mb-2 font-semibold">Record Service</h3>
              <p className="text-sm text-slate-600">Log service performed and amount paid</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <span className="text-2xl font-bold text-primary-600">4</span>
              </div>
              <h3 className="mb-2 font-semibold">Generate Report</h3>
              <p className="text-sm text-slate-600">Print service bill or daily payment report</p>
            </div>
          </div>
        </div>
      </section>

      {/* About SmartPark Section */}
      <section id="about" className="py-16">
        <div className="container px-4 mx-auto">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">About SmartPark</h2>
              <p className="mb-4 text-slate-600 dark:text-slate-400">
                SmartPark is a leading car repair and maintenance workshop located in <strong>Rubavu District, Western Province of Rwanda</strong>.
              </p>
              <p className="mb-6 text-slate-600 dark:text-slate-400">
                We provide multiple car-related services including vehicle repair, maintenance, and diagnostics.
                With CRPMS, we've transformed our manual paper-based system into an efficient digital solution.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4 text-primary-600" />
                  <span>Rubavu District, Western Province, Rwanda</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-4 h-4 text-primary-600" />
                  <span>+250 788 123 456</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Clock className="w-4 h-4 text-primary-600" />
                  <span>Monday - Saturday: 8:00 AM - 6:00 PM</span>
                </div>
              </div>
            </div>
            <div className="p-8 text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl">
              <div className="text-center">
                <Award className="w-16 h-16 mx-auto mb-4 text-white/80" />
                <p className="mb-2 text-3xl font-bold">Trusted Workshop</p>
                <p className="mb-4">in Rubavu District</p>
                <hr className="my-4 border-white/30" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold">500+</p>
                    <p className="text-sm">Cars Serviced</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">98%</p>
                    <p className="text-sm">Satisfaction</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">50+</p>
                    <p className="text-sm">Services Offered</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">24/7</p>
                    <p className="text-sm">Support</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose CRPMS - Updated with REAL Rwandan Context */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">Why SmartPark Chose CRPMS</h2>
            <p className="text-slate-600 dark:text-slate-400">Built specifically for Rwandan car repair workshops</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Rwandan Phone Number Support</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Validates MTN Rwanda (0788), Airtel Rwanda (0798), and other local carriers.
                    Supports formats: 078XXXXXXX, 079XXXXXXX, 072XXXXXXX, +250XXXXXXXXX
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Local Plate Number Format</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Supports Rwanda vehicle registration plates: RAB123C (new format with 'R'),
                    ABC123D (standard format), and RAB 123C (with space)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Prices in Rwandan Francs (RWF)</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    All service prices and payments are displayed in Rwandan Francs (RWF)
                    with proper currency formatting for local business needs.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Secure Login & Data Protection</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Session-based authentication with encrypted passwords (bcrypt).
                    Only authorized SmartPark managers can access the system.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Export Reports (PDF, Excel, CSV)</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Generate Service Bills for customers and Daily Payment Reports for management.
                    Export in multiple formats for record keeping and accounting.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">Car Service History Tracking</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Easily view complete service history for any registered vehicle.
                    Know when each car was serviced and what was done.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">SmartPark Dashboard</h2>
            <p className="text-slate-600 dark:text-slate-400">See all workshop operations at a glance</p>
          </div>
          <div className="max-w-4xl mx-auto card">
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-2 text-sm text-slate-500">SmartPark Workshop Dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
                <div className="p-3 text-center bg-white rounded-lg dark:bg-slate-900">
                  <p className="text-2xl font-bold text-primary-600">0</p>
                  <p className="text-xs">Cars Today</p>
                </div>
                <div className="p-3 text-center bg-white rounded-lg dark:bg-slate-900">
                  <p className="text-2xl font-bold text-yellow-600">0</p>
                  <p className="text-xs">Pending Payments</p>
                </div>
                <div className="p-3 text-center bg-white rounded-lg dark:bg-slate-900">
                  <p className="text-2xl font-bold text-green-600">0 RWF</p>
                  <p className="text-xs">Today's Revenue</p>
                </div>
                <div className="p-3 text-center bg-white rounded-lg dark:bg-slate-900">
                  <p className="text-2xl font-bold text-red-600">0 RWF</p>
                  <p className="text-xs">Pending Amount</p>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg dark:bg-slate-900">
                <p className="text-center text-slate-500">📊 Revenue charts and service analytics will appear here</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Transform Your Workshop Today</h2>
          <p className="max-w-2xl mx-auto mb-8 text-white/90">
            Join SmartPark in Rubavu District and modernize your car repair workshop operations
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/register" className="px-8 py-3 bg-white btn text-primary-600 hover:bg-slate-100">
              Create SmartPark Account
            </Link>
            <Link to="/login" className="px-8 py-3 text-white border-2 border-white btn hover:bg-white/10">
              Access Workshop Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-white bg-slate-900">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 text-center md:grid-cols-3 md:text-left">
            <div>
              <div className="flex items-center justify-center gap-2 mb-4 md:justify-start">
                <Wrench className="w-6 h-6 text-primary-400" />
                <span className="text-lg font-bold">SmartPark</span>
              </div>
              <p className="text-sm text-slate-400">
                Car Repair & Maintenance Workshop<br />
                Rubavu District, Western Province, Rwanda
              </p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Contact Info</h4>
              <p className="text-sm text-slate-400">📞 +250 788 123 456</p>
              <p className="text-sm text-slate-400">✉️ smartpark@crpms.rw</p>
              <p className="text-sm text-slate-400">🕐 Mon-Sat: 8AM - 6PM</p>
            </div>
            <div>
              <h4 className="mb-3 font-semibold">Quick Links</h4>
              <p className="text-sm text-slate-400">© 2024 SmartPark - CRPMS</p>
              <p className="text-sm text-slate-400">All rights reserved</p>
            </div>
          </div>
          <div className="pt-8 mt-8 text-sm text-center border-t border-slate-800 text-slate-500">
            <p>SmartPark Car Repair Management System - Digitizing Rwanda's Automotive Industry</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;