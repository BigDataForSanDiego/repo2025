"use client";
import { useState } from "react";

type BudgetCategory = {
  name: string;
  amount: number;
  percentage: number;
  description: string;
  shelterRelated: boolean;
};

export default function TaxDashboardPage() {
  const [selectedYear, setSelectedYear] = useState("2024");
  
  // Sample budget data - in production, this would come from real city/county data
  const totalBudget = 5000000000; // $5 billion
  const budgetCategories: BudgetCategory[] = [
    {
      name: "Public Safety",
      amount: 1500000000,
      percentage: 30,
      description: "Police, fire, emergency services",
      shelterRelated: false,
    },
    {
      name: "Infrastructure",
      amount: 1000000000,
      percentage: 20,
      description: "Roads, utilities, public works",
      shelterRelated: false,
    },
    {
      name: "Health & Human Services",
      amount: 800000000,
      percentage: 16,
      description: "Includes some homeless services",
      shelterRelated: true,
    },
    {
      name: "Housing & Community Development",
      amount: 500000000,
      percentage: 10,
      description: "Affordable housing, homeless services",
      shelterRelated: true,
    },
    {
      name: "Parks & Recreation",
      amount: 400000000,
      percentage: 8,
      description: "Parks, libraries, community centers",
      shelterRelated: false,
    },
    {
      name: "Education",
      amount: 300000000,
      percentage: 6,
      description: "Public schools, community colleges",
      shelterRelated: false,
    },
    {
      name: "Other Services",
      amount: 500000000,
      percentage: 10,
      description: "Administration, debt service, etc.",
      shelterRelated: false,
    },
  ];

  const shelterRelatedTotal = budgetCategories
    .filter(c => c.shelterRelated)
    .reduce((sum, c) => sum + c.amount, 0);
  
  const shelterRelatedPercentage = (shelterRelatedTotal / totalBudget) * 100;

  return (
    <div className="grid gap-6">
      <div className="card">
        <h1 className="h1">Tax Transparency Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          See where San Diego County tax dollars go and how funding can support permanent shelters for people experiencing homelessness.
        </p>
      </div>

      <div className="card">
        <label className="block text-sm font-medium mb-2">Fiscal Year:</label>
        <select className="input" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
      </div>

      <div className="card bg-green-50 border-green-200">
        <h2 className="h2 text-green-900">Total Budget: ${(totalBudget / 1000000000).toFixed(1)}B</h2>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Shelter & Homeless Services Funding:</span>
            <span className="text-lg font-bold text-green-700">
              ${(shelterRelatedTotal / 1000000).toFixed(0)}M ({shelterRelatedPercentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-600 h-4 rounded-full"
              style={{ width: `${shelterRelatedPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="h2 mb-4">Budget Breakdown by Category</h2>
        <div className="space-y-4">
          {budgetCategories.map((category) => (
            <div key={category.name} className="border-b pb-4 last:border-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.shelterRelated && (
                      <span className="badge bg-green-100 text-green-800">🏠 Shelter Related</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                </div>
                <div className="text-right ml-4">
                  <div className="font-bold">${(category.amount / 1000000).toFixed(0)}M</div>
                  <div className="text-sm text-gray-500">{category.percentage}%</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${category.shelterRelated ? "bg-green-600" : "bg-blue-600"}`}
                  style={{ width: `${category.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-blue-50 border-blue-200">
        <h2 className="h2 text-blue-900">Funding Permanent Shelters</h2>
        <p className="mt-2 text-sm text-blue-800">
          <strong>Current Allocation:</strong> ${(shelterRelatedTotal / 1000000).toFixed(0)}M is currently allocated 
          to housing and homeless services ({(shelterRelatedPercentage).toFixed(1)}% of total budget).
        </p>
        <p className="mt-2 text-sm text-blue-800">
          <strong>Potential Impact:</strong> Increasing this allocation by just 1% (${(totalBudget * 0.01 / 1000000).toFixed(0)}M) 
          could fund approximately <strong>200-300 additional permanent shelter beds</strong> per year, prioritizing families first.
        </p>
        <p className="mt-2 text-sm text-blue-800">
          <strong>Long-term Savings:</strong> Permanent supportive housing reduces costs in emergency services, 
          healthcare, and criminal justice by an estimated 50-60% compared to temporary shelter solutions.
        </p>
      </div>

      <div className="card">
        <h2 className="h2">How You Can Help</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>• <strong>Contact your representatives:</strong> Advocate for increased funding for permanent supportive housing</li>
          <li>• <strong>Stay informed:</strong> Attend city council and county board meetings</li>
          <li>• <strong>Support organizations:</strong> Donate to or volunteer with local housing nonprofits</li>
          <li>• <strong>Vote:</strong> Support ballot measures and candidates prioritizing housing solutions</li>
        </ul>
      </div>

      <div className="card bg-gray-50 text-xs text-gray-600">
        <p className="font-semibold mb-2">Data Sources:</p>
        <ul className="list-disc list-inside space-y-1 mb-3">
          <li>
            <a href="https://www.sandiegocounty.gov/auditor/" className="underline" target="_blank" rel="noopener noreferrer">
              San Diego County Auditor & Controller
            </a> - Official budget documents and financial reports
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/content/sdc/auditor/budget.html" className="underline" target="_blank" rel="noopener noreferrer">
              County Budget Documents
            </a> - Adopted budgets and financial statements
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/content/sdc/auditor/transparency.html" className="underline" target="_blank" rel="noopener noreferrer">
              County Transparency Portal
            </a> - Public financial data and reports
          </li>
          <li>
            <a href="https://www.sandiegocounty.gov/content/sdc/hhsa/programs/ssp/homeless_services.html" className="underline" target="_blank" rel="noopener noreferrer">
              Health & Human Services - Homeless Services
            </a> - Homeless services funding information
          </li>
          <li>
            <a href="https://www.sandiego.gov/finance/budget" className="underline" target="_blank" rel="noopener noreferrer">
              City of San Diego Budget
            </a> - City budget and financial data
          </li>
        </ul>
        <p className="mt-3">
          <strong>Note:</strong> This dashboard uses sample data for demonstration. For actual budget figures, 
          visit the official sources above. San Diego County's fiscal year runs from July 1 to June 30. 
          Budget documents are typically published in May/June for the upcoming fiscal year.
        </p>
      </div>
    </div>
  );
}

