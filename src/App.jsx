import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Main from "./components/main/Main"
import Sidebar from "./components/sidebar/Sidebar"

const App = () => {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<><Main/></>} />
      <Route path="/discussions/:discussionId" element={<><Main/></>} />
    </Routes>
  </Router>
  )
}

export default App