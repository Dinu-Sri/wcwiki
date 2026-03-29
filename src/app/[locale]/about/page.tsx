import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "About — wcWIKI",
  description: "About wcWIKI, the community-driven watercolor art encyclopedia.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-10">
          <h1 className="text-3xl font-bold text-foreground mb-6">About wcWIKI</h1>

          <div className="prose prose-sm max-w-none text-muted space-y-4">
            <p>
              wcWIKI is a community-driven encyclopedia dedicated to the art of watercolor painting.
              Our mission is to document, celebrate, and preserve the knowledge of watercolor art —
              from classic masters to contemporary creators around the world.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Our Mission</h2>
            <p>
              We believe watercolor art deserves a comprehensive, freely accessible knowledge base.
              wcWIKI aims to be the Wikipedia of watercolor — a place where artists, students, collectors,
              and enthusiasts can discover, learn, and contribute.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Community-Driven</h2>
            <p>
              Like Wikipedia, wcWIKI is built by its community. Registered users with Editor access
              can suggest edits to any artist profile, painting entry, or article. All changes go through
              a review process to maintain quality and accuracy.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-3">Educational Use</h2>
            <p>
              All artworks featured on wcWIKI are displayed for educational and informational purposes only.
              Full credit and attribution are given to the respective artists. If you are an artist and
              would like your work removed or updated, please contact us.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
