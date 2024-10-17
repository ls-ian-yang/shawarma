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

const theme = createTheme();

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RestaurantProvider>
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
            </Toolbar>
          </AppBar>

          <RestaurantPage />  {/* Always render RestaurantPage */}

          <Routes>
            <Route path="/" element={null} />  {/* Empty element for home route */}
            <Route path="/db" element={<DB />} />
            <Route path="/architecture" element={<Architecture />} />
          </Routes>
        </Router>
      </RestaurantProvider>
    </ThemeProvider>
  );
}

export default App;
