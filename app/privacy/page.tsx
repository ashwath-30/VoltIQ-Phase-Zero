import { LegalPageLayout, LegalSection } from "@/components/legal/legal-page-layout";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="July 11, 2026">
      <LegalSection title="1. Who we are">
        <p>
          VoltIQX ("we," "us," "our") provides an AI-powered home energy auditing platform that helps
          you understand, forecast, and reduce your home electricity costs. This policy explains what
          information we collect, how we use it, and the choices you have.
        </p>
      </LegalSection>

      <LegalSection title="2. Information we collect">
        <p>We collect the following categories of information:</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong className="text-foreground">Account information</strong> — your name, email
            address, and password (your password is never stored in readable form; it's handled
            securely by our authentication provider).
          </li>
          <li>
            <strong className="text-foreground">Home profile information</strong> — address, utility
            provider, home size, number of occupants, and whether you have solar panels, a home
            battery, or an electric vehicle. All of this is optional and provided by you.
          </li>
          <li>
            <strong className="text-foreground">Utility bill data</strong> — the PDF bills you upload,
            and the usage/cost data (billing period, total cost, kWh usage, peak and off-peak usage)
            extracted from them.
          </li>
          <li>
            <strong className="text-foreground">AI Assistant conversations</strong> — the messages you
            send to and receive from the AI Assistant, stored so your conversation history persists
            across visits.
          </li>
          <li>
            <strong className="text-foreground">Technical data</strong> — session cookies used solely
            to keep you signed in. We do not use advertising or cross-site tracking cookies.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How we use your information">
        <p>We use your information to:</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>Provide the core service — extracting data from uploaded bills, computing forecasts, your Energy Health Score, and comparisons to similar homes</li>
          <li>Power the AI Assistant with context about your real account so its answers are relevant to you, not generic</li>
          <li>Send you notifications about your account (e.g. usage alerts, forecasted bill changes)</li>
          <li>Maintain the security and integrity of the platform</li>
          <li>Improve VoltIQX's features and reliability</li>
        </ul>
        <p>We do not use your data to serve you ads, and we do not sell your personal information to third parties.</p>
      </LegalSection>

      <LegalSection title="4. How your information is processed and shared">
        <p>
          To provide the service, we share limited data with the following processors, each bound to
          only use it to provide their service to us:
        </p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>
            <strong className="text-foreground">Supabase</strong> — our database, authentication, and
            file storage provider. Your account data, profile, bills, and conversation history are
            stored on Supabase's infrastructure with access controls that restrict each user to only
            their own data.
          </li>
          <li>
            <strong className="text-foreground">Anthropic</strong> — the AI provider used to extract
            data from uploaded bill PDFs and to power the AI Assistant. Bill content and chat messages
            are sent to Anthropic's API to generate a response, per Anthropic's own data usage terms.
          </li>
          <li>
            <strong className="text-foreground">Vercel</strong> — our hosting provider, which serves
            the application itself.
          </li>
        </ul>
        <p>
          We may also disclose information if required by law, to protect our legal rights, or to
          prevent fraud or abuse of the platform.
        </p>
      </LegalSection>

      <LegalSection title="5. Data security">
        <p>
          We use industry-standard measures to protect your data, including encrypted connections
          (HTTPS) between your browser and our servers, database access rules that restrict every user
          to their own data, and secure password handling through our authentication provider. No
          system is perfectly secure, and we cannot guarantee absolute security.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention">
        <p>
          We retain your information for as long as your account is active. If you delete your
          account (available in Settings → Privacy), we delete your profile, bills, conversation
          history, and notifications from our active systems. Some information may persist briefly in
          backups before being purged.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights and choices">
        <p>You can, at any time:</p>
        <ul className="ml-5 list-disc space-y-1.5">
          <li>View and update your profile information from the Profile page</li>
          <li>Request a copy of your data from Settings → Privacy</li>
          <li>Delete your account and associated data from Settings → Privacy</li>
          <li>Control notification preferences from Settings → Notifications</li>
        </ul>
        <p>
          Depending on where you live, you may have additional rights under laws like the GDPR or CCPA
          — contact us using the details below to exercise them.
        </p>
      </LegalSection>

      <LegalSection title="8. Children's privacy">
        <p>
          VoltIQX is not directed at children, and we do not knowingly collect information from anyone
          under 18. If you believe a child has provided us with personal information, contact us and
          we will delete it.
        </p>
      </LegalSection>

      <LegalSection title="9. Changes to this policy">
        <p>
          We may update this policy as VoltIQX evolves. If we make material changes, we'll update the
          "Last updated" date above and, where appropriate, notify you directly.
        </p>
      </LegalSection>

      <LegalSection title="10. Contact us">
        <p>
          Questions about this policy or your data? Reach us at{" "}
          <a href="mailto:support@voltiqx.app" className="text-primary hover:underline">
            support@voltiqx.app
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
