import Link from "next/link";
const items=[
["What services do you provide?","We provide tutoring, study planning, research guidance, proofreading, editing, citation review and subject-specific academic support for UK and US students."],
["Do you take an exam or impersonate a student?","No. Exam support means preparation, revision strategy and tutoring. We do not impersonate students, sit assessments for them or request passwords."],
["How is pricing calculated?","Written-support services are estimated per page and adjusted for academic level and deadline. Tutoring is priced per class and exam preparation per exam-support session. Checkout shows the final server-verified USD amount."],
["Is payment secure?","Payment is hosted and processed by Paystack. We verify the transaction reference, exact amount, currency and status on our server before marking an order paid."],
["Can I return to an unpaid order?","Yes. Open your dashboard and choose Resume payment. You can also cancel an unpaid order."],
["What if I need a revision?","Use your order workspace to explain how the delivery differs from the agreed brief. Revision eligibility depends on the original instructions and status of the order."],
["Do you publish customer reviews?","Only after a review can be linked to a genuine completed order and the customer has consented to publication."],
];
export default function FAQPage(){return <main className="container mx-auto max-w-3xl px-6 py-14"><h1 className="text-4xl font-bold">Frequently asked questions</h1><p className="mt-3 text-muted-foreground">Straight answers about services, payments and support.</p><div className="mt-10 space-y-4">{items.map(([q,a])=><details key={q} className="rounded-2xl border bg-card p-6"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-4 leading-relaxed text-muted-foreground">{a}</p></details>)}</div><p className="mt-10">Still need help? <Link className="text-primary underline" href="/support">Contact support</Link>.</p></main>}
