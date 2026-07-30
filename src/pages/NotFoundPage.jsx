import { Link } from 'react-router-dom';
import { ArrowLeft, SearchX } from 'lucide-react';
import Button from '../components/ui/Button';
import { ROUTES } from '../constants/routes';
import './NotFoundPage.css';

const NotFoundPage = () => {
  return (
    <div className="not-found">
      <div className="not-found__card">
        <span className="not-found__icon" aria-hidden="true">
          <SearchX size={28} />
        </span>
        <h1>404 · Lost in the corridors</h1>
        <p>
          We couldn&apos;t find that page. It may have been moved, renamed, or it never existed
          in the first place.
        </p>
        <Link to={ROUTES.DASHBOARD}>
          <Button leftIcon={ArrowLeft} variant="primary">
            Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
