import React from 'react';

const Arrow = ({ fromPos, toPos }) => {
  const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x) * 180 / Math.PI;
  const arrowLength = 15;
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const arrowX = toPos.x - (dx * arrowLength / length);
  const arrowY = toPos.y - (dy * arrowLength / length);

  return (
    <g>
      <line 
        x1={fromPos.x} y1={fromPos.y}
        x2={arrowX} y2={arrowY}
        stroke="black" strokeWidth="2"
      />
      <polygon 
        points={`0,-3.5 10,0 0,3.5`}
        fill="black"
        transform={`translate(${arrowX},${arrowY}) rotate(${angle})`}
      />
    </g>
  );
};

export default Arrow;
