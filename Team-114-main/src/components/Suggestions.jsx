const Suggestions = ({ suggestions, budgetRecommendations, budget, onReset }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div style={{
      width: '100%',
      marginTop: '30px'
    }}>
      <div style={{
        marginBottom: '30px',
        textAlign: 'center'
      }}>
        <h2 style={{
          color: '#cccccc',
          fontSize: '2rem',
          marginBottom: '10px'
        }}>Smart Recommendations</h2>
        <p style={{
          color: '#9d9d9d',
          fontSize: '1.1rem'
        }}>AI-powered insights to optimize your resource management</p>
      </div>

      <div>
        {/* General Suggestions */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{
            color: '#cccccc',
            fontSize: '1.5rem',
            marginBottom: '20px',
            borderLeft: '4px solid #007acc',
            paddingLeft: '15px'
          }}>Resource Analysis</h3>
          <div style={{
            display: 'grid',
            gap: '15px'
          }}>
            {suggestions.map((suggestion, index) => (
              <div key={index} style={{
                background: 'rgba(37, 37, 38, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #3e3e42',
                borderLeft: '4px solid #4ec9b0',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
                color: '#cccccc',
                fontSize: '1rem',
                lineHeight: '1.6'
              }}>
                {suggestion}
              </div>
            ))}
          </div>
        </div>

        {/* Budget Recommendations */}
        {budgetRecommendations && budgetRecommendations.recommendations && budgetRecommendations.recommendations.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{
              color: '#cccccc',
              fontSize: '1.5rem',
              marginBottom: '20px',
              borderLeft: '4px solid #4ec9b0',
              paddingLeft: '15px'
            }}>Budget Recommendations (${budget})</h3>
            
            <div style={{
              background: 'rgba(37, 37, 38, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #3e3e42',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px'
              }}>
                <div>
                  <span style={{
                    color: '#9d9d9d',
                    fontSize: '0.9rem'
                  }}>Total Spent:</span>
                  <span style={{
                    color: '#cccccc',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginLeft: '10px'
                  }}>${budgetRecommendations.totalSpent.toFixed(2)}</span>
                </div>
                <div>
                  <span style={{
                    color: '#9d9d9d',
                    fontSize: '0.9rem'
                  }}>Remaining:</span>
                  <span style={{
                    color: '#4ec9b0',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    marginLeft: '10px'
                  }}>${budgetRecommendations.remainingBudget}</span>
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gap: '15px'
            }}>
              {budgetRecommendations.recommendations.map((rec, index) => (
                <div key={index} style={{
                  background: 'rgba(37, 37, 38, 0.6)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid #3e3e42',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                  }}>
                    <span style={{
                      color: '#007acc',
                      fontSize: '0.9rem',
                      fontWeight: '600',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>{rec.category}</span>
                    <span style={{
                      color: '#4ec9b0',
                      fontSize: '1.2rem',
                      fontWeight: 'bold'
                    }}>${rec.price}</span>
                  </div>
                  <div style={{
                    color: '#cccccc',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}>{rec.item}</div>
                  <div style={{
                    color: '#9d9d9d',
                    fontSize: '0.95rem',
                    lineHeight: '1.5'
                  }}>{rec.reason}</div>
                </div>
              ))}
            </div>

            {budgetRecommendations.remainingBudget > 0 && (
              <div style={{
                background: 'rgba(78, 201, 176, 0.1)',
                border: '1px solid #4ec9b0',
                borderRadius: '8px',
                padding: '15px 20px',
                marginTop: '20px',
                color: '#cccccc',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}>
                <span style={{ marginRight: '10px' }}>•</span>
                You have ${budgetRecommendations.remainingBudget} left - consider saving for future needs or adding more food items.
              </div>
            )}
          </div>
        )}

        {/* Priority Action Items */}
        <div style={{ marginBottom: '40px' }}>
          <h3 style={{
            color: '#cccccc',
            fontSize: '1.5rem',
            marginBottom: '20px',
            borderLeft: '4px solid #dcdcaa',
            paddingLeft: '15px'
          }}>Priority Actions</h3>
          <div style={{
            display: 'grid',
            gap: '15px'
          }}>
            <div style={{
              background: 'rgba(244, 135, 113, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #f48771',
              borderLeft: '4px solid #f48771'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px'
              }}>
                <span style={{
                  color: '#f48771',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>!</span>
                <span style={{
                  color: '#f48771',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>Immediate Needs</span>
              </div>
              <div style={{
                color: '#cccccc',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}>
                Ensure you have water (1 gallon/person/day) and at least 72 hours of food
              </div>
            </div>
            
            <div style={{
              background: 'rgba(220, 220, 170, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #dcdcaa',
              borderLeft: '4px solid #dcdcaa'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px'
              }}>
                <span style={{
                  color: '#dcdcaa',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>~</span>
                <span style={{
                  color: '#dcdcaa',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>Next Steps</span>
              </div>
              <div style={{
                color: '#cccccc',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}>
                Add hygiene supplies, basic tools, and emergency safety items
              </div>
            </div>
            
            <div style={{
              background: 'rgba(78, 201, 176, 0.1)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #4ec9b0',
              borderLeft: '4px solid #4ec9b0'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px'
              }}>
                <span style={{
                  color: '#4ec9b0',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}>*</span>
                <span style={{
                  color: '#4ec9b0',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}>Long-term Planning</span>
              </div>
              <div style={{
                color: '#cccccc',
                fontSize: '0.95rem',
                lineHeight: '1.6'
              }}>
                Build up to 2-week supply, add comfort items, and create emergency plan
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '15px',
        justifyContent: 'center',
        marginTop: '30px'
      }}>
        <button onClick={onReset} style={{
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
          transition: 'all 0.25s ease',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
        }}>
          Analyze Another Photo
        </button>
        <button 
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: 'Resourcify Analysis',
                text: 'Check out my resource analysis from Resourcify!',
                url: window.location.href
              });
            } else {
              // Fallback - copy to clipboard
              const shareText = `Resourcify Analysis:\n${suggestions.join('\n')}`;
              navigator.clipboard.writeText(shareText).then(() => {
                alert('Analysis copied to clipboard!');
              });
            }
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 28px',
            border: '1px solid #1177bb',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            background: 'linear-gradient(135deg, #007acc, #1177bb)',
            color: 'white',
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 20px rgba(0, 122, 204, 0.3)'
          }}
        >
          Share Results
        </button>
      </div>
    </div>
  );
};

export default Suggestions;