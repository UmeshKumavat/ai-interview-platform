import Link from "next/link";
import Image from "next/image";
import { Bird, User, Code2, Mail } from "lucide-react";
import { GrayTitle } from "./reusables";
import { checkUser } from "@/lib/checkUser";
import NewsletterForm from "./NewsletterForm";

const Footer = async () => {
  const user = await checkUser();
  const isInterviewer = user?.role === "INTERVIEWER";

  const platformLinks = [
    { label: "Explore Interviewers", href: "/explore" },
    ...(isInterviewer
      ? [{ label: "Interviewer Dashboard", href: "/dashboard" }]
      : []),
    { label: "My Appointments", href: "/appointments" },
    { label: "Get Started", href: "/onboarding" },
  ];

  return (
    <footer className="relative z-10 border-t border-white/7 bg-[#050505] pt-24 pb-12 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-amber-400/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-16">
          {/* Brand Info */}
          <div className="col-span-1 lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/logo.png"
                alt="Prept Logo"
                width={90}
                height={90}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-stone-400 text-sm font-light leading-relaxed mb-8 max-w-xs">
              The world&apos;s first AI-powered mock interview platform
              connecting you with senior engineers for real feedback.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg tracking-tight text-stone-200 mb-6">
              Platform
            </h4>
            <ul className="space-y-4">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-500 hover:text-stone-300 transition-colors duration-200 font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-serif text-lg tracking-tight text-stone-200 mb-6">
              Support
            </h4>
            <ul className="space-y-4">
              {[
                { label: "Contact Us", href: "mailto:support@prept.ai" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Terms of Service", href: "/terms" },
                { label: "Cookie Policy", href: "/privacy" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-stone-500 hover:text-stone-300 transition-colors duration-200 font-light"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif text-lg tracking-tight text-stone-200 mb-6">
              Stay Updated
            </h4>
            <p className="text-sm text-stone-500 font-light mb-6">
              Get the latest interview tips and platform updates.
            </p>

            <NewsletterForm />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs text-stone-600 font-light">
            © {new Date().getFullYear()} Prept.ai. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-stone-500 font-light">
            <span>Made with</span>
            <span className="text-red-500/80">❤️</span>
            <span>by</span>
            <span className="text-stone-300 font-medium">Umesh</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
