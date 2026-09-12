import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'cases.json');

const normalize = (value) => String(value ?? '').trim().toLowerCase();
const cleanText = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const readCases = async () => {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
      await fs.writeFile(DATA_FILE, '[]\n', 'utf8');
      return [];
    }
    throw error;
  }
};

const writeCases = async (cases) => {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, `${JSON.stringify(cases, null, 2)}\n`, 'utf8');
};

const getCaseId = (item) => String(item.caseId || item.id || item.firId || '').trim();
const getFirId = (item) => String(item.firId || '').trim();
const getDescription = (item) => String(item.incidentDescription || item.description || item.text || '').trim();
const getStatus = (item) => normalize(item.status || item.caseStatus || 'unknown');
const getType = (item) => String(item.category || item.type || item.incidentType || 'Unknown').trim();
const getLocation = (item) => String(item.incidentLocation || item.location || item.station || item.policeStation || 'Unknown').trim();
const getDate = (item) => item.incidentDate || item.filedDate || item.createdAt || item.date || null;
const getPriority = (item) => normalize(item.priority || item.casePriority || item.severity || item.urgency || 'normal');

const isHighPriority = (item) => ['high', 'critical', 'urgent', 'emergency', 'veryhigh'].includes(getPriority(item).replace(/\s+/g, ''));

const isPending = (item) => ['pending','open','registered','underinvestigation','investigationpending','awaitinginvestigation','awaitingaction','inprogress','active'].includes(getStatus(item).replace(/[\s_-]+/g, ''));

const inRange = (item, from, to) => {
  const date = new Date(getDate(item));
  if (Number.isNaN(date.getTime())) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
};

