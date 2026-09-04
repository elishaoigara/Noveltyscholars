import Link from "next/link";
import {
  ArrowRight, BookOpen, FileText, GraduationCap,
  Monitor, Briefcase, BookMarked, PenTool, FileCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { ServicesGrid } from "@/components/ServicesGrid";
import type { Service } from "@/lib/types";

const servicesList = [
  { icon: PenTool, title: "Essay Coaching", desc: "Structure, argument and draft feedback that preserves your ideas and voice." },
  { icon: FileText, title: "Research Guidance", desc: "Source evaluation, outline planning and editorial support for research papers." },
  { icon: Briefcase, title: "CV & Resume Editing", desc: "Clear, role-focused feedback for UK CVs and US resumes." },
  { icon: Monitor, title: "Online Tutoring", desc: "Live concept review and study planning without sharing account access." },
  { icon: BookMarked, title: "Application Review", desc: "Voice-preserving feedback for UCAS and US college personal statements." },
  { icon: GraduationCap, title: "Thesis Guidance", desc: "Milestone support for proposals, methods, literature reviews and editing." },
  { icon: FileCheck, title: "Proofreading", desc: "Language, clarity, citation and consistency checks for your completed draft." },
  { icon: BookOpen, title: "Citation Support", desc: "APA, MLA, Chicago, Harvard and OSCOLA reference checks." },
];

export default async function ServicesPage() {
  const supabase = await createClient();
  const { data: services } = await supabase.from("services").select("*").order("created_at", { ascending: true });
  const servicesData: Service[] = (services || []).map((s) => ({ ...s, features: Array.isArray(s.features) ? s.features : [] }));

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 max-w-6xl">
      <div className="text-center mb-10 sm:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h1>
        <p className="text-base sm:text-lg text-body max-w-2xl mx-auto">
          Ethical academic support tailored to UK and US conventions—from focused editing to live tutoring and exam preparation.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
        {servicesList.map((s, i) => (
          <div key={i} className="surface-raised border border-border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <s.icon className="h-8 w-8 text-primary" />
            <h3 className="font-bold text-lg text-heading">{s.title}</h3>
            <p className="text-sm text-body">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-12 sm:mb-16">
        <div className="bg-primary rounded-2xl p-6 sm:p-8 text-white space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Online Tutoring</h2>
          <p className="text-white/80">Work through difficult concepts, drafts and study plans with focused one-to-one support.</p>
          <Link href="/services/take-my-online-class">
            <Button variant="secondary" className="gap-2 bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">Learn More <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl p-6 sm:p-8 text-white space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Exam Preparation</h2>
          <p className="text-slate-300">Build a revision plan, practise question strategy and close knowledge gaps before the assessment.</p>
          <Link href="/services/take-my-online-exam">
            <Button variant="outline" className="gap-2 border-white text-white hover:bg-white hover:text-slate-800 w-full sm:w-auto">Learn More <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
      </div>

      {servicesData.length > 0 && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center">Order a Service Now</h2>
          <ServicesGrid services={servicesData} />
        </div>
      )}
    </div>
  );
}
