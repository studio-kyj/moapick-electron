import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold">Welcome to the Home Page!</h1>
      <Link
        to="/wanted-login"
        className="mt-4 text-lg font-medium text-primary"
      >
        Login
      </Link>
    </div>
  );
};

export default Home;