const countBy = (items, getter) => {
  const map = new Map();
  for (const item of items) {
    const key = getter(item) || 'Unknown';
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

// Lightweight local NLP. It requires no API key and is deliberately kept as a
// decision-support layer. A future ML model can replace these functions without
// changing the case/analytics API contract.
const CATEGORY_PROFILES = {
  'Cyber Crime': ['cyber', 'online', 'internet', 'phishing', 'otp', 'bank', 'upi', 'password', 'hacked', 'fraud', 'scam', 'transaction'],
  'Theft': ['stolen', 'steal', 'theft', 'robbery', 'burglary', 'snatched', 'missing phone', 'laptop stolen'],
  'Assault': ['assault', 'attack', 'beaten', 'threatened', 'injury', 'fight'],
  'Missing Person': ['missing', 'disappeared', 'cannot find', 'last seen'],
  'Accident': ['accident', 'collision', 'crash', 'vehicle', 'road accident'],
  'Domestic Violence': ['domestic', 'husband', 'wife', 'family violence', 'abuse at home'],
  'Property Dispute': ['property', 'land', 'boundary', 'ownership', 'tenant', 'dispute'],
};

const tokenize = (text) => cleanText(text).split(' ').filter((word) => word.length > 2);

const scoreCategory = (text, profile) => {
  const normalized = cleanText(text);
  return profile.reduce((score, term) => normalized.includes(term) ? score + (term.includes(' ') ? 2 : 1) : score, 0);
};

const classifyCase = (item) => {
  const provided = getType(item);
  const description = getDescription(item);
  const providedKnown = provided && normalize(provided) !== 'unknown';

  if (providedKnown) {
    return {
      category: provided,
      confidence: 0.98,
      source: 'backend-category',
      explanation: ['The case category was supplied by the core FIR backend.'],
    };
  }

  const ranked = Object.entries(CATEGORY_PROFILES)
    .map(([category, profile]) => ({ category, score: scoreCategory(description, profile) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0];
  const confidence = best.score === 0 ? 0.25 : Math.min(0.95, 0.45 + best.score * 0.08);

  return {
    category: best.score ? best.category : 'Other',
    confidence,
    source: 'local-nlp',
    explanation: best.score
      ? [`The incident description contains language associated with ${best.category}.`]
      : ['The description does not contain enough category-specific language for a confident classification.'],
  };
};

const buildTfIdfVectors = (texts) => {
  const documents = texts.map(tokenize);
  const vocabulary = [...new Set(documents.flat())];
  const docFrequency = new Map(vocabulary.map((term) => [term, documents.filter((doc) => doc.includes(term)).length]));
  return documents.map((doc) => {
    const counts = new Map();
    doc.forEach((term) => counts.set(term, (counts.get(term) || 0) + 1));
    const vector = new Map();
    for (const [term, count] of counts) {
      const tf = count / doc.length;
      const idf = Math.log((documents.length + 1) / ((docFrequency.get(term) || 0) + 1)) + 1;
      vector.set(term, tf * idf);
    }
    return vector;
  });
};

const cosineSimilarity = (a, b) => {
  let dot = 0; let normA = 0; let normB = 0;
  for (const value of a.values()) normA += value * value;
  for (const value of b.values()) normB += value * value;
  for (const [term, value] of a) dot += value * (b.get(term) || 0);
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const findRelatedCases = (items, targetIndex) => {
  const target = items[targetIndex];
  const texts = items.map((item) => `${getType(item)} ${getLocation(item)} ${getDescription(item)}`);
  const vectors = buildTfIdfVectors(texts);
  return items.map((item, index) => {
    if (index === targetIndex) return null;
    const textScore = cosineSimilarity(vectors[targetIndex], vectors[index]);
    const sameCategory = normalize(getType(target)) !== 'unknown' && normalize(getType(target)) === normalize(getType(item));
    const sameLocation = normalize(getLocation(target)) !== 'unknown' && normalize(getLocation(target)) === normalize(getLocation(item));
    const score = Math.min(1, textScore * 0.7 + (sameCategory ? 0.2 : 0) + (sameLocation ? 0.1 : 0));
    return { item, score, sameCategory, sameLocation };
  }).filter(Boolean).filter((result) => result.score >= 0.25).sort((a, b) => b.score - a.score).slice(0, 5);
};

const analyzePriority = (item, classification) => {
  const text = cleanText(`${getDescription(item)} ${getType(item)}`);
  const signals = [];
  let score = 0;

  const rules = [
    [['murder', 'life threat', 'kidnapping', 'hostage', 'weapon', 'rape'], 5, 'The description contains a severe-safety indicator.'],
    [['major injury', 'serious injury', 'critical', 'emergency'], 4, 'The description indicates an urgent or serious incident.'],
    [['large financial loss', 'bank fraud', 'financial fraud', 'identity theft'], 3, 'The description indicates potentially significant financial harm.'],
    [['threat', 'violence', 'attack'], 2, 'The description contains a threat or violence indicator.'],
  ];

  for (const [terms, points, explanation] of rules) {
    if (terms.some((term) => text.includes(term))) { score += points; signals.push(explanation); }
  }
  if (classification.category === 'Cyber Crime' && /(otp|bank|upi|transaction|phishing)/.test(text)) score += 1;

  const provided = getPriority(item);
  if (['high','critical','urgent','emergency'].includes(provided)) {
    return { priority: provided === 'critical' ? 'Critical' : 'High', confidence: 0.98, source: 'backend-priority', explanation: ['Priority was supplied by the core backend.'] };
  }

  const priority = score >= 5 ? 'High' : score >= 2 ? 'Medium' : 'Low';
  return {
    priority,
    confidence: score === 0 ? 0.62 : Math.min(0.93, 0.65 + score * 0.05),
    source: 'local-nlp-risk',
    explanation: signals.length ? signals : ['No strong high-risk indicators were detected in the available FIR text.'],
  };
};

const analyzeCases = (items) => items.map((item, index) => {
  const classification = classifyCase(item);
  const priority = analyzePriority(item, classification);
  const related = findRelatedCases(items, index);
  return {
    caseId: getCaseId(item),
    firId: getFirId(item),
    classification,
    priority,
    relatedCases: related.map(({ item: relatedItem, score }) => ({ caseId: getCaseId(relatedItem), firId: getFirId(relatedItem), similarity: Number(score.toFixed(3)) })),
    explanation: {
      classification: classification.explanation,
      priority: priority.explanation,
      similarity: related.length ? [`${related.length} related case(s) found using text/category/location similarity.`] : ['No sufficiently similar case was found in the available records.'],
    },
  };
});

const buildAnalytics = (cases, from, to) => {
  const filtered = cases.filter((item) => inRange(item, from, to));
  const categories = countBy(filtered, getType);
  const locations = countBy(filtered, getLocation).slice(0, 10);
  const status = countBy(filtered, getStatus);
  const aiResults = analyzeCases(filtered);

  const priorityMap = new Map();
  aiResults.forEach((result) => priorityMap.set(result.priority.priority, (priorityMap.get(result.priority.priority) || 0) + 1));
  const priorities = [...priorityMap.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const similarCaseIds = new Set(aiResults.filter((result) => result.relatedCases.length).map((result) => result.caseId));

  const monthlyMap = new Map();
  for (const item of filtered) {
    const date = new Date(getDate(item));
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
  }
  const monthlyTrend = [...monthlyMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, count]) => ({ month, count }));

  const closedStatuses = new Set(['resolved','closed','chargesheet','courtregistered','disposed','completed']);
  const closed = filtered.filter((item) => closedStatuses.has(getStatus(item))).length;
  const active = filtered.length - closed;
  const pendingCases = filtered.filter(isPending).length;

  const latestCases = [...filtered]
    .sort((a, b) => new Date(getDate(b) || 0) - new Date(getDate(a) || 0))
    .slice(0, 8)
    .map((item) => {
      const ai = aiResults.find((result) => result.caseId === getCaseId(item));
      return {
        caseId: getCaseId(item) || 'N/A',
        firId: getFirId(item),
        type: getType(item),
        location: getLocation(item),
        status: item.status || item.caseStatus || 'Unknown',
        priority: ai?.priority.priority || 'Low',
        classificationConfidence: ai?.classification.confidence || 0,
        filedDate: getDate(item),
      };
    });

  return {
    generatedAt: new Date().toISOString(),
    source: process.env.CORE_API_BASE_URL ? 'core backend API' : 'local case store',
    filters: { from: from?.toISOString() || null, to: to?.toISOString() || null },
    summary: {
      totalCases: filtered.length,
      highPriorityCases: aiResults.filter((result) => ['High', 'Critical'].includes(result.priority.priority)).length,
      pendingCases,
      similarCases: similarCaseIds.size,
      activeCases: active,
      closedCases: closed,
      resolutionRate: filtered.length ? Number(((closed / filtered.length) * 100).toFixed(1)) : 0,
    },
    categories,
    crimeTypes: categories,
    locations,
    status,
    priorities,
    monthlyTrend,
    similarGroups: aiResults.flatMap((result) => result.relatedCases.map((related) => ({ caseId: result.caseId, relatedCaseId: related.caseId, similarity: related.similarity }))).sort((a, b) => b.similarity - a.similarity).slice(0, 10),
    latestCases,
    aiResults,
  };
};

const parseDateParam = (value, name, endOfDay = false) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) { const error = new Error(`Invalid ${name} date.`); error.status = 400; throw error; }
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) date.setHours(23, 59, 59, 999);
  return date;
};

const getRemoteCases = async () => {
  const base = process.env.CORE_API_BASE_URL?.trim();
  const endpoint = process.env.CORE_CASES_ENDPOINT?.trim() || '/cases';
  if (!base) return null;
  const url = new URL(endpoint, base.endsWith('/') ? base : `${base}/`);
  const headers = { Accept: 'application/json' };
  if (process.env.CORE_API_TOKEN) headers.Authorization = `Bearer ${process.env.CORE_API_TOKEN}`;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Core Cases API rejected the JWT. Generate a fresh dev JWT from /api/auth/login and set CORE_API_TOKEN in server/.env.');
    }
    throw new Error(`Core backend returned HTTP ${response.status}.`);
  }
  const payload = await response.json();
  const records = Array.isArray(payload) ? payload : payload.data?.cases || payload.data || payload.cases;
  if (!Array.isArray(records)) throw new Error('Core backend response does not contain a case array.');
  return records;
};

