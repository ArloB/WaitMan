import { useNavigate } from "react-router-dom";

const BackButton = ({ to }) => {
  const navigate = useNavigate();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="absolute top-4 left-4 w-8 h-8 cursor-pointer"
      onClick={() => navigate(to)}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
      />
    </svg>
  );
};

export default BackButton;
