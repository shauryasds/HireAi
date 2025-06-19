
import { Link } from 'react-router-dom';

function CTA() {
  return (
    <section className="bg-black text-white text-center py-20 px-6">
      <h2 className="text-4xl font-bold mb-4">
        Need a Quick DEMO?
      </h2>
      <p className="text-lg text-gray-300 mb-6">
        Take The Demo Interview [No Login Required] , Experience It , Like It ?   Signup and Post Your JOBS!!!.
      </p>
      <Link 
        to="/apply-job/6853eb7e72aba40f3639987f"
        className="inline-block px-6 py-3 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-300 transition"
      >
        Get Started — No Signup/Login Required
      </Link>
    </section>
  );
}

export default CTA;
