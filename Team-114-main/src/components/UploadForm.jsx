import { useState } from 'react';

/**
 * Upload form component for image analysis
 * @component
 * @param {Object} props - Component properties
 * @param {Function} props.onAnalysisComplete - Callback function when analysis is complete
 * @param {boolean} props.isLoading - Loading state indicator
 * @param {Function} props.setIsLoading - Function to update loading state
 * @returns {JSX.Element} Upload form interface
 */
const UploadForm = ({ onAnalysisComplete, isLoading, setIsLoading }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [budget, setBudget] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  /**
   * Handles file selection and creates preview URL
   * @param {File} file - Selected image file
   */
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      alert('Please select a valid image file');
    }
  };

  /**
   * Handles drag events for file upload area
   * @param {DragEvent} e - Drag event object
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  /**
   * Handles file drop events
   * @param {DragEvent} e - Drop event object
   */
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      alert('Please select an image first');
      return;
    }

    setIsLoading(true);

    try {
      // Create FormData to send image to server
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (budget) {
        formData.append('budget', budget);
      }
      
      // Get user location if available
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 300000 // 5 minutes
            });
          });
          formData.append('lat', position.coords.latitude);
          formData.append('lng', position.coords.longitude);
          console.log('Location added:', position.coords.latitude, position.coords.longitude);
        } catch (locationError) {
          console.warn('Location not available:', locationError.message);
        }
      }

      // Import API configuration
      const { API_ENDPOINTS } = await import('../config.js')
      
      // Call the server API
      const response = await fetch(API_ENDPOINTS.analyze, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const results = await response.json();
      
      // Transform server response to match component expectations
      const transformedResults = {
        items: results.items?.map(item => item.name) || [],
        categorized: {},
        suggestions: [],
        budgetRecommendations: null,
        budget: results.budget,
        weather: results.weather
      };

      // Transform categorized items
      if (results.categorized) {
        Object.keys(results.categorized).forEach(category => {
          transformedResults.categorized[category] = results.categorized[category].map(item => 
            typeof item === 'string' ? item : item.name
          );
        });
      }

      // Transform suggestions
      if (results.suggestions?.general) {
        transformedResults.suggestions = results.suggestions.general.map(s => 
          typeof s === 'string' ? s : `${s.title}: ${s.description}`
        );
      }

      // Transform budget recommendations
      if (results.suggestions?.budgetRecommendations?.length > 0) {
        const recs = results.suggestions.budgetRecommendations;
        transformedResults.budgetRecommendations = {
          totalSpent: recs.reduce((sum, r) => sum + r.price, 0),
          remainingBudget: budget ? parseFloat(budget) - recs.reduce((sum, r) => sum + r.price, 0) : 0,
          recommendations: recs
        };
      }

      onAnalysisComplete(transformedResults);
    } catch (error) {
      console.error('Analysis error:', error);
      alert(`Analysis failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setBudget('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div style={{
      background: 'rgba(37, 37, 38, 0.6)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRadius: '16px',
      padding: '50px',
      margin: '15px 0',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px #3e3e42, inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      border: '1px solid #3e3e42',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {!previewUrl ? (
        <div
          style={{
            border: `2px dashed ${dragActive ? '#007acc' : '#3e3e42'}`,
            borderRadius: '12px',
            padding: '60px 40px',
            textAlign: 'center',
            background: dragActive ? 'rgba(0, 122, 204, 0.1)' : 'linear-gradient(135deg, #2d2d30, #363636)',
            transition: 'all 0.25s ease',
            cursor: 'pointer',
            marginBottom: '30px',
            transform: dragActive ? 'scale(1.02)' : 'none'
          }}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('imageInput').click()}
        >
          <div style={{
            fontSize: '48px',
            color: '#9d9d9d',
            marginBottom: '20px'
          }}>⬆</div>
          <h3 style={{
            color: '#cccccc',
            marginBottom: '10px',
            fontSize: '1.2rem'
          }}>Drop your photo here or click to select</h3>
          <p style={{
            color: '#9d9d9d',
            marginBottom: '20px'
          }}>Supports: JPG, PNG, WebP</p>
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 28px',
              border: '1px solid #3e3e42',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #2d2d30, #363636)',
              color: '#cccccc',
              transition: 'all 0.25s ease'
            }}
            onClick={(e) => {
              e.stopPropagation();
              document.getElementById('imageInput').click();
            }}
          >
            Choose File
          </button>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <img
            src={previewUrl}
            alt="Preview"
            style={{
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: '8px',
              border: '1px solid #3e3e42',
              marginBottom: '15px'
            }}
          />
          <br />
          <button
            type="button"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              background: 'linear-gradient(135deg, #f48771, #e74c3c)',
              color: 'white',
              transition: 'all 0.25s ease',
              boxShadow: '0 4px 20px rgba(244, 135, 113, 0.3)'
            }}
            onClick={resetForm}
          >
            × Remove
          </button>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor="budgetInput"
          style={{
            display: 'block',
            marginBottom: '8px',
            color: '#cccccc'
          }}
        >
          Budget (Optional):
        </label>
        <input
          type="number"
          id="budgetInput"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="Enter your budget"
          min="0"
          step="1"
          style={{
            width: '100%',
            padding: '14px 16px',
            backgroundColor: '#2d2d30',
            border: '1px solid #3e3e42',
            borderRadius: '8px',
            color: '#cccccc',
            fontSize: '16px',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#007acc';
            e.target.style.boxShadow = '0 0 0 3px rgba(0, 122, 204, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#3e3e42';
            e.target.style.boxShadow = 'none';
          }}
        />
        <small style={{
          color: '#9d9d9d',
          fontSize: '0.9rem',
          marginTop: '5px',
          display: 'block'
        }}>
          Get personalized purchase recommendations based on your budget
        </small>
      </div>

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={!selectedFile || isLoading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '18px 36px',
          border: '1px solid #1177bb',
          borderRadius: '8px',
          cursor: selectedFile && !isLoading ? 'pointer' : 'not-allowed',
          fontSize: '18px',
          fontWeight: '700',
          width: '100%',
          minHeight: '56px',
          background: 'linear-gradient(135deg, #007acc 0%, #1177bb 100%)',
          color: 'white',
          transition: 'all 0.25s ease',
          boxShadow: '0 4px 20px rgba(0, 122, 204, 0.3)',
          opacity: selectedFile && !isLoading ? 1 : 0.6,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'inherit',
          letterSpacing: '0.025em'
        }}
      >
        Analyze Resources
      </button>
    </div>
  );
};

export default UploadForm;