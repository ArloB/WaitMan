import { useEffect, useState } from "react";

const Icon = ({ id, className = {} }) => {
  const [icon, setIcon] = useState("");

  useEffect(() => {
    setIcon(
      `https://${process.env.REACT_APP_HOST}:${
        process.env.REACT_APP_BIP
      }/img/${id}?=${Date.now()}`
    );
  }, [id]);

  return (
    <img
      src={icon}
      onError={() => setIcon("/default")}
      alt={`${id}`}
      className={className}
    />
  );
};

export default Icon;
