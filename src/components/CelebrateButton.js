import React from 'react';
import confetti from 'canvas-confetti';

const CelebrateButton = () => {
  const handleCelebrate = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const button = document.getElementById('celebrateBtn');
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = 'scale(1)';
      }, 100);
    }
  };

  return (
    <button
      id="celebrateBtn"
      onClick={handleCelebrate}
      style={{
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        border: 'none',
        borderRadius: '5px',
        background: '#4CAF50',
        color: 'white',
        transition: 'transform 0.1s ease',
      }}
    >
      Celebrate!
    </button>
  );
};

export default CelebrateButton;
