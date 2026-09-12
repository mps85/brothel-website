import { Link } from "react-router-dom";

function Campmates() {
  return (
    <div className="app">
      <main className="main">
        <section className="campmates">
          <h1>For Campmates</h1>
          <p>
            <Link to="/message-board">Message Board</Link>
          </p>
        </section>
      </main>
    </div>
  );
}

export default Campmates;
