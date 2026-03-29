import { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for wcWIKI.com — rules and guidelines for using the watercolor art encyclopedia.",
};

export default function TermsOfUsePage() {
  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        <nav className="text-xs text-muted mb-6 flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>›</span>
          <span className="text-foreground">Terms of Use</span>
        </nav>

        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Use</h1>
        <p className="text-sm text-muted mb-8">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <div className="space-y-8 text-muted leading-relaxed text-sm">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
            <p>
              By accessing and using wcWIKI.com (the &quot;Site&quot;), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Site. We reserve the right to modify these terms at any time, and your continued use of the Site constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">2. Description of Service</h2>
            <p>
              wcWIKI.com is a community-driven encyclopedia dedicated to watercolor art. The Site provides a searchable database of watercolor artists, paintings, and articles. Users can browse content, create accounts, and contribute edits and articles subject to editorial review.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">3. User Accounts</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>You must provide accurate and complete information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must be at least 13 years of age to create an account.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
              <li>You are responsible for all activity that occurs under your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">4. Content and Contributions</h2>
            <h3 className="text-base font-medium text-foreground mt-3 mb-1">User Contributions</h3>
            <p>By submitting content (edits, articles, or other materials) to the Site, you:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Grant wcWIKI.com a non-exclusive, royalty-free, worldwide license to use, display, and distribute your contributions on the Site.</li>
              <li>Represent that your contributions are original or that you have the right to submit them.</li>
              <li>Agree that your contributions may be edited, modified, or removed at the discretion of our editorial team.</li>
            </ul>

            <h3 className="text-base font-medium text-foreground mt-3 mb-1">Artwork and Images</h3>
            <p>
              All artworks displayed on the Site are presented for educational and informational purposes only under fair use principles. All rights to artworks remain with their respective creators and rights holders. If you are a rights holder and believe your work is displayed improperly, please contact us for prompt resolution.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">5. Prohibited Conduct</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Submit false, misleading, or inaccurate information</li>
              <li>Impersonate any person or entity</li>
              <li>Upload content that infringes on copyrights, trademarks, or other intellectual property rights</li>
              <li>Submit harmful, abusive, defamatory, or offensive content</li>
              <li>Attempt to gain unauthorized access to the Site, other accounts, or our systems</li>
              <li>Use automated tools to scrape, crawl, or harvest data from the Site without permission</li>
              <li>Interfere with or disrupt the Site or its infrastructure</li>
              <li>Use the Site for any unlawful purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">6. Intellectual Property</h2>
            <p>
              The Site&apos;s design, logos, trademarks, and original content (excluding user contributions and third-party artworks) are the property of wcWIKI.com and are protected by intellectual property laws. You may not reproduce, distribute, or create derivative works from our proprietary content without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">7. Editorial Review</h2>
            <p>
              All user contributions are subject to editorial review before publication. Our editorial team (Approvers and Administrators) reserves the right to approve, reject, or modify any submitted content. Editors with elevated permissions may have their contributions auto-approved.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">8. DMCA and Copyright Claims</h2>
            <p>
              We respect the intellectual property rights of others. If you believe that content on the Site infringes your copyright, please contact us with the following information:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>A description of the copyrighted work you claim has been infringed</li>
              <li>The URL or location of the allegedly infringing content on the Site</li>
              <li>Your contact information (name, email, address)</li>
              <li>A statement that you have a good faith belief that the use is not authorized</li>
              <li>A statement, under penalty of perjury, that the information is accurate and you are the rights holder or authorized to act on their behalf</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">9. Disclaimer of Warranties</h2>
            <p>
              The Site is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not guarantee the accuracy, completeness, or reliability of any content on the Site. Information about artworks, artists, and techniques is provided for educational purposes and should not be considered authoritative or definitive.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, wcWIKI.com and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Site, including but not limited to loss of data, profits, or business opportunities.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">11. Governing Law</h2>
            <p>
              These Terms of Use shall be governed by and construed in accordance with the applicable laws. Any disputes arising from these terms shall be resolved through good faith negotiation and, if necessary, through appropriate legal channels.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">12. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Use, please contact us at:
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
