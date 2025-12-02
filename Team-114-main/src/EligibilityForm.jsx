import { useState } from 'react'
import { db } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import './universal.css'

/**
 * Eligibility Form component for checking assistance program eligibility
 * @component
 * @returns {JSX.Element} The eligibility form interface
 */
function EligibilityForm() {
  const [formData, setFormData] = useState({
    householdSize: '',
    monthlyIncome: '',
    hasChildren: false,
    childrenUnder5: false,
    isPregnant: false,
    isVeteran: false,
    hasDisability: false,
    isHomeless: false,
    isElderly: false,
    hasUtilities: false,
    rentAmount: '',
    hasInsurance: false,
    employmentStatus: '',
    citizenshipStatus: 'citizen'
  })

  const [hasConsent, setHasConsent] = useState(false)

  const [results, setResults] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    console.log('EligibilityForm: Processing eligibility check')
    console.log('EligibilityForm: Form data:', formData)
    console.log('EligibilityForm: User consent status:', hasConsent)
    
    // Enhanced eligibility logic with more programs
    const eligiblePrograms = []
    const monthlyIncome = parseFloat(formData.monthlyIncome) || 0
    const annualIncome = monthlyIncome * 12
    const householdSize = parseInt(formData.householdSize) || 1
    
    // Federal Poverty Guidelines 2024 (simplified)
    const povertyLine = 14580 + (5140 * (householdSize - 1))
    const snap130 = povertyLine * 1.30 // 130% of poverty line for SNAP
    const snap200 = povertyLine * 2.00 // 200% for some programs
    
    // SNAP (Food Assistance)
    if (annualIncome <= snap130 || formData.isHomeless) {
      eligiblePrograms.push({
        name: 'SNAP (Food Assistance)',
        description: `Monthly food benefits ($194-$939 based on household size). Income limit: $${Math.round(snap130/12)}/month`,
        priority: 'high',
        category: 'food'
      })
    }
    
    // Emergency Housing
    if (formData.isHomeless) {
      eligiblePrograms.push({
        name: 'Emergency Housing Assistance',
        description: 'Immediate shelter, transitional housing, and rental assistance',
        priority: 'critical',
        category: 'housing'
      })
    }
    
    // WIC Program
    if ((formData.hasChildren && formData.childrenUnder5) || formData.isPregnant) {
      if (annualIncome <= snap200) {
        eligiblePrograms.push({
          name: 'WIC Program',
          description: 'Nutrition assistance for women, infants, and children under 5',
          priority: 'high',
          category: 'food'
        })
      }
    }
    
    // Veterans Benefits
    if (formData.isVeteran) {
      eligiblePrograms.push({
        name: 'VA Benefits Package',
        description: 'Healthcare, disability compensation, housing assistance, and job training',
        priority: 'high',
        category: 'healthcare'
      })
    }
    
    // Disability Benefits
    if (formData.hasDisability) {
      eligiblePrograms.push({
        name: 'SSDI/SSI',
        description: 'Social Security disability benefits and supplemental income',
        priority: 'high',
        category: 'income'
      })
    }
    
    // TANF (Temporary Assistance)
    if (formData.hasChildren && annualIncome < povertyLine * 1.5) {
      eligiblePrograms.push({
        name: 'TANF',
        description: 'Temporary cash assistance and job training for families with children',
        priority: 'medium',
        category: 'income'
      })
    }
    
    // Medicaid
    if (annualIncome <= povertyLine * 1.38 || formData.isHomeless || formData.hasDisability || formData.isPregnant) {
      eligiblePrograms.push({
        name: 'Medicaid',
        description: 'Free healthcare coverage including doctor visits, prescriptions, and hospital care',
        priority: 'high',
        category: 'healthcare'
      })
    }
    
    // LIHEAP (Energy Assistance)
    if (annualIncome <= povertyLine * 1.5 && formData.hasUtilities) {
      eligiblePrograms.push({
        name: 'LIHEAP',
        description: 'Help with heating, cooling, and energy bills',
        priority: 'medium',
        category: 'utilities'
      })
    }
    
    // Senior Programs
    if (formData.isElderly) {
      eligiblePrograms.push({
        name: 'Senior Benefits',
        description: 'Senior nutrition programs, Medicare assistance, and additional support services',
        priority: 'medium',
        category: 'senior'
      })
    }
    
    // Housing Choice Voucher (Section 8)
    if (annualIncome <= povertyLine * 0.8 && formData.rentAmount) {
      eligiblePrograms.push({
        name: 'Housing Choice Voucher',
        description: 'Section 8 rental assistance - covers portion of rent in private housing',
        priority: 'medium',
        category: 'housing'
      })
    }
    
    setResults(eligiblePrograms)
    setCurrentStep(4) // Results step

    // Store eligibility assessment in Firebase if user consented
    if (hasConsent) {
      try {
        console.log('EligibilityForm: Storing assessment results in Firebase')
        console.log('EligibilityForm: Results data:', eligiblePrograms)
        
        const assessmentDoc = {
          assessmentType: 'benefit_eligibility',
          timestamp: serverTimestamp(),
          timeUTC: new Date().toISOString(),
          userConsent: hasConsent,
          householdInfo: {
            size: parseInt(formData.householdSize) || 0,
            monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
            annualIncome: (parseFloat(formData.monthlyIncome) || 0) * 12,
            employmentStatus: formData.employmentStatus,
            citizenshipStatus: formData.citizenshipStatus
          },
          demographics: {
            hasChildren: formData.hasChildren,
            childrenUnder5: formData.childrenUnder5,
            isPregnant: formData.isPregnant,
            isVeteran: formData.isVeteran,
            hasDisability: formData.hasDisability,
            isHomeless: formData.isHomeless,
            isElderly: formData.isElderly
          },
          housing: {
            isHomeless: formData.isHomeless,
            rentAmount: parseFloat(formData.rentAmount) || 0,
            hasUtilities: formData.hasUtilities
          },
          other: {
            hasInsurance: formData.hasInsurance
          },
          assessmentId: `eligibility_assessment_${Date.now()}`
        }
        
        // Use a generic city name since we don't have location in this form
        await addDoc(collection(db, 'user_analysis', 'benefit_assessments', 'general'), assessmentDoc)
        console.log('EligibilityForm: Successfully stored assessment in Firebase')
      } catch (firebaseError) {
        console.error('EligibilityForm: Failed to store assessment in Firebase:', firebaseError)
        // Don't throw error - assessment was successful, just logging failed
      }
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Household Information
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Household Size *
              </label>
              <input
                type="number"
                name="householdSize"
                value={formData.householdSize}
                onChange={handleInputChange}
                required
                min="1"
                max="20"
                className="form-control"
                placeholder="Number of people in household"
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Monthly Household Income *
              </label>
              <input
                type="number"
                name="monthlyIncome"
                value={formData.monthlyIncome}
                onChange={handleInputChange}
                required
                min="0"
                className="form-control"
                placeholder="Total monthly income (before taxes)"
              />
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Include all sources: wages, benefits, assistance, etc.
              </small>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Employment Status
              </label>
              <select
                name="employmentStatus"
                value={formData.employmentStatus}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="">Select status</option>
                <option value="employed-full">Employed Full-time</option>
                <option value="employed-part">Employed Part-time</option>
                <option value="unemployed">Unemployed</option>
                <option value="disabled">Unable to work (disability)</option>
                <option value="retired">Retired</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                Citizenship Status
              </label>
              <select
                name="citizenshipStatus"
                value={formData.citizenshipStatus}
                onChange={handleInputChange}
                className="form-control"
              >
                <option value="citizen">U.S. Citizen</option>
                <option value="resident">Legal Permanent Resident</option>
                <option value="refugee">Refugee/Asylee</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        )

      case 2:
        return (
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Personal Circumstances
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  name="hasChildren"
                  checked={formData.hasChildren}
                  onChange={handleInputChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>I have children under 18</span>
              </label>
            </div>

            {formData.hasChildren && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    name="childrenUnder5"
                    checked={formData.childrenUnder5}
                    onChange={handleInputChange}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span style={{ color: 'var(--text-primary)' }}>I have children under 5 years old</span>
                </label>
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  name="isPregnant"
                  checked={formData.isPregnant}
                  onChange={handleInputChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>I am pregnant</span>
              </label>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  name="isVeteran"
                  checked={formData.isVeteran}
                  onChange={handleInputChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>I am a military veteran</span>
              </label>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  name="hasDisability"
                  checked={formData.hasDisability}
                  onChange={handleInputChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>I have a disability</span>
              </label>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  name="isElderly"
                  checked={formData.isElderly}
                  onChange={handleInputChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>I am 60 years or older</span>
              </label>
            </div>
          </div>
        )

      case 3:
        return (
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Housing & Expenses
            </h3>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  name="isHomeless"
                  checked={formData.isHomeless}
                  onChange={handleInputChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>I am currently homeless or at risk of homelessness</span>
              </label>
            </div>

            {!formData.isHomeless && (
              <>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    Monthly Rent/Housing Cost
                  </label>
                  <input
                    type="number"
                    name="rentAmount"
                    value={formData.rentAmount}
                    onChange={handleInputChange}
                    min="0"
                    className="form-control"
                    placeholder="Monthly rent or mortgage payment"
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.75rem',
                    padding: '0.75rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      name="hasUtilities"
                      checked={formData.hasUtilities}
                      onChange={handleInputChange}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ color: 'var(--text-primary)' }}>I pay for heating, cooling, or electric utilities</span>
                  </label>
                </div>
              </>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  name="hasInsurance"
                  checked={formData.hasInsurance}
                  onChange={handleInputChange}
                  style={{ width: '16px', height: '16px' }}
                />
                <span style={{ color: 'var(--text-primary)' }}>I have health insurance</span>
              </label>
            </div>
          </div>
        )

      case 4:
        return (
          <div>
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Data Privacy Consent
            </h3>
            
            <div style={{ 
              padding: '1.5rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              marginBottom: '1.5rem'
            }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '1rem', lineHeight: '1.6' }}>
                To check your eligibility for benefit programs, we process your household and financial information. 
                This data is used only to determine program eligibility and is not permanently stored or shared with third parties.
              </p>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '0.75rem',
                  cursor: 'pointer',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  border: hasConsent ? '2px solid var(--success)' : '2px solid var(--border)'
                }}>
                  <input
                    type="checkbox"
                    checked={hasConsent}
                    onChange={(e) => setHasConsent(e.target.checked)}
                    style={{ width: '16px', height: '16px', marginTop: '2px' }}
                  />
                  <span style={{ color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    I consent to processing my information to check eligibility for assistance programs. 
                    I understand this data is used temporarily for analysis purposes only.
                  </span>
                </label>
              </div>

              <div style={{ 
                padding: '1rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)'
              }}>
                <strong>Note:</strong> You can proceed without consent, but providing consent helps us improve our services and may enable additional features in the future.
              </div>
            </div>

            {results && (
              <div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                  Your Eligible Programs
                </h3>
                {results && results.length === 0 ? (
                  <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--text-secondary)' }}>
                      Based on the information provided, we couldn't find any programs you may be eligible for. 
                      Consider consulting with a local social services office for personalized assistance.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {results?.map((program, index) => (
                      <div
                        key={index}
                        className="card"
                        style={{
                          borderLeft: `4px solid ${
                            program.priority === 'critical' ? 'var(--error)' : 
                            program.priority === 'high' ? 'var(--accent)' : 'var(--success)'
                          }`
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <h4 style={{ 
                            color: 'var(--text-primary)',
                            margin: 0,
                            fontSize: '1.1rem'
                          }}>
                            {program.name}
                          </h4>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            backgroundColor: 
                              program.priority === 'critical' ? 'var(--error)' : 
                              program.priority === 'high' ? 'var(--accent)' : 'var(--success)',
                            color: 'white'
                          }}>
                            {program.priority.toUpperCase()}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                          {program.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.8rem', fontWeight: '400' }}>
          Program Eligibility Assessment
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Complete this assessment to determine which assistance programs you may qualify for.
        </p>
      </div>

      {/* Progress Indicator */}
      {currentStep <= totalSteps && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Step {currentStep} of {totalSteps}
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '4px', 
            backgroundColor: 'var(--bg-tertiary)', 
            borderRadius: '2px' 
          }}>
            <div style={{ 
              width: `${(currentStep / totalSteps) * 100}%`, 
              height: '100%', 
              backgroundColor: 'var(--accent)', 
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="card">
        {currentStep <= totalSteps ? (
          <form onSubmit={currentStep === totalSteps ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            {renderStep()}
            
            {/* Navigation Buttons */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid var(--border)'
            }}>
              <button
                type="button"
                onClick={prevStep}
                className="btn btn-secondary"
                disabled={currentStep === 1}
                style={{ opacity: currentStep === 1 ? 0.5 : 1 }}
              >
                Previous
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
              >
                {currentStep === totalSteps ? 'Check Eligibility' : 'Next Step'}
              </button>
            </div>
          </form>
        ) : (
          <div>
            {renderStep()}
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setResults(null);
                  setFormData({
                    householdSize: '',
                    monthlyIncome: '',
                    hasChildren: false,
                    childrenUnder5: false,
                    isPregnant: false,
                    isVeteran: false,
                    hasDisability: false,
                    isHomeless: false,
                    isElderly: false,
                    hasUtilities: false,
                    rentAmount: '',
                    hasInsurance: false,
                    employmentStatus: '',
                    citizenshipStatus: 'citizen'
                  });
                }}
                className="btn btn-secondary"
              >
                Start New Assessment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EligibilityForm
