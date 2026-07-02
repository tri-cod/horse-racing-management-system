import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Reveal from '@/components/ui/Reveal';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const reduce = useReducedMotion();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <section className="border-t border-rim bg-surface-raised py-32">
      <Container narrow>
        <Reveal className="text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Don't Miss Out</p>
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Subscribe For Race Updates</h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-ink-3">
            Be the first to know about race schedules, results and behind-the-scenes stories from Royal Derby.
          </p>
          {submitted ? (
            <motion.p
              className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-gold"
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14 }}
            >
              <CheckCircle size={16} /> Thank you for subscribing!
            </motion.p>
          ) : (
            <form className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center" onSubmit={handleSubmit} noValidate>
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                className="w-full border border-rim-hi bg-surface rounded px-4 py-3 text-sm text-ink placeholder:text-ink-4 outline-none transition focus:border-gold focus:ring-1 focus:ring-gold sm:w-72"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" size="lg">Subscribe</Button>
            </form>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
