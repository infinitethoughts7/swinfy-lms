'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Award, Play, TrendingUp, Code, Cpu, Brain, LineChart, Zap, Trophy, Target, Star, CheckCircle, Clock, Flame } from 'lucide-react';
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
    <section className="relative overflow-hidden bg-white">
      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Subtle gradient orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-40" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-50 rounded-full blur-3xl opacity-50" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="min-h-[90vh] flex items-center py-12 lg:py-16">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left Column - Text Content */}
              <div className={`relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                {/* Badge */}
                <Badge variant="secondary" className="mb-6 text-sm py-2 px-4 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100">
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Transform Your Future with AI & Data Science
                </Badge>

                {/* Heading */}
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                  <span className="block text-slate-900">
                    Launch Your{' '}
                  </span>
                  <span className="block text-blue-600">
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
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 border border-blue-100">
                          <Icon className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-slate-700 font-medium">{feature.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* CTAs */}
                <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all group text-base px-8">
                    <Link href="/courses">
                      Get Started Today
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>

                  <Button asChild size="lg" variant="outline" className="border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 group text-base px-8">
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

              {/* Right Column - Enhanced Visual Dashboard */}
              <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="relative">
                  {/* Main Dashboard Card */}
                  <Card className="overflow-hidden border border-slate-200 shadow-2xl bg-white p-6">
                    <div className="space-y-5">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-slate-900 font-bold text-xl mb-1">Learning Dashboard</h3>
                          <p className="text-slate-500 text-sm">Your path to success</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                      </div>

                      {/* Progress Cards Grid */}
                      <div className="grid grid-cols-2 gap-3">
                        <MiniCard
                          icon={Code}
                          title="AI & ML"
                          value="75%"
                          bgColor="from-blue-500 to-blue-600"
                          iconBg="bg-blue-100"
                        />
                        <MiniCard
                          icon={Cpu}
                          title="Data Science"
                          value="60%"
                          bgColor="from-emerald-500 to-emerald-600"
                          iconBg="bg-emerald-100"
                        />
                        <MiniCard
                          icon={Target}
                          title="Projects"
                          value="12"
                          bgColor="from-orange-500 to-orange-600"
                          iconBg="bg-orange-100"
                        />
                        <MiniCard
                          icon={Trophy}
                          title="Certificates"
                          value="5"
                          bgColor="from-purple-500 to-purple-600"
                          iconBg="bg-purple-100"
                        />
                      </div>

                      {/* Chart Visualization */}
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-slate-900 text-sm font-semibold">Weekly Progress</span>
                            <p className="text-xs text-slate-500 mt-0.5">Last 7 days</p>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-600 text-sm font-semibold">
                            <TrendingUp className="w-4 h-4" />
                            +12%
                          </div>
                        </div>
                        <div className="flex items-end justify-between gap-2 h-28">
                          {[
                            { height: 40, color: 'bg-blue-500' },
                            { height: 65, color: 'bg-emerald-500' },
                            { height: 45, color: 'bg-blue-500' },
                            { height: 80, color: 'bg-purple-500' },
                            { height: 55, color: 'bg-orange-500' },
                            { height: 90, color: 'bg-emerald-500' },
                            { height: 75, color: 'bg-blue-600' }
                          ].map((bar, i) => (
                            <div key={i} className="flex-1 group relative">
                              <div
                                className={`${bar.color} rounded-t-lg transition-all cursor-pointer hover:opacity-80 shadow-sm`}
                                style={{ height: `${bar.height}%` }}
                              >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                                  {bar.height}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between mt-3 text-xs text-slate-400">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                            <span key={i} className="flex-1 text-center">{day}</span>
                          ))}
                        </div>
                      </div>

                      {/* Active Learning Stats */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-slate-600 font-medium">Study Time</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">24h</div>
                          <div className="text-xs text-slate-500">This week</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-3 border border-orange-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Flame className="w-4 h-4 text-orange-600" />
                            <span className="text-xs text-slate-600 font-medium">Streak</span>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">7 Days</div>
                          <div className="text-xs text-slate-500">Keep it up!</div>
                        </div>
                      </div>

                      {/* Active Students */}
                      <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-200">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="w-9 h-9 rounded-full border-2 border-white overflow-hidden bg-slate-200 ring-1 ring-emerald-200">
                                <Image
                                  src={`/assets/students/s${i}.jpg`}
                                  alt="Student"
                                  width={36}
                                  height={36}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            <div className="w-9 h-9 rounded-full border-2 border-white bg-emerald-600 flex items-center justify-center text-white text-xs font-bold ring-1 ring-emerald-200">
                              1K+
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-900 font-semibold text-sm">Active Students</div>
                            <div className="text-emerald-600 text-xs flex items-center gap-1 font-medium">
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                              Live Now
                            </div>
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                  </Card>

                  {/* Floating Achievement Badge */}
                  <Card className="absolute -bottom-4 -left-4 p-3 shadow-xl border-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white animate-float">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">15+ Years</div>
                        <div className="text-[10px] opacity-90">Experience</div>
                      </div>
                    </div>
                  </Card>

                  {/* Floating Skill Badge */}
                  <Card className="absolute -top-4 -right-4 p-3 shadow-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white animate-float animation-delay-2000">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Job Ready</div>
                        <div className="text-[10px] opacity-90">12 Weeks</div>
                      </div>
                    </div>
                  </Card>

                  {/* Rating Badge */}
                  <Card className="absolute top-1/3 -left-3 p-2.5 shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white animate-float animation-delay-4000">
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-white" />
                      <div className="text-sm font-bold">4.9</div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Enhanced Mini Card Component
interface MiniCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  bgColor: string;
  iconBg: string;
}

const MiniCard = ({ icon: Icon, title, value, bgColor, iconBg }: MiniCardProps) => (
  <div className="bg-white rounded-xl p-3 border border-slate-200 hover:shadow-md transition-all cursor-pointer group">
    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${bgColor} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-sm`}>
      <Icon className="w-4 h-4 text-white" />
    </div>
    <div className="text-slate-500 text-[10px] font-medium mb-0.5">{title}</div>
    <div className="text-slate-900 text-xl font-bold">{value}</div>
  </div>
);

// Stat component
interface StatItemProps {
  value: string;
  label: string;
}

const StatItem = ({ value, label }: StatItemProps) => (
  <div className="text-center">
    <div className="text-3xl font-bold text-blue-600 mb-1">{value}</div>
    <div className="text-sm text-slate-600">{label}</div>
  </div>
);

export default HeroSection;
