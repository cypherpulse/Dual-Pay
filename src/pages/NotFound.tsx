import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-2 sm:px-4">
      <div className="text-center max-w-xs sm:max-w-md mx-auto">
        <h1 className="mb-4 text-2xl sm:text-3xl md:text-4xl font-bold">404</h1>
        <p className="mb-4 text-base sm:text-lg md:text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="inline-block text-primary underline hover:text-primary/90 text-sm sm:text-base md:text-lg px-3 sm:px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
