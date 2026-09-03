import { useCallback, useEffect, useRef, useState } from "react";

const images = [
  "/images/BROTHel at night - Critical 26.jpg",
  "/images/BROTHel crew - Critical 26.jpeg",
];

function Carousel() {
  const [index, setIndex] = useState(0);
  const timer = useRef<number | null>(null);

  const goTo = useCallback(
    (next: number) => setIndex(((next % images.length) + images.length) % images.length),
    [],
  );

  useEffect(() => {
    timer.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4000);
    return () => {
      if (timer.current !== null) window.clearInterval(timer.current);
    };
  }, []);

  function handleClick(next: number) {
    goTo(next);
    if (timer.current !== null) {
      window.clearInterval(timer.current);
      timer.current = window.setInterval(() => {
        setIndex((i) => (i + 1) % images.length);
      }, 4000);
    }
  }

  return (
    <div className="carousel">
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src) => (
          <div className="carousel-slide" key={src}>
            <img src={src} alt="Camp scenery" loading="lazy" />
          </div>
        ))}
      </div>

      <button
        className="carousel-btn prev"
        aria-label="Previous image"
        onClick={() => handleClick(index - 1)}
      >
        &#8249;
      </button>
      <button
        className="carousel-btn next"
        aria-label="Next image"
        onClick={() => handleClick(index + 1)}
      >
        &#8250;
      </button>

      <div className="carousel-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            aria-label={`Go to image ${i + 1}`}
            onClick={() => handleClick(i)}
          />
        ))}
      </div>
    </div>
  );
}

function Home() {
  return (
    <div className="app">
      <main className="main">
        <section className="about" id="blurb">
          <h2>Late Nite Noodz</h2>
          <p>
            We're the BROTHel, a Burning Man camp serving up late night pho and offering a chill, retro spot.
          </p>
        </section>
        <section className="gallery" id="gallery">
          <Carousel />
        </section>

        <section className="about" id="about">
          <h2>The Lore</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </section>

        <section className="contact" id="contact">
          <h2>Contact Us</h2>
          <p>Have questions or want to learn more? Reach out to us!</p>
        </section>
      </main>
    </div>
  );
}

export default Home;
