export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Terms &amp; Conditions</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p className="text-gray-600">
            By accessing and using NoveltyScholars, you agree to be bound by these Terms
            and Conditions. If you do not agree with any part of these terms, you may not
            use our services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
          <p className="text-gray-600">
            NoveltyScholars provides academic writing and research assistance services.
            We provide model papers for reference purpose only. All work delivered is
            intended to be used as research and reference material.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Obligations</h2>
          <p className="text-gray-600">
            You agree to provide accurate information when placing orders, not to use the
            delivered work in violation of academic integrity policies, and to use the
            materials solely as reference.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Payments</h2>
          <p className="text-gray-600">
            All payments are processed securely. Orders will only be processed after
            payment is confirmed. Prices are subject to change based on the requirements
            provided at the time of ordering.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Revisions &amp; Refunds</h2>
          <p className="text-gray-600">
            We offer free revisions within 14 days of delivery if the work does not meet
            the original requirements. Refund requests are evaluated on a case-by-case
            basis.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Limitation of Liability</h2>
          <p className="text-gray-600">
            NoveltyScholars shall not be liable for any indirect, incidental, or
            consequential damages arising from the use of our services. Our total
            liability is limited to the amount paid for the specific order.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
          <p className="text-gray-600">
            Upon delivery and full payment, the intellectual property rights of the
            delivered work transfer to the client. We retain the right to use
            anonymized work samples for quality assurance purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
          <p className="text-gray-600">
            For questions about these Terms, please contact us at
            support@noveltyscholars.com.
          </p>
        </section>
      </div>
    </div>
  );
}
