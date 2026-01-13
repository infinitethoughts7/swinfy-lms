'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Award, Sparkles, CheckCircle2, Play, TrendingUp, Zap, Code, Cpu, Brain, LineChart } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Vibrant gradient orbs */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-purple-500/30 to-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-0 left-1/2 w-[600px] h-[600px] bg-gradient-to-t from-indigo-500/30 to-blue-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="pt-20 pb-16 lg:pt-32 lg:pb-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left Column - Text Content */}
              <div className={`relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                {/* Badge */}
                <Badge variant="secondary" className="mb-6 text-sm py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Transform Your Future with AI & Data Science
                  <Zap className="w-4 h-4 ml-1.5" />
                </Badge>

                {/* Heading */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                  <span className="block text-slate-900">
                    Launch Your{' '}
                  </span>
                  <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
                    Tech Career
                  </span>
                  <span className="block text-slate-900">Today</span>
                </h1>

                {/* Subtitle */}
                <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                  Master in-demand skills with industry experts. Get job-ready with hands-on projects,
                  live mentorship, and career support that actually works.
                </p>

                {/* Feature list */}
                <div className="space-y-3 mb-8">
                  {[
                    { text: 'Industry-recognized certifications', icon: Award },
                    { text: 'Live sessions with expert instructors', icon: Users },
                    { text: 'Lifetime access to course materials', icon: BookOpen },
                    { text: 'Join 10,000+ successful students', icon: TrendingUp }
                  ].map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 transition-all duration-500 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                        style={{ transitionDelay: `${300 + idx * 100}ms` }}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-slate-700 font-medium">{feature.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* CTAs */}
                <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:shadow-2xl transition-all group text-base px-8">
                    <Link href="/courses">
                      Get Started Today
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>

                  <Button asChild size="lg" variant="outline" className="border-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50 group text-base px-8">
                    <Link href="/courses">
                      <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                      Explore Courses
                    </Link>
                  </Button>
                </div>

                {/* Stats */}
                <div className={`mt-12 pt-8 border-t border-slate-200 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="grid grid-cols-3 gap-8">
                    <StatItem value="21+" label="Courses" />
                    <StatItem value="19+" label="Expert Instructors" />
                    <StatItem value="10K+" label="Active Students" />
                  </div>
                </div>
              </div>

              {/* Right Column - Visual Dashboard */}
              <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="relative">
                  {/* Main Dashboard Card */}
                  <Card className="overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
                    <div className="space-y-6">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-bold text-xl mb-1">Learning Dashboard</h3>
                          <p className="text-slate-400 text-sm">Your path to success</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center animate-pulse">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Progress Cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <MiniCard
                          icon={Code}
                          title="AI & ML"
                          value="75%"
                          color="from-blue-500 to-cyan-500"
                        />
                        <MiniCard
                          icon={Cpu}
                          title="Data Science"
                          value="60%"
                          color="from-purple-500 to-pink-500"
                        />
                      </div>

                      {/* Chart Visualization */}
                      <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-white text-sm font-medium">Progress Overview</span>
                          <LineChart className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex items-end gap-2 h-32">
                          {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                            <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg relative group cursor-pointer hover:opacity-80 transition-opacity" style={{ height: `${height}%` }}>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                {height}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Active Students */}
                      <div className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                        <div className="flex -space-x-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-800 overflow-hidden bg-slate-700">
                              <Image
                                src={`/assets/students/s${i}.jpg`}
                                alt="Student"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-sm">1000+ Active Students</div>
                          <div className="text-emerald-400 text-xs flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            Live Now
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Floating Achievement Badge */}
                  <Card className="absolute -bottom-6 -left-6 p-4 shadow-2xl border-0 bg-gradient-to-br from-emerald-500 to-green-600 text-white animate-float">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">15+ Years</div>
                        <div className="text-xs opacity-90">Industry Experience</div>
                      </div>
                    </div>
                  </Card>

                  {/* Floating Skill Badge */}
                  <Card className="absolute -top-6 -right-6 p-4 shadow-2xl border-0 bg-gradient-to-br from-blue-600 to-purple-600 text-white animate-float animation-delay-2000">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <Zap className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-bold">Job Ready</div>
                        <div className="text-xs opacity-90">In 12 Weeks</div>
                      </div>
                    </div>
                  </Card>

                  {/* Decorative elements */}
                  <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl" />
                  <div className="absolute -top-8 -left-8 w-32 h-32 bg-gradient-to-br from-blue-400/30 to-cyan-400/30 rounded-full blur-3xl" />
                </div>
              </div>
            </div>
          </div>

          {/* Trust indicators */}
          <div className={`mt-20 transition-all duration-1000 delay-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex flex-col items-center">
              <p className="text-sm text-slate-500 mb-6 font-medium">Trusted by students from</p>
              <div className="flex flex-wrap justify-center items-center gap-8">
                {[
                  { name: 'IITs', color: 'from-blue-600 to-cyan-600' },
                  { name: 'NITs', color: 'from-purple-600 to-pink-600' },
                  { name: 'Top Universities', color: 'from-indigo-600 to-blue-600' }
                ].map((org, i) => (
                  <div key={i} className={`px-6 py-3 rounded-xl bg-gradient-to-r ${org.color} text-white font-bold shadow-lg hover:shadow-xl transition-all cursor-pointer hover:scale-105`}>
                    {org.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Mini Card Component for Dashboard
interface MiniCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  color: string;
}

const MiniCard = ({ icon: Icon, title, value, color }: MiniCardProps) => (
  <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer group">
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div className="text-slate-400 text-xs mb-1">{title}</div>
    <div className="text-white text-2xl font-bold">{value}</div>
  </div>
);

// Stat component
interface StatItemProps {
  value: string;
  label: string;
}

const StatItem = ({ value, label }: StatItemProps) => (
  <div className="text-center">
    <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-1">{value}</div>
    <div className="text-sm text-slate-600">{label}</div>
  </div>
);

export default HeroSection;
