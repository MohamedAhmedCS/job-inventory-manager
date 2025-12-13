import { useState } from "react";
import { login, register } from "../services/jobService";

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegistering) {
        await register(username, password);
      } else {
        await login(username, password);
      }
      onLoginSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden border border-gray-700">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-2">💼 Job Tracker</h1>
            <p className="text-blue-100">Manage your job applications efficiently</p>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded-lg">
                <p className="text-red-200 text-sm font-medium">Error: {error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter username"
                  minLength={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter password"
                  minLength={isRegistering ? 6 : 1}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 outline-none transition"
                  disabled={loading}
                  required
                />
                {isRegistering && (
                  <p className="text-xs text-gray-400 mt-1">At least 6 characters</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200 mt-6"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                    Loading...
                  </span>
                ) : isRegistering ? (
                  "Sign Up"
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-gray-400 text-sm text-center mb-4">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError("");
                  setUsername("");
                  setPassword("");
                }}
                disabled={loading}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-gray-300 rounded-lg font-medium transition"
              >
                {isRegistering ? "Sign In Instead" : "Create Account"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-center">Demo Credentials:</p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Username: <span className="text-gray-400">demo</span><br />
                Password: <span className="text-gray-400">demo123</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
