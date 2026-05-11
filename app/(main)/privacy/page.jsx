import PageHeader from "@/components/reusables";

const PrivacyPage = () => {
  return (
    <main className="min-h-screen bg-black pb-20">
      <PageHeader
        label="Legal"
        gray="Privacy"
        gold="Policy"
        description="Last updated: May 2026"
      />

      <div className="max-w-4xl mx-auto px-8 py-12 text-stone-400 font-light leading-relaxed space-y-8">
        <section>
          <h2 className="text-xl font-serif text-stone-200 mb-4 tracking-tight">
            1. Introduction
          </h2>
          <p>
            At Prept, we take your privacy seriously. This policy outlines how
            we collect, use, and protect your personal information when you use
            our mock interview platform.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-stone-200 mb-4 tracking-tight">
            2. Information We Collect
          </h2>
          <p>
            We collect information you provide directly to us, such as your
            name, email address, and professional background. We also collect
            data from your recorded mock interviews and AI-generated transcripts
            to provide you with feedback.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-stone-200 mb-4 tracking-tight">
            3. Data Security
          </h2>
          <p>
            Your video recordings and transcripts are encrypted and stored
            securely. We do not sell your personal data to third parties. AI
            analysis is performed using secure Google Gemini endpoints.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-serif text-stone-200 mb-4 tracking-tight">
            4. Your Rights
          </h2>
          <p>
            You have the right to access, correct, or delete your personal
            information and recordings at any time through your dashboard
            settings.
          </p>
        </section>
      </div>
    </main>
  );
};

export default PrivacyPage;
