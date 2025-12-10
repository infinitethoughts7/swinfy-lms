'use client';

import Link from 'next/link';
import { ArrowLeft, Shield, Database, Eye, Lock, Bell, Globe, UserCheck, Mail, Cookie } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = 'December 10, 2024';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Shield className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last Updated: {lastUpdated}</p>
        </div>

        {/* Privacy Commitment Banner */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-10 border border-green-200">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Lock className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 mb-2">Our Privacy Commitment</h2>
              <p className="text-gray-700">
                At OLLA LMS, we are committed to protecting your privacy and ensuring the security 
                of your personal information. This Privacy Policy explains how we collect, use, 
                disclose, and safeguard your information when you use our platform.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="bg-blue-50 rounded-xl p-6 mb-10">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '#information-collect', label: 'Information We Collect' },
              { href: '#how-we-use', label: 'How We Use Data' },
              { href: '#data-sharing', label: 'Data Sharing' },
              { href: '#data-security', label: 'Security' },
              { href: '#your-rights', label: 'Your Rights' },
              { href: '#cookies', label: 'Cookies' },
              { href: '#children', label: 'Children\'s Privacy' },
              { href: '#contact', label: 'Contact Us' },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Privacy Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-10">
            <p className="text-gray-700 leading-relaxed">
              This Privacy Policy applies to <strong>OLLA LMS</strong> (&quot;OLLA&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), 
              an online learning management system operated by Swinfy Technologies. This policy describes 
              our practices regarding the collection, use, and disclosure of your personal information when 
              you visit our website at{' '}
              <a href="https://olla.co.in" className="text-blue-600 hover:underline">olla.co.in</a> 
              {' '}and use our services.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              By using OLLA LMS, you consent to the data practices described in this Privacy Policy. 
              If you do not agree with our policies and practices, please do not use our Platform.
            </p>
          </section>

          {/* Section 1: Information We Collect */}
          <section id="information-collect" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">1. Information We Collect</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">1.1 Information You Provide Directly</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Account Information</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                      <li>Full name and display name</li>
                      <li>Email address</li>
                      <li>Phone number</li>
                      <li>Password (encrypted)</li>
                      <li>Profile picture</li>
                      <li>Bio and learning goals</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Knowledge Partner/Instructor Information</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                      <li>Organization name and type</li>
                      <li>Business registration details</li>
                      <li>Professional qualifications</li>
                      <li>Bank account details for payouts</li>
                      <li>Tax identification numbers (PAN, GST)</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Payment Information</h4>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                      <li>Credit/debit card details (processed by Razorpay)</li>
                      <li>UPI IDs and bank account information</li>
                      <li>Billing address</li>
                      <li>Transaction history</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">1.2 Information Collected Automatically</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 text-sm">
                    <li><strong>Device Information:</strong> Device type, operating system, browser type, screen resolution</li>
                    <li><strong>Log Data:</strong> IP address, access times, pages viewed, referring URL</li>
                    <li><strong>Usage Data:</strong> Course progress, quiz scores, time spent on lessons, completion rates</li>
                    <li><strong>Location Data:</strong> Approximate location based on IP address</li>
                    <li><strong>Cookies and Tracking:</strong> Session cookies, preference cookies, analytics data</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">1.3 Information from Third Parties</h3>
                <p className="text-gray-700 text-sm">
                  We may receive information from third-party services such as:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 text-sm">
                  <li>Social login providers (Google, LinkedIn) if you choose to sign in using these services</li>
                  <li>Payment processors (Razorpay) for transaction verification</li>
                  <li>Analytics services for usage insights</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 2: How We Use Your Information */}
          <section id="how-we-use" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">2. How We Use Your Information</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700 mb-4">We use the collected information for the following purposes:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Service Delivery</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                    <li>Creating and managing your account</li>
                    <li>Providing access to courses and content</li>
                    <li>Processing payments and enrollments</li>
                    <li>Tracking learning progress</li>
                    <li>Issuing certificates</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Communication</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                    <li>Sending account notifications</li>
                    <li>Course updates and reminders</li>
                    <li>Responding to support requests</li>
                    <li>Marketing communications (with consent)</li>
                    <li>Important policy updates</li>
                  </ul>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Improvement & Analytics</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                    <li>Analyzing platform usage</li>
                    <li>Improving course recommendations</li>
                    <li>Enhancing user experience</li>
                    <li>Developing new features</li>
                    <li>Conducting research</li>
                  </ul>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Security & Compliance</h4>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
                    <li>Preventing fraud and abuse</li>
                    <li>Content moderation</li>
                    <li>Enforcing terms of service</li>
                    <li>Legal compliance</li>
                    <li>Protecting user safety</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Data Sharing */}
          <section id="data-sharing" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <Globe className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">3. Data Sharing and Disclosure</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <p className="text-gray-700">
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.1 With Service Providers</h3>
                <p className="text-gray-700 text-sm">
                  We share data with trusted third-party service providers who assist us in operating the platform:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 text-sm">
                  <li><strong>Razorpay:</strong> Payment processing</li>
                  <li><strong>Cloud Providers:</strong> Data hosting and storage (AWS, DigitalOcean)</li>
                  <li><strong>Email Services:</strong> Transactional and marketing emails (Resend)</li>
                  <li><strong>Analytics:</strong> Usage analytics and performance monitoring</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.2 With Instructors and Knowledge Partners</h3>
                <p className="text-gray-700 text-sm">
                  When you enroll in a course, the instructor or Knowledge Partner may receive:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 text-sm">
                  <li>Your name and profile information</li>
                  <li>Course progress and completion data</li>
                  <li>Quiz and assignment results</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.3 Legal Requirements</h3>
                <p className="text-gray-700 text-sm">
                  We may disclose your information when required by law, court order, or government request, 
                  or when necessary to protect our rights, property, or safety.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.4 Business Transfers</h3>
                <p className="text-gray-700 text-sm">
                  In the event of a merger, acquisition, or sale of assets, your information may be transferred 
                  as part of the transaction. We will notify you of any such change.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Data Security */}
          <section id="data-security" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Lock className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">4. Data Security</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700 mb-4">
                We implement industry-standard security measures to protect your personal information:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Encryption</h4>
                    <p className="text-gray-700 text-sm">SSL/TLS encryption for data in transit, AES-256 for data at rest</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Access Control</h4>
                    <p className="text-gray-700 text-sm">Role-based access, multi-factor authentication</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Monitoring</h4>
                    <p className="text-gray-700 text-sm">24/7 security monitoring and intrusion detection</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Database className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Backups</h4>
                    <p className="text-gray-700 text-sm">Regular encrypted backups with secure recovery procedures</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-gray-700 text-sm">
                  <strong>Note:</strong> While we implement robust security measures, no method of transmission 
                  over the internet is 100% secure. We cannot guarantee absolute security of your data.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: Your Rights */}
          <section id="your-rights" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                <UserCheck className="h-5 w-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">5. Your Rights and Choices</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <p className="text-gray-700">You have the following rights regarding your personal data:</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Access & Portability</h4>
                  <p className="text-gray-700 text-sm">
                    Request a copy of your personal data in a structured, commonly used format.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Correction</h4>
                  <p className="text-gray-700 text-sm">
                    Update or correct inaccurate personal information through your account settings.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Deletion</h4>
                  <p className="text-gray-700 text-sm">
                    Request deletion of your account and personal data, subject to legal retention requirements.
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Opt-Out</h4>
                  <p className="text-gray-700 text-sm">
                    Unsubscribe from marketing emails and manage notification preferences.
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">How to Exercise Your Rights</h4>
                <p className="text-gray-700 text-sm">
                  To exercise any of these rights, please contact us at{' '}
                  <a href="mailto:privacy@olla.co.in" className="text-blue-600 hover:underline">
                    privacy@olla.co.in
                  </a>
                  . We will respond to your request within 30 days.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Cookies */}
          <section id="cookies" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                <Cookie className="h-5 w-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">6. Cookies and Tracking</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <p className="text-gray-700">
                We use cookies and similar tracking technologies to enhance your experience:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Essential Cookies</h4>
                    <p className="text-gray-700 text-sm">Required for platform functionality, authentication, and security.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Preference Cookies</h4>
                    <p className="text-gray-700 text-sm">Remember your settings, language preferences, and customizations.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium text-gray-900">Analytics Cookies</h4>
                    <p className="text-gray-700 text-sm">Help us understand how users interact with our platform.</p>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 text-sm">
                You can control cookies through your browser settings. Disabling certain cookies may affect 
                platform functionality.
              </p>
            </div>
          </section>

          {/* Section 7: Data Retention */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700 mb-4">We retain your personal information for as long as necessary to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Provide our services and maintain your account</li>
                <li>Comply with legal obligations (tax records, audit requirements)</li>
                <li>Resolve disputes and enforce agreements</li>
                <li>Maintain business records as required by law</li>
              </ul>
              <p className="text-gray-700 mt-4">
                After account deletion, we may retain anonymized data for analytics purposes. 
                Certain information may be retained for legal compliance for up to 7 years.
              </p>
            </div>
          </section>

          {/* Section 8: Children's Privacy */}
          <section id="children" className="mb-10 scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children&apos;s Privacy</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700">
                OLLA LMS is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If we become aware that we have collected 
                personal information from a child under 13, we will take steps to delete such information.
              </p>
              <p className="text-gray-700 mt-4">
                Users between 13-18 years of age must have parental or guardian consent to use the Platform. 
                Parents or guardians may contact us to review, update, or delete their child&apos;s information.
              </p>
            </div>
          </section>

          {/* Section 9: International Transfers */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700">
                Your information may be transferred to and processed in countries other than India where 
                our service providers operate. We ensure appropriate safeguards are in place to protect 
                your data in accordance with this Privacy Policy and applicable laws.
              </p>
            </div>
          </section>

          {/* Section 10: Updates */}
          <section className="mb-10">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <Bell className="h-5 w-5 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">10. Updates to This Policy</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. 
                We encourage you to review this Privacy Policy periodically.
              </p>
              <p className="text-gray-700 mt-4">
                For significant changes, we will provide additional notice via email or platform notification.
              </p>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">11. Contact Us</h2>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>OLLA LMS (Swinfy Technologies)</strong>
                </p>
                <p className="text-gray-700">
                  <strong>Data Protection Officer</strong>
                </p>
                <p className="text-gray-700">
                  Email:{' '}
                  <a href="mailto:privacy@olla.co.in" className="text-blue-600 hover:underline">
                    privacy@olla.co.in
                  </a>
                </p>
                <p className="text-gray-700">
                  General Support:{' '}
                  <a href="mailto:support@olla.co.in" className="text-blue-600 hover:underline">
                    support@olla.co.in
                  </a>
                </p>
                <p className="text-gray-700">
                  Website:{' '}
                  <a href="https://olla.co.in" className="text-blue-600 hover:underline">
                    olla.co.in
                  </a>
                </p>
              </div>
              <div className="mt-4 p-4 bg-white rounded-lg">
                <p className="text-gray-700 text-sm">
                  <strong>Response Time:</strong> We aim to respond to all privacy-related inquiries within 
                  30 days. For urgent matters, please indicate so in your email subject line.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>
            <Link href="/" className="text-blue-600 hover:underline">
              Back to Home
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-4">
            © {new Date().getFullYear()} OLLA LMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
