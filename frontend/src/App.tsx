import { useState } from "react";
import "./App.css";
import { Button } from "@mui/material";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 className="bg-blue-500">Vite + React</h1>
      <div className="card">
        <Button
          className="bg-blue-500"
          variant="contained"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="text-3xl font-bold underline">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
