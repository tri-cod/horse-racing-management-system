import { useLocation } from 'react-router-dom';

const SITE_NAME = 'Royal Derby';
const DEFAULT_TITLE = 'Royal Derby — Horse Racing Management';
const DEFAULT_DESC = 'Royal Derby — manage races, horses, jockeys, results and betting in one platform.';
const DEFAULT_IMAGE = '/og-default.jpg';
const ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';

export default function Seo({ title, description, image, type = 'website' }) {
  const { pathname } = useLocation();
  const full = title ? `${title} — ${SITE_NAME}` : DEFAULT_TITLE;
  const desc = description || DEFAULT_DESC;
  const canonical = `${ORIGIN}${pathname}`;
  const og_image = image || DEFAULT_IMAGE;

  return (
    <>
      <title>{full}</title>
      <meta name="description" content={desc} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={full} />
      <meta property="og:description" content={desc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={og_image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={full} />
      <meta name="twitter:description" content={desc} />
    </>
  );
}
