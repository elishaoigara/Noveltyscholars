import Link from "next/link";
import { ArrowRight, Star, Shield, Clock, Users, ChevronDown } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ServicesGrid } from "@/components/ServicesGrid";
import { PricingCalculator } from "@/components/PricingCalculator";
import type { Service } from "@/lib/types";

export default async function HomePage() {
  const supabase = await createClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: true });

  const servicesData: Service[] = (services || []).map((s) => ({
    ...s,
    features: Array.isArray(s.features) ? s.features : [],
  }));

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 via-white to-white py-20 lg:py-28">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
              <Star className="h-4 w-4 fill-primary" />
              Trusted by 10,000+ students worldwide
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              We Get Your Academic Work Done &mdash;{" "}
              <span className="text-primary">Plagiarism Free, On Time</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Professional academic writing services for essays, research papers,
              dissertations, and more. High-quality work delivered on your deadline.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/order">
                <Button size="lg" className="text-base gap-2">
                  Order Now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-base">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12 border-y">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <Shield className="h-6 w-6 text-primary mx-auto" />
              <p className="font-semibold text-sm">Plagiarism-Free</p>
              <p className="text-xs text-muted-foreground">100% original work</p>
            </div>
            <div className="space-y-1">
              <Clock className="h-6 w-6 text-primary mx-auto" />
              <p className="font-semibold text-sm">On-Time Delivery</p>
              <p className="text-xs text-muted-foreground">Always meet deadlines</p>
            </div>
            <div className="space-y-1">
              <Users className="h-6 w-6 text-primary mx-auto" />
              <p className="font-semibold text-sm">Expert Writers</p>
              <p className="text-xs text-muted-foreground">Qualified professionals</p>
            </div>
            <div className="space-y-1">
              <Star className="h-6 w-6 text-primary mx-auto" />
              <p className="font-semibold text-sm">24/7 Support</p>
              <p className="text-xs text-muted-foreground">Always here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Get your academic work done in three simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-2xl">
                1
              </div>
              <h3 className="font-semibold text-lg">Place Your Order</h3>
              <p className="text-sm text-gray-600">
                Fill out our simple order form with your requirements, upload reference
                materials, and get an instant price quote.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-2xl">
                2
              </div>
              <h3 className="font-semibold text-lg">Make Payment</h3>
              <p className="text-sm text-gray-600">
                Securely pay for your order. We assign a qualified writer to start
                working on your paper immediately.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-2xl">
                3
              </div>
              <h3 className="font-semibold text-lg">Get Your Work</h3>
              <p className="text-sm text-gray-600">
                Receive your completed paper before the deadline. Request revisions
                until you&apos;re completely satisfied.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Services</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Choose from our range of professional academic writing services
            </p>
          </div>
          <ServicesGrid services={servicesData} />
        </div>
      </section>

      {/* Live Pricing Calculator */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Calculate Your Price</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Get an instant estimate for your order. The price adjusts based on deadline
              and academic level.
            </p>
          </div>
          <PricingCalculator services={servicesData} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Thousands of students trust NoveltyScholars for their academic needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                name: "Sarah M.",
                role: "Masters Student",
                text: "I was struggling with my dissertation deadline. NoveltyScholars delivered a well-researched paper in just 4 days. Absolutely amazing service!",
              },
              {
                name: "James K.",
                role: "Undergraduate",
                text: "The quality of the essay exceeded my expectations. Plagiarism-free and exactly what I needed. Will definitely use again.",
              },
              {
                name: "Priya R.",
                role: "PhD Candidate",
                text: "Their PhD-level writers are exceptional. The research methodology section was particularly well done. Highly recommended.",
              },
            ].map((t, i) => (
              <div key={i} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Is the work plagiarism-free?",
                a: "Yes! Every paper is written from scratch and checked through plagiarism detection software before delivery.",
              },
              {
                q: "Can I communicate with my writer?",
                a: "Absolutely. Our platform includes a real-time chat system so you can communicate directly with your assigned writer.",
              },
              {
                q: "What if I need revisions?",
                a: "We offer free revisions. You can request a revision through your dashboard and your writer will make the necessary changes.",
              },
              {
                q: "Is my information kept private?",
                a: "Yes, we take privacy seriously. Your personal information and order details are never shared with third parties.",
              },
              {
                q: "What subjects do you cover?",
                a: "We cover a wide range of subjects including business, nursing, law, engineering, computer science, literature, and many more.",
              },
            ].map((faq, i) => (
              <details key={i} className="group bg-white border rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer font-medium">
                  {faq.q}
                  <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary rounded-3xl p-10 md:p-16 text-center text-white max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Get Your Work Done?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
              Place your order today and let our expert writers help you achieve
              academic success.
            </p>
            <Link href="/order">
              <Button size="lg" variant="secondary" className="text-base gap-2 bg-white text-primary hover:bg-gray-100">
                Order Now <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
