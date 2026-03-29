import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Contact — wcWIKI",
  description: "Get in touch with the wcWIKI team.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-10">
          <h1 className="text-3xl font-bold text-foreground mb-6">Contact</h1>

          <div className="prose prose-sm max-w-none text-muted space-y-4">
            <p>
              Have questions, suggestions, or want to report an issue? We&apos;d love to hear from you.
            </p>

            <div className="bg-surface border border-border rounded-xl p-6 mt-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Get in Touch</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Email</p>
                  <a href="mailto:contact@wcwiki.com" className="text-primary hover:underline">
                    contact@wcwiki.com
                  </a>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Content Issues</p>
                  <p className="text-sm text-foreground">
                    If you are an artist and would like your work updated or removed, please email us
                    with the relevant page URL and we will respond within 48 hours.
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Contributing</p>
                  <p className="text-sm text-foreground">
                    Want to contribute articles or help edit content? Create an account and request
                    Editor access from your dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
