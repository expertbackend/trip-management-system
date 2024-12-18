import { useState } from "react";

const Rating = ({ initialRating, onRate }) => {
  const [rating, setRating] = useState(initialRating);

  const handleStarClick = (newRating) => {
    setRating(newRating);
    onRate(newRating); // Notify parent component of the new rating
  };

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        onClick={() => handleStarClick(i)}
        className={`cursor-pointer text-2xl ${i <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
      >
        ★
      </span>
    );
  }

  return (
    <div className="flex">
      {stars}
    </div>
  );
};

export default Rating;
