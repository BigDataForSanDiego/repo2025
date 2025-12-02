export async function fetchLocalData(month: string) {
  const response = await fetch(`/api/data?month=${month}`);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return response.json();
}

