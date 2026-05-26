import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Wrench, CreditCard, FileText, LogIn, UserPlus, CheckCircle, ArrowRight } from 'lucide-react';

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
            </div>

            {/* Nav Links */}
            <div className="hidden gap-6 md:flex">
              <a href="#home" className="text-slate-600 dark:text-slate-300 hover:text-primary-600">Home</a>
              <a href="#features" className="text-slate-600 dark:text-slate-300 hover:text-primary-600">Features</a>
              <a href="#how-it-works" className="text-slate-600 dark:text-slate-300 hover:text-primary-600">How It Works</a>
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
            <span className="text-sm font-medium text-primary-600">Smart Workshop Management</span>
          </div>
          <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl text-slate-900 dark:text-white">
            Manage Your Car Repair Workshop
            <span className="text-primary-600"> Effortlessly</span>
          </h1>
          <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
            CRPMS helps you track cars, services, payments, and generate reports - all in one place.
            No more paper records or manual calculations.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/register" className="flex items-center justify-center gap-2 px-8 py-3 text-lg btn btn-primary">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="px-8 py-3 text-lg btn btn-outline">Login to Dashboard</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white dark:bg-slate-900">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">What Can CRPMS Do?</h2>
            <p className="text-slate-600 dark:text-slate-400">Everything you need to run your car repair workshop</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="text-center transition-shadow card hover:shadow-lg">
              <div className="p-3 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl w-fit">
                <Car className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Manage Cars</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Add, edit, and track all vehicles with plate numbers, models, and owner details
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center transition-shadow card hover:shadow-lg">
              <div className="p-3 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl w-fit">
                <Wrench className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Manage Services</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Define service types and prices (Oil Change, Brake Repair, etc.)
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center transition-shadow card hover:shadow-lg">
              <div className="p-3 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl w-fit">
                <CreditCard className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Track Payments</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Record payments, track pending balances, and see daily revenue
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center transition-shadow card hover:shadow-lg">
              <div className="p-3 mx-auto mb-4 bg-primary-100 dark:bg-primary-900/30 rounded-xl w-fit">
                <FileText className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Generate Reports</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Export service bills and payment reports as PDF or Excel
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mx-auto mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">How It Works</h2>
            <p className="text-slate-600 dark:text-slate-400">Simple 4-step process to manage your workshop</p>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="mb-2 font-semibold">Add Car</h3>
              <p className="text-sm text-slate-600">Register car with plate number and owner phone</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="mb-2 font-semibold">Record Service</h3>
              <p className="text-sm text-slate-600">Select service type and record amount paid</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="mb-2 font-semibold">Track Payment</h3>
              <p className="text-sm text-slate-600">Payment status updates automatically</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30">
                <span className="text-2xl font-bold text-primary-600">4</span>
              </div>
              <h3 className="mb-2 font-semibold">Generate Report</h3>
              <p className="text-sm text-slate-600">Export reports for your records</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose CRPMS */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="container px-4 mx-auto">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">Why Choose CRPMS?</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Rwandan phone number support (078, 079, 072, +250)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Local plate number format (RAB123C, ABC123D)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Prices in Rwandan Francs (RWF)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Secure login with encrypted passwords</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span>Export reports to PDF, Excel, and CSV</span>
                </div>
              </div>
              <Link to="/register" className="inline-flex items-center gap-2 mt-8 btn btn-primary">
                Start Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="p-8 text-center text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl">
              <p className="mb-2 text-4xl font-bold">98%</p>
              <p className="mb-4">Customer Satisfaction</p>
              <p className="mb-2 text-2xl font-bold">500+</p>
              <p>Cars Serviced</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="max-w-2xl mx-auto mb-8 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">Simple Dashboard</h2>
            <p className="text-slate-600 dark:text-slate-400">See all your workshop data at a glance</p>
          </div>
          <div className="max-w-4xl mx-auto card">
            <div className="p-4 rounded-lg bg-slate-100 dark:bg-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-2 text-sm text-slate-500">crpms.dashboard</span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4 md:grid-cols-4">
                <div className="p-3 text-center bg-white rounded-lg dark:bg-slate-900">
                  <p className="text-2xl font-bold text-primary-600">0</p>
                  <p className="text-xs">Cars Today</p>
                </div>
                <div className="p-3 text-center bg-white rounded-lg dark:bg-slate-900">
                  <p className="text-2xl font-bold text-yellow-600">0</p>
                  <p className="text-xs">Pending</p>
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
                <p className="text-center text-slate-500">📊 Charts will appear here after adding data</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="container px-4 mx-auto text-center">
          <h2 className="mb-4 text-3xl font-bold text-white">Ready to Get Started?</h2>
          <p className="max-w-2xl mx-auto mb-8 text-white/90">
            Join workshop owners using CRPMS to manage their car repair services efficiently
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/register" className="px-8 py-3 bg-white btn text-primary-600 hover:bg-slate-100">
              Create Free Account
            </Link>
            <Link to="/login" className="px-8 py-3 text-white border-2 border-white btn hover:bg-white/10">
              Login to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-white bg-slate-900">
        <div className="container px-4 mx-auto text-center">
          <p>&copy; 2024 CRPMS - Car Repair Management System. All rights reserved.</p>
          <p className="mt-2 text-sm text-slate-400">Rubavu District, Western Province, Rwanda</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;