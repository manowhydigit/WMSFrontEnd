import React from "react";
import "./Gallery.css"; // Import CSS file

const Gallery = () => {
  return (
    <div className="gallery-container">
      <div className="gallery">
        <img
          src="https://assets.codepen.io/8889025/Collabrorative.PNG"
          alt="Collaborative"
        />
        <img
          src="https://assets.codepen.io/8889025/Adventurous.PNG"
          alt="Adventurous"
        />
        <img
          src="https://assets.codepen.io/8889025/Reliable.PNG"
          alt="Reliable"
        />
        <img
          src="https://assets.codepen.io/8889025/Energetic.PNG"
          alt="Energetic"
        />
      </div>

      <br />
      <a
        href="https://nhsbsauk.sharepoint.com.mcas.ms/sites/MyHub/SitePages/Our-Purpose-Vision-and-Values.aspx"
        target="_blank"
        rel="noopener noreferrer"
        className="cta-button"
      >
        Our Purpose, Vision and Values
      </a>
    </div>
  );
};

export default Gallery;
