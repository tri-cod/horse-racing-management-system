import { Link } from 'react-router-dom';
import { Flag, ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import Button from '@/components/ui/Button';
import Seo from '@/components/seo/Seo';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] bg-surface">
      <Seo title="Page Not Found" description="The page you're looking for doesn't exist." />
      <Container className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <Flag size={40} className="text-ink-4" strokeWidth={1.5} />
        <p className="font-serif text-6xl font-bold text-ink">404</p>
        <h1 className="text-lg font-semibold text-ink">This page has scratched from the race</h1>
        <p className="max-w-sm text-sm text-ink-3">
          The page you're looking for doesn't exist or may have been moved.
        </p>
        <Button as={Link} to="/" variant="primary" size="sm" className="mt-2 inline-flex items-center gap-1.5">
          Back to Home <ArrowRight size={14} />
        </Button>
      </Container>
    </div>
  );
}
