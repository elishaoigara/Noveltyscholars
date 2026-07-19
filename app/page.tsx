import Link from "next/link";
import {
  ArrowRight,
  Star,
  Shield,
  Clock,
  Users,
  ChevronDown,
  CheckCircle,
  RefreshCw,
  Lock,
  Award,
} from "lucide-react";
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
      <section className="relative bg-gray-800 text-white py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left: Feature bullets */}
            <div className="space-y-4 order-2 lg:order-1">
              <div className="bg-gray-700 rounded-xl p-5 space-y-1">
                <h3 className="font-bold text-white">Discounts Upto 50%</h3>
                <p className="text-sm text-gray-300">
                  Get massive discounts when you use our service. Rewards for
                  first-time users, referrals, and reaching 10+ orders.
                </p>
              </div>
              <div className="bg-gray-700 rounded-xl p-5 space-y-1">
                <h3 className="font-bold text-white">
                  3-Hour Instant Delivery Assurance
                </h3>
                <p className="text-sm text-gray-300">
                  Get your paper fast. That is how we need you to be
                  comfortable.
                </p>
              </div>
              <div className="bg-gray-700 rounded-xl p-5 space-y-1">
                <h3 className="font-bold text-white">
                  Qualified Writers Online
                </h3>
                <p className="text-sm text-gray-300">
                  All our writers are verified — Bachelors, Masters, and PhD
                  level.
                </p>
              </div>
            </div>

            {/* Right: Hero copy */}
            <div className="space-y-6 order-1 lg:order-2">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Professional Academic Writing Service
              </h1>
              <p className="text-lg text-gray-300">
                Stuck with tough deadlines and overwhelming assignment
                guidelines? We ensure that you won&apos;t have to worry about
                your grades anymore because our qualified professionals will
                take care of all your writing tasks.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link href="/order">
                  <Button
                    size="lg"
                    className="text-base gap-2 bg-green-500 hover:bg-green-600 text-white border-0"
                  >
                    Order Assignment <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <a
                  href="https://api.whatsapp.com/send?phone=12095600466&text=Assignment%20help"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-base gap-2 border-white text-white hover:bg-white hover:text-gray-800"
                  >
                    WhatsApp Us!
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-10 border-y bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold text-gray-700 mb-6">
            Reliable Writing Companion of more than 10k students Globally
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-4xl mx-auto">
            <div className="space-y-1">
              <Shield className="h-6 w-6 text-primary mx-auto" />
              <p className="font-semibold text-sm">Plagiarism-Free</p>
              <p className="text-xs text-muted-foreground">
                100% original work
              </p>
            </div>
            <div className="space-y-1">
              <Clock className="h-6 w-6 text-primary mx-auto" />
              <p className="font-semibold text-sm">On-Time Delivery</p>
              <p className="text-xs text-muted-foreground">
                Always meet deadlines
              </p>
            </div>
            <div className="space-y-1">
              <Users className="h-6 w-6 text-primary mx-auto" />
              <p className="font-semibold text-sm">Expert Writers</p>
              <p className="text-xs text-muted-foreground">
                Qualified professionals
              </p>
            </div>
            <div className="space-y-1">
              <Star className="h-6 w-6 text-primary mx-auto" />
              <p className="font-semibold text-sm">24/7 Support</p>
              <p className="text-xs text-muted-foreground">
                Always here to help
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About / Write My Paper Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold mb-4 text-center">
            With us, consider your academic assignments taken care of.
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Join a community of students already using our assignment writing
            services online.
          </p>
          <h3 className="text-2xl font-bold text-center mb-4">
            WRITE MY PAPER FOR ME for Cheap&hellip;
          </h3>
          <p className="text-gray-600 text-center max-w-2xl mx-auto">
            Welcome to our essay writing website. We offer professional essay
            writing services as well as essay editing services that amaze our
            clients. We are the essay writing service that you need when you
            feel stressed and in need. We have close to 400 professional paper
            writers who are eager to help when you ask &ldquo;write my
            paper.&rdquo;
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              (How) Does Our Assignment Writing Service Work?
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Free up your time by getting your academic assignments done faster
              — without compromising on quality!
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                num: 1,
                color: "bg-teal-400",
                title: "Post Assignment",
                desc: "Post your homework assignment using our quick and easy-to-use Order area.",
              },
              {
                num: 2,
                color: "bg-green-400",
                title: "Support Checks Out Order",
                desc: "A representative from our team will check your order, ensure all instructions are attached, and assign a suitable writer.",
              },
              {
                num: 3,
                color: "bg-blue-400",
                title: "H/work is Written",
                desc: "A suitable writer shall pick your work and complete it within the assigned time. Share any further instructions with the writer.",
              },
              {
                num: 4,
                color: "bg-pink-500",
                title: "Download and Check Work",
                desc: "When your work is ready, you will receive an email. Download and upload to your instructor.",
              },
            ].map((step) => (
              <div
                key={step.num}
                className={`${step.color} text-white rounded-2xl p-6 space-y-3`}
              >
                <p className="text-sm font-bold opacity-80">{step.num}.</p>
                <h3 className="font-bold text-lg">{step.title}</h3>
                <p className="text-sm opacity-90">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/order">
              <Button size="lg" className="gap-2">
                Order Now <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* What You Get */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              When You Order an Assignment, You Get
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: RefreshCw,
                title: "Moneyback Guarantee",
                desc: "Our 100% Moneyback Guarantee backs you up on rare occasions where you aren't satisfied with the writing.",
              },
              {
                icon: Lock,
                title: "Complete Confidentiality",
                desc: "We have an ultimate policy for keeping your personal and order-related details a secret.",
              },
              {
                icon: Clock,
                title: "On-Time Delivery",
                desc: "Your deadline is our threshold for success. We make sure you receive your papers before your predefined time.",
              },
              {
                icon: Award,
                title: "Premium Quality Service",
                desc: "All work is thoroughly researched and written from scratch, strictly according to your teacher's requirements.",
              },
              {
                icon: CheckCircle,
                title: "Authentic Sources",
                desc: "Your document will be thoroughly checked for plagiarism and grammatical errors using highly authentic sources.",
              },
              {
                icon: Users,
                title: "24/7 Customer Service",
                desc: "Someone from our customer support team is always here to respond to your questions at any time.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow space-y-3"
              >
                <item.icon className="h-8 w-8 text-primary" />
                <h3 className="font-bold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Academic Services</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Standing on guard for your academic liberty. We help you play by
              making your paper go away.
            </p>
          </div>
          <ServicesGrid services={servicesData} />
        </div>
      </section>

      {/* Live Pricing Calculator */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Calculate Your Price</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Get an instant estimate for your order. The price adjusts based
              on deadline and academic level.
            </p>
          </div>
          <PricingCalculator basePrice={15} showPromoCode />
        </div>
      </section>

      {/* Free Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Free Features Included</h2>
          <p className="text-gray-600 mb-10">
            Every order comes with these extras at no additional cost.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Plagiarism Report", value: "$15.99" },
              { label: "Formatting", value: "$7.99" },
              { label: "Outline", value: "$3.99" },
              { label: "Unlimited Revisions", value: "$21.99" },
              { label: "Bibliography", value: "$4.99" },
              { label: "Platinum Writer", value: "$10.91" },
            ].map((f, i) => (
              <div key={i} className="bg-white border rounded-2xl p-5 shadow-sm">
                <p className="text-sm text-gray-500 line-through">{f.value}</p>
                <p className="font-bold text-gray-800">{f.label}</p>
                <p className="text-green-600 font-semibold text-sm">FREE</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-primary text-white rounded-2xl p-6 inline-block">
            <p className="text-2xl font-bold">Save $65.77</p>
            <p className="text-sm opacity-80">
              on every order with our free features
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Thousands of students trust NoveltyScholars for their academic
              needs.
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
              <div
                key={i}
                className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
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
            <h2 className="text-3xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
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
              {
                q: "Can you take my entire online class?",
                a: "Yes! We offer a dedicated 'Take My Online Class' service where our qualified writers handle your coursework, discussions, and assignments for the entire course.",
              },
              {
                q: "Can you take my online exam?",
                a: "Yes. Our exam experts can log in and complete your online exam on your behalf, ensuring you get the grade you need.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white border rounded-2xl overflow-hidden"
              >
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/order">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-base gap-2 bg-white text-primary hover:bg-gray-100"
                >
                  Order Now <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a
                href="https://api.whatsapp.com/send?phone=12095600466&text=Assignment%20help"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base gap-2 border-white text-white hover:bg-white/10"
                >
                  WhatsApp Us!
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}