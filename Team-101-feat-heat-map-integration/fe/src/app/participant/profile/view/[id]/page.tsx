'use client';

import { useState, useEffect } from 'react';
import { useAdminAuth } from '@/app/context/AdminAuthContext';
import { useEmployerAuth } from '@/app/context/EmployerAuthContext';
import { useRouter, useParams } from 'next/navigation';

export default function ViewParticipantProfilePage() {
  const { admin } = useAdminAuth();
  const { employer } = useEmployerAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!admin && !employer) {
      return;
    }
    
    fetch(`http://localhost:8000/api/v1/profile/participant/${id}`)
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        setLoading(false);
      });
  }, [admin, employer, id]);

  if (!admin && !employer) return <div className="min-h-screen flex items-center justify-center">Access Denied</div>;
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center">Profile not found</div>;

  const getGenderLabel = (gender: string) => {
    const labels: any = {
      'MALE': 'Male',
      'FEMALE': 'Female',
      'NON_BINARY': 'Non-Binary',
      'UNKNOWN': 'Prefer not to say'
    };
    return labels[gender] || gender;
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
            {admin && (
              <button
                onClick={() => router.push(`/participant/profile/${id}`)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Edit Profile
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Display Name</label>
              <p className="text-lg font-semibold text-gray-800">{profile.display_name}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
              <p className="text-lg text-gray-800">{profile.phone || 'Not provided'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
              <p className="text-lg text-gray-800">{profile.email || 'Not provided'}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Preferred Contact</label>
              <p className="text-lg text-gray-800">{profile.preferred_contact}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
              <p className="text-lg text-gray-800">{getGenderLabel(profile.gender)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">Veteran Status</label>
                <p className="text-lg font-semibold text-gray-800">
                  {profile.veteran_status ? '✓ Yes' : '✗ No'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">Disability</label>
                <p className="text-lg font-semibold text-gray-800">
                  {profile.disability ? '✓ Yes' : '✗ No'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
