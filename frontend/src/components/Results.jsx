import React from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaChartLine, FaLightbulb, FaComments } from 'react-icons/fa';

export default function Results({ data }) {
  if (!data) return null;

  const renderVerdictIcon = (verdict) => {
    switch (verdict.toLowerCase()) {
      case 'highly suitable':
        return <FaCheckCircle className="text-green-500 text-3xl" />;
      case 'moderately suitable':
        return <FaCheckCircle className="text-blue-500 text-3xl" />;
      case 'needs improvement':
        return <FaExclamationTriangle className="text-yellow-500 text-3xl" />;
      case 'not suitable':
        return <FaTimesCircle className="text-red-500 text-3xl" />;
      default:
        return <FaChartLine className="text-gray-500 text-3xl" />;
    }
  };

  return (
    <div className="mt-12 w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Section 1: Suitability Card */}
      <section className="bg-white rounded-2xl shadow-sm border border-[var(--color-primary)] p-8">
        <div className="flex items-center space-x-6">
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full border-4 border-[var(--color-primary-dark)] flex items-center justify-center text-3xl font-bold text-[var(--color-text)]">
              {data.suitabilityScore}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {renderVerdictIcon(data.verdict)}
              <h2 className="text-2xl font-bold">{data.verdict}</h2>
            </div>
            <p className="text-[var(--color-text-light)] text-lg">{data.summary}</p>
          </div>
        </div>
      </section>

      {/* Section 2: Evaluation Analysis */}
      <section className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-700 flex items-center"><FaCheckCircle className="mr-2"/> Strengths</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-[var(--color-text)]">
            {data.strengths?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-600 flex items-center"><FaTimesCircle className="mr-2"/> Weaknesses</h3>
          <ul className="list-disc list-inside space-y-2 text-sm text-[var(--color-text)]">
            {data.weaknesses?.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
        {data.missingComponents && data.missingComponents.length > 0 && (
          <div className="md:col-span-2 bg-[var(--color-surface)] rounded-2xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-[var(--color-text)]">Technical Gaps & Missing Components</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-[var(--color-text-light)]">
              {data.missingComponents.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Section 3: Features to Scale (Roadmap) */}
      {data.roadmap && data.roadmap.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-[var(--color-accent)] p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center"><FaLightbulb className="text-[var(--color-accent)] mr-3" /> Scale Your Project (Roadmap)</h2>
          <div className="space-y-6">
            {data.roadmap.map((item, idx) => (
              <div key={idx} className="border-l-4 border-[var(--color-primary)] pl-4 py-1">
                <h4 className="text-lg font-bold">{item.recommendation}</h4>
                <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-[var(--color-text-light)]">
                  <div><span className="font-semibold text-gray-700">Why it matters:</span> {item.whyItMatters}</div>
                  <div><span className="font-semibold text-gray-700">Impact:</span> {item.expectedImpact}</div>
                  <div><span className="font-semibold text-gray-700">Strategy:</span> {item.implementationStrategy}</div>
                  <div>
                    <span className="font-semibold text-gray-700">Difficulty:</span> <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs">{item.difficulty}</span>
                    <span className="ml-3 font-semibold text-gray-700">Effort:</span> {item.estimatedLearningEffort}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Section 4: Interview Simulator */}
      {data.interviewSimulator && data.interviewSimulator.length > 0 && (
        <section className="bg-white rounded-2xl shadow-sm border border-[var(--color-highlight)] p-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center"><FaComments className="text-[var(--color-highlight)] mr-3" /> Interview Simulator</h2>
          <div className="space-y-8">
            {data.interviewSimulator.map((item, idx) => (
              <div key={idx} className="bg-[var(--color-surface)] rounded-xl p-5 border border-gray-100 relative">
                <div className="absolute -top-3 -left-3 bg-[var(--color-highlight)] text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  Q{idx + 1}
                </div>
                <h4 className="text-lg font-bold mb-3 mt-1 ml-2">{item.question}</h4>
                <div className="ml-2 space-y-3 text-sm text-[var(--color-text)]">
                  <p><span className="font-semibold text-gray-700">Why it's asked:</span> {item.whyAsked}</p>
                  <p><span className="font-semibold text-gray-700">Expected Approach:</span> {item.expectedApproach}</p>
                  <p><span className="font-semibold text-red-700">Common Mistakes:</span> {item.commonMistakes}</p>
                  {item.followUps && item.followUps.length > 0 && (
                    <div>
                      <span className="font-semibold text-gray-700">Advanced Follow-ups:</span>
                      <ul className="list-disc list-inside ml-2 mt-1 text-[var(--color-text-light)]">
                        {item.followUps.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
