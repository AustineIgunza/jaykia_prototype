"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Textarea, Select } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { GoldDivider } from "@/components/ui/gold-divider";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { useApi } from "@/lib/api/use-api";
import type { FeedbackType } from "@/lib/api/types";

const feedbackTypes = [
  { value: "comment", label: "General Comment" },
  { value: "issue", label: "Report an Issue" },
  { value: "critique", label: "Suggestion / Critique" },
];

export default function ContactPage() {
  const api = useApi();
  const [feedbackType, setFeedbackType] = useState<FeedbackType>("comment");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!api || !message.trim()) return;

    setLoading(true);
    try {
      await api.createFeedback({
        feedback_type: feedbackType,
        feedback: message,
      });
      setSubmitted(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  }

  const phone = process.env.NEXT_PUBLIC_CONTACT_PHONE || "+254 700 000 000";
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@jaykia.co.ke";
  const whatsapp = process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "+254700000000";

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <FadeIn direction="none">
        <p className="text-sm uppercase tracking-[0.25em] text-accent mb-3 text-center">Get in Touch</p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
          Contact Us
        </h1>
      </FadeIn>
      <FadeIn delay={0.2}>
        <p className="text-muted text-center mb-12">
          Have a question, concern, or just want to say hello? We&rsquo;d love to hear from you.
        </p>
      </FadeIn>

      <Stagger className="grid grid-cols-1 md:grid-cols-2 gap-8" staggerDelay={0.15}>
        {/* Contact Info */}
        <StaggerItem>
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold mb-4">Reach Us Directly</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-accent mt-0.5">&#9742;</span>
                <div>
                  <p className="text-muted-light">Phone</p>
                  <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-foreground hover:text-accent transition-colors">
                    {phone}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent mt-0.5">&#9993;</span>
                <div>
                  <p className="text-muted-light">Email</p>
                  <a href={`mailto:${email}`} className="text-foreground hover:text-accent transition-colors">
                    {email}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-accent mt-0.5">&#128172;</span>
                <div>
                  <p className="text-muted-light">WhatsApp</p>
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-accent transition-colors"
                  >
                    Message us on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <GoldDivider />

          <div>
            <h3 className="font-semibold text-sm mb-2">Office Hours</h3>
            <p className="text-sm text-muted">
              Our transfers operate 24/7. Customer support is available Monday\u2013Saturday, 7:00 AM \u2013 10:00 PM EAT.
            </p>
          </div>
        </div>
        </StaggerItem>

        {/* Feedback Form */}
        <StaggerItem>
        <Card>
          <CardContent>
            <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center py-8"
              >
                <div className="text-4xl mb-3 text-success">&#10003;</div>
                <h3 className="font-display text-lg font-semibold mb-2">Thank you!</h3>
                <p className="text-sm text-muted">
                  Your feedback has been received. We&rsquo;ll get back to you if needed.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="font-display text-lg font-semibold">Send Us a Message</h2>
                <Select
                  label="Type"
                  options={feedbackTypes}
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                />
                <Textarea
                  label="Your Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  required
                />
                <Button type="submit" loading={loading} className="w-full">
                  Send Message
                </Button>
              </form>
            )}
            </AnimatePresence>
          </CardContent>
        </Card>
        </StaggerItem>
      </Stagger>
    </div>
  );
}
