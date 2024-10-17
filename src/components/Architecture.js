import React, { useState, useCallback, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import DraggableButton from './DraggableButton';
import Arrow from './Arrow';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import StorageIcon from '@mui/icons-material/Storage';
import { useNavigate } from 'react-router-dom';
import { useRestaurant } from '../context/RestaurantContext';

const Architecture = () => {
  const navigate = useNavigate();
  const { setCurrentPage } = useRestaurant();
  const buttonWidth = 300;
  const buttonHeight = 100;

  const [components, setComponents] = useState([
    { id: 'restaurant', position: { x: 0, y: 0 }, text: 'Restaurant', icon: LocalDiningIcon, path: '/restaurant' },
    { id: 'db', position: { x: 0, y: 0 }, text: 'DB', icon: StorageIcon, path: '/db' }
  ]);

  const [arrows] = useState([
    { from: 'restaurant', to: 'db' }
  ]);

  useEffect(() => {
    const updateInitialPositions = () => {
      const containerWidth = window.innerWidth;
      const containerHeight = window.innerHeight - 64; // Subtracting header height
      
      setComponents(prevComponents => prevComponents.map((comp, index) => ({
        ...comp,
        position: {
          x: (containerWidth / 3) * (index + 1) - buttonWidth / 2,
          y: containerHeight / 2 - buttonHeight / 2
        }
      })));
    };

    updateInitialPositions();
    window.addEventListener('resize', updateInitialPositions);
    return () => window.removeEventListener('resize', updateInitialPositions);
  }, [buttonWidth, buttonHeight]);

  const updateComponentPosition = useCallback((id, newPosition) => {
    setComponents(prevComponents =>
      prevComponents.map(comp =>
        comp.id === id ? { ...comp, position: newPosition } : comp
      )
    );
  }, []);

  const getArrowPositions = useCallback((fromComponent, toComponent) => {
    const fromCenter = {
      x: fromComponent.position.x + buttonWidth / 2,
      y: fromComponent.position.y + buttonHeight / 2
    };
    const toCenter = {
      x: toComponent.position.x + buttonWidth / 2,
      y: toComponent.position.y + buttonHeight / 2
    };

    const angle = Math.atan2(toCenter.y - fromCenter.y, toCenter.x - fromCenter.x);
    
    return {
      from: {
        x: fromCenter.x + Math.cos(angle) * buttonWidth / 2,
        y: fromCenter.y + Math.sin(angle) * buttonHeight / 2
      },
      to: {
        x: toCenter.x - Math.cos(angle) * buttonWidth / 2,
        y: toCenter.y - Math.sin(angle) * buttonHeight / 2
      }
    };
  }, [buttonWidth, buttonHeight]);

  const handleNavigation = (path) => {
    setCurrentPage(path.slice(1)); // Remove the leading '/'
    navigate(path);
  };

  useEffect(() => {
    setCurrentPage('architecture');
  }, [setCurrentPage]);

  return (
    <Box sx={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Typography variant="h4" sx={{ textAlign: 'center', my: 2 }}>
        Application Architecture
      </Typography>
      
      <Box sx={{ position: 'relative', height: 'calc(100% - 64px)' }}>
        <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {arrows.map((arrow, index) => {
            const fromComponent = components.find(c => c.id === arrow.from);
            const toComponent = components.find(c => c.id === arrow.to);
            const { from, to } = getArrowPositions(fromComponent, toComponent);
            return (
              <Arrow
                key={index}
                fromPos={from}
                toPos={to}
              />
            );
          })}
        </svg>

        {components.map(component => (
          <DraggableButton
            key={component.id}
            id={component.id}
            position={component.position}
            onDrag={(newPosition) => updateComponentPosition(component.id, newPosition)}
            path={component.path}
            icon={<component.icon />}
            text={component.text}
            width={buttonWidth}
            height={buttonHeight}
            onNavigate={() => handleNavigation(component.path)}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Architecture;
