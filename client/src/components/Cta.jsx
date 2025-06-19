import { Link } from 'react-router-dom';

function CTA() {
  return (
    <section className="bg-black text-white py-20 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-yellow-400">
          Try a Demo Interview — Instantly!
        </h2>
        <p className="text-lg md:text-xl text-gray-300 mb-8">
          Experience an AI-powered interview without signing up. See how it works, love the experience — then create your account and post jobs effortlessly.
        </p>
        <Link
          to="/apply-job/6853eb7e72aba40f3639987f"
          className="inline-block bg-yellow-400 text-black text-lg font-semibold px-8 py-4 rounded-full shadow-md hover:bg-yellow-300 transition duration-300"
        >
          🎯 Start Demo Interview (No Login)
        </Link>
      </div>
    </section>
  );
}

export default CTA;
