import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for wcWIKI.com — how we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <nav className="text-xs text-muted mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>›</span>
          <span className="text-foreground">Privacy Policy</span>
        </nav>

        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted mb-8">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-8 text-muted leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Introduction</h2>
            <p>
              Welcome to wcWIKI.com (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website wcWIKI.com (the &quot;Site&quot;) and use our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Information We Collect</h2>
            <h3 className="text-base font-medium text-foreground mt-3 mb-1">Personal Information</h3>
            <p>When you create an account, we may collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Name and email address</li>
              <li>Profile picture (if provided via Google sign-in)</li>
              <li>Account credentials (passwords are securely hashed and never stored in plain text)</li>
            </ul>

            <h3 className="text-base font-medium text-foreground mt-3 mb-1">Usage Information</h3>
            <p>We automatically collect certain information when you visit the Site, including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Browser type and version</li>
              <li>Operating system</li>
              <li>Pages visited and time spent on pages</li>
              <li>Search queries performed on the Site</li>
              <li>IP address (anonymized where possible)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Provide, maintain, and improve the Site and our services</li>
              <li>Create and manage your user account</li>
              <li>Process and manage content contributions and edits</li>
              <li>Communicate with you about your account or contributions</li>
              <li>Monitor and analyze usage patterns to improve user experience</li>
              <li>Protect against unauthorized access and ensure security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong className="text-foreground">Public contributions:</strong> Content you submit (edits, articles) is publicly visible and attributed to your display name.</li>
              <li><strong className="text-foreground">Service providers:</strong> We may share information with trusted third-party services that help us operate the Site (e.g., hosting, authentication).</li>
              <li><strong className="text-foreground">Legal requirements:</strong> We may disclose information if required by law or to protect our rights and safety.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Cookies and Tracking</h2>
            <p>
              We use essential cookies to maintain your session and authentication state. We do not use third-party advertising cookies or tracking pixels. Session cookies are automatically deleted when you close your browser.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal information, including encrypted connections (HTTPS), secure password hashing, and access controls. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Access and update your personal information through your account settings</li>
              <li>Request deletion of your account and associated data</li>
              <li>Opt out of non-essential communications</li>
              <li>Request a copy of your personal data</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, please contact us at the email address provided below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. Third-Party Links</h2>
            <p>
              The Site may contain links to third-party websites (e.g., artist websites, source materials). We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Children&apos;s Privacy</h2>
            <p>
              The Site is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the Site after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="mt-2 font-medium text-foreground">
              wcWIKI.com<br />
              Email: contact@wcwiki.com
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
