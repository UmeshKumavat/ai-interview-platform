import PageHeader from "@/components/reusables";

const TermsPage = () => {
  return (
    <main className="min-h-screen bg-black pb-20">
      <PageHeader
        label="Legal"
        gray="Terms of"
        gold="Service"
        description="Last updated: May 2026"
      />

      <div className="max-w-4xl mx-auto px-8 py-12 text-stone-400 font-light leading-relaxed space-y-8">
        <section>
          <h2 className="text-xl font-serif text-stone-200 mb-4 tracking-tight">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Prept, you agree to be bound by these Terms of
            Service. If you do not agree to these terms, please do not use our
            services.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-stone-200 mb-4 tracking-tight">
            2. User Accounts
          </h2>
          <p>
            You are responsible for maintaining the confidentiality of your
            account and password. You agree to accept responsibility for all
            activities that occur under your account.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-stone-200 mb-4 tracking-tight">
            3. Use of AI Services
          </h2>
          <p>
            Our feedback system uses Generative AI. While we strive for
            accuracy, the feedback provided is for educational purposes only and
            should not be taken as absolute professional advice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-stone-200 mb-4 tracking-tight">
            4. Credit System
          </h2>
          <p>
            Credits purchased on Prept are non-refundable but can be used at any
            time. Interviewers are entitled to withdraw their earnings subject
            to our platform fee.
          </p>
        </section>
      </div>
    </main>
  );
};

export default TermsPage;
