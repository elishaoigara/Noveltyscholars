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
  { icon: PenTool, title: "Essays", desc: "We provide essays to students at all grade levels on any subject. Each essay is completely original and written according to your specifications." },
  { icon: FileText, title: "Research Papers", desc: "Our highly qualified writers are ready to assist you with any research paper, regardless of difficulty or subject matter." },
  { icon: Briefcase, title: "Resume and CV", desc: "Our writing partners know what it takes to move up the career ladder. They can write or edit a resume or CV that helps get you to the top." },
  { icon: Monitor, title: "Online Classes", desc: "We connect you with a capable expert who handles your entire online course effectively from start to finish." },
  { icon: BookMarked, title: "Scholarship & Admission Essays", desc: "Compelling written products that can get you into a prestigious institution and secure the funds you need to stay there." },
  { icon: GraduationCap, title: "Thesis and Dissertation", desc: "PhD consultants in all fields partner with graduate students to assist them with their capstone projects from start to finish." },
  { icon: FileCheck, title: "Term Papers", desc: "We write custom term papers that impress your instructor with your mastery of the subject matter." },
  { icon: BookOpen, title: "Copy Writing", desc: "Whether you need web content, product descriptions, blog posts, or press releases, count on us for all your business writing needs." },
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
          Expert academic support tailored to your needs — from essays and research papers to full online class and exam assistance.
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
          <h2 className="text-xl sm:text-2xl font-bold">Take My Online Class</h2>
          <p className="text-white/80">Can&apos;t manage work, life, and class at the same time? We connect you with an expert who handles your entire course.</p>
          <Link href="/services/take-my-online-class">
            <Button variant="secondary" className="gap-2 bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">Learn More <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl p-6 sm:p-8 text-white space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Take My Online Exam</h2>
          <p className="text-slate-300">Our exam specialists will complete your online exam on your behalf and aim for the grade you need.</p>
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
