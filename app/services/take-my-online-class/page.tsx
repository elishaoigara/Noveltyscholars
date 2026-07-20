import Link from "next/link";
import { ArrowRight, CheckCircle, Award, Users, RefreshCw, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: Award, title: '"A" Grade Promised', desc: "We take pride in maintaining a 100% on-time delivery rate. Throughout the process we will keep you posted about the order." },
  { icon: Users, title: "American Writers", desc: "We have skilled writers — our strict interviewing process gives us the best writers in any niche." },
  { icon: RefreshCw, title: "Free Revisions", desc: "At our writing service we offer revisions at no extra cost, just in case you feel you need some additional information or a rewrite." },
  { icon: CheckCircle, title: "Zero to 1% Chance of Revisions", desc: "We have a very able team and writers who ensure your coursework follows all the instructions to the letter." },
  { icon: Gift, title: "Freebies", desc: "Formatting, the cover page, and the bibliography page are given to you free of charge. You only pay for the content." },
  { icon: Award, title: "Pay For Grades", desc: "Our service can help you with academic coursework through our highly qualified team of writers." },
];

export default function TakeMyOnlineClassPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-slate-800 dark:bg-slate-900 text-white py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">Take My Online Class</h1>
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-slate-300">
            I Am In Dilemma With Who To Take My Online Classes
          </h2>
          <p className="text-slate-300 mb-8 text-base sm:text-lg">
            You are not alone in this. We have several students who come to us with the same predicament but we still manage to put a smile on their faces with our quality writing services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order?service_type=ONLINE_CLASS">
              <Button size="lg" className="gap-2 bg-green-500 hover:bg-green-600 text-white border-0 w-full sm:w-auto">
                Take My Class <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <a
              href="https://api.whatsapp.com/send?phone=12095600466&text=Take%20my%20online%20class"
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
          <h2 className="text-xl sm:text-2xl font-bold mb-3 text-heading">100&apos;s of Writers to Cater to Your Class</h2>
          <p className="text-body">
            We shall handle your entire online class, from start to finish, giving you the grade you so desire.
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
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Why Use Our Online Class Service?</h2>
          <p className="text-body mb-4">
            At NoveltyScholars, the &ldquo;Take My Online Class&rdquo; service is among the most vibrant departments with numerous reviews and overwhelming referrals. Our clients come back to us time and again because we deliver results.
          </p>
          <p className="text-body mb-8">
            Whether it&apos;s weekly discussions, quizzes, assignments, or final exams — our writers handle every component of your online course so you can focus on what matters most.
          </p>
          <div className="text-center">
            <Link href="/order?service_type=ONLINE_CLASS">
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
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Ready to Get Your Class Handled?</h2>
          <p className="mb-6 text-white/80">Contact us now and we&apos;ll assign a writer immediately.</p>
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
