'use client';

import Link from 'next/link';
import { ArrowLeft, FileText, Shield, Users, BookOpen, CreditCard, AlertTriangle, Scale, Mail } from 'lucide-react';

export default function TermsOfServicePage() {
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
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last Updated: {lastUpdated}</p>
        </div>

        {/* Quick Navigation */}
        <div className="bg-blue-50 rounded-xl p-6 mb-10">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { href: '#acceptance', label: 'Acceptance' },
              { href: '#accounts', label: 'User Accounts' },
              { href: '#content', label: 'Content Policy' },
              { href: '#intellectual-property', label: 'IP Rights' },
              { href: '#payments', label: 'Payments' },
              { href: '#prohibited', label: 'Prohibited Use' },
              { href: '#termination', label: 'Termination' },
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

        {/* Terms Content */}
        <div className="prose prose-lg max-w-none">
          {/* Introduction */}
          <section className="mb-10">
            <p className="text-gray-700 leading-relaxed">
              Welcome to <strong>OLLA LMS</strong> (&quot;OLLA&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), 
              an online learning management system operated by Swinfy Technologies. These Terms of Service 
              (&quot;Terms&quot;) govern your access to and use of our website located at{' '}
              <a href="https://olla.co.in" className="text-blue-600 hover:underline">olla.co.in</a>, 
              including any content, functionality, and services offered on or through the platform 
              (collectively, the &quot;Platform&quot;).
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Please read these Terms carefully before using the Platform. By accessing or using OLLA LMS, 
              you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these 
              Terms, you must not access or use the Platform.
            </p>
          </section>

          {/* Section 1: Acceptance of Terms */}
          <section id="acceptance" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">1. Acceptance of Terms</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700 mb-4">
                By creating an account, accessing, or using OLLA LMS, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms. You also represent that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>You are at least 18 years of age, or the age of majority in your jurisdiction</li>
                <li>If you are under 18, you have obtained parental or guardian consent to use the Platform</li>
                <li>You have the legal capacity to enter into a binding agreement</li>
                <li>You are not prohibited from using the Platform under any applicable laws</li>
                <li>All information you provide during registration is accurate and complete</li>
              </ul>
            </div>
          </section>

          {/* Section 2: User Accounts */}
          <section id="accounts" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">2. User Accounts</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.1 Account Types</h3>
                <p className="text-gray-700">OLLA LMS offers the following account types:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li><strong>Learners:</strong> Individual users who access and consume educational content</li>
                  <li><strong>Instructors:</strong> Educators who create and deliver course content</li>
                  <li><strong>Knowledge Partners:</strong> Organizations that provide training programs and manage instructors</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.2 Account Security</h3>
                <p className="text-gray-700">
                  You are responsible for maintaining the confidentiality of your account credentials and for 
                  all activities that occur under your account. You agree to:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>Create a strong, unique password for your account</li>
                  <li>Not share your login credentials with any third party</li>
                  <li>Immediately notify us of any unauthorized access or security breach</li>
                  <li>Log out from your account at the end of each session</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">2.3 Account Information</h3>
                <p className="text-gray-700">
                  You must provide accurate, current, and complete information during registration and keep 
                  your account information updated. We reserve the right to suspend or terminate accounts 
                  with inaccurate or fraudulent information.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Content and Intellectual Property */}
          <section id="content" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">3. Content Policy</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.1 User-Generated Content</h3>
                <p className="text-gray-700">
                  Users may submit, post, or share content on the Platform including but not limited to 
                  course materials, comments, reviews, and profile information. By submitting content, you:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>Grant OLLA LMS a worldwide, non-exclusive, royalty-free license to use, display, and distribute your content</li>
                  <li>Represent that you own or have the rights to share such content</li>
                  <li>Acknowledge that your content may be reviewed and moderated</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.2 Content Standards</h3>
                <p className="text-gray-700">All content must comply with our community guidelines. Content must not:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>Be defamatory, obscene, abusive, or harassing</li>
                  <li>Infringe upon intellectual property rights of others</li>
                  <li>Contain malware, spam, or deceptive content</li>
                  <li>Promote illegal activities or violence</li>
                  <li>Violate the privacy of others</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">3.3 Content Moderation</h3>
                <p className="text-gray-700">
                  We reserve the right to review, modify, or remove any content that violates these Terms 
                  or our community guidelines. We use automated systems and human review to ensure content 
                  quality and compliance.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Intellectual Property Rights */}
          <section id="intellectual-property" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <Scale className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">4. Intellectual Property Rights</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4.1 Platform Ownership</h3>
                <p className="text-gray-700">
                  The OLLA LMS platform, including its design, features, functionality, source code, 
                  trademarks, and branding, are owned by Swinfy Technologies and protected by intellectual 
                  property laws. You may not copy, modify, distribute, or create derivative works without 
                  our express written permission.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4.2 Course Content</h3>
                <p className="text-gray-700">
                  Course content created by instructors and Knowledge Partners remains their intellectual 
                  property. Learners are granted a limited, non-transferable license to access purchased 
                  content for personal, non-commercial use only.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">4.3 Restrictions</h3>
                <p className="text-gray-700">You agree not to:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>Download, copy, or redistribute course content</li>
                  <li>Screen record, capture, or reproduce video lessons</li>
                  <li>Share your account or course access with others</li>
                  <li>Use content for commercial purposes without authorization</li>
                  <li>Remove or alter copyright notices or watermarks</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: Payments and Refunds */}
          <section id="payments" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <CreditCard className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">5. Payments and Refunds</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.1 Pricing</h3>
                <p className="text-gray-700">
                  Course prices are set by instructors and Knowledge Partners and displayed in Indian Rupees (INR). 
                  Prices may be subject to change. Applicable taxes (GST) will be added at checkout.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.2 Payment Methods</h3>
                <p className="text-gray-700">
                  We accept payments through Razorpay, including credit/debit cards, UPI, net banking, 
                  and digital wallets. All transactions are processed securely through our payment partners.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.3 Refund Policy</h3>
                <p className="text-gray-700">
                  Refund eligibility is determined on a case-by-case basis. Generally:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>Refund requests must be made within 7 days of purchase</li>
                  <li>Courses with more than 30% completion are not eligible for refunds</li>
                  <li>Technical issues preventing access may qualify for full refunds</li>
                  <li>Refunds are processed within 5-10 business days</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">5.4 Revenue Sharing</h3>
                <p className="text-gray-700">
                  For instructors and Knowledge Partners, revenue sharing terms are governed by separate 
                  instructor agreements. Platform fees and payment processing charges will be deducted 
                  from course earnings.
                </p>
              </div>
            </div>
          </section>

          {/* Section 6: Prohibited Conduct */}
          <section id="prohibited" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">6. Prohibited Conduct</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700 mb-4">You agree not to engage in any of the following prohibited activities:</p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Violating any applicable laws or regulations</li>
                  <li>Impersonating another person or entity</li>
                  <li>Harassing, threatening, or abusing other users</li>
                  <li>Posting spam, scams, or fraudulent content</li>
                  <li>Attempting to gain unauthorized access to systems</li>
                </ul>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Interfering with the Platform&apos;s operation</li>
                  <li>Using bots, scrapers, or automated tools</li>
                  <li>Circumventing security measures or access controls</li>
                  <li>Uploading viruses or malicious code</li>
                  <li>Engaging in any activity that harms OLLA or its users</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 7: Termination */}
          <section id="termination" className="mb-10 scroll-mt-20">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <Shield className="h-5 w-5 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">7. Termination</h2>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">7.1 Termination by You</h3>
                <p className="text-gray-700">
                  You may terminate your account at any time by contacting our support team. Upon 
                  termination, you will lose access to purchased courses and any content associated 
                  with your account.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">7.2 Termination by Us</h3>
                <p className="text-gray-700">
                  We may suspend or terminate your account immediately, without prior notice, if you:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700">
                  <li>Violate these Terms of Service</li>
                  <li>Engage in fraudulent or illegal activities</li>
                  <li>Fail to pay for services</li>
                  <li>Create risk or legal exposure for OLLA</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">7.3 Effect of Termination</h3>
                <p className="text-gray-700">
                  Upon termination, your license to use the Platform ends immediately. Provisions 
                  relating to intellectual property, limitation of liability, and dispute resolution 
                  survive termination.
                </p>
              </div>
            </div>
          </section>

          {/* Section 8: Disclaimers and Limitations */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Disclaimers and Limitations</h2>
            <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6 space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">8.1 Platform Availability</h3>
                <p className="text-gray-700">
                  The Platform is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind. 
                  We do not guarantee uninterrupted, secure, or error-free operation.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">8.2 Content Accuracy</h3>
                <p className="text-gray-700">
                  While we strive for quality, we do not guarantee the accuracy, completeness, or 
                  usefulness of any course content. Educational outcomes may vary.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">8.3 Limitation of Liability</h3>
                <p className="text-gray-700">
                  To the maximum extent permitted by law, OLLA LMS and its affiliates shall not be 
                  liable for any indirect, incidental, special, consequential, or punitive damages 
                  arising from your use of the Platform.
                </p>
              </div>
            </div>
          </section>

          {/* Section 9: Governing Law */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Governing Law and Disputes</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700 mb-4">
                These Terms shall be governed by and construed in accordance with the laws of India. 
                Any disputes arising from these Terms or your use of the Platform shall be subject to 
                the exclusive jurisdiction of the courts in Bangalore, Karnataka, India.
              </p>
              <p className="text-gray-700">
                Before initiating any legal action, you agree to attempt to resolve disputes through 
                good-faith negotiation by contacting us at{' '}
                <a href="mailto:legal@olla.co.in" className="text-blue-600 hover:underline">
                  legal@olla.co.in
                </a>.
              </p>
            </div>
          </section>

          {/* Section 10: Changes to Terms */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-gray-700">
                We reserve the right to modify these Terms at any time. Changes will be effective 
                immediately upon posting to the Platform. We will notify users of material changes 
                via email or platform notification. Your continued use of the Platform after changes 
                constitutes acceptance of the updated Terms.
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
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="space-y-2">
                <p className="text-gray-700">
                  <strong>OLLA LMS (Swinfy Technologies)</strong>
                </p>
                <p className="text-gray-700">
                  Email:{' '}
                  <a href="mailto:support@olla.co.in" className="text-blue-600 hover:underline">
                    support@olla.co.in
                  </a>
                </p>
                <p className="text-gray-700">
                  Legal Inquiries:{' '}
                  <a href="mailto:legal@olla.co.in" className="text-blue-600 hover:underline">
                    legal@olla.co.in
                  </a>
                </p>
                <p className="text-gray-700">
                  Website:{' '}
                  <a href="https://olla.co.in" className="text-blue-600 hover:underline">
                    olla.co.in
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Links */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
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