const loadCaseData = async () => {
  const remote = await getRemoteCases();
  return remote ?? readCases();
};

export const getAnalytics = async (req, res, next) => {
  try {
    const from = parseDateParam(req.query.from, 'from');
    const to = parseDateParam(req.query.to, 'to', true);
    if (from && to && from > to) return res.status(400).json({ success: false, message: 'The from date cannot be after the to date.' });
    const cases = await loadCaseData();
    return res.json({ success: true, data: buildAnalytics(cases, from, to) });
  } catch (error) { next(error); }
};

export const getCaseAI = async (req, res, next) => {
  try {
    const caseId = String(req.params.caseId || '').trim();
    const cases = await loadCaseData();
    const index = cases.findIndex((item) => getCaseId(item) === caseId);
    if (index < 0) return res.status(404).json({ success: false, message: 'Case not found.' });
    return res.json({ success: true, data: analyzeCases(cases)[index] });
  } catch (error) { next(error); }
};

export const addCaseForAnalytics = async (req, res, next) => {
  try {
    if (!req.body || typeof req.body !== 'object') return res.status(400).json({ success: false, message: 'A case object is required.' });
    const caseId = getCaseId(req.body);
    const filedDate = getDate(req.body);
    if (!caseId || !filedDate) return res.status(400).json({ success: false, message: 'Each case must include caseId (or id/firId) and incidentDate (or filedDate/createdAt/date).' });
    const cases = await readCases();
    const existingIndex = cases.findIndex((item) => getCaseId(item) === caseId);
    const record = { ...req.body, caseId, filedDate, updatedAt: new Date().toISOString() };
    if (existingIndex >= 0) cases[existingIndex] = { ...cases[existingIndex], ...record };
    else cases.push({ ...record, createdAt: record.createdAt || new Date().toISOString() });
    await writeCases(cases);
    const ai = analyzeCases(cases)[existingIndex >= 0 ? existingIndex : cases.length - 1];
    return res.status(existingIndex >= 0 ? 200 : 201).json({ success: true, message: existingIndex >= 0 ? 'Case analytics record updated.' : 'Case analytics record created.', case: record, ai });
  } catch (error) { next(error); }
};
