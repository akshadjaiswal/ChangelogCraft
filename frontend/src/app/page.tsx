'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Github, Sparkles, Zap, Share2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleGitHubLogin = () => {
    window.location.href = '/api/auth/github';
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ChangelogCraft</span>
          </div>
          <Button variant="ghost" onClick={handleGitHubLogin}>
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col">
        <section className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Changelog Generation</span>
          </div>

          <h1 className="mb-6 max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Turn commits into{' '}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              beautiful changelogs
            </span>
          </h1>

          <p className="mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Connect your GitHub repository and let AI transform your commit history into
            clear, user-friendly changelogs in seconds.
          </p>

          <Button size="lg" onClick={handleGitHubLogin} className="gap-2 text-lg">
            <Github className="h-5 w-5" />
            Get Started with GitHub
          </Button>

          <p className="mt-4 text-sm text-muted-foreground">
            Free to use • No credit card required
          </p>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-muted/30 py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">Why ChangelogCraft?</h2>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Intelligent categorization and rewriting of commit messages into
                  user-friendly descriptions.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                  <Zap className="h-7 w-7 text-accent" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Generate comprehensive changelogs in seconds with real-time streaming
                  updates.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Share2 className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Easy Sharing</h3>
                <p className="text-muted-foreground">
                  Share beautiful public changelog pages or export as markdown for your
                  documentation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold">How It Works</h2>

            <div className="mx-auto max-w-3xl space-y-8">
              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  1
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-semibold">Connect GitHub</h3>
                  <p className="text-muted-foreground">
                    Sign in with your GitHub account and select a repository.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  2
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-semibold">Generate Changelog</h3>
                  <p className="text-muted-foreground">
                    AI analyzes your commits and creates a beautifully formatted changelog.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  3
                </div>
                <div>
                  <h3 className="mb-1 text-xl font-semibold">Share & Export</h3>
                  <p className="text-muted-foreground">
                    Share your public changelog page or download as markdown for your
                    project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-muted/30 py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to get started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join developers who are simplifying their release process.
            </p>
            <Button size="lg" onClick={handleGitHubLogin} className="gap-2 text-lg">
              <Github className="h-5 w-5" />
              Start Creating Changelogs
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 ChangelogCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
