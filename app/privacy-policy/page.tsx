export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="text-gray-600">
            We collect information you provide directly to us, including your name, email
            address, and order details. We also collect information about your use of our
            platform, including pages visited and time spent on the site.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="text-gray-600">
            We use the information we collect to provide, maintain, and improve our
            services, process your orders, communicate with you about your orders, and send
            you technical notices and support messages.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
          <p className="text-gray-600">
            We do not sell, trade, or otherwise transfer your personal information to
            outside parties. We may share information with trusted third parties who assist
            us in operating our platform, so long as those parties agree to keep this
            information confidential.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
          <p className="text-gray-600">
            We implement a variety of security measures to maintain the safety of your
            personal information. Your data is stored on secure servers and all
            transmissions are encrypted using SSL technology.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Cookies</h2>
          <p className="text-gray-600">
            We use cookies to understand and save your preferences for future visits and
            compile aggregate data about site traffic and site interaction so that we can
            offer better site experiences in the future.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
          <p className="text-gray-600">
            You have the right to access, correct, or delete your personal information at
            any time. You can also request a copy of the data we hold about you by
            contacting our support team.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
          <p className="text-gray-600">
            If you have any questions about this Privacy Policy, please contact us at
            support@noveltyscholars.com.
          </p>
        </section>
      </div>
    </div>
  );
}
