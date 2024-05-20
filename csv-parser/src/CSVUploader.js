// CSVUploader component using React and some utility libraries
import React, { useState } from 'react';
import axios from 'axios';
import {
  Form,
  Button,
  Container,
  Alert,
  Spinner,
} from 'react-bootstrap'; // Importing necessary components from react-bootstrap library

const CSVUploader = () => {
  // Initializing state variables using React's useState hook
  const [file, setFile] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  // Handling form submission
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError('Please select a CSV file.');
      return;
    }
    // Creating a new FormData object and appending the selected CSV file to it
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Sending a POST request to the server to import the CSV file
      const response = await axios.post(
        'http://localhost:3000/import',
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentCompleted);
          },
        }
      );

      setRequestId(response.data.requestId);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while uploading the file.');
      setProgress(0);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setFile(file);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid CSV file.');
    }
  };

  const handleDataFetch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/data/${requestId}`
      );

      setData(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while fetching the data.');
    }
  };

  // Rendering the CSV uploader form and UI components
  return (
    <Container className="csv-uploader">
      <h1 className="mb-4">CSV Uploader</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formFile" className="mb-4">
          <Form.Label>Select a CSV file</Form.Label>
          <Form.Control type="file" onChange={handleFileChange} />
          {error && <Form.Text className="text-danger">{error}</Form.Text>}
        </Form.Group>
        <Button variant="primary" type="submit" disabled={!file}>
          Upload
          {progress > 0 && (
            <Spinner
              animation="border"
              role="status"
              size="sm"
              className="ml-2"
            >
              <span className="sr-only">Loading...</span>
            </Spinner>
          )}
        </Button>
      </Form>
      {requestId && (
        <>
          <hr />
          <h2>Data</h2>
          <Button variant="secondary" onClick={handleDataFetch}>
            Fetch Data
          </Button>
          {error && <Alert variant="danger">{error}</Alert>}
          <table className="table">
            <thead>
              <tr>
                <th>Column 1</th>
                <th>Column 2</th>
                <th>Column 3</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index}>
                  <td>{row[0]}</td>
                  <td>{row[1]}</td>
                  <td>{row[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      {progress > 0 && (
        <div className="progress-bar-container">
          <progress value={progress} max="100" />
          <span>{`${progress}%`}</span>
        </div>
      )}
    </Container>
  );
};

export default CSVUploader; // Exporting the CSVUploader component