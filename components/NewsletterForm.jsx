"use client";

import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

const NewsletterForm = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    // Artificial delay for demo effect
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLoading(false);
    setEmail("");
    toast.success("Subscription successful! 🚀", {
      description: "You've been added to our insider list.",
    });
  };

  return (
    <form onSubmit={handleSubscribe} className="flex gap-2">
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="bg-white/[0.02] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-stone-300 focus:outline-none focus:border-amber-400/30 w-full transition-all"
      />
      <button
        type="submit"
        disabled={loading}
        className="p-2.5 rounded-xl bg-amber-400 text-black hover:bg-amber-300 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center min-w-[44px] cursor-pointer"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Mail size={18} />
        )}
      </button>
    </form>
  );
};

export default NewsletterForm;
