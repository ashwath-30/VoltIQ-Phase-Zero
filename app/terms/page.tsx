import { LegalPageLayout, LegalSection } from "@/components/legal/legal-page-layout";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPageLayout title="Terms of Service" lastUpdated="July 11, 2026">
      <LegalSection title="1. Acceptance of terms">
        <p>
          By creating an account or using VoltIQ, you agree to these Terms of Service and our{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
          . If you don't agree, please don't use VoltIQ.
        </p>
      </LegalSection>

      <LegalSection title="2. Description of the service">
        <p>
          VoltIQ is an early-stage home energy auditing platform. It analyzes utility bills you
          upload, generates forecasts and an Energy Health Score from your usage history, and provides
          an AI Assistant for questions about your account. VoltIQ is under active development —
          features may change, and some capabilities are still being built.
        </p>
      </LegalSection>

      <LegalSection title="3. Your account">
        <p>
          You must provide accurate information when creating an account and keep your login
          credentials secure. You're responsible for all activity under your account. You must be at
          least 18 years old to use VoltIQ.
        </p>
      </LegalSection>

      <LegalSection title="4. Acceptable use">
        <p>You agree not to:</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Upload documents that aren't genuinely your own utility bills</li>
          <li>Use VoltIQ for any unlawful purpose, or to violate anyone else's rights</li>
          <li>Attempt to access another user's account or data</li>
          <li>Interfere with or disrupt VoltIQ's infrastructure, or attempt to bypass its security</li>
          <li>Use automated means to scrape or extract data from VoltIQ at scale without permission</li>
        </ul>
      </LegalSection>

      <LegalSection title="5. Your content">
        <p>
          You retain ownership of the bills you upload and the information in your profile. By
          uploading a bill, you grant VoltIQ a limited license to process it (including via AI models)
          solely to provide the service to you — extracting usage data, generating forecasts, and
          answering your questions about it.
        </p>
      </LegalSection>

      <LegalSection title="6. Forecasts, scores, and AI-generated content are estimates">
        <p>
          This is important: VoltIQ's forecasts, Energy Health Score, peer comparisons, notifications,
          and AI Assistant responses are automated estimates generated from the data available to us —
          they are <strong className="text-foreground">not guarantees</strong>, professional energy
          audits, financial advice, or a substitute for advice from a licensed electrician, energy
          auditor, or financial professional. Actual results (savings, bill amounts, equipment
          performance) may differ from what VoltIQ predicts. Confidence scores reflect how much data
          supports an estimate, not a guarantee of accuracy.
        </p>
      </LegalSection>

      <LegalSection title="7. Pricing">
        <p>
          VoltIQ is currently free to use. If we introduce paid plans in the future, we'll provide
          clear notice before any charges apply to your account.
        </p>
      </LegalSection>

      <LegalSection title="8. Intellectual property">
        <p>
          VoltIQ's software, design, and branding are owned by us and protected by applicable
          intellectual property laws. These terms don't grant you any rights to VoltIQ's intellectual
          property beyond what's needed to use the service as intended.
        </p>
      </LegalSection>

      <LegalSection title="9. Disclaimers">
        <p>
          VoltIQ is provided "as is" and "as available," without warranties of any kind, express or
          implied. We don't warrant that the service will be uninterrupted, error-free, or that any
          forecast, score, or recommendation will be accurate for your specific situation.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation of liability">
        <p>
          To the fullest extent permitted by law, VoltIQ and its creators are not liable for any
          indirect, incidental, or consequential damages arising from your use of the service,
          including decisions made based on forecasts, scores, or AI-generated content.
        </p>
      </LegalSection>

      <LegalSection title="11. Termination">
        <p>
          You may delete your account at any time from Settings → Privacy. We may suspend or terminate
          accounts that violate these terms, or that we reasonably believe pose a security or legal
          risk to VoltIQ or other users.
        </p>
      </LegalSection>

      <LegalSection title="12. Changes to these terms">
        <p>
          We may update these terms as VoltIQ evolves. We'll update the "Last updated" date above when
          we do, and for material changes, we'll make a reasonable effort to notify you directly.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact us">
        <p>
          Questions about these terms? Reach us at{" "}
          <a href="mailto:support@voltiq.app" className="text-primary hover:underline">
            support@voltiq.app
          </a>{" "}
          or via the{" "}
          <a href="/contact" className="text-primary hover:underline">
            Contact page
          </a>
          .
        </p>
      </LegalSection>
    </LegalPageLayout>
  );
}
