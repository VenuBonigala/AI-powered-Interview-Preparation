import { useNavigate } from "react-router-dom";

function ChooseMode() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Choose Mode</h2>

      <button onClick={() => navigate("/prep")}>Preparation Plan</button>

      <button onClick={() => navigate("/mock")}>Mock Interview</button>
    </div>
  );
}

export default ChooseMode;
