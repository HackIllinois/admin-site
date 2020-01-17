import React from 'react';
import Lottie from 'react-lottie';

import animationData from 'assets/animations/car.json';
import './style.scss';

export default function Loading() {
  const options = { animationData, autoplay: true, loop: true };
  const style = { marginRight: '15%', width: '80%', height: '80%' };

  return (
    <div id="Loading">
      <Lottie id="car" options={options} style={style} />
      <h1>Loading...</h1>
    </div>
  );
}