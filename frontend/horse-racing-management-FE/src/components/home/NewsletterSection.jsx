import { useState } from 'react';
import Container from '../ui/Container';
import Button from '../ui/Button';
import '../../assets/css/home/NewsletterSection.css';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    // TODO: wire to /api/newsletter subscription endpoint when available
    setSubmitted(true);
  };

  return (
    <section className="home-newsletter">
      <Container narrow>
        <p className="eyebrow home-newsletter__eyebrow">Don't Miss Out</p>
        <h2 className="home-newsletter__title">Subscribe For Race Updates</h2>
        <p className="home-newsletter__subtitle">
          Be the first to know about race schedules, results and behind-the-scenes
          stories from Royal Derby.
        </p>

        <form className="home-newsletter__form" onSubmit={handleSubmit}>
          <input
            type="email"
            className="home-newsletter__input"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="dark" size="md" className="home-newsletter__submit">
            Subscribe
          </Button>
        </form>
        {submitted && <p className="home-newsletter__success">Thank you for subscribing!</p>}
      </Container>
    </section>
  );
}
