const Bubble = ({ x, y }) => {
    return (
      <div
        style={{
          position: 'absolute',
          left: `${x - 20}px`, // Offset slightly to center the bubble on the mouse
          top: `${y - 20}px`, // Offset slightly to center the bubble on the mouse
          backgroundColor: 'rgba(0, 255, 0, 0.6)',
          padding: '10px',
          borderRadius: '50%',
          pointerEvents: 'none', // Prevent the bubbles from blocking clicks
          transition: 'transform 0.3s ease-out',
        }}
      >
        Bubble
      </div>
    );
  };
  
  export default Bubble;
  