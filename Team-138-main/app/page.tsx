export default function Page() {
  return (
    <div className="grid gap-6">
      <div className="card">
        <h1 className="h1">Welcome to CareLink SD</h1>
        <p className="mt-2">Comprehensive support for unhoused neighbors: telehealth, resources, shelters, food, and more.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="btn btn-primary" href="/intake">I need care</a>
          <a className="btn" href="/resources">Find Resources</a>
          <a className="btn" href="/shelters">Shelters</a>
          <a className="btn" href="/food">Food Pantries</a>
          <a className="btn" href="/affordable-food">Affordable Food</a>
          <a className="btn" href="/hygiene">Hygiene</a>
          <a className="btn" href="/medical">Medical</a>
          <a className="btn" href="/staff">Staff console</a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="h2">🏥 Telehealth Services</h2>
          <p className="mt-2 text-sm">Quick consent, simple triage, and fast connection to clinicians and navigators.</p>
          <a className="btn btn-primary mt-3" href="/intake">Get Started</a>
        </div>

        <div className="card">
          <h2 className="h2">🏠 Shelter Directory</h2>
          <p className="mt-2 text-sm">Real-time availability for temporary and permanent shelters. Check in like Airbnb.</p>
          <a className="btn btn-primary mt-3" href="/shelters">View Shelters</a>
        </div>

        <div className="card">
          <h2 className="h2">🍽️ Food Pantries</h2>
          <p className="mt-2 text-sm">Find food pantries and meal services throughout San Diego County by day of week.</p>
          <a className="btn btn-primary mt-3" href="/food">Find Food</a>
        </div>

        <div className="card">
          <h2 className="h2">🛒 Affordable Food Stores</h2>
          <p className="mt-2 text-sm">Grocery stores with affordable pricing for low-income individuals. Accepts EBT, WIC, SNAP.</p>
          <a className="btn btn-primary mt-3" href="/affordable-food">Find Stores</a>
        </div>

        <div className="card">
          <h2 className="h2">🚿 Hygiene Stations</h2>
          <p className="mt-2 text-sm">Showers, restrooms, laundry, mail services with real-time availability updates.</p>
          <a className="btn btn-primary mt-3" href="/hygiene">Find Hygiene</a>
        </div>

        <div className="card">
          <h2 className="h2">⚕️ Medical Clinics</h2>
          <p className="mt-2 text-sm">Walk-in clinics with live wait times. Accepts Medi-Cal and uninsured patients.</p>
          <a className="btn btn-primary mt-3" href="/medical">Find Care</a>
        </div>

        <div className="card">
          <h2 className="h2">📍 Community Resources</h2>
          <p className="mt-2 text-sm">Shelters, food banks, social services, and transportation options with walking distances.</p>
          <a className="btn btn-primary mt-3" href="/resources">Browse Resources</a>
        </div>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <h2 className="h2 text-blue-900">💰 Tax Transparency</h2>
        <p className="mt-2 text-sm text-blue-800">
          See where tax dollars go and how funding can support permanent shelters. 
          <a href="/tax-dashboard" className="underline font-semibold ml-1">View Dashboard →</a>
        </p>
      </div>

      <div className="card">
        <h2 className="h2">Emergency</h2>
        <p className="mt-1">If you are in immediate danger or thinking about harming yourself, call <span className="font-semibold">911</span> or <span className="font-semibold">988</span> now.</p>
      </div>

      <div className="card bg-gray-50 text-xs text-gray-600">
        <p className="font-semibold mb-2">Official Resources & Data Sources:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">
              211 San Diego
            </a> - Comprehensive resource directory (Call 211 or visit online)
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/content/sdc/hhsa.html" className="underline" target="_blank" rel="noopener noreferrer">
              San Diego County Health & Human Services
            </a> - Official county services and programs
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/auditor/" className="underline" target="_blank" rel="noopener noreferrer">
              County Auditor & Controller
            </a> - Budget and financial transparency data
          </li>
        </ul>
        <p className="mt-3">
          <strong>Note:</strong> This platform uses sample data for demonstration. For official resources and real-time information, 
          contact <a href="https://211sandiego.org" className="underline" target="_blank" rel="noopener noreferrer">211 San Diego</a> 
          or call <strong>211</strong> (24/7).
        </p>
      </div>
    </div>
  );
}

