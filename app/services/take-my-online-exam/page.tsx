import Link from "next/link";
import { ArrowRight, CheckCircle, Award, Users, RefreshCw, Gift, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: BookOpen, title: "Pay For Grades In My Online Exam", desc: "Our service can help you with academic exams through our highly qualified team of subject-matter experts." },
  { icon: Award, title: '"A" Grade Promised', desc: "We stand firm by our commitment to deliver your exam results on time. Our account managers keep you posted throughout." },
  { icon: Users, title: "American Writers", desc: "We have skilled writers — our strict interviewing process gives us the best writers in any niche." },
  { icon: RefreshCw, title: "Free Revisions", desc: "At our writing service we offer revisions at no extra cost, just in case you feel you need some additional information." },
  { icon: CheckCircle, title: "Zero to 1% Chance of Revisions", desc: "We have a very able team who ensure your exam follows all the instructions. We are humans and prone to mistakes, but they are very rare." },
  { icon: Gift, title: "Freebies", desc: "Formatting, the cover page, and the bibliography page are given to you free of charge. You only pay for the content." },
];

export default function TakeMyOnlineExamPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-800 dark:bg-slate-900 text-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Take My Online Exam</h1>
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-slate-300">
            Our &ldquo;Take My Exam&rdquo; Service Shall Help You Achieve&hellip;
          </h2>
          <p className="text-slate-300 mb-4 text-base sm:text-lg font-semibold">
            Improve Your Grades with Our Exam Writing Service.
          </p>
          <p className="text-slate-400 mb-8">
            Stuck with a tough exam and a tight deadline? Our qualified exam experts will log in and complete your online exam, giving you the grade you deserve.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order?service_type=ONLINE_EXAM">
              <Button size="lg" className="gap-2 bg-green-500 hover:bg-green-600 text-white border-0 w-full sm:w-auto">
                Take My Exam <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=12095600466&text=Take%20my%20online%20exam"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="gap-2 border-white text-white hover:bg-white hover:text-slate-800 w-full sm:w-auto">
                Inquire More
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Intro strip */}
      <section className="py-14 sm:py-16 bg-primary/5">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-2xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-heading">100&apos;s of Writers to Cater to Your Exam</h2>
          <p className="text-body">
            We shall write your exam from start to finish, giving you the grade you so desire.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Don&apos;t Have Time? We Can Help.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {features.map((f, i) => (
              <div key={i} className="surface-raised border border-border rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-3">
                <f.icon className="h-8 w-8 text-primary" />
                <h3 className="font-bold text-lg text-heading">{f.title}</h3>
                <p className="text-sm text-body">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 sm:py-20 surface-sunken">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Why Use Our Exam Writing Service?</h2>
          <p className="text-body mb-4">
            At NoveltyScholars, our exam writing service is trusted by thousands of students globally. Whether it&apos;s a timed quiz, a proctored exam, or a take-home test — our experts are ready.
          </p>
          <p className="text-body mb-8">
            We cover all subjects including math, science, nursing, business, law, and more. Simply share your login credentials securely through our platform and we&apos;ll handle the rest.
          </p>
          <div className="text-center">
            <Link href="/order?service_type=ONLINE_EXAM">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Get Started Today <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-14 sm:py-16 bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Ready to Get Your Exam Handled?</h2>
          <p className="mb-6 text-white/80">Contact us now and we&apos;ll assign an expert immediately.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+12095600466">
              <Button variant="secondary" className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">+1 (209) 560-0466</Button>
            </a>
            <a href="mailto:noveltyscholars@gmail.com">
              <Button variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">noveltyscholars@gmail.com</Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
