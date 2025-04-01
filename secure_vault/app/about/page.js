"use client"
import { Shield, Users, Award, Briefcase, Zap, Globe, CheckCircle, ThumbsUp, Clock } from "lucide-react";
import Image from 'next/image';
import Link from "next/link";

export default function AboutUs() {
  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Hero Section - More modern with angled divider */}
      <div className="relative bg-gradient-to-br from-blue-700 to-blue-600 dark:from-blue-900 dark:to-blue-800 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl mb-6">
              About Secure Vault
            </h1>
            <div className="h-1 w-24 bg-blue-300 mx-auto mb-6"></div>
            <p className="text-xl text-blue-100">
              Our mission is to provide uncompromising security and privacy for all your sensitive data.
            </p>
          </div>
        </div>

        {/* Diagonal divider */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900" style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%, 0% 100%)" }}></div>
      </div>

      {/* Quick Stats Banner */}
      <div className="bg-gray-50 dark:bg-slate-800 py-8 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">1M+</p>
              <p className="text-gray-600 dark:text-gray-300">Users Protected</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">5,000+</p>
              <p className="text-gray-600 dark:text-gray-300">Businesses</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">150+</p>
              <p className="text-gray-600 dark:text-gray-300">Countries</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">99.99%</p>
              <p className="text-gray-600 dark:text-gray-300">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story Section - Card-based layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 order-2 md:order-1">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-lg z-0"></div>
              <Image 
                src="/api/placeholder/500/400" 
                alt="Secure Vault team" 
                width={500} 
                height={400} 
                className="rounded-lg shadow-xl relative z-10"
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-blue-50 dark:bg-blue-900/50 rounded-lg z-0"></div>
            </div>
          </div>
          
          <div className="md:w-1/2 order-1 md:order-2">
            <div className="flex items-center mb-6">
              <div className="h-1 w-12 bg-blue-500 mr-4"></div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Our Story
              </h2>
            </div>
            
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              <p>
                Secure Vault was founded in 2019 by a team of cybersecurity experts who saw a critical gap in the market: the need for truly secure, private, and user-friendly data storage solutions that put users in control of their data.
              </p>
              <p>
                After years of working in the cybersecurity industry, our founders were frustrated by the false choice users faced between convenience and security. Too many solutions compromised on privacy, had confusing interfaces, or stored encryption keys on their servers – creating potential vulnerabilities.
              </p>
              <p>
                We built Secure Vault on a simple principle: your data should remain your data. Our zero-knowledge architecture ensures that only you can access your information, while our intuitive interface makes security accessible to everyone, not just technical experts.
              </p>
            </div>
            
            <div className="mt-8 flex items-center text-blue-600 dark:text-blue-400">
              <Clock className="w-5 h-5 mr-2" />
              <span>Protecting data since 2019</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Section - New addition */}
      <div className="bg-gray-50 dark:bg-slate-800 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Our Journey
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              The path to becoming a leader in data security
            </p>
          </div>
          
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200 dark:bg-blue-700"></div>
            
            {/* Timeline items */}
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">2019</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">Founded by Emily Chen and Marcus Johnson with seed funding</p>
                </div>
                <div className="bg-blue-500 rounded-full w-6 h-6 z-10 flex-shrink-0"></div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-600 dark:text-gray-300">Initial beta release with zero-knowledge architecture</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0 order-1 md:order-1">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-600 dark:text-gray-300">Secured Series A funding and expanded team to 30 people</p>
                  </div>
                </div>
                <div className="bg-blue-500 rounded-full w-6 h-6 z-10 flex-shrink-0 order-2 md:order-2"></div>
                <div className="md:w-1/2 md:pl-12 order-3 md:order-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">2020</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">Enterprise version launched</p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">2022</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">Reached 500,000 users</p>
                </div>
                <div className="bg-blue-500 rounded-full w-6 h-6 z-10 flex-shrink-0"></div>
                <div className="md:w-1/2 md:pl-12">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-600 dark:text-gray-300">SOC 2 Type II & ISO 27001 Certification</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-1/2 md:pr-12 md:text-right mb-4 md:mb-0 order-1 md:order-1">
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm">
                    <p className="text-gray-600 dark:text-gray-300">Surpassed 1 million users and expanded to 150+ countries</p>
                  </div>
                </div>
                <div className="bg-blue-500 rounded-full w-6 h-6 z-10 flex-shrink-0 order-2 md:order-2"></div>
                <div className="md:w-1/2 md:pl-12 order-3 md:order-3">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Today</h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-2">Global security leader</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Values - Cards with hover effects */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Our Core Values
          </h2>
          <div className="h-1 w-20 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The principles that guide everything we do
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Value 1 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300 hover:border-blue-200 dark:hover:border-blue-800">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full inline-flex mb-4">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Security First</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We never compromise on security. Every decision we make is filtered through the lens of keeping your data protected from all threats.
            </p>
          </div>

          {/* Value 2 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300 hover:border-blue-200 dark:hover:border-blue-800">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full inline-flex mb-4">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">User Privacy</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We believe privacy is a fundamental right. We design our systems so we cannot access your data even if we wanted to.
            </p>
          </div>

          {/* Value 3 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300 hover:border-blue-200 dark:hover:border-blue-800">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full inline-flex mb-4">
              <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Simplicity</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Security should be accessible to everyone. We work tirelessly to make complex security simple and intuitive for all users.
            </p>
          </div>

          {/* Value 4 */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-shadow duration-300 hover:border-blue-200 dark:hover:border-blue-800">
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-full inline-flex mb-4">
              <Award className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-3">Excellence</h3>
            <p className="text-gray-600 dark:text-gray-400">
              We hold ourselves to the highest standards in every aspect of our business, from code quality to customer support.
            </p>
          </div>
        </div>
      </div>

      {/* Our Team - Improved cards with social links */}
      <div className="bg-gray-50 dark:bg-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Meet Our Leadership
            </h2>
            <div className="h-1 w-20 bg-blue-500 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The experts behind Secure Vault
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-sm group">
              <div className="aspect-w-1 aspect-h-1 relative">
                <Image 
                  src="/api/placeholder/400/400" 
                  alt="Emily Chen, CEO" 
                  width={400} 
                  height={400} 
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <p className="font-medium">Former security lead at CloudTech with 15+ years in cybersecurity.</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">Emily Chen</h3>
                <p className="text-blue-600 dark:text-blue-400 mb-2">CEO & Co-Founder</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Emily holds patents in encryption technology and is passionate about making security accessible to everyone.
                </p>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-sm group">
              <div className="aspect-w-1 aspect-h-1 relative">
                <Image 
                  src="/api/placeholder/400/400" 
                  alt="Marcus Johnson, CTO" 
                  width={400} 
                  height={400} 
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <p className="font-medium">Cryptography expert with a PhD from MIT.</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">Marcus Johnson</h3>
                <p className="text-blue-600 dark:text-blue-400 mb-2">CTO & Co-Founder</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Previously led security architecture at DataGuard and contributed to multiple open-source security projects.
                </p>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-lg overflow-hidden shadow-sm group">
              <div className="aspect-w-1 aspect-h-1 relative">
                <Image 
                  src="/api/placeholder/400/400" 
                  alt="Sarah Park, COO" 
                  width={400} 
                  height={400} 
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-4 text-white">
                    <p className="font-medium">Operations expert who scaled three previous tech startups.</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">Sarah Park</h3>
                <p className="text-blue-600 dark:text-blue-400 mb-2">COO</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Sarah brings 12 years of leadership experience in high-growth technology companies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements - Horizontal layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Our Achievements
          </h2>
          <div className="h-1 w-20 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Recognition of our commitment to excellence in security
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-slate-700">
            <div className="p-8 text-center">
              <Award className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                "Best Security Solution"
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Tech Innovation Awards 2024
              </p>
            </div>
            
            <div className="p-8 text-center">
              <ThumbsUp className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                99.99% Uptime
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Since Launch
              </p>
            </div>
            
            <div className="p-8 text-center">
              <Globe className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Global Protection
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                150+ Countries Served
              </p>
            </div>
            
            <div className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Security Certified
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                SOC 2 Type II & ISO 27001
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Improved with wave background */}
      <div className="relative bg-blue-600 dark:bg-blue-800 overflow-hidden">
        {/* Wave Pattern */}
        <div className="absolute top-0 left-0 right-0 h-8 opacity-10">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" fill="white"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="bg-white/10 rounded-2xl backdrop-blur-sm p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              Join Our Team
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
              Help us build the future of secure data storage
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/careers" 
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 shadow-sm transition-colors duration-300"
              >
                <Briefcase className="h-5 w-5 mr-2" />
                View Open Positions
              </Link>
              
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 border border-white text-base font-medium rounded-lg text-white hover:bg-white/10 transition-colors duration-300"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}