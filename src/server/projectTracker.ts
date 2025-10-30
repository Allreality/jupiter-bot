import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use(express.json());

interface TimeEntry {
  projectId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  notes?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  totalTime: number; // total seconds
  lastWorked?: Date;
  status: 'active' | 'paused' | 'completed';
  category?: string;
}

// In-memory storage (should be database in production)
const projects = new Map<string, Project>();
const timeEntries: TimeEntry[] = [];
let activeTimer: { projectId: string; startTime: Date } | null = null;

// Initialize with your projects
const initialProjects = [
  { id: 'trading-bot', name: 'Jupiter Trading Bot', category: 'DeFi', status: 'active' },
  { id: 'midnight', name: 'MIDNIGHT Integration', category: 'Blockchain', status: 'active' },
  { id: 'tra', name: 'TRA Project', category: 'Development', status: 'active' },
  { id: 'historical-genetic-engineering', name: 'Historical Genetic Engineering', category: 'Research', status: 'active' },
  { id: 'blackart', name: 'Black Art', category: 'Creative', status: 'active' },
  { id: 'midnight-roadmap', name: 'MIDNIGHT Roadmap', category: 'Planning', status: 'active' },
  { id: 'offgrid-studio', name: 'Off-Grid Studio', category: 'Infrastructure', status: 'active' },
  { id: 'quantum-resonance', name: 'Quantum Resonance', category: 'Research', status: 'active' },
  { id: 'star-atlas', name: 'Star Atlas', category: 'Gaming', status: 'active' },
];

initialProjects.forEach(p => {
  projects.set(p.id, { ...p, totalTime: 0, status: p.status as any });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'Project Tracker' });
});

// Get all projects
app.get('/api/projects', (req, res) => {
  const projectList = Array.from(projects.values()).map(p => ({
    ...p,
    isActive: activeTimer?.projectId === p.id,
    totalTimeFormatted: formatDuration(p.totalTime)
  }));
  res.json(projectList);
});

// Get single project
app.get('/api/projects/:id', (req, res) => {
  const project = projects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  const entries = timeEntries.filter(e => e.projectId === req.params.id);
  res.json({ ...project, timeEntries: entries });
});

// Start timer
app.post('/api/timer/start', (req, res) => {
  const { projectId } = req.body;
  
  if (!projects.has(projectId)) {
    return res.status(404).json({ error: 'Project not found' });
  }
  
  if (activeTimer) {
    return res.status(400).json({ error: 'Timer already running', activeProject: activeTimer.projectId });
  }
  
  activeTimer = { projectId, startTime: new Date() };
  res.json({ success: true, startTime: activeTimer.startTime });
});

// Stop timer
app.post('/api/timer/stop', (req, res) => {
  if (!activeTimer) {
    return res.status(400).json({ error: 'No active timer' });
  }
  
  const endTime = new Date();
  const duration = Math.floor((endTime.getTime() - activeTimer.startTime.getTime()) / 1000);
  
  const entry: TimeEntry = {
    projectId: activeTimer.projectId,
    startTime: activeTimer.startTime,
    endTime,
    duration,
    notes: req.body.notes
  };
  
  timeEntries.push(entry);
  
  // Update project total time
  const project = projects.get(activeTimer.projectId);
  if (project) {
    project.totalTime += duration;
    project.lastWorked = endTime;
  }
  
  const result = { ...entry, durationFormatted: formatDuration(duration) };
  activeTimer = null;
  
  res.json(result);
});

// Get active timer
app.get('/api/timer/active', (req, res) => {
  if (!activeTimer) {
    return res.json({ active: false });
  }
  
  const elapsed = Math.floor((Date.now() - activeTimer.startTime.getTime()) / 1000);
  res.json({
    active: true,
    projectId: activeTimer.projectId,
    startTime: activeTimer.startTime,
    elapsed,
    elapsedFormatted: formatDuration(elapsed)
  });
});

// Get time summary
app.get('/api/summary', (req, res) => {
  const totalTime = Array.from(projects.values()).reduce((sum, p) => sum + p.totalTime, 0);
  const activeProjects = Array.from(projects.values()).filter(p => p.status === 'active').length;
  
  const topProjects = Array.from(projects.values())
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, 5)
    .map(p => ({ name: p.name, time: formatDuration(p.totalTime) }));
  
  res.json({
    totalTime: formatDuration(totalTime),
    activeProjects,
    totalProjects: projects.size,
    topProjects
  });
});

// Add new project
app.post('/api/projects', (req, res) => {
  const { id, name, description, category } = req.body;
  
  if (projects.has(id)) {
    return res.status(400).json({ error: 'Project already exists' });
  }
  
  const project: Project = {
    id,
    name,
    description,
    category,
    totalTime: 0,
    status: 'active'
  };
  
  projects.set(id, project);
  res.json(project);
});

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

const PORT = 5004;

app.listen(PORT, () => {
  console.log(`⏱️  Project Tracker running on http://localhost:${PORT}`);
});
