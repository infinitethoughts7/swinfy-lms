'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, Users, Award, Play, TrendingUp, Code, Cpu, Brain, Zap, Trophy, Target, Star, CheckCircle, Clock, Flame } from 'lucide-react';
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
        <div className="py-16 lg:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

              {/* Left Column - Text Content */}
              <div className={`relative transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                {/* Badge */}
                <Badge variant="secondary" className="mb-6 text-sm py-2 px-4 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100">
                  <Zap className="w-3.5 h-3.5 mr-1.5" />
                  Transform Your Future with AI & Data Science
                </Badge>

                {/* Heading */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
                  <span className="block text-slate-900">
                    Launch Your{' '}
                  </span>
                  <span className="block text-blue-600">
                    Tech Career
                  </span>
                  <span className="block text-slate-900">Today</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
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
                <div className={`mt-10 pt-8 border-t border-slate-200 transition-all duration-700 delay-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <div className="grid grid-cols-3 gap-8">
                    <StatItem value="21+" label="Courses" />
                    <StatItem value="19+" label="Instructors" />
                    <StatItem value="10K+" label="Students" />
                  </div>
                </div>
              </div>

              {/* Right Column - Compact Dashboard */}
              <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="relative aspect-[4/3]">
                  {/* Main Dashboard Card */}
                  <Card className="overflow-hidden border border-slate-200 shadow-2xl bg-white p-5 h-full flex flex-col">
                    <div className="space-y-4 flex-1 flex flex-col">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-slate-900 font-bold text-lg mb-0.5">Learning Dashboard</h3>
                          <p className="text-slate-500 text-xs">Your path to success</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                      </div>

                      {/* Progress Cards Grid - 2x2 */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <MiniCard
                          icon={Code}
                          title="AI & ML"
                          value="75%"
                          bgColor="from-blue-500 to-blue-600"
                        />
                        <MiniCard
                          icon={Cpu}
                          title="Data Sci"
                          value="60%"
                          bgColor="from-emerald-500 to-emerald-600"
                        />
                        <MiniCard
                          icon={Target}
                          title="Projects"
                          value="12"
                          bgColor="from-orange-500 to-orange-600"
                        />
                        <MiniCard
                          icon={Trophy}
                          title="Certs"
                          value="5"
                          bgColor="from-purple-500 to-purple-600"
                        />
                      </div>

                      {/* Compact Chart */}
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg p-3 border border-slate-200 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-slate-900 text-xs font-semibold">Weekly Progress</span>
                          <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                            <TrendingUp className="w-3 h-3" />
                            +12%
                          </div>
                        </div>
                        <div className="flex items-end justify-between gap-1.5 h-16">
                          {[
                            { height: 40, color: 'bg-blue-500' },
                            { height: 65, color: 'bg-emerald-500' },
                            { height: 45, color: 'bg-blue-500' },
                            { height: 80, color: 'bg-purple-500' },
                            { height: 55, color: 'bg-orange-500' },
                            { height: 90, color: 'bg-emerald-500' },
                            { height: 75, color: 'bg-blue-600' }
                          ].map((bar, i) => (
                            <div key={i} className="flex-1">
                              <div
                                className={`${bar.color} rounded-t transition-all cursor-pointer hover:opacity-80`}
                                style={{ height: `${bar.height}%` }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Stats Row */}
                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-2.5 border border-blue-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3 h-3 text-blue-600" />
                            <span className="text-[10px] text-slate-600 font-medium">Study Time</span>
                          </div>
                          <div className="text-lg font-bold text-slate-900">24h</div>
                        </div>
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-2.5 border border-orange-200">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Flame className="w-3 h-3 text-orange-600" />
                            <span className="text-[10px] text-slate-600 font-medium">Streak</span>
                          </div>
                          <div className="text-lg font-bold text-slate-900">7 Days</div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Floating Achievement Badge */}
                  <Card className="absolute -bottom-3 -left-3 p-2.5 shadow-xl border-0 bg-gradient-to-br from-amber-400 to-orange-500 text-white animate-float">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
                        <Award className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold">15+ Years</div>
                        <div className="text-[8px] opacity-90">Experience</div>
                      </div>
                    </div>
                  </Card>

                  {/* Floating Skill Badge */}
                  <Card className="absolute -top-3 -right-3 p-2.5 shadow-xl border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white animate-float animation-delay-2000">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold">Job Ready</div>
                        <div className="text-[8px] opacity-90">12 Weeks</div>
                      </div>
                    </div>
                  </Card>

                  {/* Rating Badge */}
                  <Card className="absolute top-1/3 -left-2.5 p-2 shadow-lg border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white animate-float animation-delay-4000">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <div className="text-xs font-bold">4.9</div>
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

// Compact Mini Card Component
interface MiniCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  bgColor: string;
}

const MiniCard = ({ icon: Icon, title, value, bgColor }: MiniCardProps) => (
  <div className="bg-white rounded-lg p-2.5 border border-slate-200 hover:shadow-md transition-all cursor-pointer group">
    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${bgColor} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-sm`}>
      <Icon className="w-3.5 h-3.5 text-white" />
    </div>
    <div className="text-slate-500 text-[9px] font-medium mb-0.5">{title}</div>
    <div className="text-slate-900 text-base font-bold">{value}</div>
  </div>
);

// Stat component
interface StatItemProps {
  value: string;
  label: string;
}

const StatItem = ({ value, label }: StatItemProps) => (
  <div className="text-center">
    <div className="text-2xl font-bold text-blue-600 mb-1">{value}</div>
    <div className="text-xs text-slate-600">{label}</div>
  </div>
);

export default HeroSection;
