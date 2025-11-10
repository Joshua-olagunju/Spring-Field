import { Link } from "react-router-dom";

const SignUp = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4 py-8">
      <div className="bg-white shadow-2xl rounded-lg px-6 py-10 md:px-12 md:py-12 w-full max-w-md text-center">
        <div className="flex justify-center items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
            SF
          </div>
          <p className="text-xl font-semibold text-gray-800">
            SpringField Estate
          </p>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign Up</h2>
        <p className="text-gray-500 mb-8">Create your account - Coming Soon</p>

        <Link
          to="/login"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
};

export default SignUp;
