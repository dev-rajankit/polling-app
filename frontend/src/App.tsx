import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import PollView from "./pages/PollView";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/poll/:pollId" element={<PollView />} />
        </Routes>
      </>
    </Suspense>
  );
}

export default App;
