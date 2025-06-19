
import { Link } from 'react-router-dom';

function CTA() {
  return (
    <section className="bg-black text-white text-center py-20 px-6">
      <h2 className="text-4xl font-bold mb-4">
        Need a Quick DEMO?
      </h2>
      <p className="text-lg text-gray-300 mb-6">
        Take The Interview , Experience It , If you Linke It then Signup and Post Your JOBS!!!.
      </p>
      <Link 
        to="/signup"
        className="inline-block px-6 py-3 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-300 transition"
      >
        Get Started — No Signup/Login Required
      </Link>
    </section>
  );
}

export default CTA;
