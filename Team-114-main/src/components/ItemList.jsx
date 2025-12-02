const ItemList = ({ categorized, items }) => {
  if (!categorized || Object.keys(categorized).length === 0) {
    return null;
  }

  const categoryEmojis = {
    food: '',
    clothing: '',
    shelter: '',
    hygiene: '',
    tools: '',
    safety: '',
    misc: ''
  };

  const categoryNames = {
    food: 'Food & Drinks',
    clothing: 'Clothing',
    shelter: 'Shelter & Protection',
    hygiene: 'Hygiene & Health',
    tools: 'Tools & Utilities', 
    safety: 'Safety & Emergency',
    misc: 'Miscellaneous'
  };

  const getCategoryDescription = (category, count) => {
    const descriptions = {
      food: `${count} food item${count !== 1 ? 's' : ''} - Essential for nutrition and energy`,
      clothing: `${count} clothing item${count !== 1 ? 's' : ''} - Protection and comfort`,
      shelter: `${count} shelter item${count !== 1 ? 's' : ''} - Weather protection and warmth`,
      hygiene: `${count} hygiene item${count !== 1 ? 's' : ''} - Health and cleanliness`,
      tools: `${count} tool${count !== 1 ? 's' : ''} - Daily functionality and tasks`,
      safety: `${count} safety item${count !== 1 ? 's' : ''} - Emergency preparedness`,
      misc: `${count} miscellaneous item${count !== 1 ? 's' : ''} - Various utilities`
    };
    return descriptions[category] || `${count} item${count !== 1 ? 's' : ''}`;
  };

  const totalItems = Object.values(categorized).flat().length;

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
        }}>Analysis Results</h2>
        <div style={{
          color: '#9d9d9d',
          fontSize: '1.1rem'
        }}>
          Found {totalItems} item{totalItems !== 1 ? 's' : ''} in {Object.keys(categorized).length} categor{Object.keys(categorized).length !== 1 ? 'ies' : 'y'}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {Object.entries(categorized).map(([category, categoryItems]) => (
          <div key={category} style={{
            background: 'rgba(37, 37, 38, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #3e3e42',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '15px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span style={{
                  fontSize: '24px'
                }}>{categoryEmojis[category]}</span>
                <h3 style={{
                  color: '#cccccc',
                  fontSize: '1.2rem',
                  margin: 0
                }}>{categoryNames[category] || category}</h3>
              </div>
              <div style={{
                backgroundColor: '#007acc',
                color: 'white',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                {categoryItems.length}
              </div>
            </div>
            
            <div style={{
              color: '#9d9d9d',
              fontSize: '0.9rem',
              marginBottom: '15px'
            }}>
              {getCategoryDescription(category, categoryItems.length)}
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '15px'
            }}>
              {categoryItems.map((item, index) => (
                <div key={index} style={{
                  background: '#2d2d30',
                  border: '1px solid #3e3e42',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  color: '#cccccc',
                  fontSize: '0.9rem'
                }}>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '15px'
            }}>
              <div style={{
                height: '4px',
                backgroundColor: '#2d2d30',
                borderRadius: '2px',
                overflow: 'hidden',
                marginBottom: '8px'
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min((categoryItems.length / 5) * 100, 100)}%`,
                  backgroundColor: categoryItems.length >= 3 ? '#4ec9b0' : categoryItems.length >= 1 ? '#dcdcaa' : '#f48771',
                  transition: 'width 0.3s ease'
                }}></div>
              </div>
              <div style={{
                color: categoryItems.length >= 3 ? '#4ec9b0' : categoryItems.length >= 1 ? '#dcdcaa' : '#f48771',
                fontSize: '0.85rem',
                fontWeight: '600'
              }}>
                {categoryItems.length >= 3 ? 'Well stocked' : 
                 categoryItems.length >= 1 ? 'Moderate' : 'Limited'}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: 'rgba(37, 37, 38, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: '12px',
        padding: '20px',
        border: '1px solid #3e3e42',
        marginTop: '20px'
      }}>
        <details>
          <summary style={{
            color: '#cccccc',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: '600',
            padding: '10px 0'
          }}>All Detected Items ({items?.length || 0})</summary>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            marginTop: '15px'
          }}>
            {items?.map((item, index) => (
              <span key={index} style={{
                background: '#2d2d30',
                border: '1px solid #3e3e42',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#cccccc',
                fontSize: '0.9rem'
              }}>{item}</span>
            )) || []}
          </div>
        </details>
      </div>
    </div>
  );
};

export default ItemList;