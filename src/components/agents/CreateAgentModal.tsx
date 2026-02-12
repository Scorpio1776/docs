'use client';

import { useState } from 'react';
import Modal from '@/components/shared/Modal';
import TemplateSelector from './TemplateSelector';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useAgentTemplates } from '@/hooks/useAgents';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Agent } from '@/lib/types';

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (agent: Agent) => void;
}

const ALL_TOOLS = [
  'web_search',
  'summarize',
  'extract_data',
  'analyze',
  'compare',
  'write',
  'edit',
  'format',
  'discover',
  'assess',
  'verify',
  'cross_reference',
  'cite',
  'track',
  'alert',
];

export default function CreateAgentModal({
  isOpen,
  onClose,
  onCreated,
}: CreateAgentModalProps) {
  const { templates, isLoading: templatesLoading } = useAgentTemplates();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  function handleSelectTemplate(id: string) {
    setSelectedTemplateId(id);
    const template = templates.find((t) => t.id === id);
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setSelectedTools([...template.defaultTools]);
    }
  }

  function handleGoToStep2() {
    if (!selectedTemplateId) return;
    setStep(2);
  }

  function handleBack() {
    setStep(1);
    setError(null);
  }

  function toggleTool(tool: string) {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  }

  async function handleCreate() {
    if (!selectedTemplateId || !name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: selectedTemplateId,
          name: name.trim(),
          description: description.trim() || undefined,
          tools: selectedTools,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create agent');
      }

      const data = await res.json();
      onCreated(data.agent);
      handleReset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setStep(1);
    setSelectedTemplateId(null);
    setName('');
    setDescription('');
    setSelectedTools([]);
    setError(null);
  }

  function handleClose() {
    handleReset();
    onClose();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={step === 1 ? 'Choose a Template' : 'Customize Agent'}
      size="lg"
    >
      {templatesLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : step === 1 ? (
        <div>
          <p className="text-sm text-gray-400 mb-4">
            Pick a template to start from. You can customize everything in the next step.
          </p>
          <TemplateSelector
            templates={templates}
            selected={selectedTemplateId}
            onSelect={handleSelectTemplate}
          />
          <div className="flex justify-end mt-5 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={handleGoToStep2}
              disabled={!selectedTemplateId}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-claw-primary text-white hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="space-y-4">
            <div>
              <label htmlFor="agent-name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Agent Name
              </label>
              <input
                id="agent-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. My Researcher"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-claw-primary/50 focus:border-claw-primary"
              />
            </div>

            <div>
              <label htmlFor="agent-desc" className="block text-sm font-medium text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                id="agent-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What should this agent focus on?"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-claw-primary/50 focus:border-claw-primary resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tools
              </label>
              <div className="flex flex-wrap gap-2">
                {ALL_TOOLS.map((tool) => {
                  const isActive = selectedTools.includes(tool);
                  return (
                    <button
                      key={tool}
                      type="button"
                      onClick={() => toggleTool(tool)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
                        isActive
                          ? 'bg-claw-primary/20 border-claw-primary/50 text-claw-primary'
                          : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                      }`}
                    >
                      {tool.replace(/_/g, ' ')}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedTemplate && (
              <div className="text-xs text-gray-500 pt-1">
                Based on <span className="text-gray-400">{selectedTemplate.name}</span> template
              </div>
            )}

            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-800">
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              onClick={handleCreate}
              disabled={!name.trim() || isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-claw-primary text-white hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : (
                'Create Agent'
              )}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
