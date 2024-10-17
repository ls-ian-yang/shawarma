import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';
import { Button, Paper } from '@mui/material';

const DraggableButton = ({ id, position, onDrag, onNavigate, icon, text, width, height }) => {
  const navigate = useNavigate();
  const [dragStart, setDragStart] = useState(null);

  const handleStart = (e, data) => {
    setDragStart({ x: data.x, y: data.y });
  };

  const handleStop = (e, data) => {
    if (dragStart) {
      const dragDistance = Math.sqrt(
        Math.pow(data.x - dragStart.x, 2) + Math.pow(data.y - dragStart.y, 2)
      );
      if (dragDistance < 5) {
        onNavigate();
      }
    }
    setDragStart(null);
  };

  return (
    <Draggable 
      position={position} 
      onStart={handleStart}
      onStop={handleStop}
      onDrag={(e, data) => onDrag({ x: data.x, y: data.y })}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          position: 'absolute', 
          width: width, 
          height: height,
          userSelect: 'none',
          cursor: 'move'
        }}
      >
        <Button
          variant="contained"
          startIcon={icon}
          fullWidth
          sx={{ 
            height: '100%', 
            fontSize: '1.5rem',
            '&:hover': { cursor: 'move' } 
          }}
        >
          {text}
        </Button>
      </Paper>
    </Draggable>
  );
};

export default DraggableButton;
