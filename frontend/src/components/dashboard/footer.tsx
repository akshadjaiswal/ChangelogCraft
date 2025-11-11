'use client';

import Link from 'next/link';
import { Github, Linkedin, Twitter } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Made by section */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <span className="text-red-500">♥</span>
            <span>by</span>
            <a
              href="https://github.com/akshadjaiswal"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground transition-colors hover:text-primary"
            >
              Akshad
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/akshadjaiswal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="GitHub Profile"
            >
              <Github className="size-5" />
            </a>
            <a
              href="https://x.com/akshad_999"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="X (Twitter) Profile"
            >
              <Twitter className="size-5" />
            </a>
            <a
              href="https://linkedin.com/in/akshadsantoshjaiswal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground transition-colors hover:text-foreground"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="size-5" />
            </a>
          </div>

          {/* Open Source Notice */}
          <div className="text-center text-sm text-muted-foreground md:text-right">
            <a
              href="https://github.com/akshadjaiswal/ChangelogCraft"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground"
            >
              Open source contributions accepted
            </a>
          </div>
        </div>

        {/* Copyright */}
        <Separator className="my-4" />
        <div className="text-center text-xs text-muted-foreground">
          © {currentYear} ChangelogCraft. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
