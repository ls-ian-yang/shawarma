import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import './App.css';
import RestaurantPage from './pages/RestaurantPage';
import DB from './components/DB';
import Architecture from './components/Architecture';
import { RestaurantProvider } from './context/RestaurantContext';
import Pipeline from './components/Pipeline';
import ModelRegistryPage from './components/ModelRegistryPage';
import { ModelRegistryProvider } from './context/ModelRegistryContext';
import Monitor from './components/Monitor';

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RestaurantProvider>
        <ModelRegistryProvider>
          <Router>
            <AppBar position="static">
              <Toolbar>
                <Button color="inherit" component={Link} to="/architecture">
                  Architecture
                </Button>
                <Button color="inherit" component={Link} to="/">
                  Restaurant
                </Button>
                <Button color="inherit" component={Link} to="/db">
                  DB
                </Button>
                <Button color="inherit" component={Link} to="/pipeline">
                  Pipeline
                </Button>
                <Button color="inherit" component={Link} to="/model-registry">
                  Model Registry
                </Button>
                <Button color="inherit" component={Link} to="/monitor">
                  Monitor
                </Button>
              </Toolbar>
            </AppBar>

            <RestaurantPage />

            <Routes>
              <Route path="/" element={null} />
              <Route path="/db" element={<DB />} />
              <Route path="/architecture" element={<Architecture />} />
              <Route path="/pipeline" element={<Pipeline />} />
              <Route path="/model-registry" element={<ModelRegistryPage />} />
              <Route path="/monitor" element={<Monitor />} />
            </Routes>
          </Router>
        </ModelRegistryProvider>
      </RestaurantProvider>
    </ThemeProvider>
  );
}

export default App;
