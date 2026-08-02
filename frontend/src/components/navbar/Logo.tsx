import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to={"/"} className="flex">
      <img src="/logo.png" alt="logo" className="w-20" />
    </Link>
  );
};

export default Logo;
