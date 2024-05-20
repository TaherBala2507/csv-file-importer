// Importing React and the CSVUploader component
import React from 'react';
import CSVUploader from './CSVUploader';

// Defining the main App component
const App = () => {
  // App component returns a single div element containing a header with the CSVUploader component
  return (
    <div className="App">
      <header className="App-header">
        {/* Rendering the CSVUploader component */}
        <CSVUploader />
      </header>
    </div>
  );
};
// Exporting the App component as the default export
export default App;