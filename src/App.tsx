import { router } from '@/router';
import { RouterProvider } from 'react-router-dom';
import './index.css';

// Custom CSS for animations
const customStyles = `
  /* RTL specific animations */
  @keyframes rtl-fade-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes rtl-slide-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Original animations */
  @keyframes fade-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fade-in-1 {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fade-in-2 {
    0% { opacity: 0; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes fade-in-3 {
    0% { opacity: 0; }
    66% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes pulse-slow {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-up {
    animation: rtl-fade-up 0.6s ease forwards;
  }

  .animate-fade-in-1 {
    animation: fade-in-1 0.5s ease forwards;
  }

  .animate-fade-in-2 {
    animation: fade-in-2 0.8s ease forwards;
  }

  .animate-fade-in-3 {
    animation: fade-in-3 1.1s ease forwards;
  }

  .animate-pulse-slow {
    animation: pulse-slow 3s ease-in-out infinite;
  }

  .animate-slide-up {
    animation: rtl-slide-up 0.3s ease forwards;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* RTL specific fixes */
  .rtl {
    direction: rtl;
    text-align: right;
  }
`;

function App() {
  return (
    <>
      <style>{customStyles}</style>
      <div className="rtl">
        <RouterProvider router={router} />
      </div>
    </>
  );
}

export default App;
