import "./Gallery.css";

function Gallery() {
  return (
    <section className="gallery section">
      <img className="gallery__image" alt="1" src="./src/img/stena.jpg" />
      <img className="gallery__image" alt="2" src="./src/img/army.jpg" />
      <img className="gallery__image" alt="3" src="./src/img/harbin.jpg" />
      <img className="gallery__image" alt="4" src="./src/img/most.jpg" />
    </section>
  );
}

export default Gallery;
