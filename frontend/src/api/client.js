const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Handle fetch responses and errors centrally.
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }
  
  return response.json();
}

/**
 * Calls the AI to generate clarifying questions based on a raw idea.
 * @param {string} idea - The raw product idea
 * @returns {Promise<{questions: string[]}>}
 */
export async function getClarifyingQuestions(idea) {
  return fetchApi('/ai/clarify', {
    method: 'POST',
    body: JSON.stringify({ idea }),
  });
}

/**
 * Calls the AI to generate a markdown spec from the idea and QA.
 * @param {string} idea - The raw product idea
 * @param {string[]} questions - The clarifying questions asked
 * @param {string[]} answers - The answers provided
 * @returns {Promise<{spec: string}>}
 */
export async function generateSpec(idea, questions, answers) {
  return fetchApi('/ai/generate-spec', {
    method: 'POST',
    body: JSON.stringify({ idea, questions, answers }),
  });
}

/**
 * Retrieves all saved specs.
 * @returns {Promise<any[]>}
 */
export async function getAllSpecs() {
  return fetchApi('/specs', {
    method: 'GET',
  });
}

/**
 * Retrieves a single spec by ID.
 * @param {number|string} id - The integer ID of the spec
 * @returns {Promise<any>}
 */
export async function getSpec(id) {
  return fetchApi(`/specs/${id}`, {
    method: 'GET',
  });
}

/**
 * Creates a new spec record in the database.
 * @param {Object} data - Information to save (title, raw_idea, etc)
 * @returns {Promise<any>}
 */
export async function createSpec(data) {
  return fetchApi('/specs', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Updates an existing spec in the database.
 * @param {number|string} id - The integer ID of the spec
 * @param {Object} data - Fields to update (e.g. status)
 * @returns {Promise<any>}
 */
export async function updateSpec(id, data) {
  return fetchApi(`/specs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Deletes a spec from the database.
 * @param {number|string} id - The integer ID of the spec
 * @returns {Promise<{message: string}>}
 */
export async function deleteSpec(id) {
  return fetchApi(`/specs/${id}`, {
    method: 'DELETE',
  });
}
